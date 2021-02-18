import Pademelon = require('../../browser-module');
import { interceptObject } from '../interceptObject';
import { modifiedLocation } from './location';

// not creating a separate modifiedWindow/document folder because the only
// immutable object we need to rewrite is document.location

function modifiedDocument(pademelonInstance: Pademelon, modifiedWindow: object, targetWindow: Window): void {
    const modifiedDocumentProps = {};
    modifiedLocation(pademelonInstance, modifiedDocumentProps, targetWindow);
    const interceptedDocument = interceptObject(document, { modifiedProperties: modifiedDocumentProps });
    Object.defineProperty(modifiedWindow, 'document', {
        enumerable: true,
        get() {
            return interceptedDocument;
        }
    });
}

export { modifiedDocument };
