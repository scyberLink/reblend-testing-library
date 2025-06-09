import { Reblend, useRef, useState } from "reblendjs";
import { render, fireEvent, screen, waitFor, queryByText } from "../";
import { useEffect } from "reblendjs";

test("render calls useEffect immediately", async () => {
  const effectCb = jest.fn();
  //@reblendComponent
  function MyUselessComponent() {
    useEffect(effectCb);
    return <></>;
  }
  await render(<MyUselessComponent />);
  expect(effectCb).toHaveBeenCalledTimes(1);
});

test("findByTestId returns the element", async () => {
  const ref = useRef();
  await render(<div ref={ref} data-testid="foo" />);
  expect(await screen.findByTestId("foo")).toBe(ref.current);
});

test("fireEvent triggers useEffect calls", async () => {
  const effectCb = jest.fn();
  //@reblendComponent
  function Counter() {
    useEffect(effectCb);
    const [count, setCount] = useState(0);
    return (
      <>
        <button onClick={() => setCount(count + 1)}>{count}</button>
        {count ? "Watch me change!" : "Click the button!"}
      </>
    );
  }
  const {
    container: {
      firstChild: { firstChild: buttonNode },
    },
  } = await render(<Counter />);
  effectCb.mockClear();
  fireEvent.click(buttonNode);
  await waitFor(async () => {
    screen.getByText(/Click the button!/);
  });
  await waitFor(async () => {
    screen.getByText(/Watch me change!/);
  });
  expect(buttonNode).toHaveTextContent("1");
  expect(effectCb).toHaveBeenCalledTimes(1);
});
