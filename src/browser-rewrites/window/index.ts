import Pademelon = require('../../browser-module');
import { patchCreateTreeWalker } from './document.createTreeWalker';
import { rewriteElementProto } from './Element.prototype';
import { rewritefetch } from './fetch';
import { rewriteHistory } from './history';
import { rewriteHTMLElements } from './HTMLElements';
import { patchMutationObserver } from './MutationObserver.prototype';
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
    rewriteHistory,
    patchCreateTreeWalker,
    patchMutationObserver
];

export { windowRewriters, rewriterFuncParams };
