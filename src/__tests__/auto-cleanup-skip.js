import {Reblend} from 'reblendjs'

let render
beforeAll(() => {
  process.env.RTL_SKIP_AUTO_CLEANUP = 'true'
  const rtl = require('../')
  render = rtl.render
})

// This one verifies that if RTL_SKIP_AUTO_CLEANUP is set
// then we DON'T auto-wire up the afterEach for folks
test('first', async () => {
  await render(<div>hi</div>)
})

test('second', async () => {
  expect(document.body.innerHTML).toEqual('<div><div>hi</div></div>')
})
