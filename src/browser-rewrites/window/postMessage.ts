import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function rewritePostMessage(_pademelonInstance: Pademelon): void {
    window.postMessage = rewriteFunction(window.postMessage, {
        interceptArgs(_, message: any, _targetOrigin: string, transfer?: any) {
            return [message, window.location.origin, transfer] as const;
        }
    });
}

export { rewritePostMessage };
