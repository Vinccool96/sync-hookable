# Hookable

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![packagephobia][packagephobia-src]][packagephobia-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]

> Synchronous hook system

## Install

Using yarn:

```bash
yarn add sync-hookable
```

Using npm:

```bash
npm install sync-hookable
```

## Usage

**Method A: Create a sync-hookable instance:**

```js
import { createHooks } from 'sync-hookable'

// Create a sync-hookable instance
const hooks = createHooks()

// Hook on 'hello'
hooks.hook('hello', () => { console.log('Hello World' )})

// Call 'hello' hook
hooks.callHook('hello')
```

**Method B: Extend your base class from Hookable:**

```js
import { Hookable } from 'sync-hookable'

export default class FooLib extends Hookable {
  constructor() {
    // Call to parent to initialize
    super()
    // Initialize Hookable with custom logger
    // super(consola)
  }

  someFunction() {
    // Call for `hook1` hooks (if any) sequential
    this.callHook('hook1')
  }
}
```

**Inside plugins, register for any hook:**

```js
const lib = new FooLib()

// Register a handler for `hook2`
lib.hook('hook2', () => { /* ... */ })

// Register multiply handlers at once
lib.addHooks({
  hook1: () => { /* ... */ },
  hook2: [ /* can be also an array */ ]
})
```

**Unregistering hooks:**

```js
const lib = new FooLib()

const hook0 = () => { /* ... */ }
const hook1 = () => { /* ... */ }
const hook2 = () => { /* ... */ }

// The hook() method returns an "unregister" function
const unregisterHook0 = lib.hook('hook0', hook0)
const unregisterHooks1and2 = lib.addHooks({ hook1, hook2 })

/* ... */

unregisterHook0()
unregisterHooks1and2()

// or

lib.removeHooks({ hook0, hook1 })
lib.removeHook('hook2', hook2)
```

**Triggering a hook handler once:**

```js
const lib = new FooLib()

const unregister = lib.hook('hook0', () => {
  // Unregister as soon as the hook is executed
  unregister()

  /* ... */
})
```


## Hookable class

### `constructor()`

### `hook (name, fn)`

Register a handler for a specific hook. `fn` must be a function.

Returns an `unregister` function that, when called, will remove the registered handler.

### `hookOnce (name, fn)`

Similar to `hook` but unregisters hook once called.

Returns an `unregister` function that, when called, will remove the registered handler before first call.

### `addHooks(configHooks)`

Flatten and register hooks object.

Example:

```js
hookable.addHooks({
  test: {
    before: () => {},
    after: () => {}
  }
})

```

This registers `test:before` and `test:after` hooks at bulk.

Returns an `unregister` function that, when called, will remove all the registered handlers.

### `callHook (name, ...args)`

Used by class itself to **sequentially** call handlers of a specific hook.

### `callHookWith (name, callerFn)`

If you need custom control over how hooks are called, you can provide a custom function that will receive an array of handlers of a specific hook.

`callerFn` if a callback function that accepts two arguments, `hooks` and `args`:
- `hooks`: Array of user hooks to be called
- `args`: Array of arguments that should be passed each time calling a hook

### `deprecateHook (old, name)`

Deprecate hook called `old` in favor of `name` hook.

### `deprecateHooks (deprecatedHooks)`

Deprecate all hooks from an object (keys are old and values or newer ones).

### `removeHook (name, fn)`

Remove a particular hook handler, if the `fn` handler is present.

### `removeHooks (configHooks)`

Remove multiple hook handlers.

Example:

```js
const handler = () => { /* ... */ }

hookable.hook('test:before', handler)
hookable.addHooks({ test: { after: handler } })

// ...

hookable.removeHooks({
  test: {
    before: handler,
    after: handler
  }
})
```

### `beforeEach (syncCallback)`

Registers a (sync) callback to be called before each hook is being called.

```js
hookable.beforeEach((event) => { console.log(`${event.name} hook is being called with ${event.args}`)})
hookable.hook('test', () => { console.log('running test hook') })

// test hook is being called with []
// running test hook
hookable.callHook('test')
```

### `afterEach (syncCallback)`

Registers a (sync) callback to be called after each hook is being called.

```js
hookable.afterEach((event) => { console.log(`${event.name} hook called with ${event.args}`)})
hookable.hook('test', () => { console.log('running test hook') })

// running test hook
// test hook called with []
hookable.callHook('test')
```

### `createDebugger`

Automatically logs each hook that is called and how long it takes to run.

```js
const debug = hookable.createDebugger(hooks, { tag: 'something' })

hooks.callHook('some-hook', 'some-arg')
// [something] some-hook: 0.21ms

debug.close()
```

## Credits

Extracted from [Nuxt](https://github.com/nuxt/nuxt.js) hooks system originally introduced by [Sébastien Chopin](https://github.com/Atinux)

## License

MIT - Made with 💖

<!-- Badges -->
[npm-version-src]: https://flat.badgen.net/npm/dt/sync-hookable
[npm-version-href]: https://npmjs.com/package/sync-hookable

[npm-downloads-src]: https://flat.badgen.net/npm/v/sync-hookable
[npm-downloads-href]: https://npmjs.com/package/sync-hookable

[github-actions-ci-src]: https://flat.badgen.net/github/checks/Vinccool96/sync-hookable/master
[github-actions-ci-href]: https://github.com/Vinccool96/sync-hookable/actions

[packagephobia-src]: https://flat.badgen.net/packagephobia/install/sync-hookable
[packagephobia-href]: https://packagephobia.now.sh/result?p=sync-hookable
