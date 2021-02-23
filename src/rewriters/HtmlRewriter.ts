import srcset = require('srcset');
import { escapeCharacters, escapeString, unescapeString } from './css-rewriter';

type htmlUrlTypes = 'url' | 'stylesheet' | 'script' | 'fetch';
type htmlUrlRewriter = (inputUrl: string, htmlUrlType: htmlUrlTypes) => string;
type htmlCSSRewriter = (str: string) => string;
type htmlJSRewriter = (str: string) => string;

// quote regex modified from
// https://stackoverflow.com/questions/171480/regex-grabbing-values-between-quotation-marks#comment87998981_171499

// :~ means capture group is used to recreate the original string, and not used in processing
// capture group 1: href
// capture group 2:~ ' = '
// capture group 3: delimiter. " or '
// capture group 4: the actual url

const urlAttributes = [
    'action',
    'background',
    'cite',
    'classid',
    'codebase',
    'data',
    'href',
    'longdesc',
    'profile',
    'src',
    'usemap',
    'archive',
    'content',
    'srcset'
];
// following is generated with `"['"+Object.keys(HTMLElement.prototype).filter(e=>e.startsWith('on')).join("','")+"']"`
const eventListenerAttributes = [
    'onabort',
    'onblur',
    'oncancel',
    'oncanplay',
    'oncanplaythrough',
    'onchange',
    'onclick',
    'onclose',
    'oncontextmenu',
    'oncuechange',
    'ondblclick',
    'ondrag',
    'ondragend',
    'ondragenter',
    'ondragleave',
    'ondragover',
    'ondragstart',
    'ondrop',
    'ondurationchange',
    'onemptied',
    'onended',
    'onerror',
    'onfocus',
    'onformdata',
    'oninput',
    'oninvalid',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onload',
    'onloadeddata',
    'onloadedmetadata',
    'onloadstart',
    'onmousedown',
    'onmouseenter',
    'onmouseleave',
    'onmousemove',
    'onmouseout',
    'onmouseover',
    'onmouseup',
    'onmousewheel',
    'onpause',
    'onplay',
    'onplaying',
    'onprogress',
    'onratechange',
    'onreset',
    'onresize',
    'onscroll',
    'onseeked',
    'onseeking',
    'onselect',
    'onstalled',
    'onsubmit',
    'onsuspend',
    'ontimeupdate',
    'ontoggle',
    'onvolumechange',
    'onwaiting',
    'onwebkitanimationend',
    'onwebkitanimationiteration',
    'onwebkitanimationstart',
    'onwebkittransitionend',
    'onwheel',
    'onauxclick',
    'ongotpointercapture',
    'onlostpointercapture',
    'onpointerdown',
    'onpointermove',
    'onpointerup',
    'onpointercancel',
    'onpointerover',
    'onpointerout',
    'onpointerenter',
    'onpointerleave',
    'onselectstart',
    'onselectionchange',
    'onanimationend',
    'onanimationiteration',
    'onanimationstart',
    'ontransitionrun',
    'ontransitionstart',
    'ontransitionend',
    'ontransitioncancel',
    'oncopy',
    'oncut',
    'onpaste',
    'onpointerrawupdate'
];

const attributesToRewrite = urlAttributes.concat(eventListenerAttributes).concat(['style']);
const htmlAttributeRegex = new RegExp(
    '(' + attributesToRewrite.join('|') + ')(\\s*=\\s*)(["\'])((?:\\\\.|[^\\\\])*?)(?=\\3)',
    'gi'
);

function rewriteAttribute(element: Element, attributeName: string, rewriter: (attributeValue: string) => string) {
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue) {
        element.setAttribute(attributeName, rewriter(attributeValue));
    }
}

