import Pademelon = require('../../../worker-browser-module');
import { rewriteWorkerRequest } from './Request';
import { rewriteWorkerResponse } from './Response.prototype';
import { rewriteWorkerfetch } from './WorkerGlobalScope.prototype/fetch';
import { rewriteWorkerimportScripts } from './WorkerGlobalScope.prototype/importScripts';
import { rewriteWorkerWorkerLocationProto } from './WorkerLocation.prototype';

type rewriterFuncParams = (pademelonInstance: Pademelon) => void;

const workerRewriters: rewriterFuncParams[] = [
    // native api network requests
    rewriteWorkerfetch,
    rewriteWorkerRequest,
    rewriteWorkerResponse,

    // other native apis that utilize networking
    rewriteWorkerimportScripts,

    // navigation
    rewriteWorkerWorkerLocationProto
];

export { workerRewriters };
