import Pademelon = require('../../../worker-browser-module');
import { typeToMod } from '../../../mod';
import { rewriteFunction } from '../../rewriteFunction';

function rewriteWorkerRequest(pademelonInstance: Pademelon): void {
    self.Request = rewriteFunction(self.Request, {
        // reminder that this is a constructor so it returns an instance of Request
        interceptArgs(_Request, input: string | Request, initOpts?: Request) {
            let url: string;
            if (typeof input === 'string') {
                url = input;
            } else if ('url' in input) {
                url = input.url;
            } else {
                url = input;
            }
            return [
                new _Request(
                    pademelonInstance.rewriteUrl(url, undefined, typeToMod('api')),
                    new _Request(input, initOpts)
                )
            ] as const;
        }
    });
}

export { rewriteWorkerRequest };
