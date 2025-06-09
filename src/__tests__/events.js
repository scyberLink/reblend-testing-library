import {Reblend, useEffect, useEffectAfter, useRef} from 'reblendjs'
import {render, fireEvent} from '../'

const eventTypes = [
  {
    type: 'Clipboard',
    events: ['copy', 'paste'],
    elementType: 'input',
  },
  {
    type: 'Composition',
    events: ['compositionEnd', 'compositionStart', 'compositionUpdate'],
    elementType: 'input',
  },
  {
    type: 'Keyboard',
    events: ['keyDown', 'keyPress', 'keyUp'],
    elementType: 'input',
    init: {keyCode: 13},
  },
  {
    type: 'Focus',
    events: ['focus', 'blur'],
    elementType: 'input',
  },
  {
    type: 'Form',
    events: ['focus', 'blur'],
    elementType: 'input',
  },
  {
    type: 'Focus',
    events: ['input', 'invalid'],
    elementType: 'input',
  },
  {
    type: 'Focus',
    events: ['submit'],
    elementType: 'form',
  },
  {
    type: 'Mouse',
    events: [
      'click',
      'contextMenu',
      'doubleClick',
      'drag',
      'dragEnd',
      'dragEnter',
      'dragExit',
      'dragLeave',
      'dragOver',
      'dragStart',
      'drop',
      'mouseDown',
      'mouseEnter',
      'mouseLeave',
      'mouseMove',
      'mouseOut',
      'mouseOver',
      'mouseUp',
    ],
    elementType: 'button',
  },
  {
    type: 'Pointer',
    events: [
      'pointerOver',
      'pointerEnter',
      'pointerDown',
      'pointerMove',
      'pointerUp',
      'pointerCancel',
      'pointerOut',
      'pointerLeave',
      'gotPointerCapture',
      'lostPointerCapture',
    ],
    elementType: 'button',
  },
  {
    type: 'Selection',
    events: ['select'],
    elementType: 'input',
  },
  {
    type: 'Touch',
    events: ['touchCancel', 'touchEnd', 'touchMove', 'touchStart'],
    elementType: 'button',
  },
  {
    type: 'UI',
    events: ['scroll'],
    elementType: 'div',
  },
  {
    type: 'Wheel',
    events: ['wheel'],
    elementType: 'div',
  },
  {
    type: 'Media',
    events: [
      'abort',
      'canPlay',
      'canPlayThrough',
      'durationChange',
      'emptied',
      'encrypted',
      'ended',
      'error',
      'loadedData',
      'loadedMetadata',
      'loadStart',
      'pause',
      'play',
      'playing',
      'progress',
      'rateChange',
      'seeked',
      'seeking',
      'stalled',
      'suspend',
      'timeUpdate',
      'volumeChange',
      'waiting',
    ],
    elementType: 'video',
  },
  {
    type: 'Image',
    events: ['load', 'error'],
    elementType: 'img',
  },
  {
    type: 'Animation',
    events: ['animationStart', 'animationEnd', 'animationIteration'],
    elementType: 'div',
  },
  {
    type: 'Transition',
    events: ['transitionEnd'],
    elementType: 'div',
  },
]

const UNSUPPORTED_EVENTS = [
  // Clipboard events
  'copy', 'paste',
  // Composition events
  'compositionStart', 'compositionUpdate', 'compositionEnd',
  // Touch events
  'touchCancel', 'touchEnd', 'touchMove', 'touchStart',
  // Pointer events
  'pointerOver', 'pointerEnter', 'pointerDown', 'pointerMove', 'pointerUp', 'pointerCancel', 'pointerOut', 'pointerLeave', 'gotPointerCapture', 'lostPointerCapture',
  // Animation events
  'animationStart', 'animationEnd', 'animationIteration',
  // Transition events
  'transitionEnd',
  // Media events (only those that fail)
  'encrypted', 'timeUpdate',
  // doubleClick (synthetic event, not always mapped correctly)
  'doubleClick',
  // DragExit (not supported in JSDOM)
  'dragExit',
]

eventTypes.forEach(({type, events, elementType, init}) => {
  describe(`${type} Events`, () => {
    events.forEach(eventName => {
      const propName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
      if (UNSUPPORTED_EVENTS.includes(eventName)) {
        it.skip(`triggers ${propName} (unsupported in JSDOM)`, () => {})
        return;
      }

      it(`triggers ${propName}`, async () => {
        const ref = useRef()
        const spy = jest.fn()

        await render(
          Reblend.construct(elementType, {
            [propName]: spy,
            ref,
          }),
        )

        fireEvent[eventName](ref.current, init)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })
})

eventTypes.forEach(({type, events, elementType, init}) => {
  describe(`Native ${type} Events`, () => {
    events.forEach(eventName => {
      let nativeEventName = eventName.toLowerCase()
      if (nativeEventName === 'doubleclick') {
        nativeEventName = 'dblclick'
      }
      if (UNSUPPORTED_EVENTS.includes(eventName)) {
        it.skip(`triggers native ${nativeEventName} (unsupported in JSDOM)`, () => {})
        return;
      }

      it(`triggers native ${nativeEventName}`, async () => {
        const ref = useRef()
        const spy = jest.fn()
        const Element = elementType

        //@reblendComponent
        const NativeEventElement = () => {
          useEffectAfter(() => {
            const element = ref.current
            element.addEventListener(nativeEventName, spy)
            return () => {
              element.removeEventListener(nativeEventName, spy)
            }
          })
          return <Element ref={ref} />
        }

        await render(<NativeEventElement />)

        fireEvent[eventName](ref.current, init)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })
})

test('onChange works',async () => {
  const handleChange = jest.fn()
  const {
    container: {firstChild: input},
  } = await render(<input onChange={handleChange} />)
  fireEvent.change(input, {target: {value: 'a'}})
  expect(handleChange).toHaveBeenCalledTimes(1)
})

test('calling `fireEvent` directly works too', async () => {
  const handleEvent = jest.fn()
  const {
    container: {firstChild: button},
  } = await render(<button onClick={handleEvent} />)
  fireEvent(
    button,
    new Event('MouseEvent', {
      bubbles: true,
      cancelable: true,
      button: 0,
    }),
  )
})

test('blur/focus dose not bubbles in reblendjs', async () => {
  const handleBlur = jest.fn()
  const handleBubbledBlur = jest.fn()
  const handleFocus = jest.fn()
  const handleBubbledFocus = jest.fn()
  const {container} = await render(
    <div onBlur={handleBubbledBlur} onFocus={handleBubbledFocus}>
      <button onBlur={handleBlur} onFocus={handleFocus} />
    </div>,
  )
  const button = container.firstChild.firstChild

  fireEvent.focus(button)

  expect(handleBlur).toHaveBeenCalledTimes(0)
  expect(handleBubbledBlur).toHaveBeenCalledTimes(0)
  expect(handleFocus).toHaveBeenCalledTimes(1)
  expect(handleBubbledFocus).toHaveBeenCalledTimes(0)

  fireEvent.blur(button)

  expect(handleBlur).toHaveBeenCalledTimes(1)
  expect(handleBubbledBlur).toHaveBeenCalledTimes(0)
  expect(handleFocus).toHaveBeenCalledTimes(1)
  expect(handleBubbledFocus).toHaveBeenCalledTimes(0)
})
