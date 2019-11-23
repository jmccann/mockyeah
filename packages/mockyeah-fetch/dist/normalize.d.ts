import { MatchObject, Match } from './types';
declare const stripQuery: (url: string) => {
    url: string;
    query: any;
};
declare const normalize: (match: Match, incoming?: boolean | undefined) => MatchObject | import("./types").MatchFunction;
export { stripQuery };
export { normalize };
