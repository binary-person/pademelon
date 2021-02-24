import { HtmlRewriter, HtmlRewriterOptions } from './HtmlRewriter';

class HtmlRewriterBrowser extends HtmlRewriter {
    private parser: HTMLTemplateElement;
    constructor(options: HtmlRewriterOptions) {
        super(options);

        this.parser = document.createElement('template');
    }
    public rewriteHtmlString(htmlText: string): string {
        this.parser.innerHTML = htmlText;
        this.rewriteHtml((this.parser.content as unknown) as Element);
        return this.parser.innerHTML;
    }
}

export { HtmlRewriterBrowser };
