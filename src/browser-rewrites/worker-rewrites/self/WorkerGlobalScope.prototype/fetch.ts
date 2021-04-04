import Pademelon = require('../../../../worker-browser-module');
import { rewriteFunction } from '../../../rewriteFunction';

/**
 * this wraps the request url by sending it through the already wrapped Request
 * then unrewrites the response url after the request
 */
function rewriteWorkerfetch(pademelonInstance: Pademelon): void {
    self.fetch = rewriteFunction(self.fetch, {
        interceptArgs(_, input: RequestInfo, initOpts?: Request) {
            return [new Request(input, initOpts)] as const;
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

export { rewriteWorkerfetch };
