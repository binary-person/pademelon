import { htmlUrlRewriter, recursiveRewriteHtml, strStrFunc } from './html-rewriter';

// const htmlBrowserRewriter =
//     (element: HTMLElement, urlRewriteFunc: htmlUrlRewriter, cssRewriterFunc: strStrFunc, jsRewriterFunc: strStrFunc, recursive = true) =>
//         recursiveRewriteHtml(element, urlRewriteFunc, cssRewriterFunc, jsRewriterFunc, recursive);

export { recursiveRewriteHtml as htmlBrowserRewriter };
