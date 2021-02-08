import Pademelon = require('../../browser-module');
import { modTypes, typeToMod } from '../../mod';
import { rewriteAttrSpecial } from '../../rewriters/html-rewriter';
import { rewriteFunction } from '../rewriteFunction';
import { htmlElementClassRewrites } from './HTMLElementsAttribute';

function rewriteAttrValue(
    element: Element,
    attr: string,
    attrValue: string,
    rewriter: (url: string, mod?: string) => string
): string {
    if (htmlElementClassRewrites[element.constructor.name]) {
        for (const eachRewriteAttr of htmlElementClassRewrites[element.constructor.name]) {
            if (eachRewriteAttr[0] === attr) {
                return rewriteAttrSpecial(attr, attrValue, (url) => rewriter(url, eachRewriteAttr[1]));
            }
        }
    }
    return attrValue;
}

function rewriteElementProto(pademelonInstance: Pademelon) {
    rewriteFunction(Element.prototype, 'setAttribute', false, {
        interceptArgs(this: Element, _, attr: string, attrValue?: string) {
            if (typeof attrValue === 'string') {
                attrValue = rewriteAttrValue(this, attr, attrValue, (url, mod) =>
                    pademelonInstance.rewriteUrl(url, typeToMod(mod as modTypes))
                );
            }
            return [attr, attrValue];
        }
    });
    rewriteFunction(Element.prototype, 'getAttribute', false, {
        interceptReturn(this: Element, _, originalValue, attr: string) {
            if (typeof originalValue === 'string') {
                return rewriteAttrValue(this, attr, originalValue, (url) => pademelonInstance.unrewriteUrl(url).url);
            }
            return originalValue;
        }
    });
}

export { rewriteElementProto };
