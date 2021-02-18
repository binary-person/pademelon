import Pademelon = require('../../browser-module');
import { fakeToString } from '../fakeToString';

function patchFunctionProto(pademelonInstance: Pademelon): void {
    const originalCall = Function.prototype.call;
    const modifiedDocument = pademelonInstance.modifiedWindow.document;
    // eslint-disable-next-line @typescript-eslint/ban-types
    Function.prototype.call = function (this: Function, thisArg: any, ...argArray: any[]) {
        if (thisArg === modifiedDocument) {
            thisArg = document;
        }
        return originalCall.apply(this, [thisArg, ...argArray]);
    };
    fakeToString(Function.prototype.call, 'call');
}

export { patchFunctionProto };
