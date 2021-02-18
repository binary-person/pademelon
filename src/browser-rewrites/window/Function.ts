import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function rewriteWindowFunction(pademelonInstance: Pademelon): void {
    window.Function = rewriteFunction(window.Function, {
        interceptReturn(_, returnValue) {
            if (typeof returnValue === 'function') {
                returnValue = returnValue.bind(pademelonInstance.modifiedWindow);
            }
            return returnValue;
        }
    });
}

export { rewriteWindowFunction };
