import { Portal, Reblend, useEffect, useReducer, useRef } from "reblendjs";
import { fireEvent, render, screen, configure } from "../";

describe("render API", () => {
  let originalConfig;
  beforeEach(() => {
    // Grab the existing configuration so we can restore
    // it at the end of the test
    configure((existingConfig) => {
      originalConfig = existingConfig;
      // Don't change the existing config
      return {};
    });
  });

  afterEach(() => {
    configure(originalConfig);
  });

  test("renders div into document", async () => {
    const ref = useRef();
    const { container } = await render(<div ref={ref} />);
    expect(container.firstChild).toBe(ref.current);
  });

  test("works great with reblendjs portals", async () => {
    class MyPortal extends Reblend {
      initState(...args) {
        super.initState(...args);
        this.portalNode = document.createElement("div");
        this.portalNode.dataset.testid = "my-portal";
      }
      componentDidMount() {
        document.body.appendChild(this.portalNode);
      }
      componentWillUnmount() {
        this.portalNode.parentNode.removeChild(this.portalNode);
      }
      html() {
        return (
          <Portal portal={this.portalNode}>
            <Greet greeting="Hello" subject="World" />,
          </Portal>
        );
      }
    }

    function Greet({ greeting, subject }) {
      return (
        <div>
          <strong>
            {greeting} {subject}
          </strong>
        </div>
      );
    }

    const { unmount } = await render(<MyPortal />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    const portalNode = screen.getByTestId("my-portal");
    expect(portalNode).toBeInTheDocument();
    await unmount();
    expect(portalNode).not.toBeInTheDocument();
  });

  test("returns baseElement which defaults to document.body", async () => {
    const { baseElement } = await render(<div />);
    expect(baseElement).toBe(document.body);
  });

  test("supports fragments", async () => {
    class Test extends Reblend {
      html() {
        return (
          <div>
            <code>DocumentFragment</code> is pretty cool!
          </div>
        );
      }
    }

    const { asFragment } = await render(<Test />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders options.wrapper around node", async () => {
    //@reblendComponent
    function WrapperComponent({ children }) {
      return <div data-testid="wrapper">{children}</div>;
    }
    const { container } = await render(<div data-testid="inner" />, {
      wrapper: WrapperComponent,
    });

    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      reblendcomponent="WrapperComponent"
    >
      <div
        data-testid="wrapper"
      >
        <div
          data-testid="inner"
        >
          
        </div>
      </div>
    </div>
  `);
  });

  test("renders", async () => {
    const spy = jest.fn();

    //@reblendComponent
    function Component({ spy }) {
      spy();
      return <></>;
    }

    await render(<Component spy={spy} />);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("flushes useEffect cleanup functions sync on unmount()", async () => {
    const spy = jest.fn();

    //@reblendComponent
    function Component({ spy }) {
      useEffect(() => spy, []);
      return <></>;
    }
    const { unmount } = await render(<Component spy={spy} />);
    expect(spy).toHaveBeenCalledTimes(0);

    await unmount();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("can be called multiple times on the same container", async () => {
    const container = document.createElement("div");

    const { unmount } = await render(<strong />, { container });

    expect(container).toContainHTML("<strong></strong>");

    await render(<em />, { container });

    expect(container).toContainHTML("<em></em>");

    await unmount();

    expect(container).toBeEmptyDOMElement();
  });

  /*   test('The UI should be interactive', async () => {
    //@reblendComponent
    function App() {
      const [clicked, handleClick] = useReducer(n => n + 1, 0)

      return (
        <button type="button" onClick={handleClick}>
          clicked:{clicked}
        </button>
      )
    }
    const ui = <App />
    const container = document.createElement('div')
    document.body.appendChild(container)
    container.innerHTML = await Reblend.renderToString(ui)

    expect(container).toHaveTextContent('clicked:0')

    await render(ui, {container})

    fireEvent.click(container.querySelector('button'))

    expect(container).toHaveTextContent('clicked:1')
  }) */

  test("Render with a wrapper", async () => {
    const wrapperComponentMountEffect = jest.fn();
    const ui = <div />;

    //@reblendComponent
    function WrapperComponent({ children }) {
      useEffect(() => {
        wrapperComponentMountEffect();
      });

      return <>{children}</>;
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = await Reblend.renderToString(ui);

    await render(ui, { container, wrapper: WrapperComponent });

    expect(wrapperComponentMountEffect).toHaveBeenCalledTimes(1);
  });
});
