import { Reblend, useEffect, useState } from "reblendjs";
import { render, cleanup } from "../";

test("cleans up the document", async () => {
  const spy = jest.fn();
  const divId = "my-div";

  class Test extends Reblend {
    componentWillUnmount() {
      expect(document.getElementById(divId)).toBeInTheDocument();
      spy();
    }

    html() {
      return <div id={divId} />;
    }
  }

  await render(<Test />);
  await cleanup();
  expect(document.body).toBeEmptyDOMElement();
  expect(spy).toHaveBeenCalledTimes(1);
});

test("cleanup does not error when an element is not a child", async () => {
  await render(<div />, { container: document.createElement("div") });
  await cleanup();
});

test("cleanup runs effect cleanup functions", async () => {
  const spy = jest.fn();

  //@reblendComponent
  const Test = () => {
    useEffect(() => spy);
  };

  await render(<Test />);
  await cleanup();
  expect(spy).toHaveBeenCalledTimes(1);
});

describe("fake timers and missing act warnings", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {
      // assert messages explicitly
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("cleanup does not flush microtasks", async () => {
    const microTaskSpy = jest.fn();
    //@reblendComponent
    function Test() {
      const [counter, setDeferredCounter] = useState(1);
      useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(() => {
          microTaskSpy();
          // eslint-disable-next-line jest/no-if, jest/no-conditional-in-test -- false positive
          if (!cancelled) {
            setDeferredCounter(counter);
          }
        });

        return () => {
          cancelled = true;
        };
      }, [counter]);

      return null;
    }
    await render(<Test />);

    await cleanup();

    expect(microTaskSpy).toHaveBeenCalledTimes(1);
    // console.error is mocked
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  test("cleanup does not flush macrotasks", async () => {
    const deferredStateUpdateSpy = jest.fn();
    //@reblendComponent
    function Test() {
      const [counter, setDeferredCounter] = useState(1);
      useEffect(() => {
        let cancelled = false;
        setTimeout(() => {
          deferredStateUpdateSpy();
          // eslint-disable-next-line jest/no-conditional-in-test -- false-positive
          if (!cancelled) {
            setDeferredCounter(counter);
          }
        }, 0);

        return () => {
          cancelled = true;
        };
      }, [counter]);

      return null;
    }
    await render(<Test />);

    jest.runAllTimers();
    await cleanup();

    expect(deferredStateUpdateSpy).toHaveBeenCalledTimes(1);
  });
});
