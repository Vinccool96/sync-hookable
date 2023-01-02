// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, test, beforeEach, expect, vi } from "vitest"
import { createHooks, flatHooks, mergeHooks } from "../src"

describe("core: hookable", () => {
  beforeEach(() => {
    ;["log", "warn", "error", "debug"].forEach((l) => {
      console[l] = vi.fn()
    })
  })

  test("should construct hook object", () => {
    const hook = createHooks()

    expect(hook._hooks).toEqual({})
    expect(hook._deprecatedHooks).toEqual({})
    expect(hook.hook).toBeInstanceOf(Function)
    expect(hook.callHook).toBeInstanceOf(Function)
  })

  test("should register hook successfully", () => {
    const hook = createHooks()
    hook.hook("test:hook", () => {})
    hook.hook("test:hook", () => {})

    expect(hook._hooks["test:hook"]).toHaveLength(2)
    expect(hook._hooks["test:hook"]).toBeInstanceOf(Array)
    expect(hook._hooks["test:hook"]).toEqual([expect.any(Function), expect.any(Function)])
  })

  test("should ignore empty hook name", () => {
    const hook = createHooks()
    hook.hook(0, () => {})
    hook.hook("", () => {})
    hook.hook(undefined, () => {})

    expect(hook._hooks[0]).toBeUndefined()
    expect(hook._hooks[""]).toBeUndefined()
    expect(hook._hooks[undefined]).toBeUndefined()
  })

  test("should ignore non-function hook", () => {
    const hook = createHooks()
    hook.hook("test:hook", "")
    hook.hook("test:hook", undefined)

    expect(hook._hooks["test:hook"]).toBeUndefined()
  })

  test("should convert and display deprecated hooks", () => {
    const hook = createHooks()
    hook.deprecateHook("a", "b")
    hook.deprecateHook("b", { to: "c" })
    hook.deprecateHook("x", { to: "y", message: "Custom" })

    hook.hook("a", () => {})
    hook.hook("a", () => {})
    hook.hook("b", () => {})
    hook.hook("c", () => {})
    hook.hook("x", () => {})

    expect(console.warn).toBeCalledWith("a hook has been deprecated, please use c")
    expect(console.warn).toBeCalledWith("b hook has been deprecated, please use c")
    expect(console.warn).toBeCalledWith("Custom")
    expect(console.warn).toBeCalledTimes(3)
    expect(hook._hooks.a).toBeUndefined()
    expect(hook._hooks.b).toBeUndefined()
    expect(hook._hooks.c).toEqual([
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    ])
  })

  test("allow hiding deprecation warns", () => {
    const hook = createHooks()
    hook.deprecateHook("a", "b")
    hook.hook("a", () => {}, { allowDeprecated: true })
    expect(console.warn).toBeCalledTimes(0)
  })

  test("should handle deprecation after registering", () => {
    const hook = createHooks()
    hook.hook("a", () => {})
    hook.hook("b", () => {})
    hook.deprecateHook("a", "b")
    expect(console.warn).toBeCalledWith("a hook has been deprecated, please use b")
    expect(hook._hooks.a).toBeUndefined()
    expect(hook._hooks.b).toEqual([expect.any(Function), expect.any(Function)])
  })

  test("deprecateHooks", () => {
    const hook = createHooks()
    hook.deprecateHooks({
      "test:hook": "test:before",
    })

    hook.hook("test:hook", () => {})

    expect(console.warn).toBeCalledWith("test:hook hook has been deprecated, please use test:before")
    expect(hook._hooks["test:hook"]).toBeUndefined()
    expect(hook._hooks["test:before"]).toEqual([expect.any(Function)])
  })

  test("should call registered hook", () => {
    const hook = createHooks()
    hook.hook("test:hook", () => console.log("test:hook called"))

    hook.callHook("test:hook")

    expect(console.log).toBeCalledWith("test:hook called")
  })

  test("should ignore unregistered hook", () => {
    const hook = createHooks()

    hook.callHook("test:hook")

    expect(console.debug).not.toBeCalled()
  })

  test("should throw hook error", () => {
    const hook = createHooks()
    let error: Error
    let caught: Error
    try {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error("Hook Error")
    } catch (e) {
      error = e
    }
    hook.hook("test:hook", () => {
      throw error
    })
    try {
      hook.callHook("test:hook")
    } catch (e) {
      caught = e
    }
    expect(caught).toBe(error)
  })

  test("should return a self-removal function", () => {
    const hook = createHooks()
    const remove = hook.hook("test:hook", () => {
      console.log("test:hook called")
    })

    hook.callHook("test:hook")
    remove()
    hook.callHook("test:hook")

    expect(console.log).toBeCalledTimes(1)
  })

  test("should clear only its own hooks", () => {
    const hook = createHooks()
    const callback = () => {}

    hook.hook("test:hook", callback)
    const remove = hook.hook("test:hook", callback)
    hook.hook("test:hook", callback)

    expect(hook._hooks["test:hook"]).toEqual([callback, callback, callback])

    remove()
    remove()
    remove()

    expect(hook._hooks["test:hook"]).toEqual([callback, callback])
  })

  test("should clear removed hooks", () => {
    const hook = createHooks()
    const callback = () => {}
    hook.hook("test:hook", callback)
    hook.hook("test:hook", callback)

    expect(hook._hooks["test:hook"]).toHaveLength(2)

    hook.removeHook("test:hook", callback)

    expect(hook._hooks["test:hook"]).toHaveLength(1)

    hook.removeHook("test:hook", callback)

    expect(hook._hooks["test:hook"]).toBeUndefined()
  })

  test("should call self-removing hooks once", () => {
    const hook = createHooks()
    const remove = hook.hook("test:hook", () => {
      console.log("test:hook called")
      remove()
    })

    expect(hook._hooks["test:hook"]).toHaveLength(1)

    hook.callHook("test:hook")
    hook.callHook("test:hook")

    expect(console.log).toBeCalledWith("test:hook called")
    expect(console.log).toBeCalledTimes(1)
    expect(hook._hooks["test:hook"]).toBeUndefined()
  })

  test("should return flat hooks", () => {
    const hooks = flatHooks({
      test: {
        hook: () => {},
        before: () => {},
      },
    })

    expect(hooks).toEqual({
      "test:hook": expect.any(Function),
      "test:before": expect.any(Function),
    })
  })

  test("should add object hooks", () => {
    const hook = createHooks()
    hook.addHooks({
      test: {
        hook: () => {},
        before: () => {},
        after: null,
      },
    })

    expect(hook._hooks).toEqual({
      "test:hook": expect.any(Array),
      "test:before": expect.any(Array),
      "test:after": undefined,
    })
    expect(hook._hooks["test:hook"]).toHaveLength(1)
    expect(hook._hooks["test:before"]).toHaveLength(1)
  })

  test("should clear multiple hooks", () => {
    const hook = createHooks()
    const callback = () => {}

    const hooks = {
      test: {
        hook: () => {},
        before: () => {},
      },
    }

    hook.addHooks(hooks)

    hook.hook("test:hook", callback)

    expect(hook._hooks["test:hook"]).toHaveLength(2)
    expect(hook._hooks["test:before"]).toHaveLength(1)

    hook.removeHooks(hooks)

    expect(hook._hooks["test:hook"]).toEqual([callback])
    expect(hook._hooks["test:before"]).toBeUndefined()
  })

  test("should clear only the hooks added by addHooks", () => {
    const hook = createHooks()
    const callback1 = () => {}
    const callback2 = () => {}
    hook.hook("test:hook", callback1)

    const remove = hook.addHooks({
      test: {
        hook: () => {},
        before: () => {},
      },
    })

    hook.hook("test:hook", callback2)

    expect(hook._hooks["test:hook"]).toHaveLength(3)
    expect(hook._hooks["test:before"]).toHaveLength(1)

    remove()

    expect(hook._hooks["test:hook"]).toEqual([callback1, callback2])
    expect(hook._hooks["test:before"]).toBeUndefined()
  })

  test("hook once", () => {
    const hook = createHooks()

    let x = 0

    hook.hookOnce("test", () => {
      x++
    })

    hook.callHook("test")
    hook.callHook("test")

    expect(x).toBe(1)
  })

  test("hook sync", () => {
    const hook = createHooks()

    let x = 0

    hook.hook("test", () => {
      x++
    })

    const syncCaller = (hooks) => hooks.map((hook) => hook())
    hook.callHookWith(syncCaller, "test")
    hook.callHookWith(syncCaller, "test")

    expect(x).toBe(2)
  })

  test("beforeEach and afterEach spies", () => {
    const hook = createHooks<{ test(): void }>()

    let x = 0

    hook.beforeEach((event) => {
      expect(event.context.count).toBeUndefined()
      event.name === "test" && x++
      event.context.count = x
    })
    hook.afterEach((event) => {
      expect(event.context.count).toEqual(x)
      event.name === "test" && x++
    })

    hook.callHook("test")

    expect(x).toBe(2)
  })

  test("mergeHooks", () => {
    const fn = () => {}
    const hooks1 = {
      foo: fn,
      bar: fn,
      "a:b": fn,
      "a:c": fn,
    }
    const hooks2 = {
      foo: fn,
      baz: fn,
      a: {
        b: fn,
        d: fn,
      },
    }

    const merged = mergeHooks(hooks1, hooks2)

    expect(Object.keys(merged)).toMatchObject(["foo", "bar", "a:b", "a:c", "baz", "a:d"])
  })
})
