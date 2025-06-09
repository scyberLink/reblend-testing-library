import {Reblend} from 'reblendjs'
import {getByText, render, screen} from '../'

// This just verifies that by importing RTL in an
// environment which supports afterEach (like jest)
// we'll get automatic cleanup between tests.
test('first', async () => {
  await render(<div>hi</div>)
  expect(screen.getByText('hi').textContent).toBe('hi')
})

test('second', async () => {
  expect(document.body).toBeEmptyDOMElement()
})
