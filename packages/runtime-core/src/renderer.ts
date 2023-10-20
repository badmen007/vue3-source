import { ShapeFlags } from "@vue/shared";

export function createRenderer(options) {
  const {
    inert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProps: hostPatchProps
  } = options;
  const mountChildren = (children, container) => {
    // 递归创建儿子
    for(let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  }
  const mountElement = (vnode, container) => {
    const { type, props, shapeFlag, children } = vnode;
    let el = vnode.el = hostCreateElement(type)
    if (props) {
      for(let key in props) {
        hostPatchProps(el, key, null, props[key])
      }
    }
    if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      mountChildren(children, el)
    } else {
      hostSetElementText(el, children)
    }
    hostInsert(el, container)
  };

  const patchElement = (n1, n2, container) => {};

  // 每次更新都会重新执行
  const patch = (n1, n2, container) => {
    if (n1 == null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2, container);
    }
  };

  return {
    render(vnode, container) {
      if (vnode === null) {
        // 执行卸载逻辑
      } else {
        const prevVnode = container._vnode;
        const nextVnode = vnode;
        patch(prevVnode, nextVnode, container);
        container._vnode = vnode;
      }
    },
  };
}
