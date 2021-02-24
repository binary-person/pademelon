import Pademelon = require('../../browser-module');
import { modTypes, typeToMod } from '../../mod';
import { HtmlRewriter } from '../../rewriters/HtmlRewriter';
import { rewriteFunction } from '../rewriteFunction';
import { rewriteGetterSetter } from '../rewriteGetterSetter';
import { htmlElementClassRewrites, elementClasses } from './HTMLElementsAttribute';

function rewriteAttrValue(
    element: Element,
    attr: string,
    attrValue: string,
    rewriter: (url: string, mod?: string) => string
): string {
    const htmlRewriter = new HtmlRewriter();
    if (element.constructor.name in htmlElementClassRewrites) {
        for (const eachRewriteAttr of htmlElementClassRewrites[element.constructor.name as elementClasses]) {
            if (eachRewriteAttr[0] === attr) {
                htmlRewriter.rewriteUrl = (url) => rewriter(url, eachRewriteAttr[1]);
                return htmlRewriter.attributeRewriter(attr, attrValue);
            }
        }
    }
    return attrValue;
}

function rewriteElementProto(pademelonInstance: Pademelon): void {
    // get/setAttribute
    Element.prototype.setAttribute = rewriteFunction(Element.prototype.setAttribute, {
        interceptArgs(this: Element, _, attr: string, attrValue: string) {
            if (typeof attrValue === 'string') {
                attrValue = rewriteAttrValue(this, attr, attrValue, (url, mod) =>
                    pademelonInstance.rewriteUrl(url, undefined, typeToMod(mod as modTypes))
                );
            }
            return [attr, attrValue] as const;
        }
    });
    Element.prototype.getAttribute = rewriteFunction(Element.prototype.getAttribute, {
        interceptReturn(this: Element, _, originalValue, attr: string) {
            if (typeof originalValue === 'string') {
                return rewriteAttrValue(this, attr, originalValue, (url) => pademelonInstance.unrewriteUrl(url).url);
            }
            return originalValue;
        }
    });

    // innerHTML
    rewriteGetterSetter(Element.prototype, 'innerHTML', {
        rewriteSetter(this: Element, setValue: string): string {
            if (setValue && this instanceof HTMLElement) {
                setValue = pademelonInstance.rewriteHTML(setValue);
            }
            return setValue;
        }
    });
}

export { rewriteElementProto };
