import { isFunction } from "@vue/shared";
import {
  ReactiveEffect,
  activeEffect,
  trackEffects,
  triggerEffects,
} from "./effect";

class ComputedRefImpl {
  effect;
  private _value;
  dep = new Set();
  _dirty = true;
  __v_isRef = true;
  constructor(getter, _setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
      triggerEffects(this.dep);
    });
    this.effect.computed = this;
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.dep);
    }
    if (this._dirty) {
      this._dirty = false;
      // 想要拿到值要调effect得run 方法
      this._value = this.effect.run();
    }

    return this._value;
  }
}

export function computed(getterOrOptions) {
  let getter, setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("Write operation failed: computed value is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}
