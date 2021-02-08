import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

/**
 * this wraps the request url by sending it through the already wrapped Request
 * then unrewrites the response url after the request
 */
function rewritefetch(pademelonInstance: Pademelon) {
    // polyfill empty function to make jest tests run
    if (!window.fetch) window.fetch = (() => undefined) as any;
    rewriteFunction(window, 'fetch', false, {
        interceptArgs(_, input: string | Request, initOpts: Request) {
            return [new Request(input, initOpts)];
        },
        interceptReturn(_, returnPromiseResponse: Promise<Response>) {
            return new Promise((resolve, reject) => {
                returnPromiseResponse
                    .then((response) => {
                        Object.defineProperty(response, 'url', {
                            value: pademelonInstance.unrewriteUrl(response.url).url
                        });
                        resolve(response);
                    })
                    .catch(reject);
            });
        }
    });
}

export { rewritefetch };
