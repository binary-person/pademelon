import Pademelon = require('../../browser-module');
import { interceptObject } from '../interceptObject';
import { modifiedLocation } from './location';

// not creating a separate modifiedWindow/document folder because the only
// immutable object we need to rewrite is document.location

function modifiedDocument(pademelonInstance: Pademelon, modifiedProperties: object, targetWindow: Window): void {
    const modifiedDocumentProps = {};
    modifiedLocation(pademelonInstance, modifiedDocumentProps, targetWindow);
    const interceptedDocument = interceptObject(document, { modifiedProperties: modifiedDocumentProps });
    Object.defineProperty(modifiedProperties, 'document', {
        enumerable: true,
        value: interceptedDocument
    });
}

export { modifiedDocument };
