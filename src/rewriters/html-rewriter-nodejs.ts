import { JSDOM } from 'jsdom';
import { recursiveRewriteHtml, failbackHtmlRewriter, htmlUrlRewriter, strStrFunc } from './html-rewriter';
import { parse as parseHtml, valid as validateHtml, TextNode } from 'node-html-parser';

function htmlNodejsRewriter(
    htmlText: string,
    urlRewriteFunc: htmlUrlRewriter,
    cssRewriterFunc: strStrFunc,
    jsRewriterFunc: strStrFunc,
): string {
    // the following is old code for the node-html-parser. leaving it here in case something goes wrong
    if (validateHtml(htmlText)) {
        const parsedHtml = parseHtml(htmlText, {
            lowerCaseTagName: true, // convert tag name to lower case (hurt performance heavily)
            comment: true, // retrieve comments (hurt performance slightly)
            blockTextElements: {
                script: true, // keep text content when parsing
                noscript: true, // keep text content when parsing
                style: true, // keep text content when parsing
                pre: true, // keep text content when parsing
            },
        });
        recursiveRewriteHtml(parsedHtml, urlRewriteFunc, cssRewriterFunc, jsRewriterFunc);
        return parsedHtml.toString();
    } else {
        return failbackHtmlRewriter(htmlText, urlRewriteFunc);
    }

    // even though jsdom parses *very* slow, it is worth the cost for valid rewritten html
    // additionally, I don't need to go through the headache of coding polyfills for
    // a faster accurate parser library like parse5
    // const jsdom = new JSDOM(htmlText);
    // recursiveRewriteHtml(jsdom.window.document.documentElement, urlRewriteFunc, cssRewriterFunc, jsRewriterFunc);
    // return jsdom.serialize();
}

export { htmlNodejsRewriter };
