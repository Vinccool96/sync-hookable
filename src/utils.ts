import type { NestedHooks, HookCallback } from "./types"

export function flatHooks<T>(configHooks: NestedHooks<T>, hooks: T = {} as T, parentName?: string): T {
  for (const key in configHooks) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const subHook: T = configHooks[key]
    const name = parentName ? `${parentName}:${key}` : key
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name)
    } else if (typeof subHook === "function") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      hooks[name] = subHook
    }
  }
  return hooks
}

export function mergeHooks<T>(...hooks: NestedHooks<T>[]): T {
  const finalHooks = {} as any

  for (const hook of hooks) {
    const flatenHook = flatHooks(hook)
    for (const key in flatenHook) {
      if (finalHooks[key]) {
        finalHooks[key].push(flatenHook[key])
      } else {
        finalHooks[key] = [flatenHook[key]]
      }
    }
  }

  for (const key in finalHooks) {
    if (finalHooks[key].length > 1) {
      const array = finalHooks[key]
      finalHooks[key] = (...arguments_: any[]) => serial(array, (function_: any) => function_(...arguments_))
    } else {
      finalHooks[key] = finalHooks[key][0]
    }
  }

  return finalHooks
}

export function serial<T>(tasks: T[], function_: (task: T) => any): void {
  for (const task of tasks) {
    function_(task)
  }
}

export function serialCaller(hooks: HookCallback[], arguments_: any[] = []): void {
  for (const hook of hooks) {
    hook(...arguments_)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function callEachWith(callbacks: Function[], argument0?: any) {
  for (const callback of callbacks) {
    callback(argument0)
  }
}
