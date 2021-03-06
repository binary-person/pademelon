import Pademelon = require('../../browser-module');
import { rewriteFunction } from '../rewriteFunction';

function injectPademelonIntoEmptyIFrame(
    pademelonInstance: Pademelon,
    iframe: HTMLIFrameElement,
    executeImmediately = false
) {
    const loadPademelon = () => {
        if (
            !iframe.src ||
            iframe.src === 'about:blank' ||
            !iframe.contentDocument ||
            !iframe.contentWindow ||
            'Pademelon' in iframe.contentWindow
        )
            return;

        const pademelonInject = iframe.contentDocument.createElement('script');
        pademelonInject.text =
            pademelonInstance.getPademelonDist() + pademelonInstance.generateDefaultPademelonInitCode();

        iframe.contentDocument.head.appendChild(pademelonInject);
    };
    iframe.addEventListener('load', loadPademelon);
    if (executeImmediately) loadPademelon();
}

function rewriteDocumentProto(pademelonInstance: Pademelon): void {
    Document.prototype.createElement = rewriteFunction(Document.prototype.createElement, {
        hookAfterCall(_, element: Element, _tagName: string, _options?: any) {
            if (element instanceof HTMLIFrameElement) {
                // inject pademelon into empty iframes
                injectPademelonIntoEmptyIFrame(pademelonInstance, element);
            }
        }
    });
    Document.prototype.write = rewriteFunction(Document.prototype.write, {
        interceptArgs(_, ...texts: string[]) {
            return [pademelonInstance.rewriteHTML(texts.join(''))] as const;
        }
    });
    Document.prototype.writeln = rewriteFunction(Document.prototype.writeln, {
        interceptArgs(_, ...texts: string[]) {
            return [pademelonInstance.rewriteHTML(texts.join(''))] as const;
        }
    });
}

function patchCreateTreeWalker(pademelonInstance: Pademelon): void {
    Document.prototype.createTreeWalker = rewriteFunction(Document.prototype.createTreeWalker, {
        interceptArgs(_: any, root: Document, whatToShow?: any, filter?: any) {
            if (root === pademelonInstance.modifiedWindow.document) {
                root = document;
            }
            return [root, whatToShow, filter] as const;
        }
    });
}

export { rewriteDocumentProto, patchCreateTreeWalker };
