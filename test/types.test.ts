import { describe, test } from "vitest"
import { expectTypeOf } from "expect-type"
import { createHooks } from "../src"
import type { HookCallback } from "../src"

describe("hook types", () => {
  test("correctly handles non-nested hooks", () => {
    const hooks = createHooks<{ foo: () => true; bar: (_arg: string) => 42 }>()

    expectTypeOf(hooks.hook).parameter(0).not.toBeAny()
    expectTypeOf(hooks.hook).parameter(0).toEqualTypeOf<"foo" | "bar">()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    hooks.hook("foo", (_param) => true)
  })

  test("deprecates hooks", () => {
    const hooks = createHooks<{ foo: () => true; bar: (_arg: string) => 42 }>()
    hooks.deprecateHooks({
      foo: { to: "bar" },
    })
  })

  test("handles nested hooks", () => {
    const hooks = createHooks<{
      "namespace:foo": (arg: number) => void
      bar: (_arg: string) => void
      "namespace:baz": (arg: "42") => void
    }>()

    // should be valid
    hooks.addHooks({
      namespace: { foo: (_arg) => {}, baz: (_arg) => {} },
      bar: (_arg) => {},
      "namespace:foo": () => {},
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    hooks.addHooks({ a: (_arg) => {} })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    hooks.addHooks({ namespace: { nonexistent: (_arg) => {} } })
  })

  test("handles nested hooks with signature", () => {
    const hooks = createHooks<{
      [key: string]: HookCallback
      "namespace:foo": (arg: number) => void
      bar: (_arg: string) => void
    }>()

    // should both be valid
    hooks.addHooks({ namespace: { foo: (_arg: number) => {} }, bar: (_arg) => {}, "namespace:foo": () => {} })
    hooks.addHooks({ namespace: { nothing: (_arg: any) => {} } })
    hooks.addHooks({ nothing: (_arg) => {} })
  })

  test("beforeEach and afterEach typings", () => {
    const hooks = createHooks<{ foo: () => true; bar: (_arg: number) => 42 }>()

    expectTypeOf(hooks.beforeEach).parameter(0).not.toBeAny()
    expectTypeOf(hooks.afterEach)
      .parameter(0)
      .parameter(0)
      .toEqualTypeOf<
        | { name: "foo"; args: []; context: Record<string, any> }
        | { name: "bar"; args: [number]; context: Record<string, any> }
      >()

    hooks.beforeEach(({ name, args }) => {
      expectTypeOf(name).toEqualTypeOf<"foo" | "bar">()
      if (name === "foo") {
        expectTypeOf(args).toEqualTypeOf<[]>()
      }
      if (name === "bar") {
        expectTypeOf(args[0]).toEqualTypeOf<number>()
      }
    })
  })
})
