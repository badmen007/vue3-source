import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

export const mutableHandlers = {
  get(target, key, receiver) {
    // 在使用proxy的时候要搭配reflect使用，用来解决this问题
    // 取值的时候，让这个属性和effect产生关系
    // 如果被代理过了 就不代理了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 依赖收集 记录属性和当前的effect关系
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    return res
  },
  set(target, key, value, receiver) {
    // 更新
    let oldValue = target[key]
    const r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }

    return r
  },
};
