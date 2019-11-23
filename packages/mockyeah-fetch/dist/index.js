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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var url_1 = require("url");
var qs_1 = __importDefault(require("qs"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var flatten_1 = __importDefault(require("lodash/flatten"));
var cookie_1 = __importDefault(require("cookie"));
var debug_1 = __importDefault(require("debug"));
var match_deep_1 = __importDefault(require("match-deep"));
var normalize_1 = require("./normalize");
var isMockEqual_1 = require("./isMockEqual");
var respond_1 = require("./respond");
var Expectation_1 = require("./Expectation");
var types_1 = require("./types");
var debugLog = debug_1["default"]('mockyeah:fetch:log');
var debugError = debug_1["default"]('mockyeah:fetch:error');
var DEFAULT_BOOT_OPTIONS = {};
var Mockyeah = /** @class */ (function () {
    function Mockyeah(bootOptions) {
        var _this = this;
        if (bootOptions === void 0) { bootOptions = DEFAULT_BOOT_OPTIONS; }
        var defaultProxy = bootOptions.proxy, prependServerURL = bootOptions.prependServerURL, noPolyfill = bootOptions.noPolyfill, _a = bootOptions.host, host = _a === void 0 ? 'localhost' : _a, _b = bootOptions.port, port = _b === void 0 ? 4001 : _b, portHttps = bootOptions.portHttps, // e.g., 4443
        _c = bootOptions.suiteHeader, // e.g., 4443
        suiteHeader = _c === void 0 ? 'x-mockyeah-suite' : _c, _d = bootOptions.suiteCookie, suiteCookie = _d === void 0 ? 'mockyeahSuite' : _d, _e = bootOptions.ignorePrefix, ignorePrefix = _e === void 0 ? "http" + (portHttps ? 's' : '') + "://" + host + ":" + (portHttps || port) + "/" : _e, aliases = bootOptions.aliases, _f = bootOptions.responseHeaders, responseHeaders = _f === void 0 ? true : _f, 
        // This is the fallback fetch when no mocks match.
        // @ts-ignore
        _g = bootOptions.fetch, 
        // This is the fallback fetch when no mocks match.
        // @ts-ignore
        fetch = _g === void 0 ? global.fetch : _g;
        if (!fetch) {
            throw new Error('@mockyeah/fetch requires a fetch implementation');
        }
        var serverUrl = "http" + (portHttps ? 's' : '') + "://" + host + ":" + (portHttps || port);
        var mocks = [];
        var makeMock = function (match, res) {
            var matchNormal = normalize_1.normalize(match);
            var existingIndex = mocks.findIndex(function (m) { return isMockEqual_1.isMockEqual(matchNormal, m[0]); });
            if (existingIndex >= 0) {
                mocks.splice(existingIndex, 1);
            }
            var resObj = typeof res === 'string' ? { text: res } : res;
            resObj = resObj || { status: 200 };
            if (Object.keys(resObj).some(function (key) { return !types_1.responseOptionsKeys.includes(key); })) {
                throw new Error("Response option(s) invalid. Options must include one of the following: " + types_1.responseOptionsKeys.join(', '));
            }
            if (matchNormal.$meta) {
                matchNormal.$meta.expectation = new Expectation_1.Expectation(matchNormal);
            }
            return [matchNormal, resObj];
        };
        var mock = function (match, res) {
            var mockNormal = makeMock(match, res);
            mocks.push(mockNormal);
            var expectation = mockNormal[0].$meta && mockNormal[0].$meta.expectation;
            var api = expectation.api.bind(expectation);
            var expect = function (_match) { return api(_match); };
            return {
                expect: expect.bind(expectation)
            };
        };
        var methodize = function (match, method) {
            var matchObject = isPlainObject_1["default"](match)
                ? match
                : { url: match };
            return __assign(__assign({}, matchObject), { method: method });
        };
        var fallbackFetch = function (input, init, fetchOptions) {
            if (fetchOptions === void 0) { fetchOptions = {}; }
            return __awaiter(_this, void 0, void 0, function () {
                var proxy, url, headers, res, status_1, statusText, headers, newHeaders;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            proxy = fetchOptions.proxy;
                            url = typeof input === 'string' ? input : input.url;
                            if (!proxy || !url.startsWith('http')) {
                                headers = {};
                                if (responseHeaders) {
                                    headers['x-mockyeah-missed'] = 'true';
                                }
                                return [2 /*return*/, new Response(undefined, {
                                        status: 404,
                                        headers: headers
                                    })];
                            }
                            return [4 /*yield*/, fetch(input, init)];
                        case 1:
                            res = _a.sent();
                            if (responseHeaders) {
                                status_1 = res.status, statusText = res.statusText, headers = res.headers;
                                newHeaders = headers && new Headers(headers);
                                if (newHeaders) {
                                    newHeaders.set('x-mockyeah-proxied', 'true');
                                    newHeaders.set('x-mockyeah-missed', 'true');
                                }
                                res = new Response(res.body, {
                                    headers: newHeaders,
                                    status: status_1,
                                    statusText: statusText
                                });
                            }
                            return [2 /*return*/, res];
                    }
                });
            });
        };
        var aliasReplacements = {};
        (aliases || []).forEach(function (aliasSet) {
            aliasSet.forEach(function (alias) {
                aliasReplacements[alias] = aliasSet;
            });
        });
        var mockyeahFetch = function (input, init, _a) {
            var _b = _a === void 0 ? {} : _a, dynamicMocks = _b.dynamicMocks, _c = _b.proxy, proxy = _c === void 0 ? defaultProxy : _c;
            return __awaiter(_this, void 0, void 0, function () {
                var url, options, dynamicMocksNormal, parsed, inHeaders, contentType, isBodyJson, inBody, query, method, headers, incoming, matchingMock, pathname, cookies, cookieHeader, requestForHandler, suiteName, m, newOptions;
                var _d;
                return __generator(this, function (_e) {
                    url = typeof input === 'string' ? input : input.url;
                    options = init || {};
                    dynamicMocksNormal = (dynamicMocks || [])
                        .map(function (dynamicMock) { return dynamicMock && makeMock.apply(void 0, dynamicMock); })
                        .filter(Boolean);
                    parsed = url_1.parse(url);
                    inHeaders = options.headers
                        ? options.headers instanceof Headers
                            ? options.headers
                            : new Headers(options.headers)
                        : undefined;
                    // TODO: Handle non-string bodies (Buffer, Form, etc.).
                    if (options.body && typeof options.body !== 'string') {
                        debugError('@mockyeah/fetch does not yet support non-string request bodies');
                        return [2 /*return*/, fallbackFetch(url, init)];
                    }
                    contentType = inHeaders && inHeaders.get('Content-Type');
                    isBodyJson = contentType && contentType.includes('application/json');
                    inBody = options.body && isBodyJson
                        ? JSON.parse(options.body)
                        : // TODO: Support forms as key/value object (see https://expressjs.com/en/api.html#req.body)
                            options.body;
                    query = parsed.query ? qs_1["default"].parse(parsed.query) : undefined;
                    method = options.method ? options.method.toLowerCase() : 'get';
                    // TODO: Handle `Headers` type.
                    if (options.headers && !isPlainObject_1["default"](options.headers)) {
                        debugError('@mockyeah/fetch does not yet support non-object request headers');
                        return [2 /*return*/, fallbackFetch(url, init)];
                    }
                    headers = options.headers;
                    incoming = {
                        url: url.replace(ignorePrefix, ''),
                        query: query,
                        headers: headers,
                        body: inBody,
                        method: method
                    };
                    __spreadArrays([
                        incoming
                    ], flatten_1["default"](Object.entries(aliasReplacements).map(function (_a) {
                        var alias = _a[0], aliasSet = _a[1];
                        if (incoming.url.replace(/^\//, '').startsWith(alias)) {
                            return aliasSet.map(function (alias2) { return (__assign(__assign({}, incoming), { url: url.replace(alias, alias2) })); });
                        }
                        return [];
                    }))).filter(Boolean)
                        .find(function (inc) {
                        var incNorm = normalize_1.normalize(inc, true);
                        return __spreadArrays((dynamicMocksNormal || []).filter(Boolean), mocks).find(function (m) {
                            var match = normalize_1.normalize(m[0]);
                            var matchResult = match_deep_1["default"](incNorm, match, { skipKeys: ['$meta'] });
                            if (matchResult.result) {
                                matchingMock = m;
                                return true;
                            }
                            return false;
                        });
                    });
                    pathname = parsed.pathname || '/';
                    cookieHeader = headers && (headers.cookie || headers.Cookie);
                    if (cookieHeader) {
                        cookies = cookie_1["default"].parse(cookieHeader);
                    }
                    else if (typeof window !== 'undefined') {
                        cookies = cookie_1["default"].parse(window.document.cookie);
                    }
                    requestForHandler = {
                        url: pathname,
                        path: pathname,
                        query: query,
                        method: method,
                        headers: headers,
                        body: inBody,
                        cookies: cookies
                    };
                    if (matchingMock) {
                        debugLog('@mockyeah/fetch matched mock for URL', url, {
                            request: requestForHandler,
                            mock: matchingMock
                        });
                        if (matchingMock[0] && matchingMock[0].$meta && matchingMock[0].$meta.expectation) {
                            // May throw error, which will cause the promise to reject.
                            matchingMock[0].$meta.expectation.request(requestForHandler);
                        }
                        return [2 /*return*/, respond_1.respond(matchingMock, requestForHandler, bootOptions)];
                    }
                    debugLog('@mockyeah/fetch missed mocks for URL', url, {
                        request: requestForHandler
                    });
                    // Consider removing this `prependServerURL` feature.
                    if (prependServerURL && serverUrl) {
                        url = serverUrl + "/" + url.replace('://', '~~~');
                    }
                    if (typeof document !== 'undefined') {
                        m = document.cookie.match("\\b" + suiteCookie + "=([^;]+)\\b");
                        suiteName = m && m[1];
                    }
                    newOptions = __assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), (suiteName && (_d = {},
                            _d[suiteHeader] = suiteName,
                            _d))) });
                    return [2 /*return*/, fallbackFetch(url, newOptions, { proxy: proxy })];
                });
            });
        };
        if (!noPolyfill) {
            // @ts-ignore
            global.fetch = mockyeahFetch;
        }
        var reset = function () {
            // @ts-ignore
            // global.fetch = fetch;
            mocks = [];
        };
        var all = function (match, res) { return mock(match, res); };
        var get = function (match, res) { return mock(methodize(match, 'get'), res); };
        var post = function (match, res) { return mock(methodize(match, 'post'), res); };
        var put = function (match, res) { return mock(methodize(match, 'put'), res); };
        var del = function (match, res) { return mock(methodize(match, 'delete'), res); };
        var options = function (match, res) { return mock(methodize(match, 'options'), res); };
        var patch = function (match, res) { return mock(methodize(match, 'patch'), res); };
        var methods = {
            all: all,
            get: get,
            post: post,
            put: put,
            "delete": del,
            options: options,
            patch: patch
        };
        var expect = function (match) { return all('*').expect(match); };
        Object.assign(this, __assign({ fetch: mockyeahFetch, reset: reset,
            mock: mock,
            methods: methods,
            expect: expect }, methods));
    }
    return Mockyeah;
}());
exports["default"] = Mockyeah;
