import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteXMLHttpRequest(pademelonInstance: Pademelon) {
    rewriteFunction(XMLHttpRequest.prototype, 'open', false, (_, method: string, url: string, ...otherArgs) => {
        return [method, pademelonInstance.rewriteUrl(url, typeToMod('api')), ...otherArgs];
    });
}

export { rewriteXMLHttpRequest };
