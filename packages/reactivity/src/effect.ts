export let activeEffect;
const targetMap = new WeakMap();

export class ReactiveEffect {
  fn;
  parent;
  deps = [];
  computed
  constructor(fn, public scheduler?) {
    this.fn = fn;
  }
  run() {
    // 这里就是考虑effect 套effect的这种情况
    try {
      this.parent = activeEffect;
      // 把当前的ReactiveEffect放到了全局上
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      // 这里的finally的执行时机就是fn执行完了
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
}

// 清理 每次都要重新收集
function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
  }
  deps.length = 0;
}

// 结构就是这样
// {name: 'aa', age: 20}: Map({ name: Set()})
export function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    // 第一次进来肯定是没有的
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    trackEffects(dep);
  }
}

export function trackEffects(dep) {
  let shouldTrack = false;

  // 源码中这里用了很多的位运算 暂时不考虑
  shouldTrack = !dep.has(activeEffect!);

  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // 没有被追踪过
    return;
  }
  let deps = [];
  // void 就是可以计算这个表达式 数字的话都是undefined
  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }
  // 后面这里还对Map这种结构做了处理 偶买噶 忽略一下
  if (deps.length == 1) {
    triggerEffects(deps[0]);
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    triggerEffects(new Set(effects));
  }
}

export function triggerEffects(dep) {
  const effects = [...dep];
  for (const effect of effects) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options?) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  
  if (!options || !options.lazy) {
    _effect.run();
  }

  const runner = _effect.run.bind(_effect);

  return runner;
}
