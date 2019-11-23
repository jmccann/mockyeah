"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isObject_1 = __importDefault(require("lodash/isObject"));
const isRegExp_1 = __importDefault(require("lodash/isRegExp"));
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const stringify = (value) => {
    if (value === undefined)
        return 'undefined';
    try {
        return JSON.stringify(value);
    }
    catch (error) {
        return value;
    }
};
const DEFAULT_MATCH_OPTIONS = {};
const makeMatcher = (options = DEFAULT_MATCH_OPTIONS) => {
    const { shortCircuit, skipKeys } = options;
    const errors = [];
    const internalMatcher = (value, source, keyPath) => {
        if (isRegExp_1.default(source)) {
            const result = source.test(value);
            if (!result)
                errors.push({
                    message: `Regex \`${source}\` does not match value \`${stringify(value)}\``,
                    keyPath
                });
        }
        else if (typeof source === 'number') {
            const result = (source && source.toString()) === (value && value.toString());
            if (!result)
                errors.push({
                    message: `Number \`${source}\` and value \`${value}\` not equal`,
                    keyPath
                });
        }
        else if (typeof source === 'function') {
            try {
                const result = source(value);
                if (result !== undefined && !result)
                    errors.push({
                        message: `Value \`${stringify(value)}\` does not pass function${source.name ? ` \`${source.name}\`` : ''}`,
                        keyPath
                    });
            }
            catch (error) {
                errors.push({
                    message: error && error.message
                        ? error.message
                        : `Threw error without message \`${stringify(error)}\``,
                    keyPath
                });
            }
        }
        else if (isObject_1.default(value) && isObject_1.default(source)) {
            Object.keys(source).forEach(key => {
                if (skipKeys && skipKeys.includes(key))
                    return;
                if (shortCircuit && errors.length)
                    return;
                // @ts-ignore
                internalMatcher(value[key], source[key], [...keyPath, key]);
            });
        }
        else if (typeof source !== 'undefined') {
            const result = isEqual_1.default(value, source);
            if (!result)
                errors.push({
                    message: `Expected \`${stringify(source)}\` and value \`${stringify(value)}\` not equal`,
                    keyPath
                });
        }
    };
    const matcher = (value, source) => internalMatcher(value, source, []);
    return { errors, matcher };
};
const matches = (value, source, options) => {
    const { errors, matcher } = makeMatcher(options);
    matcher(value, source);
    const result = !errors.length;
    const message = errors.length
        ? errors
            .map(error => `${error.message}${error.keyPath.length ? ` for "${error.keyPath.join('.')}"` : ''}`)
            .join('. ')
        : undefined;
    return {
        value,
        source,
        result,
        message,
        errors
    };
};
exports.default = matches;
//# sourceMappingURL=index.js.map