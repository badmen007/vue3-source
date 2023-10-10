import { ReactiveFlags } from "./reactive";

export const mutableHandlers = {
  get(target, key, receiver) {
    // 在使用proxy的时候要搭配reflect使用，用来解决this问题
    // 取值的时候，让这个属性和effect产生关系
    // 如果被代理过了 就不代理了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 更新
    return Reflect.set(target, key, value, receiver);
  },
};
