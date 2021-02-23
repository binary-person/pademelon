import { HtmlRewriter } from './HtmlRewriter';
import { parse as parseHtml, valid as validateHtml } from 'node-html-parser';

class HtmlRewriterNodejs extends HtmlRewriter {
    public rewriteHtmlString(htmlText: string): string {
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
            this.rewriteHtml((parsedHtml as unknown) as Element);
            return parsedHtml.toString();
        } else {
            return this.failbackHtmlRewriter(htmlText);
        }
    }
}

export { HtmlRewriterNodejs };
