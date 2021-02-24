import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteNavigatorSendBeacon(pademelonInstance: Pademelon): void {
    if (!window.navigator.sendBeacon) window.navigator.sendBeacon = () => false;

    window.navigator.sendBeacon = rewriteFunction(window.navigator.sendBeacon, {
        interceptArgs(_, url: string, data?: any | null | undefined) {
            return [pademelonInstance.rewriteUrl(url, undefined, typeToMod('api')), data] as const;
        }
    });
}

export { rewriteNavigatorSendBeacon };
