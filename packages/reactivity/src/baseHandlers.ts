import { hasChanged } from "@vue/shared";
import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

export const MutableReactiveHandler = {
  get(target, key, receiver) {
    if (key == ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    const res = Reflect.get(target, key, receiver);

    track(target, key)

    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver);
    if (hasChanged(value, oldValue)) {
      trigger(target, key)
    }
    return result;
  },
};
