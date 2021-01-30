import Pademelon = require('../../browser-module');
import { rewritefetch } from './fetch';
import { rewriteRequest } from './Request';
import { rewriteResponse } from './Response';
import { rewriteXMLHttpRequest } from './XMLHttpRequest';

type rewriterFuncParams = (pademelonInstance: Pademelon) => void;

const windowRewriters: rewriterFuncParams[] = [rewriteXMLHttpRequest, rewritefetch, rewriteRequest, rewriteResponse];

export { windowRewriters, rewriterFuncParams };
