import { isFunction } from "@vue/shared";
import { ReactiveEffect, activeEffect, trackEffects, triggerEffects } from "./effect";

class ComputedRefImpl {
  public effect;
  public _value;
  public _dirty = true;
  public dep = new Set()
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true; // 依赖的值发生变化了之后 会将dirty变为true
        triggerEffects(this.dep)
      }
    });
  }
  get value() {
    // 依赖收集
    trackEffects(this.dep)
    // 实现缓存效果
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }

    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
}

export function computed(getterOrOptions) {
  let getter;
  let setter;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.log("warning");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
