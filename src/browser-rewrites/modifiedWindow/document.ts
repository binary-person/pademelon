import Pademelon = require('../../browser-module');
import { interceptObject } from '../interceptObject';
import { modifiedLocation } from './location';

// not creating a separate modifiedWindow/document folder because the only
// immutable object we need to rewrite is document.location

function modifiedDocument(pademelonInstance: Pademelon, modifiedWindow: object) {
    const modifiedDocumentProps = {};
    modifiedLocation(pademelonInstance, modifiedDocumentProps);
    const interceptedDocument = interceptObject(document, modifiedDocumentProps);
    Object.defineProperty(modifiedWindow, 'document', {
        get() {
            return interceptedDocument;
        },
    });
}

export { modifiedDocument };
