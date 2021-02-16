import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteNavigatorSendBeacon(pademelonInstance: Pademelon) {
    if (!window.navigator.sendBeacon) window.navigator.sendBeacon = (() => undefined) as any;

    rewriteFunction(window.navigator, 'sendBeacon', {
        interceptArgs(_, url: string, data: any) {
            return [pademelonInstance.rewriteUrl(url, typeToMod('api')), data];
        }
    });
}

export { rewriteNavigatorSendBeacon };
