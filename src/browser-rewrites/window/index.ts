import Pademelon = require('../../browser-module');
import { rewriteDocumentProto, patchCreateTreeWalker } from './Document';
import { rewriteElementProto } from './Element.prototype';
import { rewritefetch } from './fetch';
import { rewriteWindowFunction } from './Function';
import { rewriteHistory } from './history';
import { rewriteHTMLElementsAttribute } from './HTMLElementsAttribute';
import { rewriteScriptElementProto } from './HTMLScriptElement.prototype';
import { patchMutationObserver } from './MutationObserver.prototype';
import { rewriteNavigatorSendBeacon } from './navigator.sendBeacon';
import { rewriteNodeProto } from './Node.prototype';
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
    rewriteHistory,
    rewriteNodeProto,
    rewriteDocumentProto,
    rewriteHTMLElementsAttribute,
    rewriteElementProto,
    rewriteScriptElementProto,
    rewriteWindowFunction,
    patchCreateTreeWalker,
    patchMutationObserver
];

export { windowRewriters, rewriterFuncParams };
