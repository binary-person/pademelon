/* tslint:disable no-console */

import http = require('http');
import https = require('https');
import fs = require('fs');
import path = require('path');

import streamToString = require('stream-to-string');

import { Pademelon } from './nodejs-module';

const pademelonDistFilePath = path.resolve(__dirname, '../dist/pademelon.min.js');
const port = 4444;

const pademelon = new Pademelon({
    hostname: 'localhost:' + port,
    pathnamePrefix: '/pademelonprefix/',
    windowProp: 'pademelonInstance',
    browserPademelonDistUrl: '/pademelon.min.js',
    useHttp: true
});

function request(options: http.RequestOptions, callback: (res: http.IncomingMessage) => void): http.ClientRequest {
    if (options.protocol === 'https:') {
        return https.request(options, callback);
    } else {
        return http.request(options, callback);
    }
}

function proxyHandler(clientReq: http.IncomingMessage, clientRes: http.ServerResponse) {
    if (!clientReq.url) {
        clientRes.writeHead(400);
        clientRes.end('400. url header missing');
        return;
    }
    const proxyPath = clientReq.url as string;
    const unrewrittenUrl = pademelon.unrewriteUrl(proxyPath);
    if (unrewrittenUrl.fail) {
        clientRes.writeHead(400);
        clientRes.end('400. Unable to unrewrite url');
        return;
    }
    let url: URL;
    try {
        url = new URL(unrewrittenUrl.url);
    } catch (e) {
        clientRes.writeHead(400);
        clientRes.end('400. invalid url');
        return;
    }
    const options: http.RequestOptions = {
        hostname:
            typeof url.hostname === 'string' && url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
        protocol: url.protocol,
        port: url.port,
        path: url.pathname + url.search,
        method: clientReq.method,
        headers: clientReq.headers
    };
    if (options.headers) {
        options.headers.host = url.host;
        options.headers['accept-encoding'] = 'identity;q=1, *;q=0';
        if (options.headers.origin) {
            options.headers.origin = url.origin;
        }
    }

    const proxy = request(options, async (res) => {
        delete res.headers['content-length'];
        delete res.headers['content-security-policy'];
        delete res.headers.link;
        clientRes.writeHead(res.statusCode || 200, res.headers);

        const contentType = res.headers['content-type'] || '';
        const contentTypeSemicolon = contentType.indexOf(';');
        switch (
            contentType.slice(
                contentType.indexOf('/') + 1,
                contentTypeSemicolon === -1 ? contentType.length : contentTypeSemicolon
            )
        ) {
            case 'html':
                clientRes.end(pademelon.rewriteHTML(await streamToString(res), proxyPath));
                break;
            case 'javascript':
                clientRes.end(pademelon.rewriteJS(await streamToString(res)));
                break;
            case 'css':
                clientRes.end(pademelon.rewriteCSS(await streamToString(res), proxyPath));
                break;
            default:
                res.pipe(clientRes, {
                    end: true
                });
        }
    });

    clientReq.pipe(proxy, {
        end: true
    });

    proxy.on('error', (err) => {
        console.error('Proxy error', err);
        if (!clientRes.writableEnded) {
            clientRes.writeHead(400);
            clientRes.end('Proxy error');
        }
    });
    clientReq.on('error', console.error);
}

const server = http.createServer((req, res) => {
    switch (req.url) {
        case pademelon.options.browserPademelonDistUrl:
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(fs.readFileSync(pademelonDistFilePath, 'utf8'));
            break;
        case '/':
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<script>
            function go(){var input=document.getElementById('url-target');if(input.value){window.open('${pademelon.options.pathnamePrefix}'+input.value);}else{alert('Please provide a link.');}}
            </script>
            <input type='text' placeholder='https://www.google.com' id='url-target' onkeydown='if(event.key==="Enter") go()' />
            <button onclick='go()'>Go!</button>`);
            break;
        default:
            if (req.url?.startsWith(pademelon.options.pathnamePrefix)) {
                try {
                    proxyHandler(req, res);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500);
                    res.end('Error occurred while proxying request. Check log for details');
                }
            } else {
                res.writeHead(404);
                res.end('404 error. What were you looking for?');
            }
    }
});

server.listen(port, '127.0.0.1', () => console.log('Pademelon demo server listening on http://localhost:' + port));
