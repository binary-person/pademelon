/**
 * putting all HTML(insert_element_class_name_here) rewrites in one file to put everything related together
 * (and to avoid creating 20 files)
 */

import Pademelon = require('../../browser-module');
import { modTypes, typeToMod } from '../../mod';
import { HtmlRewriter } from '../../rewriters/HtmlRewriter';
import { rewriteGetterSetter } from '../rewriteGetterSetter';

/*
following is code used to generate the core of htmlElementClassRewrites. keeping it here
to alleviate the maintenance done on this file when the whatwg spec updates
(paste this in a modern browser)
var list = [];
// list of attributes credited to https://stackoverflow.com/a/2725168/6850723
var attributes = ['action', 'archive', 'background', 'cite', 'classid', 'codebase', 'content',
    'data', 'href', 'longdesc', 'profile', 'src', 'srcset', 'usemap']
for (let eachDesc in Object.getOwnPropertyDescriptors(window))
    if(eachDesc.startsWith('HTML'))
        list.push(eachDesc)
list = list.sort((a, b) => a.localeCompare(b))

var htmlElementClassRewrites = {};
for (let eachElementClass of list) {
    htmlElementClassRewrites[eachElementClass] = [];
    let descriptors = Object.getOwnPropertyDescriptors(window[eachElementClass].prototype);
    for (let eachAttribute of attributes)
        if (eachAttribute in descriptors)
            htmlElementClassRewrites[eachElementClass].push([eachAttribute])
    if (!htmlElementClassRewrites[eachElementClass].length || eachElementClass === 'HTMLTemplateElement')
        delete htmlElementClassRewrites[eachElementClass];
}
console.log(JSON.stringify(htmlElementClassRewrites, null, 4))
*/

type elementClasses =
    | 'HTMLAnchorElement'
    | 'HTMLAreaElement'
    | 'HTMLBaseElement'
    | 'HTMLBodyElement'
    | 'HTMLEmbedElement'
    | 'HTMLFormElement'
    | 'HTMLFrameElement'
    | 'HTMLIFrameElement'
    | 'HTMLImageElement'
    | 'HTMLInputElement'
    | 'HTMLLinkElement'
    | 'HTMLMediaElement'
    | 'HTMLMetaElement'
    | 'HTMLModElement'
    | 'HTMLObjectElement'
    | 'HTMLQuoteElement'
    | 'HTMLScriptElement'
    | 'HTMLSourceElement'
    | 'HTMLTrackElement';
type htmlElementClassRewritesArrayType = [attribute: string, modType?: modTypes];
type htmlElementClassRewritesShape = {
    [elementClass in elementClasses]: htmlElementClassRewritesArrayType[];
};

// reason for using arrays is because when running prettier, it saves lots of space
// and is much more compact
const htmlElementClassRewrites: htmlElementClassRewritesShape = {
    HTMLAnchorElement: [['href']],
    HTMLAreaElement: [['href']],
    HTMLBaseElement: [['href']],
    HTMLBodyElement: [['background', 'raw']],
    HTMLEmbedElement: [['src', 'raw']],
    HTMLFormElement: [['action']],
    HTMLFrameElement: [['src']],
    HTMLIFrameElement: [['src']],
    HTMLImageElement: [
        ['src', 'raw'],
        ['srcset', 'raw']
    ],
    HTMLInputElement: [['src']],
    HTMLLinkElement: [['href']],
    HTMLMediaElement: [['src', 'raw']],
    HTMLMetaElement: [['content']],
    HTMLModElement: [['cite']],
    HTMLObjectElement: [['archive'], ['data', 'raw']],
    HTMLQuoteElement: [['cite']],
    HTMLScriptElement: [['src', 'javascript']],
    HTMLSourceElement: [['src'], ['srcset']],
    HTMLTrackElement: [['src']]
};

function rewriteElementProtoAttr<T extends new (...args: any[]) => any, K extends string & keyof T>(
    pademelonInstance: Pademelon,
    targetElementClass: T,
    attr: K,
    mod?: string
): void {
    const htmlRewriter = new HtmlRewriter();

    if (targetElementClass && targetElementClass.prototype) {
        rewriteGetterSetter(targetElementClass.prototype, attr, {
            rewriteGetter(returnValue: string): string {
                if (returnValue) {
                    htmlRewriter.rewriteUrl = (url) => pademelonInstance.unrewriteUrl(url).url;
                    return htmlRewriter.attributeRewriter(attr, returnValue);
                }
                return returnValue;
            },
            rewriteSetter(setValue: string): string {
                if (setValue) {
                    htmlRewriter.rewriteUrl = (url) => pademelonInstance.rewriteUrl(url, undefined, mod);
                    return htmlRewriter.attributeRewriter(attr, setValue);
                }
                return setValue;
            }
        });
    }
}

function rewriteHTMLElementsAttribute(pademelonInstance: Pademelon): void {
    for (const elementClass in htmlElementClassRewrites) {
        for (const eachAttribute of htmlElementClassRewrites[elementClass as elementClasses]) {
            rewriteElementProtoAttr(
                pademelonInstance,
                window[elementClass as elementClasses],
                eachAttribute[0] as any,
                typeToMod(eachAttribute[1] as modTypes)
            );
        }
    }
}

export { rewriteHTMLElementsAttribute, htmlElementClassRewrites, elementClasses };
