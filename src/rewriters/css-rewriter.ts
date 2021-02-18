type cssUrlTypes = '@import' | 'url';
type cssUrlRewriter = (inputUrl: string, type: cssUrlTypes) => string;

type escapeCharacters = '"' | "'" | ')';

// quote regex modified from
// https://stackoverflow.com/questions/171480/regex-grabbing-values-between-quotation-marks#comment87998981_171499

// :~ means capture group is used to recreate the original string, and not used in processing
// capture group 1: @import, url
// capture group 2:~ *space between (@import or url) and (quote or the actual url)
// capture group 3: " for url("aa"), ', or nothing for url(aa); used to unescape strings from "aa\'aa" to "aa'aa"`
// capture group 4: the actual url

// matches @import "a", @import ' \'a'
const importRegex = /(@import)(\s*)(["'])((?:\\.|[^\\])*?)(?=\3)/g;

// matches @import url(""), @import url('a'), @import url(aa\)a)
const importUrlRegex = /(@import)(\s+url\(\s*)(["']?)((?:\\.|[^\\])*?)(?=\3\s*\))/g;

// matches url(""), url('a'), url(aa\)aa) but not @import url('aa')
const urlRegex = /(?<!@import\s+)(url)(\(\s*)(["']?)((?:\\.|[^\\])*?)(?=\3\s*\))/g;

// unescapes backslashes. while this is fast and simple, it won't work with \n, or unicode characters
const unescapeRegex = /\\(.)/g;

// escapes ', ", or )
const escapeSingleQuote = /'/g;
const escapeDoubleQuote = /"/g;
const escapeParentheses = /\)/g;
const escapeBackslash = /\\/g;

function unescapeString(str: string): string {
    return str.replace(unescapeRegex, '$1');
}
function escapeString(str: string, delimiter: escapeCharacters): string {
    str = str.replace(escapeBackslash, '\\\\');
    switch (delimiter) {
        case "'":
            return str.replace(escapeSingleQuote, "\\'");
        case '"':
            return str.replace(escapeDoubleQuote, '\\"');
        case ')':
            return str
                .replace(escapeSingleQuote, "\\'")
                .replace(escapeDoubleQuote, '\\"')
                .replace(escapeParentheses, '\\)');
        default:
            throw new TypeError('Unknown delimiter: ' + delimiter);
    }
}

/**
 *
 * @param cssText - string of the css contents
 * @param urlRewriteFunc - this function rewrites the url
 */
function cssRewriter(cssText: string, urlRewriteFunc: cssUrlRewriter): string {
    function cssReplacer(_match: string, g1: cssUrlTypes, g2: string, g3: string, g4: string): string {
        let delimiter = g3 as escapeCharacters;
        if (!g3) {
            // delimiter must be ) if g3 is empty
            delimiter = ')';
        }
        return g1 + g2 + g3 + escapeString(urlRewriteFunc(unescapeString(g4), g1), delimiter);
    }
    return cssText
        .replace(importRegex, cssReplacer)
        .replace(importUrlRegex, cssReplacer)
        .replace(urlRegex, cssReplacer);
}

export { cssRewriter, cssUrlTypes, cssUrlRewriter, escapeString, unescapeString, escapeCharacters };
