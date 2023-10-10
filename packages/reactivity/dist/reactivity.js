// packages/shared/src/index.ts
var isObject = (value) => {
  return value !== null && typeof value === "object";
};

// packages/reactivity/src/handler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v__isReactive" /* IS_REACTIVE */) {
      return true;
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }
};

// packages/reactivity/src/reactive.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v__isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target))
    return;
  let existProxy = reactiveMap.get(target);
  if (existProxy)
    return existProxy;
  if (target["__v__isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

// packages/reactivity/src/effect.ts
function effect() {
}
export {
  ReactiveFlags,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
