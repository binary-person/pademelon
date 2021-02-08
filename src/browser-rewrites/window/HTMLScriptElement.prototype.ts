import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

function rewriteScriptElementProto(pademelonInstance: Pademelon) {
    rewriteGetterSetter(HTMLScriptElement.prototype, 'text', {
        rewriteSetter: (setValue: string) => {
            return pademelonInstance.rewriteJS(setValue);
        }
    });
}

export { rewriteScriptElementProto };
