import { escapeCharacters, escapeString, unescapeString } from './css-rewriter';

type htmlUrlTypes = 'url' | 'stylesheet' | 'script';
type htmlUrlRewriter = (inputUrl: string, htmlUrlType: htmlUrlTypes) => string;
type strStrFunc = (str: string) => string;

// quote regex modified from
// https://stackoverflow.com/questions/171480/regex-grabbing-values-between-quotation-marks#comment87998981_171499

// :~ means capture group is used to recreate the original string, and not used in processing
// capture group 1:~ 'href = '
// capture group 2: delimiter. " or '
// capture group 3: the actual url

const attributesToRewrite = ['href', 'src', 'poster', 'action', 'data', 'codebase'];
const htmlAttributeRegex = new RegExp(
    '((?:' + attributesToRewrite.join('|') + ')\\s*=\\s*)(["\'])((?:\\\\.|[^\\\\])*?)(?=\\2)',
    'g',
);

function failbackHtmlRewriter(htmlText: string, urlRewriteFunc: htmlUrlRewriter): string {
    return htmlText.replace(htmlAttributeRegex, (_match: string, g1: string, g2: string, g3: string) => {
        const delimiter = g2 as escapeCharacters;
        return g1 + g2 + escapeString(urlRewriteFunc(unescapeString(g3), 'url'), delimiter);
    });
}

function rewriteAttribute(element: any, attributeName: string, callbackRewrite: (attributeValue: string) => string) {
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue) {
        element.setAttribute(attributeName, callbackRewrite(attributeValue));
    }
}

function recursiveRewriteHtml(
    element: any,
    urlRewriteFunc: htmlUrlRewriter,
    cssRewriterFunc: strStrFunc,
    jsRewriterFunc: strStrFunc,
    recursive = true,
) {
    switch (element.tagName) {
        case 'SCRIPT':
            if (element.textContent) element.textContent = jsRewriterFunc(element.textContent);
            rewriteAttribute(element, 'src', (attributeValue) => urlRewriteFunc(attributeValue, 'script'));
            break;
        case 'STYLE':
            if (element.textContent) element.textContent = cssRewriterFunc(element.textContent);
            break;
        case 'LINK':
            rewriteAttribute(element, 'href', (hrefValue) => {
                if (element.getAttribute('rel') === 'stylesheet' || element.getAttribute('type')?.endsWith('css')) {
                    return urlRewriteFunc(hrefValue, 'stylesheet');
                }
                const typeAs = element.getAttribute('as');
                if (typeAs) {
                    if (typeAs === 'script') {
                        return urlRewriteFunc(hrefValue, 'script');
                    } else if (typeAs === 'style') {
                        return urlRewriteFunc(hrefValue, 'stylesheet');
                    } else {
                        return urlRewriteFunc(hrefValue, 'url');
                    }
                } else {
                    return urlRewriteFunc(hrefValue, 'url');
                }
            });
            break;
        default:
            for (const eachAttribute of attributesToRewrite) {
                rewriteAttribute(element, eachAttribute, (attributeValue) => urlRewriteFunc(attributeValue, 'url'));
            }
            rewriteAttribute(element, 'srcset', (attributeValue) => {
                return attributeValue
                    .split(',')
                    .map((e) => {
                        const spaceSplit = e.trim().split(' ');
                        spaceSplit[0] = urlRewriteFunc(spaceSplit[0], 'url');
                        return spaceSplit.join(' ');
                    })
                    .join(', ');
            });
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

export { recursiveRewriteHtml, failbackHtmlRewriter, htmlUrlTypes, htmlUrlRewriter, strStrFunc };
