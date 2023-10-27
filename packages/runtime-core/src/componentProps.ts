import { reactive } from "packages/reactivity/src/reactive";

export function initProps(instance, rawProps) {
  // rawProps是组件虚拟节点上的属性
  const props = {};
  const attrs = {};

  const options = instance.propsOptions || {};
  if (rawProps) {
    for (let key in rawProps) {
      if (key in options) {
        props[key] = rawProps[key];
      } else {
        attrs[key] = rawProps[key];
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
}
