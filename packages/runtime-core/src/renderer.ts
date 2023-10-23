import { ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./createVNode";

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
  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }
  const unmountChildren = (children) => {
    for(let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  };

  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag, children } = vnode;
    // 挂载的时候将创建的真实dom放到了el属性上
    let el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (let key in props) {
        hostPatchProps(el, key, null, props[key]);
      }
    }
    if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      mountChildren(children, el);
    } else {
      hostSetElementText(el, children);
    }
    hostInsert(el, container, anchor);
  };

  const patchProps = (oldProps, newProps, el) => {
    // 添加新的属性
    for(let key in newProps) {
      hostPatchProps(el, key, oldProps[key], newProps[key])
    }
    // 如果老的上有新的上没有 就移除老的
    for(let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProps(el, key, oldProps[key], null)
      }
    }
  }

  const patchKeyedChildren = (c1, c2, el) => {

    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // 从头开始比
    while(i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }
    // 从尾开始比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 说明是新增的
    if (i > e1) {
      if (i <= e2) {
        // i-e2之间是新增的元素
        while(i <= e2) {
          // 如果e2后面没有值，说明是向后插入
          // 如果e2后面有值，说明是向前插入
          const nextPos = e2 + 1;
          const anchor = c2[nextPos]?.el
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while(i <= e1) {
        unmount(c1[i])
        i++
      }
    }
  }

  const patchChildren = (n1, n2, el) => {
    // 比较前后两个儿子的差异
    const c1 = n1.children // 老儿子
    const c2 = n2.children // 新儿子

    // 几种情况 文本 数组 空  9中情况
    // 文本 -》 数组 删除文本替换成数组
    // 文本 -》 文本 替换
    // 文本 -》 空 删除

    // 数组 -》 文本 替换
    // 数组 -》 数组 diff
    // 数组 -》 空  删除

    // 空 -》 数组  挂载数组
    // 空 -》 文本  挂载文本
    // 空 -》 空 不用处理

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果新儿子是文本的话
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老儿子是数组
        unmountChildren(c1)
      }
      // 老儿子是文本
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else { // 走到下面这个判断 新儿子之可能是数组或者是空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          //diff
          patchKeyedChildren(c1, c2, el)
        } else {
          // 老的是数组 新的是空
          unmountChildren(c1)
        }
      } else {
        // 这里就是
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "")
        }

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }

  }

  const patchElement = (n1, n2, container) => {
    // 能走到这里 就表示两个节点相同了
    let el = (n2.el = n1.el); // 复用老节点
    patchProps(n1.props || {}, n2.props || {}, el);
    patchChildren(n1, n2, el);
  };

  // 每次更新都会重新执行
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null;
      // 这里不是要替换n1变成n2吗？ 把n1置成null就会走下面的逻辑
    }

    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2, container);
    }
  };

  return {
    render(vnode, container) {
      if (vnode === null) {
        // 执行卸载逻辑
        // 删掉容器中的dom元素
        unmount(container._vnode)
      } else {
        const prevVnode = container._vnode;
        const nextVnode = vnode;
        patch(prevVnode, nextVnode, container);
        container._vnode = vnode;
      }
    },
  };
}
