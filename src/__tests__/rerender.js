import { Reblend } from "reblendjs";
import { render, configure } from "../";

describe("rerender API", () => {
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

  test("rerender will re-render the element", async () => {
    const Greeting = (props) => <div>{props.message}</div>;
    const { container, rerender } = await render(<Greeting message="hi" />);
    expect(container.firstChild).toHaveTextContent("hi");
    await rerender(<Greeting message="hey" />);
    expect(container.firstChild).toHaveTextContent("hey");
  });

/*   test("rerender will re-render the element", async () => {
    const initialInputElement = document.createElement("input");
    const container = document.createElement("div");
    container.appendChild(initialInputElement);
    document.body.appendChild(container);

    const firstValue = "hello";
    initialInputElement.value = firstValue;

    const { rerender } = await render(
      <input value="" onChange={() => null} />,
      {
        container,
      }
    );

    expect(initialInputElement).toHaveValue(firstValue);

    const secondValue = "goodbye";
    await rerender(<input value={secondValue} onChange={() => null} />);
    expect(initialInputElement).toHaveValue(secondValue);
  }); */

  test("renders options.wrapper around node", async () => {
    const WrapperComponent = ({ children }) => (
      <div data-testid="wrapper">{children}</div>
    );
    const Greeting = (props) => <div>{props.message}</div>;
    const { container, rerender } = await render(<Greeting message="hi" />, {
      wrapper: WrapperComponent,
    });

    expect(container.firstChild).toMatchInlineSnapshot(`
          <div
            reblendcomponent="WrapperComponent"
          >
            <div
              data-testid="wrapper"
            >
              <div
                reblendcomponent="Greeting"
              >
                <div>
                  hi
                </div>
              </div>
            </div>
          </div>
      `);

    await rerender(<Greeting message="hey" />);
    expect(container.firstChild).toMatchInlineSnapshot(`
          <div
            reblendcomponent="WrapperComponent"
          >
            <div
              data-testid="wrapper"
            >
              <div
                reblendcomponent="Greeting"
              >
                <div>
                  hey
                </div>
              </div>
            </div>
          </div>
    `);
  });

  test("body of functional components runs once", async () => {

    const spy = jest.fn();
    function Component() {
      spy();
    }

    const { rerender } = await render(<Component />);
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockClear();
    await rerender(<Component />);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
