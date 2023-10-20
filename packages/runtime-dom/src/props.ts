function patchStyle(el, prevValue, nextValue) {
  // 这里可以拿到样式表
  const style = el["style"];
  if (nextValue) {
    for (let key in nextValue) {
      style[key] = nextValue[key];
    }
  }
  if (prevValue) {
    // 老的有 新的没有 删除
    for (let key in prevValue) {
      if (!nextValue[key]) {
        style[key] = null;
      }
    }
  }
}

function patchClass(el, nextValue) {
  if (!nextValue) {
    el.removeAttribute("class");
  } else {
    el.className = nextValue;
  }
}

function createInvoker(val) {
  const invoker = (e) => invoker.val(e);
  invoker.val = val;
  return invoker;
}

function patchEvent(el, eventName, nextValue) {
  // 怎么去比较两个函数？

  const invokers = el._vei || (el._vei = {});
  const exist = invokers[eventName];
  if (exist && nextValue) {
    // 换绑事件
    exist.val = nextValue;
  } else {
    const name = eventName.slice(2).toLowerCase();
    if (nextValue) {
      const invoker = (invokers[eventName] = createInvoker(nextValue));
      el.addEventListener(name, invoker);
    } else if (exist) {
      el.removeListener(name, exist);
      invokers[eventName] = null;
    }
  }
}

function patchAttr(el, key, nextValue) {
  if (!nextValue) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}

export function patchProps(el, key, prevValue, nextValue) {
  if (key === "style") {
    // el.style[key] = value
    return patchStyle(el, prevValue, nextValue);
  } else if (key === "class") {
    return patchClass(el, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // onClick -> @click这种都会被转换成onClick
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}
