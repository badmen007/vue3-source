import { createRenderer } from "@vue/runtime-core";
export * from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProps } from "./props";

const renderOptions = { ...nodeOps, patchProps };

export function render(vdom, container) {
  const { render } = createRenderer(renderOptions);
  render(vdom, container);
}
