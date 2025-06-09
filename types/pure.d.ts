import { BoundFunctions, PrettyDOMOptions, Queries } from "@testing-library/dom";
import { fireEvent } from "./fire-event";
import { getConfig, configure } from "./config";
import { ReblendTyping } from "reblendjs";
export interface IRenderOption<C = HTMLElement, T extends Queries = {}> {
    baseElement?: HTMLElement;
    container?: C;
    queries?: T;
    wrapper?: ReblendTyping.ReblendNode;
}
export type IRenderReturnType<T = HTMLElement> = BoundFunctions<any> & {
    container: T;
    baseElement: HTMLElement;
    debug: (dom?: never | unknown | Element | Document, maxLength?: number, options?: PrettyDOMOptions) => void;
    unmount: () => Promise<void>;
    rerender: (ui: ReblendTyping.ReblendNode) => Promise<void>;
    asFragment: () => DocumentFragment;
};
declare function render<C = HTMLElement, T extends Queries = {}>(ui: ReblendTyping.ReblendNode, { baseElement, container, queries, wrapper, }?: IRenderOption<C> | undefined): Promise<IRenderReturnType<C>>;
declare function cleanup(): Promise<void>;
declare function renderHook(useRenderCallback: any, options?: {}): Promise<{
    result: ReblendTyping.Ref<unknown>;
    rerender: (rerenderCallbackProps: any) => Promise<void>;
    unmount: () => Promise<void>;
}>;
export * from "@testing-library/dom";
export { render, renderHook, cleanup, fireEvent, getConfig, configure };
