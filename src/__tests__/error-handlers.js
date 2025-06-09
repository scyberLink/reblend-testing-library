import { Reblend } from "reblendjs";
import { render } from "../";

test("render errors", async () => {
  //@reblendComponent
  function Thrower() {
    throw new Error("Boom!");
  }

  let errorMessage = "";

  class ErrorBoundary extends Reblend {
    handleError(error) {
      errorMessage = error.message;
    }
  }

  await render(<Thrower />, { wrapper: ErrorBoundary });
  expect(errorMessage).toBe("Boom!");
});
