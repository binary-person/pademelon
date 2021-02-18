import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function patchMutationObserver(pademelonInstance: Pademelon): void {
    MutationObserver.prototype.observe = rewriteFunction(MutationObserver.prototype.observe, {
        interceptArgs(_: any, target: Node, options?: any) {
            if (target === pademelonInstance.modifiedWindow.document) {
                target = document;
            }
            return [target, options] as const;
        }
    });
}

export { patchMutationObserver };
