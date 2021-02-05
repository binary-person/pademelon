/**
 * this is for rewriting immutable objects like window.location
 */

import Pademelon = require('../../browser-module');
import { interceptObject } from '../interceptObject';
import { modifiedDocument } from './document';
import { modifiedLocation } from './location';
import { modifiedTop } from './top';
import { modifiedRecursiveWindow } from './window';

type modifiedWindowFuncParams = (pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window) => void;

const modifiedWindowRewriters: modifiedWindowFuncParams[] = [
    modifiedLocation,
    modifiedRecursiveWindow,
    modifiedDocument,
    modifiedTop
];

function generateModifiedWindow(pademelonInstance: Pademelon, targetWindow: Window = window) {
    // force "any" type on all objects to get webpack to stop screaming about
    // "Element implicitly has an 'any' type because expression of type 'string | number | symbol' can't be used to index type '{}'."
    const modifiedWindow = {};
    for (const modifiedWindowRewriter of modifiedWindowRewriters) {
        modifiedWindowRewriter(pademelonInstance, modifiedWindow, targetWindow);
    }
    return interceptObject(window, modifiedWindow);
}

export { generateModifiedWindow };
