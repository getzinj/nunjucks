'use strict';

import * as lib from './lib';
import * as r from './runtime/runtime';
import { SafeString } from './runtime/SafeString';
import { TemplateError, TemplateError as TemplateError1 } from './templateError';


export function normalize<T, V>(value: T | null | undefined | false, defaultValue: V): T | V {
  if (value === null || value === undefined || value === false) {
    return defaultValue;
  }
  return value;
}


export const abs: (x: number) => number = Math.abs;


export function isNaN(num): boolean {
  return num !== num; // eslint-disable-line no-self-compare
}


export function batch<T>(arr: T[], linecount: number, fillWith: T): T[][] {
  let i: number;
  const res: T[][] = [];
  let tmp: T[] = [];

  for (i = 0; i < arr.length; i++) {
    if (i % linecount === 0 && tmp.length) {
      res.push(tmp);
      tmp = [];
    }

    tmp.push(arr[i]);
  }

  if (tmp.length) {
    if (fillWith) {
      for (i = tmp.length; i < linecount; i++) {
        tmp.push(fillWith);
      }
    }

    res.push(tmp);
  }

  return res;
}


export function capitalize(str) {
  str = normalize(str, '');
  const ret: string = str.toLowerCase();
  return r.copySafeness(str, ret.charAt(0).toUpperCase() + ret.slice(1));
}


export function center(str, width) {
  str = normalize(str, '');
  width = width || 80;

  if (str.length >= width) {
    return str;
  }

  const spaces: number = width - str.length;
  const pre: string = lib.repeat(' ', (spaces / 2) - (spaces % 2));
  const post: string = lib.repeat(' ', spaces / 2);
  return r.copySafeness(str, pre + str + post);
}


export function default_<T>(val: T, def: T, bool): T {
  if (bool) {
    return val || def;
  } else {
    return (val !== undefined) ? val : def;
  }
}


export function dictsort(val, caseSensitive, by) {
  if (!lib.isObject(val)) {
    throw new TemplateError1('dictsort filter: val must be an object');
  }

  let array = [];
  // deliberately include properties from the object's prototype
  for (let k in val) { // eslint-disable-line guard-for-in, no-restricted-syntax
    array.push([k, val[k]]);
  }

  let si;
  if (by === undefined || by === 'key') {
    si = 0;
  } else if (by === 'value') {
    si = 1;
  } else {
    throw new TemplateError('dictsort filter: You can only sort by either key or value');
  }

  array.sort((t1, t2): number => {
    let a = t1[si];
    let b = t2[si];

    if (!caseSensitive) {
      if (lib.isString(a)) {
        a = a.toUpperCase();
      }
      if (lib.isString(b)) {
        b = b.toUpperCase();
      }
    }

    return a > b ? 1 : (a === b ? 0 : -1); // eslint-disable-line no-nested-ternary
  });

  return array;
}


export function dump(obj, spaces): string {
  return JSON.stringify(obj, null, spaces);
}


export function escape(str) {
  if (str instanceof SafeString) {
    return str;
  }
  str = (str === null || str === undefined) ? '' : str;
  return r.markSafe(lib.escape(str.toString()));
}


export function safe(str) {
  if (str instanceof SafeString) {
    return str;
  }
  str = (str === null || str === undefined) ? '' : str;
  return r.markSafe(str.toString());
}


export function first(arr) {
  return arr[0];
}


export function forceescape(str) {
  str = (str === null || str === undefined) ? '' : str;
  return r.markSafe(lib.escape(str.toString()));
}


export function groupby(arr, attr): {} {
  return lib.groupBy(arr, attr, this.env.opts.throwOnUndefined);
}


export function indent(str, width, indentfirst) {
  str = normalize(str, '');

  if (str === '') {
    return '';
  }

  width = width || 4;
  // let res = '';
  const lines = str.split('\n');
  const sp: string = lib.repeat(' ', width);

  const res = lines.map((l, i) => {
    return (i === 0 && !indentfirst) ? l : `${sp}${l}`;
  }).join('\n');

  return r.copySafeness(str, res);
}


