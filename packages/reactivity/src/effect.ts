export let activeEffect = undefined;

function cleanupEffect(effect) {
  const { deps } = effect
  for(let i = 0; i < deps.length; i++) {
    // 遍历删除自己
    deps[i].delete(effect)
  }
  // 清空数组
  effect.deps.length = 0
}

export class ReactiveEffect {
  // 默认会将fn挂载到类的实例上
  constructor(private fn, public scheduler?) {}
  parent = undefined;
  deps = []
  active = true
  run() {
    // 失活 调用run只是 执行 并不进行依赖收集
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect; // 处理那种嵌套问题
      activeEffect = this;
      // 清理上次的依赖收集
      cleanupEffect(this)
      // fn调用的时候会触发依赖收集
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
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
    trackEffects(dep)
  }
}

export function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    // 为啥要进行这一步
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key, newVal, oldVal) {
  // 找到属性对应的effect重新执行
  const depsMap = targetMap.get(target)
  if (!depsMap) return;
  const dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  const effects = [...dep];

  effects &&
    effects.forEach((effect) => {
      // 自己不要执行自己 否则就是死循环
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run();
        }
      }
    });
}
