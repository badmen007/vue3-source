import { isObject } from "@vue/shared";
import { mutableHandlers } from "./handler";

export enum ReactiveFlags {
  IS_REACTIVE = '__v__isReactive'
}

const reactiveMap = new WeakMap();

export function reactive(target) {
  // reactive只能处理对象
  if (!isObject(target)) return;

  // 看是不是代理过的 如果是代理过的就不用代理了
  let existProxy = reactiveMap.get(target);
  if (existProxy) return existProxy;

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  const proxy = new Proxy(target, mutableHandlers);

  reactiveMap.set(target, proxy);

  // 已经被proxy代理过了 
  return proxy;
}
