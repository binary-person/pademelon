import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

import decompressResponse = require('decompress-response');
import streamToString = require('stream-to-string');
import TypedEmitter from 'typed-emitter';

import { modToType, modTypes } from '../mod';
import { Pademelon } from '../nodejs-module';

type passThroughModsType = 'raw' | 'api' | 'serviceworker' | 'webworker';
type modifierModsType = Exclude<modTypes, passThroughModsType>;
type contentTypeModDictionaryType = {
    [contentType: string]: modTypes;
};
type modHandlerType = {
    [key in modifierModsType]: (responseString: string, proxyPath: string) => string;
};

interface ProxyHandlerEmitters {
    error: (error: Error) => void;
}

const contentTypeModDictionary: contentTypeModDictionaryType = {
    html: 'html',
    css: 'stylesheet',
    javascript: 'javascript'
};

class ProxyHandler extends (EventEmitter as new () => TypedEmitter<ProxyHandlerEmitters>) {
    private pademelon: Pademelon;
    private passthroughMods: passThroughModsType[] = ['raw', 'api', 'serviceworker', 'webworker'];
    private modHandler: modHandlerType = {
        html: (responseStr, proxyPath) => this.pademelon.rewriteHTML(responseStr, proxyPath),
        javascript: (responseStr) => this.pademelon.rewriteJS(responseStr),
        stylesheet: (responseStr, proxyPath) => this.pademelon.rewriteCSS(responseStr, proxyPath)
    };
    constructor(pademelon: Pademelon) {
        super();
        this.pademelon = pademelon;
    }
    /**
     * @name handler
     */
    public async handler(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse): Promise<void> {
        const unrewrittenUrl = this.pademelon.unrewriteUrl(req.url || '');
        if (unrewrittenUrl.fail) {
            throw new Error('This should never throw. How did it get pass the first check?? Request URL: ' + req.url);
        }

        const contentTypeMod = this.contentTypeToMod(proxyRes.headers['content-type']);
        const modType = unrewrittenUrl.mod && contentTypeMod !== 'raw' ? modToType(unrewrittenUrl.mod) : contentTypeMod;

        if (this.passthroughMods.includes(modType as passThroughModsType)) {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        } else {
            try {
                proxyRes = decompressResponse(proxyRes);
                delete proxyRes.headers['content-encoding'];
                const modifiedResponse = this.modHandler[modType as modifierModsType](
                    await streamToString(proxyRes),
                    req.url || ''
                );

                delete proxyRes.headers['content-length'];

                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                res.end(modifiedResponse);
            } catch (e) {
                this.emit('error', new Error(e));
                if (!res.headersSent) res.writeHead(500);
                if (res.writable) res.end('An error occurred. Check log for details');
            }
        }
    }
    /**
     * @name clientToServerHeaderRewrites
     */
    public clientToServerHeaderRewrites(req: IncomingMessage): void {
        try {
            const unrewrittenUrl = this.pademelon.unrewriteUrl(req.url || '');
            if (unrewrittenUrl.fail) {
                throw new Error('Invalid url while rewriting header: ' + req.url);
            }
            const url = new URL(unrewrittenUrl.url);
            const refererUrl = new URL(this.pademelon.unrewriteUrl(req.headers.referer || req.url || '').url);

            req.headers.host = url.host;
            if (req.headers.origin || modToType(unrewrittenUrl.mod) === 'api') req.headers.origin = refererUrl.origin;
            if (req.headers.referer) req.headers.referer = refererUrl.href;
            if (req.headers.location)
                req.headers.location = this.pademelon.rewriteUrl(
                    req.headers.location,
                    req.url || '',
                    unrewrittenUrl.mod
                );
        } catch (e) {
            this.emit('error', new Error(e));
        }
    }
    /**
     * @name serverToClientHeaderRewrites
     */
    public serverToClientHeaderRewrites(proxyRes: IncomingMessage, req: IncomingMessage): void {
        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers.link;
        if (proxyRes.headers.location)
            proxyRes.headers.location = this.pademelon.rewriteUrl(
                proxyRes.headers.location,
                req.url || '',
                this.pademelon.unrewriteUrl(req.url || '').mod
            );
    }

    private contentTypeToMod(contentType?: string): modTypes {
        if (!contentType) {
            return 'raw';
        }

        // turn 'text/html; charset=UTF-8' into 'html'
        let semicolonPos = contentType.indexOf(';');
        semicolonPos = semicolonPos === -1 ? contentType.length : semicolonPos;
        contentType = contentType.slice(contentType.indexOf('/') + 1, semicolonPos);

        if (contentTypeModDictionary[contentType]) {
            return contentTypeModDictionary[contentType];
        } else {
            return 'raw';
        }
    }
}

export { ProxyHandler };
