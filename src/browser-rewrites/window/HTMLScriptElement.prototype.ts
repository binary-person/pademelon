import Pademelon = require('../../browser-module');
import { rewriteGetterSetter } from '../rewriteGetterSetter';

function rewriteScriptElementProto(pademelonInstance: Pademelon): void {
    rewriteGetterSetter(HTMLScriptElement.prototype, 'text', {
        rewriteSetter: (setValue: string) => {
            return pademelonInstance.rewriteJS(setValue);
        }
    });
    // prevent integrity from being set since we are rewriting js anyway
    // take care of jsdom tester's lack of the integrity getter setter
    if ('integrity' in HTMLScriptElement.prototype) {
        rewriteGetterSetter(HTMLScriptElement.prototype, 'integrity', {
            rewriteSetter: () => {
                return '';
            }
        });
    }
}

export { rewriteScriptElementProto };
