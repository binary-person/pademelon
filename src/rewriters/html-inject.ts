function htmlInject(htmlText: string, injectHtml: string): string {
    if (!injectHtml.length) return htmlText;
    let injectedHtml = htmlText.replace('<head>', '<head>' + injectHtml);
    if (injectedHtml.length !== htmlText.length) return injectedHtml;
    injectedHtml = htmlText.replace('<html>', '<html>' + injectHtml);
    if (injectedHtml.length !== htmlText.length) return injectedHtml;
    return injectHtml + injectedHtml;
}

export { htmlInject };
