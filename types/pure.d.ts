import { BoundFunctions, PrettyDOMOptions, Queries } from "@testing-library/dom";
import { fireEvent } from "./fire-event";
import { getConfig, configure } from "./config";
import { ReblendNode } from "reblendjs";
export interface IRenderOption<C = HTMLElement, T extends Queries = {}> {
    baseElement?: HTMLElement;
    container?: C;
    queries?: T;
    wrapper?: ReblendNode;
}
export type IRenderReturnType<T = HTMLElement> = BoundFunctions<any> & {
    container: T;
    baseElement: HTMLElement;
    debug: (dom?: never | unknown | Element | Document, maxLength?: number, options?: PrettyDOMOptions) => void;
    unmount: () => Promise<void>;
    rerender: (ui: ReblendNode) => Promise<void>;
    asFragment: () => DocumentFragment;
};
declare function render<C = HTMLElement, T extends Queries = {}>(ui: ReblendNode, { baseElement, container, queries, wrapper, }?: IRenderOption<C> | undefined): Promise<IRenderReturnType<C>>;
declare function cleanup(): Promise<void>;
declare function renderHook(useRenderCallback: any, options?: {}): Promise<{
    result: import("reblend-typing").Ref<unknown>;
    rerender: (rerenderCallbackProps: any) => Promise<void>;
    unmount: () => Promise<void>;
}>;
declare function act(callback: () => void | Promise<void>): Promise<void>;
export * from "@testing-library/dom";
export { act, render, renderHook, cleanup, fireEvent, getConfig, configure };
