import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function patchMutationObserver(pademelonInstance: Pademelon) {
    rewriteFunction(MutationObserver.prototype, 'observe', false, (_: any, target: Node, options?: any) => {
        if (target === pademelonInstance.modifiedWindow.document) {
            return [document, options];
        }
    });
}

export { patchMutationObserver };
