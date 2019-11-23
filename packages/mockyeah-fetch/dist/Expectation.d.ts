import { MatchObject, Match, Matcher, VerifyCallback, RunHandlerOrPromise, RequestForHandler } from './types';
declare class Expectation {
    prefix: string;
    called: number;
    assertions: (() => void)[];
    handlers: ((req: RequestForHandler) => void)[];
    runPromise?: Promise<void>;
    constructor(match: MatchObject);
    request(req: RequestForHandler): void;
    api(predicateOrMatchObject: Match): this;
    atLeast(num: number): this;
    atMost(num: number): this;
    never(): this;
    once(): this;
    twice(): this;
    thrice(): this;
    exactly(num: number): this;
    path(value: Matcher<string>): this;
    url(value: Matcher<string>): this;
    header(name: string, value: Matcher<string>): this;
    params(value: Matcher<Record<string, string>>): this;
    query(value: Matcher<Record<string, string>>): this;
    body(value: any): this;
    verifier(done: (err?: Error) => void): (err?: Error | undefined) => void;
    run(handlerOrPromise: RunHandlerOrPromise): this;
    verify(callback?: VerifyCallback): Promise<void> | undefined;
}
export { Expectation };
