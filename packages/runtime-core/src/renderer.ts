import { isNumber, isString, ShapeFlags } from "@vue/shared";
import { createVNode, isSameVnode, Text } from "./createVNode";

function getSeq(arr) {
  const result = [0];
  const len = arr.length;
  let resultLastIndex;
  let start;
  let end;
  let middle = 0;
  const p = arr.slice(0).fill(0);
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI != 0) {
      resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i);
        p[i] = resultLastIndex;
        continue;
      }
      start = 0;
      end = result.length - 1;
      // 有序数组的二分
      // 用二分查找去替换之前的
      while (start < end) {
        middle = Math.floor((start + end) / 2);
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      if (arrI < arr[result[end]]) {
        p[i] = result[end - 1];
        result[end] = i;
      }
    }
  }
  let i = result.length;
  let last = result[i - 1];
  while (i-- > 0) {
    result[i] = last;
    last = p[last];
  }
  return result;
}

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
    patchProps: hostPatchProps,
  } = options;

  function convert(child) {
    if (isString(child) || isNumber(child)) {
      return createVNode(Text, null, child)
    } else {
      return child
    }
  }
  const mountChildren = (children, container) => {
    // 递归创建儿子
    for (let i = 0; i < children.length; i++) {
      const child = convert(children[i])
      patch(null, child, container);
    }
  };
  const unmount = (vnode) => {
    hostRemove(vnode.el);
  };
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
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
    for (let key in newProps) {
      hostPatchProps(el, key, oldProps[key], newProps[key]);
    }
    // 如果老的上有新的上没有 就移除老的
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProps(el, key, oldProps[key], null);
      }
    }
  };

  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 从头开始比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
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
        while (i <= e2) {
          // 如果e2后面没有值，说明是向后插入
          // 如果e2后面有值，说明是向前插入
          const nextPos = e2 + 1;
          const anchor = c2[nextPos]?.el;
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }

    let s1 = i;
    let s2 = i;
    // 用没有匹配的新儿子的key生成一个map
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      const child = c2[i];
      keyToNewIndexMap.set(child.key, i);
    }
    console.log(keyToNewIndexMap);

    const toBePatch = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatch).fill(0);

    // 遍历老的节点去看新的上面有没有
    for (let i = s1; i <= e1; i++) {
      const child = c1[i];
      let newIndex = keyToNewIndexMap.get(child.key);
      if (newIndex == undefined) {
        // 老的里面没有
        unmount(child);
      } else {
        // 为什么i要加1 因为0有可能表示的是索引
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        // 老的有新的也有，那就需要diff算法
        patch(child, c2[newIndex], el);
      }
    }

    // 看看哪些不需要动
    console.log(newIndexToOldIndexMap);
    // [5, 3, 4, 0] -> [1, 2] 根据标记找到哪些索引不需要动，倒序循环时匹配到索引跳过即可
    const cressingIndexMap = getSeq(newIndexToOldIndexMap);
    let lastIndex = cressingIndexMap.length - 1;
    // 怎么知道哪些元素是新增的
    // 倒序插入

    for (let i = toBePatch - 1; i >= 0; i--) {
      const anchorIndex = s2 + i;
      const child = c2[anchorIndex];
      const insertAnchor = c2[anchorIndex + 1]?.el;
      if (!child.el) {
        patch(null, child, el, insertAnchor);
      } else {
        // 插入的比较暴力
        // 最长递增子序列
        if (cressingIndexMap[lastIndex] === i) {
          lastIndex--;
        } else {
          hostInsert(child.el, el, insertAnchor);
        }
      }
    }
  };

  const patchChildren = (n1, n2, el) => {
    // 比较前后两个儿子的差异
    const c1 = n1.children; // 老儿子
    const c2 = n2.children; // 新儿子

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

    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果新儿子是文本的话
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老儿子是数组
        unmountChildren(c1);
      }
      // 老儿子是文本
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      // 走到下面这个判断 新儿子之可能是数组或者是空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          //diff
          patchKeyedChildren(c1, c2, el);
        } else {
          // 老的是数组 新的是空
          unmountChildren(c1);
        }
      } else {
        // 这里就是
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };

  const patchElement = (n1, n2, container) => {
    // 能走到这里 就表示两个节点相同了
    let el = (n2.el = n1.el); // 复用老节点
    patchProps(n1.props || {}, n2.props || {}, el);
    patchChildren(n1, n2, el);
  };

  function processElement(n1, n2, container, anchor) {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function processText(n1, n2, container) {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      let el = n2.el = n1.el;
      if (n2.children != n1.children) {
        hostSetText(el, n2.children)
      }
    }
  }
  // 每次更新都会重新执行
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null;
      // 这里不是要替换n1变成n2吗？ 把n1置成null就会走下面的逻辑
    }

    const { type } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      default:
        processElement(n1, n2, container, anchor);
    }
  };

  return {
    render(vnode, container) {
      if (vnode === null) {
        // 执行卸载逻辑
        // 删掉容器中的dom元素
        unmount(container._vnode);
      } else {
        const prevVnode = container._vnode;
        const nextVnode = vnode;
        patch(prevVnode, nextVnode, container);
        container._vnode = vnode;
      }
    },
  };
}
