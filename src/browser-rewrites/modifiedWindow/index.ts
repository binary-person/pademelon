/**
 * this is for rewriting immutable objects like window.location
 */

import Pademelon = require('../../browser-module');
import { interceptObject } from '../interceptObject';
import { modifiedDocument } from './document';
import { modifiedGlobalThis } from './globalThis';
import { modifiedLocation } from './location';
import { modifiedParent } from './parent';
import { modifiedSelf } from './self';
import { modifiedTop } from './top';
import { modifiedRecursiveWindow } from './window';

type modifiedWindowFuncParams = (
    pademelonInstance: Pademelon,
    modifiedProperties: object,
    targetWindow: Window,
    modifiedWindow: Window
) => void;

const modifiedWindowRewriters: modifiedWindowFuncParams[] = [
    modifiedLocation,
    modifiedRecursiveWindow,
    modifiedDocument,
    modifiedTop,
    modifiedSelf,
    modifiedParent,
    modifiedGlobalThis
];

function generateModifiedWindow(pademelonInstance: Pademelon, targetWindow: Window = window): Window {
    const modifiedProperties = {};
    const modifiedWindow = interceptObject(targetWindow, {
        modifiedProperties,
        useOriginalTarget: false,
        getHook(prop) {
            if (!(prop in targetWindow) && typeof prop === 'string') {
                pademelonInstance.runFuncLookupChain(prop);
            }
        }
    });
    for (const modifiedWindowRewriter of modifiedWindowRewriters) {
        modifiedWindowRewriter(pademelonInstance, modifiedProperties, targetWindow, modifiedWindow);
    }
    return modifiedWindow;
}

export { generateModifiedWindow };
