import Reblend, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "reblendjs";
import { renderHook } from "../pure";
import { useProps } from "reblendjs";

//Reblend custom hooks are not yet stable
test("gives committed result", async () => {
  //@ReblendHook
  function useStateHookTest() {
    const [states, setStates] = useState(1);

    const state = {
      states,
      setStates,
    };

    useEffect(() => {
      setStates(2);
    }, []);

    useEffect(() => {
      state.states = states;
    }, states);

    return state;
  }

  const { result } = await renderHook(useStateHookTest);

  expect(result.current).toEqual({
    states: 2,
    setStates: expect.any(Function),
  });
});

test("allows rerendering", async () => {
  //@ReblendHook
  function useLeftRight() {
    const [left, setLeft] = useState("left");
    const [right, setRight] = useState("right");
    const result = { result: null };

    useProps((_props, { initialProps: { branch } }) => {
      switch (branch) {
        case "left":
          result.result = [left, setLeft];
          break;
        case "right":
          result.result = [right, setRight];
          break;

        default:
          throw new Error(
            "No Props passed. This is a bug in the implementation"
          );
      }
    });

    return result;
  }

  const { result, rerender } = await renderHook(useLeftRight, {
    initialProps: { branch: "left" },
  });

  expect(result.current.result).toEqual(["left", expect.any(Function)]);

  await rerender({ branch: "right" });

  expect(result.current.result).toEqual(["right", expect.any(Function)]);
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
