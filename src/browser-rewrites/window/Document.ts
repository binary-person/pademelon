import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function injectPademelonIntoEmptyIFrame(
    pademelonInstance: Pademelon,
    iframe: HTMLIFrameElement,
    executeImmediately = false
) {
    if (
        (!iframe.src || iframe.src === 'about:blank') &&
        iframe.contentDocument &&
        iframe.contentWindow &&
        !('Pademelon' in iframe.contentWindow)
    ) {
        const loadPademelon = () => {
            if (!iframe.contentDocument || !iframe.contentWindow || 'Pademelon' in iframe.contentWindow) return;

            const pademelonInject = iframe.contentDocument.createElement('script');
            pademelonInject.text =
                pademelonInstance.getPademelonDist() + pademelonInstance.generateDefaultPademelonInitCode();

            iframe.contentDocument.head.appendChild(pademelonInject);
        };
        iframe.addEventListener('load', loadPademelon);
        if (executeImmediately) loadPademelon();
    }
}

function rewriteDocumentProto(pademelonInstance: Pademelon) {
    rewriteFunction(Document.prototype, 'createElement', false, {
        hookAfterCall(_, element: Element, _tagName: string, _options?: any) {
            if (element instanceof HTMLIFrameElement) {
                // inject pademelon into empty iframes
                injectPademelonIntoEmptyIFrame(pademelonInstance, element);
            }
        }
    });
}

function patchCreateTreeWalker(pademelonInstance: Pademelon) {
    rewriteFunction(Document.prototype, 'createTreeWalker', false, {
        interceptArgs(_: any, root: Document, whatToShow?: any, filter?: any) {
            if (root === pademelonInstance.modifiedWindow.document) {
                root = document;
            }
            return [root, whatToShow, filter];
        }
    });
}

export { rewriteDocumentProto, patchCreateTreeWalker };
