import {
  getQueriesForElement,
  prettyDOM,
  configure as configureDTL,
  BoundFunctions,
  PrettyDOMOptions,
  Queries,
} from "@testing-library/dom";
import { fireEvent } from "./fire-event";
import { getConfig, configure } from "./config";
import Reblend, {
  ConfigUtil,
  detach,
  rand,
  ReblendTyping,
  useEffect,
  useRef,
} from "reblendjs";

// Ideally we'd just use a WeakMap where containers are keys and roots are values.
// We use two variables so that we can bail out in constant time when we render with a new container (most common use case)
const mountedContainers = new Set<HTMLElement>();

function wrapUiIfNeeded(innerElement, wrapperComponent) {
  return wrapperComponent
    ? Reblend.construct(wrapperComponent, {}, innerElement)
    : innerElement;
}

export interface IRenderOption<C = HTMLElement, T extends Queries = {}> {
  baseElement?: HTMLElement;
  container?: C;
  queries?: T;
  wrapper?: ReblendTyping.ReblendNode;
}

export type IRenderReturnType<T = HTMLElement> = BoundFunctions<any> & {
  container: T;
  baseElement: HTMLElement;
  debug: (
    dom?: never | unknown | Element | Document,
    maxLength?: number,
    options?: PrettyDOMOptions
  ) => void;
  unmount: () => Promise<void>;
  rerender: (ui: ReblendTyping.ReblendNode) => Promise<void>;
  asFragment: () => DocumentFragment;
};

async function renderRoot<C = HTMLElement, T extends Queries = {}>(
  ui: ReblendTyping.ReblendNode,
  { baseElement, container, queries, wrapper: WrapperComponent }: any = {}
): Promise<IRenderReturnType<C>> {
  if (!container) return undefined as any;
  ConfigUtil.getInstance().update({
    noDefering: true,
  });
  await Reblend.mountOn(
    container as any,
    (await wrapUiIfNeeded(ui, WrapperComponent)) as any
  );

  return {
    container,
    baseElement,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? // eslint-disable-next-line no-console
          el.forEach((e) => console.log(prettyDOM(e, maxLength, options)))
        : // eslint-disable-next-line no-console,
          console.log(prettyDOM(el, maxLength, options)),
    unmount: async () => {
      mountedContainers.delete(container);
      await detach(container);
    },
    rerender: async (rerenderUi) => {
      const rerenderchildren = await wrapUiIfNeeded(
        rerenderUi,
        WrapperComponent
      );
      await Reblend.mountOn(container as any, rerenderchildren as any);
      // Intentionally do not return anything to avoid unnecessarily complicating the API.
      // folks can use all the same utilities we return in the first place that are bound to the container
    },
    asFragment: () => {
      /* istanbul ignore else (old jsdom limitation) */
      if (typeof document.createRange === "function") {
        return document
          .createRange()
          .createContextualFragment(container?.innerHTML!);
      } else {
        const template = document.createElement("template");
        template.innerHTML = container?.innerHTML!;
        return template.content;
      }
    },
    ...getQueriesForElement<T>(baseElement!, queries),
  } as any;
}

async function render<C = HTMLElement, T extends Queries = {}>(
  ui: ReblendTyping.ReblendNode,
  {
    baseElement,
    container,
    queries,
    wrapper,
  }: IRenderOption<C> | undefined = {}
) {
  if (!baseElement) {
    // default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output
    baseElement = document.body;
  }
  if (!container) {
    container = baseElement.appendChild(document.createElement("div")) as any;
  }

  mountedContainers.add(container as any);

  return await renderRoot<C, T>(ui, {
    container,
    baseElement,
    queries,
    wrapper,
  });
}

async function cleanup() {
  for (const container of mountedContainers) {
    await detach(container);
  }
  mountedContainers.clear();
}

async function renderHook(useRenderCallback, options = {}) {
  const { initialProps, ...renderOptions } = options as any;

  let result = useRef();

  //@reblendComponent
  function TestComponent({ renderCallbackProps, refreshCode }) {
    useEffect(() => {
      const pendingResult = useRenderCallback(renderCallbackProps);
      result && (result.current = pendingResult);
    }, refreshCode);

    return null;
  }

  const { rerender: baseRerender, unmount } = await render(
    <TestComponent renderCallbackProps={initialProps} refreshCode={0} />,
    renderOptions
  );

  async function rerender(rerenderCallbackProps) {
    return await baseRerender(
      <TestComponent
        renderCallbackProps={rerenderCallbackProps}
        refreshCode={rand(101, 4321)}
      />
    );
  }

  return { result, rerender, unmount };
}

// just re-export everything from dom-testing-library
export * from "@testing-library/dom";
export { render, renderHook, cleanup, fireEvent, getConfig, configure };

/* eslint func-name-matching:0 */
