import { HtmlRewriter, HtmlRewriterOptions } from './HtmlRewriter';

class HtmlRewriterBrowser extends HtmlRewriter {
    private parser: Document;
    constructor(options: HtmlRewriterOptions) {
        super(options);

        this.parser = new Document();
        this.parser.append(this.parser.implementation.createDocumentType('html', '', ''));
        this.parser.append(this.parser.createElement('html'));
    }
    public rewriteHtmlString(htmlText: string): string {
        this.parser.documentElement.innerHTML = htmlText;
        this.rewriteHtml(this.parser.documentElement);
        return this.parser.documentElement.innerHTML;
    }
}

export { HtmlRewriterBrowser };