class HtmlRewriter {
    public rewriteUrl: htmlUrlRewriter;
    public rewriteCSS: htmlCSSRewriter;
    public rewriteJS: htmlJSRewriter;
    constructor({
        rewriteUrl = (url) => url,
        rewriteCSS = (css) => css,
        rewriteJS = (js) => js
    }: {
        rewriteUrl?: htmlUrlRewriter;
        rewriteCSS?: htmlCSSRewriter;
        rewriteJS?: htmlJSRewriter;
    } = {}) {
        this.rewriteUrl = rewriteUrl;
        this.rewriteCSS = rewriteCSS;
        this.rewriteJS = rewriteJS;
    }

    public attributeRewriter(attr: string, attrValue: string): string {
        attr = attr.toLowerCase();
        switch (attr) {
            case 'archive':
                const splitArchive = attrValue.split(/ |,/);
                for (let i = 0; i < splitArchive.length; i++) {
                    splitArchive[i] = this.rewriteUrl(splitArchive[i], 'url');
                }
                return splitArchive.join(',');
            case 'content':
                const splitSemicolon = attrValue.split(/;\s*url=/);
                if (splitSemicolon[1]) {
                    splitSemicolon[1] = this.rewriteUrl(splitSemicolon[1], 'url');
                }
                return splitSemicolon.join('; url=');
            case 'srcset':
                try {
                    const srcsetParsed = srcset.parse(attrValue);
                    for (const eachSet of srcsetParsed) {
                        eachSet.url = this.rewriteUrl(eachSet.url, 'url');
                    }
                    return srcset.stringify(srcsetParsed);
                } catch (e) {
                    return attrValue;
                }
            default:
                if (attr === 'style') {
                    return this.rewriteCSS(attrValue);
                } else if (eventListenerAttributes.includes(attr)) {
                    return this.rewriteJS(attrValue);
                }
                return this.rewriteUrl(attrValue, 'url');
        }
    }
    public failbackHtmlRewriter(htmlText: string): string {
        return htmlText.replace(
            htmlAttributeRegex,
            (_match: string, g1: string, g2: string, g3: string, g4: string) => {
                const delimiter = g3 as escapeCharacters;
                return g1 + g2 + g3 + escapeString(this.attributeRewriter(g1, unescapeString(g4)), delimiter);
            }
        );
    }
    public rewriteHtml(element: Element, recursive = true): void {
        switch (element.tagName) {
            case 'SCRIPT':
                element.removeAttribute('integrity');
                if (element.textContent && !element.getAttribute('type')?.endsWith('json'))
                    element.textContent = this.rewriteJS(element.textContent);
                rewriteAttribute(element, 'src', (attributeValue) => this.rewriteUrl(attributeValue, 'script'));
                break;
            case 'STYLE':
                if (element.textContent) element.textContent = this.rewriteCSS(element.textContent);
                break;
            case 'LINK':
                element.removeAttribute('integrity');
                rewriteAttribute(element, 'href', (hrefValue) => {
                    if (element.getAttribute('rel') === 'stylesheet' || element.getAttribute('type')?.endsWith('css')) {
                        return this.rewriteUrl(hrefValue, 'stylesheet');
                    }
                    const typeAs = element.getAttribute('as');
                    let urlType: htmlUrlTypes = 'url';
                    switch (typeAs) {
                        case 'script':
                            urlType = 'script';
                            break;
                        case 'style':
                            urlType = 'stylesheet';
                            break;
                        case 'fetch':
                            urlType = 'fetch';
                            break;
                    }
                    return this.rewriteUrl(hrefValue, urlType);
                });
                break;
            default:
                for (const eachAttribute of attributesToRewrite) {
                    rewriteAttribute(element, eachAttribute, (attributeValue) =>
                        this.attributeRewriter(eachAttribute, attributeValue)
                    );
                }
        }
        if (recursive) {
            for (const eachChildNode of element.childNodes) {
                if (eachChildNode.nodeType === 1) {
                    // 1 === Node.ELEMENT_NODE
                    this.rewriteHtml(eachChildNode as Element, recursive);
                }
            }
        }
    }
}

export { HtmlRewriter, htmlUrlTypes, htmlUrlRewriter, htmlCSSRewriter, htmlJSRewriter };
