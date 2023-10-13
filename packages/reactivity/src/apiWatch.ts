// watch api 用法很多 常见的就是监控一个函数的返回值  根据返回值的变化触发对应的函数
// watch watchEffect

import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";

// seen是防止循环引用出现死循环
function traverse(value, seen = new Set()) {
  if (!isObject(value)) {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}

export function doWatch(source, cb, options) {
  // 1.source是一个响应式对象
  // 2.source是一个函数
  // 两种情况
  let getter;
  if (isReactive(source)) {
    // 是不是响应式的
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    // 是不是函数
    getter = source;
  }
  let oldVal;
  const job = () => {
    if (cb) {
      const newVal = effect.run();
      cb(newVal, oldVal);
      oldVal = newVal; 
    } else {
      // 其他的情况就是watchEffect
      effect.run()
    }
  }
  const effect = new ReactiveEffect(getter, job);
  oldVal = effect.run();
}

export function watchEffect(source, options) {
  return doWatch(source, null, options)
}

export function watch(source, cb, options) {
  return doWatch(source, cb, options)
}
