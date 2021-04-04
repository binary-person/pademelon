import { typeToMod } from '../../../../mod';
import Pademelon = require('../../../../worker-browser-module');
import { rewriteFunction } from '../../../rewriteFunction';

function rewriteWorkerimportScripts(pademelonInstance: Pademelon): void {
    self.importScripts = rewriteFunction(self.importScripts, {
        interceptArgs(_, ...scriptUrls) {
            for (let i = 0; i < scriptUrls.length; i++) {
                scriptUrls[i] = pademelonInstance.rewriteUrl(scriptUrls[i] + '', undefined, typeToMod('webworker')); // toString without having typescript throw an error
            }
            return scriptUrls;
        }
    });
}

export { rewriteWorkerimportScripts };
