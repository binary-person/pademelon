import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

function rewriteScriptElementProto(pademelonInstance: Pademelon): void {
    rewriteGetterSetter(HTMLScriptElement.prototype, 'text', {
        rewriteSetter: (setValue: string) => {
            return pademelonInstance.rewriteJS(setValue);
        }
    });
    // prevent integrity from being set since we are rewriting js anyway
    rewriteGetterSetter(HTMLScriptElement.prototype, 'integrity', {
        rewriteSetter: () => {
            return '';
        }
    });
}

export { rewriteScriptElementProto };
