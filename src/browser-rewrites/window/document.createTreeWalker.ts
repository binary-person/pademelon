/**
 * sites like youtube that use document.createTreeWalker(document) will break
 * because createTreeWalker does not like proxied Node instances.
 * This is to patch createTreeWalker and rewrite the argument to replace
 * pademelon.modifiedWindow.document with the true document object
 */

import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function patchCreateTreeWalker(pademelonInstance: Pademelon) {
    rewriteFunction(document, 'createTreeWalker', false, (_: any, root: Document, whatToShow?: any, filter?: any) => {
        if (root === pademelonInstance.modifiedWindow.document) {
            return [document, whatToShow, filter];
        }
    });
}

export { patchCreateTreeWalker };
