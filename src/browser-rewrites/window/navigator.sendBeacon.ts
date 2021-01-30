import Pademelon = require('../../browser-module');
import { typeToMod } from '../../mod';
import { rewriteFunction } from '../rewriteFunction';

function rewriteNavigatorSendBeacon(pademelonInstance: Pademelon) {
    rewriteFunction(window.navigator, 'sendBeacon', false, (_, url: string, data: any) => {
        return [pademelonInstance.rewriteUrl(url, typeToMod('api')), data];
    });
}

export { rewriteNavigatorSendBeacon };
