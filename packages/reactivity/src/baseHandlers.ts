import { ReactiveFlags } from "./reactive";

export const MutableReactiveHandler = {
  get(target, key, receiver) {
    if (key == ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    const res = Reflect.get(target, key, receiver);
    return res;
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    return result;
  },
};
