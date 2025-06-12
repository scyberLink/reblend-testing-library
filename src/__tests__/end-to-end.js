import Reblend, { useEffect, useState } from "reblendjs";
import { render, waitForElementToBeRemoved, screen, waitFor, act } from "../";

describe.each([
  ["real timers", () => jest.useRealTimers()],
  ["fake legacy timers", () => jest.useFakeTimers("legacy")],
  ["fake modern timers", () => jest.useFakeTimers("modern")],
])(
  "it waits for the data to be loaded in a macrotask using %s",
  (label, useTimers) => {
    beforeEach(() => {
      useTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const fetchAMessageInAMacrotask = () =>
      new Promise((resolve) => {
        // we are using random timeout here to simulate a real-time example
        // of an async operation calling a callback at a non-deterministic time
        const randomTimeout = Math.floor(Math.random() * 100);
        setTimeout(() => {
          resolve({ returnedMessage: "Hello World" });
        }, randomTimeout);
      });

    //@reblendComponent
    function ComponentWithMacrotaskLoader() {
      const [state, setState] = useState({
        data: undefined,
        loading: true,
      });

      useEffect(() => {
        let cancelled = false;
        fetchAMessageInAMacrotask().then((data) => {
          if (!cancelled) {
            setState({ data, loading: false });
          }
        });

        return () => {
          cancelled = true;
        };
      }, []);

      return state.loading ? (
        <div>Loading...</div>
      ) : (
        <div data-testid="message">
          Loaded this message: {state.data.returnedMessage}!
        </div>
      );
    }

    test("waitForElementToBeRemoved", async () => {
      await render(<ComponentWithMacrotaskLoader />);
      const loading = () => screen.getByText("Loading...");
      await waitForElementToBeRemoved(loading);
      await act(() => {
        expect(screen.getByTestId("message")).toHaveTextContent(/Hello World/);
      });
    });

    test("waitFor", async () => {
      await render(<ComponentWithMacrotaskLoader />);
      await waitFor(() => screen.getByText(/Loading../));
      await waitFor(() => screen.getByText(/Loaded this message:/));
      await act(() => {
        expect(screen.getByTestId("message")).toHaveTextContent(/Hello World/);
      });
    });

    test("findBy", async () => {
      await render(<ComponentWithMacrotaskLoader />);
      await act(async () => {
        await expect(screen.findByTestId("message")).resolves.toHaveTextContent(
          /Hello World/
        );
      });
    });
  }
);
