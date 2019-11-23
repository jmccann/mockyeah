"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var url_1 = require("url");
var qs_1 = __importDefault(require("qs"));
var path_to_regexp_1 = __importDefault(require("path-to-regexp"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var isEmpty_1 = __importDefault(require("lodash/isEmpty"));
var isRegExp_1 = __importDefault(require("lodash/isRegExp"));
var decodedPortRegex = /^(\/?https?.{3}[^/:?]+):/;
var decodedProtocolRegex = /^(\/?https?).{3}/;
var encodedPortRegex = /^(\/?https?.{3}[^/:?]+)~/;
var encodedProtocolRegex = /^(\/?https?).{3}/;
// Restore any special protocol or port characters that were possibly tilde-replaced.
var decodeProtocolAndPort = function (str) {
    return str.replace(encodedProtocolRegex, '$1://').replace(encodedPortRegex, '$1:');
};
var encodeProtocolAndPort = function (str) {
    return str.replace(decodedPortRegex, '$1~').replace(decodedProtocolRegex, '$1~~~');
};
var stripQuery = function (url) {
    var parsed;
    // is absolute?
    if (/^https?:/.test(url)) {
        parsed = url_1.parse(url);
        url = (parsed.protocol || 'http:') + "//" + parsed.hostname + (parsed.port && !['80', '443'].includes(parsed.port) ? ":" + parsed.port : '') + parsed.pathname;
    }
    else {
        parsed = url_1.parse("http://example.com" + (url.startsWith('/') ? url : "/" + url));
        url = parsed.pathname || '';
    }
    var query = parsed.query ? qs_1["default"].parse(parsed.query) : undefined;
    return {
        url: url,
        query: query
    };
};
exports.stripQuery = stripQuery;
var leadingSlashRegex = /^\//;
var leadUrlEncodedProtocolRegex = /^(https?)%3A%2F%2F/;
var stripLeadingSlash = function (url) { return url.replace(leadingSlashRegex, ''); };
var makeRequestUrl = function (url) {
    var isAbsolute = /^\/+https?[:~][/~]{2}/.test(url);
    return isAbsolute
        ? decodeProtocolAndPort(stripLeadingSlash(url).replace(leadUrlEncodedProtocolRegex, function (match, p1) { return p1 + "://"; }))
        : url;
};
var normalize = function (match, incoming) {
    if (typeof match === 'function')
        return match;
    var originalMatch = isPlainObject_1["default"](match) ? __assign({}, match) : match;
    if (!isPlainObject_1["default"](match)) {
        match = {
            url: match
        };
    }
    else {
        // shallow copy
        match = __assign({}, match);
    }
    match.query = isEmpty_1["default"](match.query) ? undefined : match.query;
    match.headers = isEmpty_1["default"](match.headers)
        ? undefined
        : Object.entries(match.headers).reduce(function (acc, _a) {
            var k = _a[0], v = _a[1];
            acc[k.toLowerCase()] = v;
            return acc;
        }, {});
    if (!match.method) {
        match.method = 'get';
    }
    else if (match.method === 'all' || match.method === 'ALL' || match.method === '*') {
        delete match.method;
    }
    else if (typeof match.method === 'string') {
        match.method = match.method.toLowerCase();
    }
    var originalNormal = __assign({}, match);
    var $meta = __assign({}, (match.$meta || {}));
    $meta.original = originalMatch;
    $meta.originalNormal = originalNormal;
    if (match.path) {
        match.url = match.path;
        delete match.path;
    }
    if (match.url === '*') {
        delete match.url;
    }
    if (typeof match.url === 'string') {
        match.url = makeRequestUrl(match.url);
        var stripped = stripQuery(match.url);
        match.url = stripped.url.replace(/\/+$/, '');
        match.url = match.url || '/';
        originalNormal.url = match.url;
        if (!incoming) {
            var matchKeys = [];
            // `pathToRegexp` mutates `matchKeys` to contain a list of named parameters
            var regex_1 = path_to_regexp_1["default"](encodeProtocolAndPort(match.url), matchKeys);
            match.url = function (u) { return regex_1.test(encodeProtocolAndPort(u) || encodeProtocolAndPort("/" + u)); };
            $meta.regex = regex_1;
            $meta.matchKeys = matchKeys;
            $meta.fn = match.url.toString();
        }
        match.query = isPlainObject_1["default"](match.query)
            ? __assign(__assign({}, stripped.query), match.query) : match.query || stripped.query;
    }
    else if (isRegExp_1["default"](match.url)) {
        if (!incoming) {
            var regex_2 = match.url;
            match.url = function (u) {
                return regex_2.test(decodeProtocolAndPort(u)) || regex_2.test(decodeProtocolAndPort("/" + u));
            };
            $meta.regex = regex_2;
            $meta.fn = match.url.toString();
        }
    }
    else if (typeof match.url === 'function') {
        var fn_1 = match.url;
        match.url = function (u) { return fn_1(u) || fn_1("/" + u); };
    }
    match.$meta = $meta;
    return match;
};
exports.normalize = normalize;
