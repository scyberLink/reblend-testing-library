# Reblend Testing Library

![Build Status](https://github.com/scyberLink/reblend-testing-library/actions/workflows/ci.yml/badge.svg)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

> Simple and complete ReblendJS DOM testing utilities that encourage good testing practices.

---

## Overview

Reblend Testing Library provides lightweight utilities for testing [ReblendJS](https://github.com/scyberLink/reblendjs) components. It encourages tests that focus on user interactions and DOM output, not implementation details.

## Installation

```bash
npm install --save-dev reblend-testing-library @testing-library/dom @testing-library/jest-dom
```

- Requires Node.js >= 20
- Peer dependencies: `reblendjs`, `@testing-library/dom`

## Usage Example

```js
import { render, fireEvent, screen } from 'reblend-testing-library';
import '@testing-library/jest-dom';

function Counter() {
  const [count, setCount] = Reblend.useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      {count ? 'Clicked!' : 'Click the button!'}
    </>
  );
}

test('increments counter', async () => {
  render(<Counter />);
  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('0');
  fireEvent.click(button);
  expect(button).toHaveTextContent('1');
  expect(screen.getByText('Clicked!')).toBeInTheDocument();
});
```

## Features
- Works with [ReblendJS](https://github.com/scyberLink/reblendjs) components and hooks
- Encourages user-centric testing
- Integrates with [@testing-library/dom](https://testing-library.com/docs/dom-testing-library/intro/) and [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)
- Supports async utilities like `waitFor`, `findBy*`, etc.

## API
- `render(ui, options)`: Render a ReblendJS component to the DOM
- `fireEvent`: Simulate user events
- `screen`: Global queries for DOM elements
- `waitFor`, `waitForElementToBeRemoved`: Async utilities for waiting on DOM changes

See the [API docs](https://testing-library.com/docs/dom-testing-library/api) for more details.

## Migration from React
- All React/ReactDOM references have been removed
- Use `reblendjs` and Reblend Testing Library utilities in your tests
- Most React Testing Library patterns are supported, but use ReblendJS components/hooks

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
MIT © Emmanuel Paul Elom

---

For more examples and advanced usage, see the [docs](https://testing-library.com/reblend) or open an issue if you have questions.
