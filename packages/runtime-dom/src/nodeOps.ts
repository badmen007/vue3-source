export const nodeOps = {
  inert(el, parent, anchor) {
    // 不穿anchor就是appendChild
    return parent.insertBefore(el, anchor || null);
  },
  remove(el) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    return (node.nodeValue = text);
  },
  setElementText(node, text) {
    return (node.textContent = text);
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
};
