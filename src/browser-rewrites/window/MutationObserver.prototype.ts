import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function patchMutationObserver(pademelonInstance: Pademelon) {
    rewriteFunction(MutationObserver.prototype, 'observe', false, {
        interceptArgs(_: any, target: Node, options?: any) {
            if (target === pademelonInstance.modifiedWindow.document) {
                target = document;
            }
            return [target, options];
        }
    });
}

export { patchMutationObserver };
