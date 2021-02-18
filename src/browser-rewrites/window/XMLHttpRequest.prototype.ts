import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteXMLHttpRequest(pademelonInstance: Pademelon): void {
    XMLHttpRequest.prototype.open = rewriteFunction(XMLHttpRequest.prototype.open, {
        interceptArgs(_, method: string, url: string, ...otherArgs) {
            return [method, pademelonInstance.rewriteUrl(url, typeToMod('api')), ...otherArgs] as const;
        }
    });
}

export { rewriteXMLHttpRequest };
