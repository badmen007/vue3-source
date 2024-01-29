import { isObject } from "@vue/shared";
import { MutableReactiveHandler } from "./baseHandlers";

const proxyMap = new WeakMap();
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

function createReactiveObject(target) {
  // 如果不是对象的话 就返回
  if (!isObject) {
    return target;
  }

  // 只有代理过才可能走get方法，普通对象相当于取值 只能是undefined
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return target;
  }
  const proxy = new Proxy(target, MutableReactiveHandler);
  proxyMap.set(target, proxy);
  return proxy;
}
export function reactive(target) {
  return createReactiveObject(target);
}
