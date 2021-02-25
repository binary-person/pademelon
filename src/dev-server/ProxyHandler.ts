import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

import decompressResponse = require('decompress-response');
import streamToString = require('stream-to-string');
import TypedEmitter from 'typed-emitter';

import { modToType, modTypes } from '../mod';
import { Pademelon } from '../nodejs-module';

type passThroughModsType = 'raw' | 'api' | 'serviceworker' | 'webworker';
type modifierModsType = Exclude<modTypes, passThroughModsType>;
type mimeTypeModDictionaryType = {
    [contentType: string]: modTypes;
};
type modHandlerType = {
    [key in modifierModsType]: (responseString: string, proxyPath?: string) => string;
};

interface ProxyHandlerEmitters {
    error: (error: Error) => void;
}

const mimeTypeModDictionary: mimeTypeModDictionaryType = {
    image: 'raw'
};
const mimeSubTypeModDictionary: mimeTypeModDictionaryType = {
    html: 'html',
    css: 'stylesheet',
    javascript: 'javascript'
};

class ProxyHandler extends (EventEmitter as new () => TypedEmitter<ProxyHandlerEmitters>) {
    private pademelon: Pademelon;
    private passthroughMods: passThroughModsType[] = ['raw', 'api', 'serviceworker', 'webworker'];
    private modHandler: modHandlerType = {
        html: (responseStr, proxyPath = '') => this.pademelon.rewriteHTML(responseStr, proxyPath),
        javascript: (responseStr) => this.pademelon.rewriteJS(responseStr),
        stylesheet: (responseStr, proxyPath = '') => this.pademelon.rewriteCSS(responseStr, proxyPath)
    };
    constructor(pademelon: Pademelon) {
        super();
        this.pademelon = pademelon;
    }
    /**
     * @name handler
     */
    public async handler(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse): Promise<void> {
        const unrewrittenUrl = this.pademelon.unrewriteUrl(req.url);
        if (unrewrittenUrl.fail) {
            throw new Error('This should never throw. How did it get pass the first check?? Request URL: ' + req.url);
        }

        const modType: modTypes = this.modAndContentTypeToModType(proxyRes.headers['content-type'], unrewrittenUrl.mod);

        if (this.passthroughMods.includes(modType as passThroughModsType)) {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        } else {
            try {
                proxyRes = decompressResponse(proxyRes);
                delete proxyRes.headers['content-encoding'];
                const modifiedResponse = this.modHandler[modType as modifierModsType](
                    await streamToString(proxyRes),
                    req.url
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
            const unrewrittenUrl = this.pademelon.unrewriteUrl(req.url);
            if (unrewrittenUrl.fail) {
                throw new Error('Invalid url while rewriting header: ' + req.url);
            }
            const url = new URL(unrewrittenUrl.url);
            const unrewrittenReferer = this.pademelon.unrewriteUrl(req.headers.referer);
            const refererUrl = new URL(unrewrittenReferer.fail ? unrewrittenUrl.url : unrewrittenReferer.url);

            req.headers.host = url.host;
            if (req.headers.origin || modToType(unrewrittenUrl.mod) === 'api') req.headers.origin = refererUrl.origin;
            if (req.headers.referer) req.headers.referer = refererUrl.href;
            if (req.headers.location)
                req.headers.location = this.pademelon.rewriteUrl(req.headers.location, req.url, unrewrittenUrl.mod);
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
        proxyRes.headers['referrer-policy'] = 'strict-origin-when-cross-origin';
        if (proxyRes.headers.location)
            proxyRes.headers.location = this.pademelon.rewriteUrl(
                proxyRes.headers.location,
                req.url,
                this.pademelon.unrewriteUrl(req.url).mod
            );
    }

    private contentTypeToModType(contentType?: string): modTypes | 'invalid' {
        if (!contentType) {
            return 'invalid';
        }

        const mimeSplit = contentType.split(';')[0].split('/');
        if (mimeSplit.length !== 2) {
            return 'invalid';
        }
        const mimeType = mimeSplit[0];
        const mimeSubType = mimeSplit[1];

        return mimeTypeModDictionary[mimeType] || mimeSubTypeModDictionary[mimeSubType] || 'invalid';
    }
    private modAndContentTypeToModType(contentType?: string, mod?: string): modTypes {
        const contentTypeModType = this.contentTypeToModType(contentType);
        const modModType = modToType(mod);

        if (contentTypeModType === 'raw' || (mod && modModType === 'raw')) {
            return 'raw';
        }

        if (!contentType && !mod) {
            return 'html';
        } else if (contentTypeModType === 'invalid') {
            return modModType;
        } else if (contentType && !mod) {
            return contentTypeModType;
        } else {
            return modModType;
        }
    }
}

export { ProxyHandler };