export function join(arr, del, attr) {
  del = del || '';

  if (attr) {
    arr = lib.map(arr, (v) => v[attr]);
  }

  return arr.join(del);
}


export function last(arr) {
  return arr[arr.length - 1];
}


export function length(val) {
  const value: any = normalize(val, '');

  if (value === undefined) {
    return 0;
  } else if (
      (typeof Map === 'function' && value instanceof Map) ||
      (typeof Set === 'function' && value instanceof Set)
  ) {
    // ECMAScript 2015 Maps and Sets
    return value.size;
  } else if (value instanceof SafeString) {
    return value.length;
  } else if (lib.isObject(value) && !(value instanceof SafeString)) {
    // Objects (besides SafeStrings), non-primitive Arrays
    return lib.keys(value).length;
  } else {
    return value.length;
  }
}


export function list(val) {
  if (lib.isString(val)) {
    return val.split('');
  } else if (lib.isObject(val)) {
    return lib._entries(val || {}).map(([key, value]): { value; key } => ({key, value}));
  } else if (lib.isArray(val)) {
    return val;
  } else {
    throw new TemplateError1('list filter: type not iterable');
  }
}


export function lower(str): string {
  str = normalize(str, '');
  return str.toLowerCase();
}


export function nl2br(str) {
  if (str === null || str === undefined) {
    return '';
  }
  return r.copySafeness(str, str.replace(/\r\n|\n/g, '<br />\n'));
}


export function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


/**
 * Construct select or reject filter
 *
 * @param {boolean} expectedTestResult
 * @returns {function(array, string, *): array}
 */
export function getSelectOrReject(expectedTestResult): (arr, testName: string, secondArg) => any {
  function filter(arr, testName: string = 'truthy', secondArg) {
    const context = this;
    const test = context.env.getTest(testName);

    return lib.toArray(arr).filter(function examineTestResult(item): boolean {
      return test.call(context, item, secondArg) === expectedTestResult;
    });
  }

  return filter;
}

export const reject: (arr, testName: string, secondArg) => any = getSelectOrReject(false);

export function rejectattr(arr, attr) {
  return arr.filter((item): boolean => !item[attr]);
}


export const select: (arr, testName: string, secondArg) => any = getSelectOrReject(true);

export function selectattr(arr, attr) {
  return arr.filter((item): boolean => !!item[attr]);
}


export function replace(str: string, old: string | RegExp, new_: string, maxCount?: number) {
  const originalStr: string = str;

  if (old instanceof RegExp) {
    return str.replace(old, new_);
  }

  if (typeof maxCount === 'undefined') {
    maxCount = -1;
  }

  let res: string = ''; // Output

  // Cast Numbers in the search term to string
  if (typeof old === 'number') {
    old = '' + old;
  } else if (typeof old !== 'string') {
    // If it is something other than number or string,
    // return the original string
    return str;
  }

  // Cast numbers in the replacement to string
  if (typeof str === 'number') {
    str = '' + str;
  }

  // If by now, we don't have a string, throw it back
  if (typeof str !== 'string' && !(str as any instanceof SafeString)) {
    return str;
  }

  // ShortCircuits
  if (old === '') {
    // Mimic the python behaviour: empty string is replaced
    // by replacement e.g. "abc"|replace("", ".") -> .a.b.c.
    res = new_ + str.split('').join(new_) + new_;
    return r.copySafeness(str, res);
  }

  let nextIndex: number = str.indexOf(old);
  // if # of replacements to perform is 0, or the string to does
  // not contain the old value, return the string
  if (maxCount === 0 || nextIndex === -1) {
    return str;
  }

  let pos: number = 0;
  let count: number = 0; // # of replacements made

  while (nextIndex > -1 && (maxCount === -1 || count < maxCount)) {
    // Grab the next chunk of src string and add it with the
    // replacement, to the result
    res += str.substring(pos, nextIndex) + new_;
    // Increment our pointer in the src string
    pos = nextIndex + old.length;
    count++;
    // See if there are any more replacements to be made
    nextIndex = str.indexOf(old, pos);
  }

  // We've either reached the end, or done the max # of
  // replacements, tack on any remaining string
  if (pos < str.length) {
    res += str.substring(pos);
  }

  return r.copySafeness(originalStr, res);
}


