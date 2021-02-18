/* tslint:disable no-console */

import http = require('http');
import https = require('https');
import fs = require('fs');
import path = require('path');

import nodeStatic = require('node-static');
import httpProxy = require('http-proxy');

import { Pademelon } from '../nodejs-module';
import { ProxyHandler } from './ProxyHandler';
import { Duplex } from 'stream';

const pademelonDistFilePath = path.resolve(__dirname, '../../dist/pademelon.min.js');
const publicFolder = path.resolve(__dirname, '../../src/dev-server/public');
const port = 4444;

const pademelon = new Pademelon({
    hostname: 'localhost:' + port,
    pathnamePrefix: '/pademelonprefix/',
    windowProp: 'pademelonInstance',
    browserPademelonDistUrl: '/pademelon.min.js',
    useHttp: true
});
const proxyHandler = new ProxyHandler(pademelon);
const staticServer = new nodeStatic.Server(publicFolder, { cache: false });

// purpose of using http-proxy is to avoid implementing
// websocket proxy functionality
const proxy = new httpProxy({
    secure: false,
    ignorePath: true,
    prependPath: true
});

proxy.on('error', console.error);
proxyHandler.on('error', console.error);

const server = http.createServer((req, res) => {
    if (req.url?.startsWith(pademelon.options.pathnamePrefix)) {
        const unrewrittenUrl = pademelon.unrewriteUrl(req.url);
        if (unrewrittenUrl.fail) {
            res.writeHead(400);
            res.end('Unable to unrewrite url');
            return;
        }
        let url: URL;
        try {
            url = new URL(unrewrittenUrl.url);
        } catch (e) {
            res.writeHead(400);
            res.end('Bad unrewritten url');
            return;
        }

        const options: http.RequestOptions = {
            hostname: url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
            protocol: url.protocol,
            port: url.port,
            path: url.pathname + url.search,
            method: req.method,
            headers: req.headers
        };
        proxyHandler.clientToServerHeaderRewrites(req);

        const proxyRequest = (url.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
            proxyHandler.serverToClientHeaderRewrites(proxyRes, req);
            void proxyHandler.handler(proxyRes, req, res);
        });
        req.pipe(proxyRequest, {
            end: true
        });

        proxyRequest.on('error', (err) => {
            console.error('Proxy error', err);
            if (!res.writableEnded) {
                res.writeHead(400);
                res.end('Proxy error');
            }
        });
        req.on('error', console.error);
        res.on('error', console.error);
        return;
    }

    // copy over freshest generated webpack file
    fs.copyFileSync(pademelonDistFilePath, path.join(publicFolder, pademelon.options.browserPademelonDistUrl));

    staticServer.serve(req, res);
});

server.on('upgrade', (req: http.IncomingMessage, socket: Duplex, head: Buffer) => {
    try {
        proxyHandler.clientToServerHeaderRewrites(req);
        proxy.ws(req, socket, head, {
            target: new URL(pademelon.unrewriteUrl(req.url || '').url)
        });
    } catch (e) {
        console.error('Error occurred in websocket proxy', e);
        if (!socket.writableFinished) {
            socket.end();
        }
    }
});

server.listen(port, '127.0.0.1', () => console.log('Pademelon demo server listening on http://localhost:' + port));
