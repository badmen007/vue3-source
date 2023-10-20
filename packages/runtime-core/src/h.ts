import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./createVNode";

export function h(type, propsOrChildren?, children?) {
  const len = arguments.length;

  if (len === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        // const vDom = h("div", h('span'));
        return createVNode(type, null, [propsOrChildren]);
      }
      // const vDom = h("div", { style: { color: "red" } });
      return createVNode(type, propsOrChildren);
    } else {
      // const vDom = h('div', 'hello')
      // const vDom = h("div", [h("span"), h("span")]);
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (len > 3) {
      children = Array.from(arguments).slice(2);
    } else if (len === 3 && isVNode(children)) {
      // const vDom = h("div", {}, h("span"), h("span"));
      children = [children];
    }
    // const vDom = h('div', {}, 'hello')
    // const vDom = h("div", {}, [h("span"), h("span")]);
    return createVNode(type, propsOrChildren, children);
  }
}

// const vDom = h("div");

