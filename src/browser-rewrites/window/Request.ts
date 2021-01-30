import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteRequest(pademelonInstance: Pademelon) {
    rewriteFunction(window, 'Request', true, (_Request: any, input: string | Request, initOpts: Request) => {
        let url: string;
        if (typeof input === 'string') {
            url = input;
        } else if ('url' in input) {
            url = input.url;
        } else {
            url = input;
        }
        return [new _Request(pademelonInstance.rewriteUrl(url, typeToMod('api')), new _Request(input, initOpts))];
    });
}

export { rewriteRequest };