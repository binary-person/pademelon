import { recursiveRewriteHtml, failbackHtmlRewriter, htmlUrlRewriter, strStrFunc } from './html-rewriter';
import { parse as parseHtml, valid as validateHtml } from 'node-html-parser';

function htmlNodejsRewriter(
    htmlText: string,
    urlRewriteFunc: htmlUrlRewriter,
    cssRewriterFunc: strStrFunc,
    jsRewriterFunc: strStrFunc
): string {
    if (validateHtml(htmlText)) {
        const parsedHtml = parseHtml(htmlText, {
            lowerCaseTagName: true, // convert tag name to lower case (hurt performance heavily)
            comment: true, // retrieve comments (hurt performance slightly)
            blockTextElements: {
                script: true, // keep text content when parsing
                noscript: true, // keep text content when parsing
                style: true, // keep text content when parsing
                pre: true // keep text content when parsing
            }
        });
        recursiveRewriteHtml((parsedHtml as unknown) as Element, urlRewriteFunc, cssRewriterFunc, jsRewriterFunc);
        return parsedHtml.toString();
    } else {
        return failbackHtmlRewriter(htmlText, urlRewriteFunc);
    }
}

export { htmlNodejsRewriter };
