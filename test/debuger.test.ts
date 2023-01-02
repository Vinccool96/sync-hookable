import { afterAll, beforeAll, describe, it, beforeEach, expect, vi } from "vitest"
import { createDebugger, Hookable } from "../src"

const consoleMethods = ["time", "timeEnd", "timeLog", "groupCollapsed", "groupEnd"] as const

describe("debugger", () => {
  let hooks: Hookable

  beforeAll(() => {
    consoleMethods.forEach((l) => {
      console[l] = vi.fn()
    })
  })
  beforeEach(() => {
    hooks = new Hookable()
    vi.clearAllMocks()
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("should respect `tag` option", () => {
    createDebugger(hooks, { tag: "tag" })
    hooks.callHook("hook")
    expect(console.time).toBeCalledWith(expect.stringContaining("[tag] hook"))
    expect(console.timeEnd).toBeCalledWith(expect.stringContaining("[tag] hook"))
  })
  it("should respect `inspect` option", () => {
    createDebugger(hooks, { inspect: true })
    hooks.callHook("hook")
    expect(console.time).toBeCalledWith(expect.stringContaining("hook"))
    expect(console.timeLog).toBeCalledWith("hook", [])
  })
  it("should respect `group` option", () => {
    createDebugger(hooks, { group: true })
    hooks.callHook("hook")
    expect(console.groupCollapsed).toBeCalled()
    expect(console.groupEnd).toBeCalled()
  })
  it("should respect `filter` option as string", () => {
    createDebugger(hooks, { filter: "other:" })
    hooks.callHook("hook")
    expect(console.time).not.toBeCalled()
    hooks.callHook("other:hook")
    expect(console.time).toBeCalled()
  })
  it("should respect `filter` option as function", () => {
    createDebugger(hooks, { filter: (id) => id === "other:hook" })
    hooks.callHook("hook")
    expect(console.time).not.toBeCalled()
    hooks.callHook("other:hook")
    expect(console.time).toBeCalled()
  })
  it("should allowing closing debugger", () => {
    const debug = createDebugger(hooks)
    hooks.callHook("hook")
    expect(console.time).toBeCalled()
    debug.close()
    vi.clearAllMocks()
    hooks.callHook("hook")
    expect(console.time).not.toBeCalled()
    debug.close()
  })
})
