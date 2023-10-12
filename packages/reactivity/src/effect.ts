export let activeEffect = undefined;
export class ReactiveEffect {
  // 默认会将fn挂载到类的实例上
  constructor(private fn) {}
  parent = undefined;
  deps = []
  run() {
    try {
      this.parent = activeEffect; // 处理那种嵌套问题
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

// {name: "xz"}: name -> [effect, effect]
// weakMap -> map -> set
const targetMap = new WeakMap();
export function track(target, key) {
  // 属性记录 当前的activeEffect
  // 当activeEffect的时候证明是在effect中的取值 而不是在effect之外取值
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);

    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }

    let shouldTrack = !dep.has(activeEffect)

    if (shouldTrack) {
      dep.add(activeEffect)
      // 为啥要进行这一步
      activeEffect.deps.push(dep)
    }
  }
}
export function trigger(target, key, newVal, oldVal) {
  // 找到属性对应的effect重新执行
  const depsMap = targetMap.get(target)
  if (!depsMap) return;
  const dep = depsMap.get(key)
  dep && dep.forEach(effect => {
    // 自己不要执行自己 否则就是死循环
    if (effect !== activeEffect) {
      effect.run()
    }
  })
}