export function reverse(val) {
  let arr;
  if (lib.isString(val)) {
    arr = list(val);
  } else {
    // Copy it
    arr = lib.map(val, (v) => v);
  }

  arr.reverse();

  if (lib.isString(val)) {
    return r.copySafeness(val, arr.join(''));
  }
  return arr;
}

export function round(val, precision, method): number {
  precision = precision || 0;
  const factor: number = Math.pow(10, precision);
  let rounder;

  if (method === 'ceil') {
    rounder = Math.ceil;
  } else if (method === 'floor') {
    rounder = Math.floor;
  } else {
    rounder = Math.round;
  }

  return rounder(val * factor) / factor;
}

export function slice(arr, slices, fillWith) {
  const sliceLength: number = Math.floor(arr.length / slices);
  const extra: number = arr.length % slices;
  const res = [];
  let offset: number = 0;

  for (let i = 0; i < slices; i++) {
    const start: number = offset + (i * sliceLength);
    if (i < extra) {
      offset++;
    }
    const end: number = offset + ((i + 1) * sliceLength);

    const currSlice = arr.slice(start, end);
    if (fillWith && i >= extra) {
      currSlice.push(fillWith);
    }
    res.push(currSlice);
  }

  return res;
}

export function sum(arr, attr, start: number = 0) {
  if (attr) {
    arr = lib.map(arr, (v) => v[attr]);
  }

  return start + arr.reduce((a, b) => a + b, 0);
}


export const sort: (...macroArgs) => any = r.makeMacro(
    ['value', 'reverse', 'case_sensitive', 'attribute'], [],
    function sortFilter(arr, reversed, caseSens, attr) {
    // Copy it
    let array = lib.map(arr, (v) => v);
    let getAttribute: (item) => (undefined) = lib.getAttrGetter(attr);

    array.sort((a, b): 1 | -1 | number => {
      let x = (attr) ? getAttribute(a) : a;
      let y = (attr) ? getAttribute(b) : b;

      if (
        this.env.opts.throwOnUndefined &&
        attr && (x === undefined || y === undefined)
      ) {
        throw new TypeError(`sort: attribute "${attr}" resolved to undefined`);
      }

      if (!caseSens && lib.isString(x) && lib.isString(y)) {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }

      if (x < y) {
        return reversed ? 1 : -1;
      } else if (x > y) {
        return reversed ? -1 : 1;
      } else {
        return 0;
      }
    });

    return array;
  });

export function string(obj) {
  return r.copySafeness(obj, obj);
}


export function striptags(input, preserveLinebreaks) {
  input = normalize(input, '');
  let tags: RegExp = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;
  let trimmedInput = trim(input.replace(tags, ''));
  let res: string = '';
  if (preserveLinebreaks) {
    res = trimmedInput
      .replace(/^ +| +$/gm, '') // remove leading and trailing spaces
      .replace(/ +/g, ' ') // squash adjacent spaces
      .replace(/(\r\n)/g, '\n') // normalize linebreaks (CRLF -> LF)
      .replace(/\n\n\n+/g, '\n\n'); // squash abnormal adjacent linebreaks
  } else {
    res = trimmedInput.replace(/\s+/gi, ' ');
  }
  return r.copySafeness(input, res);
}


