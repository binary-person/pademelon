import Pademelon = require('../../browser-module');
import { rewritefetch } from './fetch';
import { rewriteNavigatorSendBeacon } from './navigator.sendBeacon';
import { rewriteRequest } from './Request';
import { rewriteResponse } from './Response';
import { rewriteXMLHttpRequest } from './XMLHttpRequest';

type rewriterFuncParams = (pademelonInstance: Pademelon) => void;

const windowRewriters: rewriterFuncParams[] = [
    rewriteXMLHttpRequest,
    rewritefetch,
    rewriteRequest,
    rewriteResponse,
    rewriteNavigatorSendBeacon,
];

export { windowRewriters, rewriterFuncParams };
