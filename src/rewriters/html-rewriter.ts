import srcset = require('srcset');
import { escapeCharacters, escapeString, unescapeString } from './css-rewriter';

type htmlUrlTypes = 'url' | 'stylesheet' | 'script' | 'fetch';
type htmlUrlRewriter = (inputUrl: string, htmlUrlType: htmlUrlTypes) => string;
type strStrFunc = (str: string) => string;

// quote regex modified from
// https://stackoverflow.com/questions/171480/regex-grabbing-values-between-quotation-marks#comment87998981_171499

// :~ means capture group is used to recreate the original string, and not used in processing
// capture group 1: href
// capture group 2:~ ' = '
// capture group 3: delimiter. " or '
// capture group 4: the actual url

const attributesToRewrite = [
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
const htmlAttributeRegex = new RegExp(
    '(' + attributesToRewrite.join('|') + ')(\\s*=\\s*)(["\'])((?:\\\\.|[^\\\\])*?)(?=\\3)',
    'gi'
);

function rewriteAttrSpecial(attr: string, attrValue: string, rewriter: (origUrl: string) => string): string {
    switch (attr?.toLowerCase()) {
        case 'archive':
            const splitArchive = attrValue.split(/ |,/);
            for (let i = 0; i < splitArchive.length; i++) {
                splitArchive[i] = rewriter(splitArchive[i]);
            }
            return splitArchive.join(',');
        case 'content':
            const splitSemicolon = attrValue.split(/;\s*url=/);
            if (splitSemicolon[1]) {
                splitSemicolon[1] = rewriter(splitSemicolon[1]);
            }
            return splitSemicolon.join('; url=');
        case 'srcset':
            try {
                const srcsetParsed = srcset.parse(attrValue);
                for (const eachSet of srcsetParsed) {
                    eachSet.url = rewriter(eachSet.url);
                }
                return srcset.stringify(srcsetParsed);
            } catch (e) {
                return attrValue;
            }
        default:
            return rewriter(attrValue);
    }
}

function failbackHtmlRewriter(htmlText: string, urlRewriteFunc: htmlUrlRewriter): string {
    return htmlText.replace(htmlAttributeRegex, (_match: string, g1: string, g2: string, g3: string, g4: string) => {
        const delimiter = g3 as escapeCharacters;
        return (
            g1 +
            g2 +
            g3 +
            escapeString(
                rewriteAttrSpecial(g1, unescapeString(g4), (url) => urlRewriteFunc(url, 'url')),
                delimiter
            )
        );
    });
}

function rewriteAttribute(element: any, attributeName: string, callbackRewrite: (attributeValue: string) => string) {
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue) {
        element.setAttribute(
            attributeName,
            rewriteAttrSpecial(attributeName, attributeValue, (url) => callbackRewrite(url))
        );
    }
}

function recursiveRewriteHtml(
    element: any,
    urlRewriteFunc: htmlUrlRewriter,
    cssRewriterFunc: strStrFunc,
    jsRewriterFunc: strStrFunc,
    recursive = true
) {
    switch (element.tagName) {
        case 'SCRIPT':
            element.removeAttribute('integrity');
            if (element.textContent && !element.getAttribute('type')?.endsWith('json'))
                element.textContent = jsRewriterFunc(element.textContent);
            rewriteAttribute(element, 'src', (attributeValue) => urlRewriteFunc(attributeValue, 'script'));
            break;
        case 'STYLE':
            if (element.textContent) element.textContent = cssRewriterFunc(element.textContent);
            break;
        case 'LINK':
            element.removeAttribute('integrity');
            rewriteAttribute(element, 'href', (hrefValue) => {
                if (element.getAttribute('rel') === 'stylesheet' || element.getAttribute('type')?.endsWith('css')) {
                    return urlRewriteFunc(hrefValue, 'stylesheet');
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
                return urlRewriteFunc(hrefValue, urlType);
            });
            break;
        default:
            for (const eachAttribute of attributesToRewrite) {
                rewriteAttribute(element, eachAttribute, (attributeValue) => urlRewriteFunc(attributeValue, 'url'));
            }
            rewriteAttribute(element, 'style', cssRewriterFunc);
    }
    if (recursive) {
        for (const eachChildNode of element.childNodes) {
            if (eachChildNode.nodeType === 1) {
                // 1 === Node.ELEMENT_NODE
                recursiveRewriteHtml(eachChildNode, urlRewriteFunc, cssRewriterFunc, jsRewriterFunc, recursive);
            }
        }
    }
}

export { recursiveRewriteHtml, failbackHtmlRewriter, rewriteAttrSpecial, htmlUrlTypes, htmlUrlRewriter, strStrFunc };
