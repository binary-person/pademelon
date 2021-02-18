import Pademelon = require('../../browser-module');
import { rewriteDocumentProto, patchCreateTreeWalker } from './Document';
import { rewriteElementProto } from './Element.prototype';
import { rewritefetch } from './fetch';
import { rewriteWindowFunction } from './Function';
import { patchFunctionProto } from './Function.prototype';
import { rewriteHistory } from './history';
import { rewriteAnchorElementProto } from './HTMLAnchorElement.prototype';
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
    // native api network requests
    rewriteXMLHttpRequest,
    rewritefetch,
    rewriteRequest,
    rewriteResponse,

    // other native apis that utilize networking
    rewriteNavigatorSendBeacon,

    // navigation
    rewriteHistory,

    // DOM rewrites
    rewriteNodeProto,
    rewriteDocumentProto,
    rewriteHTMLElementsAttribute,
    rewriteElementProto,

    // DOM specific rewrites
    rewriteScriptElementProto,
    rewriteAnchorElementProto,

    // other uncategorized rewrites
    rewriteWindowFunction,

    // patches
    patchCreateTreeWalker,
    patchMutationObserver,
    patchFunctionProto
];

export { windowRewriters, rewriterFuncParams };
