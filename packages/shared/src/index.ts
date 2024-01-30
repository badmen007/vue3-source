export const isObject = (val) => {
  return typeof val == "object" && val !== null;
};

// Object.is 判断两个值一不一样 不会对值进行转化
export const hasChanged = (value, oldValue) => !Object.is(value, oldValue);

export const isArray = Array.isArray