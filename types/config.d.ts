export function getConfig(): {
    reblendStrictMode: boolean;
    testIdAttribute: string;
    unstable_advanceTimersWrapper(cb: (...args: unknown[]) => unknown): unknown;
    asyncWrapper(cb: (...args: any[]) => any): Promise<any>;
    eventWrapper(cb: (...args: any[]) => any): void;
    asyncUtilTimeout: number;
    computedStyleSupportsPseudoElements: boolean;
    defaultHidden: boolean;
    defaultIgnore: string;
    showOriginalStackTrace: boolean;
    throwSuggestions: boolean;
    getElementError: (message: string | null, container: Element) => Error;
};
export function configure(newConfig: any): void;
