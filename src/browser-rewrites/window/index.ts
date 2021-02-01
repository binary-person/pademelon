import Pademelon = require('../../browser-module');
import { rewriteElementProto } from './Element.prototype';
import { rewritefetch } from './fetch';
import { rewriteHTMLElements } from './HTMLElements';
import { rewriteNavigatorSendBeacon } from './navigator.sendBeacon';
import { rewriteRequest } from './Request';
import { rewriteResponse } from './Response.prototype';
import { rewriteXMLHttpRequest } from './XMLHttpRequest.prototype';

type rewriterFuncParams = (pademelonInstance: Pademelon) => void;

const windowRewriters: rewriterFuncParams[] = [
    rewriteXMLHttpRequest,
    rewritefetch,
    rewriteRequest,
    rewriteResponse,
    rewriteNavigatorSendBeacon,
    rewriteHTMLElements,
    rewriteElementProto,
];

export { windowRewriters, rewriterFuncParams };
