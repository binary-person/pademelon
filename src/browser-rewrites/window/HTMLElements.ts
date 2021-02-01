/**
 * putting all HTML(insert_element_class_name_here) rewrites in one file to put everything related together
 * (and to avoid creating 20 files)
 */

import Pademelon = require('../../browser-module');
import { modTypes, typeToMod } from '../../mod';
import { rewriteAttrSpecial } from '../../rewriters/html-rewriter';
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
    if (!htmlElementClassRewrites[eachElementClass].length) delete htmlElementClassRewrites[eachElementClass];
}
console.log(JSON.stringify(htmlElementClassRewrites, null, 4))
*/

type htmlElementClassRewritesArrayType = [attribute: string, modType?: modTypes];
type htmlElementClassRewritesShape = {
    [elementClass: string]: htmlElementClassRewritesArrayType[];
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
        ['srcset', 'raw'],
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
    HTMLTemplateElement: [['content']],
    HTMLTrackElement: [['src']],
};

function rewriteElementProtoAttr(
    pademelonInstance: Pademelon,
    targetElementClass: any,
    attr: string,
    mod?: string,
): void {
    if (targetElementClass && targetElementClass.prototype) {
        rewriteGetterSetter(
            targetElementClass.prototype,
            attr,
            (returnValue: string): string => {
                return rewriteAttrSpecial(attr, returnValue, (url) => pademelonInstance.unrewriteUrl(url).url);
            },
            (setValue: string): string => {
                return rewriteAttrSpecial(attr, setValue, (url) => pademelonInstance.rewriteUrl(url, mod));
            },
        );
    }
}

function rewriteHTMLElements(pademelonInstance: Pademelon) {
    for (const elementClass in htmlElementClassRewrites) {
        for (const eachAttribute of htmlElementClassRewrites[elementClass]) {
            rewriteElementProtoAttr(
                pademelonInstance,
                window[elementClass as any],
                eachAttribute[0],
                typeToMod(eachAttribute[1] as modTypes),
            );
        }
    }
}

export { rewriteHTMLElements, htmlElementClassRewrites };
