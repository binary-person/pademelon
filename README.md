# Pademelon

> client request rewriting library for nodejs and the browser

## NOTE

This is a work-in-progress project. For more info, see [Roadmap](#roadmap)

## Purpose

This was primarily inspired by [Wombat](https://github.com/webrecorder/wombat), but it was built for recording (Pademelon *can* be used for recording, given custom (un)rewriteUrlIntercept functions that add a timestamp) and not proxying and had the following issues:
1. `location.href`/`location.pathname` is not rewritten, breaking websites that use react.
2. `localStorage` is not stored in respective sites
3. `modifiedFunc.toString` is not faked, so websites that validate functions are broken (or something, depends on the website)

More importantly:
1. Wombat was built for pyweb
2. nodejs will need to reimplement URL rewriting functions
3. Different licenses
4. Server and client use different rewriting code (pywb has their own rewriting functions while the client uses wombat), and this library's goal is to bring the two pieces together

About the project:
1. purpose is to provide easy, understandable client rewriting tools to nodejs developers
2. Primarily used as a URL proxy (like `https://someproxysite.com/https://destinationwebsite.com`)
3. Rewrites `XMLHttpRequest`, `fetch`, `history`, `postMessage`, `Worker`, and more (for the full list see [Roadmap](#roadmap), all to make sure everything is to be served under `https://someproxysite.com/https://destinationwebsite.com` and not `https://destinationwebsite.com`

## Example

This package can be used in nodejs (for reversing rewritten URLs and rewriting js/css files) or the browser.

### Server

```js
const Pademelon = require('pademelon').Pademelon;
const proxyPrefix = 'https://someproxysite.com/prefix/';
const rewriter = new pademelon.Rewriter(proxyPrefix, options);

// "rewrite" is defined as rewriting the asset url/link from https://originalurl.com to https://someproxysite.com/https://originalurl.com
// rewriting behavior can be defined in options

// rewrite JavaScript files
let rewrittenJS = rewriter.rewriteJavaScript(javascriptText);
// rewrite CSS files
let rewrittenCSS = rewriter.rewriteCSS(cssText);
// rewrite HTML files
let rewrittenHTML = rewriter.rewriteHTML(htmlText);
// rewrite absolute URLs
let rewrittenAbsoluteUrl = rewriter.rewriteUrl(absoluteURL);
// reverse rewrite
let unrewrittenAbsoluteUrl = rewriter.unrewriteUrl(rewrittenAbsoluteUrl);
```

## Browser

```html
<!-- this isn't really necessary because injection is already taken care of by nodejs's rewriteHTML -->
<head>
    <script src='pademelon.min.js'></script>
    <script>
        window.pademelonInstance = new Pademelon({
            hostname: window.location.host,
            pathnamePrefix: "/pademelonprefix/",
            windowProp: "pademelonInstance"
        });
        pademelonInstance.init()
    </script>
</head>
```

## Roadmap

Following is the current functions that are implemented with their unit tests written.

- rewriteJS
- rewriteCSS
- rewriteHTML
- rewriteUrl
- unrewriteUrl
- browser rewrite utils
  - fakeToString
  - rewriteFunction
- rewrite window
  - XMLHttpRequest
  - fetch, Request, Response
  - (for more, see [browser-rewrites](src/browser-rewrites/))
- rewrite immutable objects
  - (window/document).location
  - window

Todo list:
- add getter/setter rewriters
- add more todo rewrite functions to todo rewrite list
- todo rewrite list
  - document atttribute getters/setters
  - implement MutationObserver
  - localStorage
  - sessionStorage
  - history
  - Worker
  - postMessage
  - navigator.sendBeacon
  
  ## Contributing

  Guidelines and development details can be found [here](CONTRIBUTING).