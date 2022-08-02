/**
 * Forked from mark.js v8.9.0 (https://github.com/Gijsjan/mark.js)
 *  - https://github.com/julmot/mark.js
 *  - Copyright (c) 2014–2017, Julian Motz
 * Released under the MIT license https://git.io/vwTVl
 */

// @ts-nocheck
class Mark {
    // eslint-disable-line no-unused-vars
    private ctx;
    private ie;
    private _opt;
    private _iterator;

    constructor(ctx) {
        this.ctx = ctx;

        this.ie = false;
        const ua = window.navigator.userAgent;
        if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
            this.ie = true;
        }
    }

    set opt(val) {
        this._opt = Object.assign(
            {},
            {
                element: '',
                className: '',
                exclude: [],
                separateWordSearch: true,
                diacritics: true,
                synonyms: {},
                accuracy: 'partially',
                acrossElements: false,
                caseSensitive: false,
                ignoreJoiners: false,
                ignoreGroups: 0,
                wildcards: 'disabled',
                each: () => {},
                noMatch: () => {},
                filter: () => true,
                done: () => {},
                debug: false,
                log: window.console,
            },
            val
        );
    }

    get opt() {
        return this._opt;
    }

    get iterator() {
        if (!this._iterator) {
            this._iterator = new DOMIterator(this.ctx, this.opt.exclude);
        }
        return this._iterator;
    }

    log(msg, level = 'debug') {
        const log = this.opt.log;
        if (!this.opt.debug) {
            return;
        }
        if (typeof log === 'object' && typeof log[level] === 'function') {
            log[level](`mark.js: ${msg}`);
        }
    }

    escapeStr(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

    createRegExp(str) {
        if (this.opt.wildcards !== 'disabled') {
            str = this.setupWildcardsRegExp(str);
        }
        str = this.escapeStr(str);
        if (Object.keys(this.opt.synonyms).length) {
            str = this.createSynonymsRegExp(str);
        }
        if (this.opt.ignoreJoiners) {
            str = this.setupIgnoreJoinersRegExp(str);
        }
        if (this.opt.diacritics) {
            str = this.createDiacriticsRegExp(str);
        }
        str = this.createMergedBlanksRegExp(str);
        if (this.opt.ignoreJoiners) {
            str = this.createIgnoreJoinersRegExp(str);
        }
        if (this.opt.wildcards !== 'disabled') {
            str = this.createWildcardsRegExp(str);
        }
        str = this.createAccuracyRegExp(str);
        return str;
    }

    createSynonymsRegExp(str) {
        const syn = this.opt.synonyms,
            sens = this.opt.caseSensitive ? '' : 'i';
        for (let index in syn) {
            if (syn.hasOwnProperty(index)) {
                const value = syn[index],
                    k1 =
                        this.opt.wildcards !== 'disabled'
                            ? this.setupWildcardsRegExp(index)
                            : this.escapeStr(index),
                    k2 =
                        this.opt.wildcards !== 'disabled'
                            ? this.setupWildcardsRegExp(value)
                            : this.escapeStr(value);
                if (k1 !== '' && k2 !== '') {
                    str = str.replace(
                        new RegExp(`(${k1}|${k2})`, `gm${sens}`),
                        `(${k1}|${k2})`
                    );
                }
            }
        }
        return str;
    }

    setupWildcardsRegExp(str) {
        // replace single character wildcard with unicode 0001
        str = str.replace(/(?:\\)*\?/g, (val) => {
            return val.charAt(0) === '\\' ? '?' : '\u0001';
        });
        // replace multiple character wildcard with unicode 0002
        return str.replace(/(?:\\)*\*/g, (val) => {
            return val.charAt(0) === '\\' ? '*' : '\u0002';
        });
    }

    createWildcardsRegExp(str) {
        // default to "enable" (i.e. to not include spaces)
        // "withSpaces" uses `[\\S\\s]` instead of `.` because the latter
        // does not match new line characters
        let spaces = this.opt.wildcards === 'withSpaces';
        return (
            str
                // replace unicode 0001 with a RegExp class to match any single
                // character, or any single non-whitespace character depending
                // on the setting
                .replace(/\u0001/g, spaces ? '[\\S\\s]?' : '\\S?')
                // replace unicode 0002 with a RegExp class to match zero or
                // more characters, or zero or more non-whitespace characters
                // depending on the setting
                .replace(/\u0002/g, spaces ? '[\\S\\s]*?' : '\\S*')
        );
    }

    setupIgnoreJoinersRegExp(str) {
        // adding a "null" unicode character as it will not be modified by the
        // other "create" regular expression functions
        return str.replace(/[^(|)\\]/g, (val, indx, original) => {
            // don't add a null after an opening "(", around a "|" or before
            // a closing "(", or between an escapement (e.g. \+)
            let nextChar = original.charAt(indx + 1);
            if (/[(|)\\]/.test(nextChar) || nextChar === '') {
                return val;
            } else {
                return val + '\u0000';
            }
        });
    }

    createIgnoreJoinersRegExp(str) {
        // u+00ad = soft hyphen
        // u+200b = zero-width space
        // u+200c = zero-width non-joiner
        // u+200d = zero-width joiner
        return str.split('\u0000').join('[\\u00ad|\\u200b|\\u200c|\\u200d]?');
    }

    createDiacriticsRegExp(str) {
        const sens = this.opt.caseSensitive ? '' : 'i';
        const dct = this.opt.caseSensitive
            ? [
                  'aàáâãäåāąă',
                  'AÀÁÂÃÄÅĀĄĂ',
                  'cçćč',
                  'CÇĆČ',
                  'dđď',
                  'DĐĎ',
                  'eèéêëěēę',
                  'EÈÉÊËĚĒĘ',
                  'iìíîïī',
                  'IÌÍÎÏĪ',
                  'lł',
                  'LŁ',
                  'nñňń',
                  'NÑŇŃ',
                  'oòóôõöøō',
                  'OÒÓÔÕÖØŌ',
                  'rř',
                  'RŘ',
                  'sšśșş',
                  'SŠŚȘŞ',
                  'tťțţ',
                  'TŤȚŢ',
                  'uùúûüůū',
                  'UÙÚÛÜŮŪ',
                  'yÿý',
                  'YŸÝ',
                  'zžżź',
                  'ZŽŻŹ',
              ]
            : [
                  'aàáâãäåāąăAÀÁÂÃÄÅĀĄĂ',
                  'cçćčCÇĆČ',
                  'dđďDĐĎ',
                  'eèéêëěēęEÈÉÊËĚĒĘ',
                  'iìíîïīIÌÍÎÏĪ',
                  'lłLŁ',
                  'nñňńNÑŇŃ',
                  'oòóôõöøōOÒÓÔÕÖØŌ',
                  'rřRŘ',
                  'sšśșşSŠŚȘŞ',
                  'tťțţTŤȚŢ',
                  'uùúûüůūUÙÚÛÜŮŪ',
                  'yÿýYŸÝ',
                  'zžżźZŽŻŹ',
              ];
        const handled = [];
        str.split('').forEach((ch) => {
            dct.every((dct) => {
                // Check if the character is inside a diacritics list
                if (dct.indexOf(ch) !== -1) {
                    // Check if the related diacritics list was not
                    // handled yet
                    if (handled.indexOf(dct) > -1) {
                        return false;
                    }
                    // Make sure that the character OR any other
                    // character in the diacritics list will be matched
                    str = str.replace(
                        new RegExp(`[${dct}]`, `gm${sens}`),
                        `[${dct}]`
                    );
                    handled.push(dct);
                }
                return true;
            });
        });
        return str;
    }

    createMergedBlanksRegExp(str) {
        return str.replace(/[\s]+/gim, '[\\s]+');
    }

    createAccuracyRegExp(str) {
        const chars = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~¡¿`;
        let acc = this.opt.accuracy,
            val = typeof acc === 'string' ? acc : acc.value,
            ls = typeof acc === 'string' ? [] : acc.limiters,
            lsJoin = '';
        ls.forEach((limiter) => {
            lsJoin += `|${this.escapeStr(limiter)}`;
        });
        switch (val) {
            case 'partially':
            default:
                return `()(${str})`;
            case 'complementary':
                lsJoin = '\\s' + (lsJoin ? lsJoin : this.escapeStr(chars));
                return `()([^${lsJoin}]*${str}[^${lsJoin}]*)`;
            case 'exactly':
                return `(^|\\s${lsJoin})(${str})(?=$|\\s${lsJoin})`;
        }
    }

    getSeparatedKeywords(sv) {
        let stack = [];
        sv.forEach((kw) => {
            if (!this.opt.separateWordSearch) {
                if (kw.trim() && stack.indexOf(kw) === -1) {
                    stack.push(kw);
                }
            } else {
                kw.split(' ').forEach((kwSplitted) => {
                    if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                        stack.push(kwSplitted);
                    }
                });
            }
        });
        return {
            // sort because of https://git.io/v6USg
            keywords: stack.sort((a, b) => {
                return b.length - a.length;
            }),
            length: stack.length,
        };
    }

    getTextNodes(cb) {
        let val = '',
            nodes = [];
        this.iterator.forEachNode(
            NodeFilter.SHOW_TEXT,
            (node) => {
                nodes.push({
                    start: val.length,
                    end: (val += node.textContent).length,
                    node,
                });
            },
            (node) => {
                if (this.matchesExclude(node.parentNode)) {
                    return NodeFilter.FILTER_REJECT;
                } else {
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            () => {
                cb({
                    value: val,
                    nodes: nodes,
                });
            }
        );
    }

    matchesExclude(el) {
        return DOMIterator.matches(
            el,
            this.opt.exclude.concat([
                // ignores the elements itself, not their childrens (selector *)
                'script',
                'style',
                'title',
                'head',
                'html',
            ])
        );
    }

    wrapRangeInTextNode(node, start, end) {
        const hEl = !this.opt.element ? 'mark' : this.opt.element,
            startNode = node.splitText(start),
            ret = startNode.splitText(end - start);
        let repl = document.createElement(hEl);
        repl.setAttribute('data-markjs', 'true');
        if (this.opt.className) {
            repl.setAttribute('class', this.opt.className);
        }
        repl.textContent = startNode.textContent;
        startNode.parentNode.replaceChild(repl, startNode);
        return ret;
    }

    wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
        // iterate over all text nodes to find the one matching the positions
        dict.nodes.every((n, i) => {
            const sibl = dict.nodes[i + 1];
            if (typeof sibl === 'undefined' || sibl.start > start) {
                if (!filterCb(n.node)) {
                    return false;
                }
                // map range from dict.value to text node
                const s = start - n.start,
                    e = (end > n.end ? n.end : end) - n.start,
                    startStr = dict.value.substr(0, n.start),
                    endStr = dict.value.substr(e + n.start);
                n.node = this.wrapRangeInTextNode(n.node, s, e);
                // recalculate positions to also find subsequent matches in the
                // same text node. Necessary as the text node in dict now only
                // contains the splitted part after the wrapped one
                dict.value = startStr + endStr;
                dict.nodes.forEach((k, j) => {
                    if (j >= i) {
                        if (dict.nodes[j].start > 0 && j !== i) {
                            dict.nodes[j].start -= e;
                        }
                        dict.nodes[j].end -= e;
                    }
                });
                end -= e;
                eachCb(n.node.previousSibling, n.start);
                if (end > n.end) {
                    start = n.end;
                } else {
                    return false;
                }
            }
            return true;
        });
    }

    wrapMatches(regex, ignoreGroups, filterCb, eachCb, endCb) {
        const matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
        this.getTextNodes((dict) => {
            dict.nodes.forEach((node) => {
                node = node.node;
                let match;
                while (
                    (match = regex.exec(node.textContent)) !== null &&
                    match[matchIdx] !== ''
                ) {
                    if (!filterCb(match[matchIdx], node)) {
                        continue;
                    }
                    let pos = match.index;
                    if (matchIdx !== 0) {
                        for (let i = 1; i < matchIdx; i++) {
                            pos += match[i].length;
                        }
                    }
                    node = this.wrapRangeInTextNode(
                        node,
                        pos,
                        pos + match[matchIdx].length
                    );
                    eachCb(node.previousSibling);
                    // reset index of last match as the node changed and the
                    // index isn't valid anymore http://tinyurl.com/htsudjd
                    regex.lastIndex = 0;
                }
            });
            endCb();
        });
    }

    wrapMatchesAcrossElements(regex, ignoreGroups, filterCb, eachCb, endCb) {
        const matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
        this.getTextNodes((dict) => {
            let match;
            while (
                (match = regex.exec(dict.value)) !== null &&
                match[matchIdx] !== ''
            ) {
                // calculate range inside dict.value
                let start = match.index;
                if (matchIdx !== 0) {
                    for (let i = 1; i < matchIdx; i++) {
                        start += match[i].length;
                    }
                }
                const end = start + match[matchIdx].length;
                // note that dict will be updated automatically, as it'll change
                // in the wrapping process, due to the fact that text
                // nodes will be splitted
                this.wrapRangeInMappedTextNode(
                    dict,
                    start,
                    end,
                    (node) => {
                        return filterCb(match[matchIdx], node);
                    },
                    (node, lastIndex) => {
                        regex.lastIndex = lastIndex;
                        eachCb(node);
                    }
                );
            }
            endCb();
        });
    }

    unwrapMatches(node) {
        const parent = node.parentNode;
        let docFrag = document.createDocumentFragment();
        while (node.firstChild) {
            docFrag.appendChild(node.removeChild(node.firstChild));
        }
        parent.replaceChild(docFrag, node);
        if (!this.ie) {
            // use browser's normalize method
            parent.normalize();
        } else {
            // custom method (needs more time)
            this.normalizeTextNode(parent);
        }
    }

    normalizeTextNode(node) {
        if (!node) {
            return;
        }
        if (node.nodeType === 3) {
            while (node.nextSibling && node.nextSibling.nodeType === 3) {
                node.nodeValue += node.nextSibling.nodeValue;
                node.parentNode.removeChild(node.nextSibling);
            }
        } else {
            this.normalizeTextNode(node.firstChild);
        }
        this.normalizeTextNode(node.nextSibling);
    }

    markRegExp(regexp, opt) {
        this.opt = opt;
        this.log(`Searching with expression "${regexp}"`);
        let totalMatches = 0,
            fn = 'wrapMatches';
        const eachCb = (element) => {
            totalMatches++;
            this.opt.each(element);
        };
        if (this.opt.acrossElements) {
            fn = 'wrapMatchesAcrossElements';
        }
        this[fn](
            regexp,
            this.opt.ignoreGroups,
            (match, node) => {
                return this.opt.filter(node, match, totalMatches);
            },
            eachCb,
            () => {
                if (totalMatches === 0) {
                    this.opt.noMatch(regexp);
                }
                this.opt.done(totalMatches);
            }
        );
    }

    mark(sv, opt) {
        this.opt = opt;
        let totalMatches = 0;
        const i = this.opt.caseSensitive ? '' : 'i';
        const fn = this.opt.acrossElements
            ? 'wrapMatchesAcrossElements'
            : 'wrapMatches';
        const { keywords: kwArr, length: kwArrLen } = this.getSeparatedKeywords(
            typeof sv === 'string' ? [sv] : sv
        );
        if (!kwArrLen) return this.opt.done(totalMatches);

        const handler = (kw) => {
            // async function calls as iframes are async too
            let regex = new RegExp(this.createRegExp(kw), `gm${i}`);
            let matches = 0;
            this.log(`Searching with expression "${regex}"`);

            const filterCb = (term, node) =>
                this.opt.filter(node, kw, totalMatches, matches);
            const eachCb = (element) => {
                matches++;
                totalMatches++;
                this.opt.each(element);
            };
            const endCb = () => {
                if (matches === 0) {
                    this.opt.noMatch(kw);
                }
                if (kwArr[kwArrLen - 1] === kw) {
                    this.opt.done(totalMatches);
                } else {
                    handler(kwArr[kwArr.indexOf(kw) + 1]);
                }
            };

            this[fn](regex, 1, filterCb, eachCb, endCb);
        };

        handler(kwArr[0]);
    }

    unmark(opt) {
        this.opt = opt;
        let sel = this.opt.element ? this.opt.element : '*';
        sel += '[data-markjs]';
        if (this.opt.className) {
            sel += `.${this.opt.className}`;
        }
        this.log(`Removal selector "${sel}"`);
        this.iterator.forEachNode(
            NodeFilter.SHOW_ELEMENT,
            (node) => {
                this.unwrapMatches(node);
            },
            (node) => {
                const matchesSel = DOMIterator.matches(node, sel),
                    matchesExclude = this.matchesExclude(node);
                if (!matchesSel || matchesExclude) {
                    return NodeFilter.FILTER_REJECT;
                } else {
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            this.opt.done
        );
    }
}

class DOMIterator {
    private ctx;
    private exclude;

    constructor(ctx, exclude = []) {
        this.ctx = ctx;
        this.exclude = exclude;
    }

    static matches(element, selector) {
        const selectors = typeof selector === 'string' ? [selector] : selector,
            fn =
                element.matches ||
                element.matchesSelector ||
                element.msMatchesSelector ||
                element.mozMatchesSelector ||
                element.oMatchesSelector ||
                element.webkitMatchesSelector;
        if (fn) {
            let match = false;
            selectors.every((sel) => {
                if (fn.call(element, sel)) {
                    match = true;
                    return false;
                }
                return true;
            });
            return match;
        } else {
            // may be false e.g. when el is a textNode
            return false;
        }
    }

    getContexts() {
        let ctx,
            filteredCtx = [];
        if (typeof this.ctx === 'undefined' || !this.ctx) {
            // e.g. null
            ctx = [];
        } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
            ctx = Array.prototype.slice.call(this.ctx);
        } else if (Array.isArray(this.ctx)) {
            ctx = this.ctx;
        } else if (typeof this.ctx === 'string') {
            ctx = Array.prototype.slice.call(
                document.querySelectorAll(this.ctx)
            );
        } else {
            // e.g. HTMLElement or element inside iframe
            ctx = [this.ctx];
        }
        // filter duplicate text nodes
        ctx.forEach((ctx) => {
            const isDescendant =
                filteredCtx.filter((contexts) => {
                    return contexts.contains(ctx);
                }).length > 0;
            if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
                filteredCtx.push(ctx);
            }
        });
        return filteredCtx;
    }

    createIterator(ctx, whatToShow, filter) {
        return document.createNodeIterator(ctx, whatToShow, filter, false);
    }

    getIteratorNode(itr) {
        const prevNode = itr.previousNode();
        let node;
        if (prevNode === null) {
            node = itr.nextNode();
        } else {
            node = itr.nextNode() && itr.nextNode();
        }
        return {
            prevNode,
            node,
        };
    }

    iterateThroughNodes(whatToShow, ctx, eachCb, filterCb, doneCb) {
        const itr = this.createIterator(ctx, whatToShow, filterCb);

        let elements = [];
        let node;

        const retrieveNodes = () => {
            const result = this.getIteratorNode(itr);
            return result.node;
        };

        while ((node = retrieveNodes())) {
            // it's faster to call the each callback in an array loop
            // than in this while loop
            elements.push(node);
        }

        elements.forEach((node) => {
            eachCb(node);
        });

        doneCb();
    }

    forEachNode(whatToShow, each, filter, done = () => {}) {
        const contexts = this.getContexts();
        let open = contexts.length;
        if (!open) {
            done();
        }
        contexts.forEach((ctx) => {
            this.iterateThroughNodes(whatToShow, ctx, each, filter, () => {
                if (--open <= 0) {
                    // call end all contexts were handled
                    done();
                }
            });
        });
    }
}

export default Mark;
