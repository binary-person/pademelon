import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function patchEventTargetProto(pademelonInstance: Pademelon): void {
    const interceptThis = (_originalFunc: unknown, thisArg: any): any => {
        switch (thisArg) {
            case pademelonInstance.modifiedWindow:
                return window;
            case pademelonInstance.modifiedWindow.document:
                return document;
            default:
                return thisArg;
        }
    };
    EventTarget.prototype.addEventListener = rewriteFunction(EventTarget.prototype.addEventListener, {
        interceptThis
    });
    EventTarget.prototype.removeEventListener = rewriteFunction(EventTarget.prototype.removeEventListener, {
        interceptThis
    });
    EventTarget.prototype.dispatchEvent = rewriteFunction(EventTarget.prototype.dispatchEvent, {
        interceptThis
    });
}

export { patchEventTargetProto };
