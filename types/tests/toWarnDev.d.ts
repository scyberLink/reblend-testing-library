export function toWarnDev(callback: any, expectedMessages: any, options?: {}, ...args: any[]): {
    message: () => any;
    pass: boolean;
} | {
    pass: boolean;
    message?: undefined;
};
export function toErrorDev(callback: any, expectedMessages: any, options?: {}, ...args: any[]): {
    message: () => any;
    pass: boolean;
} | {
    pass: boolean;
    message?: undefined;
};
