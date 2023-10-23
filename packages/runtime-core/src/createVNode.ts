import { ShapeFlags, isString } from "@vue/shared";

export function isVNode(val) {
  return !!(val && val.__v_isVNode);
}

// 判断两个虚拟节点是不是同一个节点
export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export function createVNode(type, props?, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

  const vnode = {
    shapeFlag,
    __v_isVNode: true,
    type,
    props,
    key: props && props.key,
    el: null, // 虚拟节点对应的真实节点，后续比较新老虚拟节点的差异，然后更新真实节点
    children,
  };

  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }
  return vnode;
}