export function title(str) {
  str = normalize(str, '');
  let words = str.split(' ').map((word) => capitalize(word));
  return r.copySafeness(str, words.join(' '));
}


export function trim(str) {
  return r.copySafeness(str, str.replace(/^\s*|\s*$/g, ''));
}


export function truncate(input, length, killwords, end) {
  const orig = input;
  input = normalize(input, '');
  length = length || 255;

  if (input.length <= length) {
    return input;
  }

  if (killwords) {
    input = input.substring(0, length);
  } else {
    let idx = input.lastIndexOf(' ', length);
    if (idx === -1) {
      idx = length;
    }

    input = input.substring(0, idx);
  }

  input += (end !== undefined && end !== null) ? end : '...';
  return r.copySafeness(orig, input);
}


export function upper(str): string {
  str = normalize(str, '');
  return str.toUpperCase();
}


export function urlencode(obj) {
  const enc: (uriComponent: (string | number | boolean)) => string = encodeURIComponent;
  if (lib.isString(obj)) {
    return enc(obj);
  } else {
    let keyvals = (lib.isArray(obj)) ? obj : lib._entries(obj);
    return keyvals.map(([k, v]): string => `${enc(k)}=${enc(v)}`).join('&');
  }
}


// For the jinja regexp, see
// https://github.com/mitsuhiko/jinja2/blob/f15b814dcba6aa12bc74d1f7d0c881d55f7126be/jinja2/utils.py#L20-L23
const puncRe: RegExp = /^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/;
// from http://blog.gerv.net/2011/05/html5_email_address_regexp/
const emailRe: RegExp = /^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i;
const httpHttpsRe: RegExp = /^https?:\/\/.*$/;
const wwwRe: RegExp = /^www\./;
const tldRe: RegExp = /\.(?:org|net|com)(?:\:|\/|$)/;


export function urlize(str, length, nofollow) {
  if (isNaN(length)) {
    length = Infinity;
  }

  const noFollowAttr: string = (nofollow === true ? ' rel="nofollow"' : '');

  const words = str.split(/(\s+)/).filter((word) => {
    // If the word has no length, bail. This can happen for str with
    // trailing whitespace.
    return word && word.length;
  }).map((word) => {
    const matches = word.match(puncRe);
    const possibleUrl = (matches) ? matches[1] : word;
    const shortUrl: string = possibleUrl.substr(0, length);

    // url that starts with http or https
    if (httpHttpsRe.test(possibleUrl)) {
      return `<a href="${possibleUrl}"${noFollowAttr}>${shortUrl}</a>`;
    }

    // url that starts with www.
    if (wwwRe.test(possibleUrl)) {
      return `<a href="http://${possibleUrl}"${noFollowAttr}>${shortUrl}</a>`;
    }

    // an email address of the form username@domain.tld
    if (emailRe.test(possibleUrl)) {
      return `<a href="mailto:${ possibleUrl }">${ possibleUrl }</a>`;
    }

    // url that ends in .com, .org or .net that is not an email address
    if (tldRe.test(possibleUrl)) {
      return `<a href="http://${ possibleUrl }"${ noFollowAttr }>${ shortUrl }</a>`;
    }

    return word;
  });

  return words.join('');
}


export function wordcount(str) {
  str = normalize(str, '');
  const words = (str) ? str.match(/\w+/g) : null;
  return (words) ? words.length : null;
}


export function float(val, def) {
  const res: number = parseFloat(val);
  return (isNaN(res)) ? def : res;
}


export const intFilter: (...macroArgs) => any = r.makeMacro(
  ['value', 'default', 'base'],
  [],
  function doInt(value, defaultValue, base: number = 10) {
    const res: number = parseInt(value, base);
    return (isNaN(res)) ? defaultValue : res;
  }
);


// Aliases
//export const d = exports.default;
//export const e = exports.escape;

module.exports = {
  ... module.exports,
  'int': intFilter,
  'e': escape,
  'd': default_
}
