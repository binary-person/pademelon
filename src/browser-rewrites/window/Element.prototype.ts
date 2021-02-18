import Pademelon = require('../../browser-module');
import { modTypes, typeToMod } from '../../mod';
import { rewriteAttrSpecial } from '../../rewriters/html-rewriter';
import { rewriteFunction } from '../rewriteFunction';
import { htmlElementClassRewrites, elementClasses } from './HTMLElementsAttribute';

function rewriteAttrValue(
    element: Element,
    attr: string,
    attrValue: string,
    rewriter: (url: string, mod?: string) => string
): string {
    if (element.constructor.name in htmlElementClassRewrites) {
        for (const eachRewriteAttr of htmlElementClassRewrites[element.constructor.name as elementClasses]) {
            if (eachRewriteAttr[0] === attr) {
                return rewriteAttrSpecial(attr, attrValue, (url) => rewriter(url, eachRewriteAttr[1]));
            }
        }
    }
    return attrValue;
}

function rewriteElementProto(pademelonInstance: Pademelon): void {
    Element.prototype.setAttribute = rewriteFunction(Element.prototype.setAttribute, {
        interceptArgs(this: Element, _, attr: string, attrValue: string) {
            if (typeof attrValue === 'string') {
                attrValue = rewriteAttrValue(this, attr, attrValue, (url, mod) =>
                    pademelonInstance.rewriteUrl(url, typeToMod(mod as modTypes))
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
}

export { rewriteElementProto };
