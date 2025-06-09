import Reblend, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "reblendjs";
import { renderHook } from "../pure";

/* 
//Reblend custom hooks are not yet stable
test("gives committed result", async () => {
  //@ReblendHook
  function useStateHookTest() {
    const [states, setStates] = useState(1);

    useEffect(() => {
      setStates(2);
    }, []);

    return [states, setStates];
  }

  const { result } = await renderHook(useStateHookTest);

  expect(result.current).toEqual([2, expect.any(Function)]);
}); */

test("allows rerendering", async () => {
  //@ReblendHook
  function useLeftRight({ branch }) {
    const [left, setLeft] = useState("left");
    const [right, setRight] = useState("right");

    // eslint-disable-next-line jest/no-if, jest/no-conditional-in-test -- false-positive
    return (() => {
      switch (branch) {
        case "left":
          return [left, setLeft];
        case "right":
          return [right, setRight];

        default:
          throw new Error(
            "No Props passed. This is a bug in the implementation"
          );
      }
    })();
  }

  const { result, rerender } = await renderHook(useLeftRight, {
    initialProps: { branch: "left" },
  });

  expect(result.current).toEqual(["left", expect.any(Function)]);

  await rerender({ branch: "right" });

  expect(result.current).toEqual(["right", expect.any(Function)]);
});

test("allows wrapper components", async () => {
  const Context = createContext("default");
  function Wrapper({ children }) {
    return <>{children}</>;
  }

  const { result } = await renderHook(
    function useAny() {
      const ctx = useContext(Context);
      return ctx;
    },
    {
      wrapper: Wrapper,
    }
  );

  expect(result.current[0]).toEqual("default");
});
