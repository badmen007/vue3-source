


// 最长递增子序列

function getSeq(arr) {
  const result = [0]
  const len = arr.length;
  let resultLastIndex;
  let start;
  let end;
  let middle = 0;
  const p = arr.slice(0).fill(0)
  for( let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI != 0) {
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex
        continue
      }
      start = 0;
      end = result.length - 1;
      // 有序数组的二分
      // 用二分查找去替换之前的
      while(start < end) {
        middle = Math.floor((start + end) / 2)
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle 
        }
      }
      if (arrI < arr[result[end]]) {
        p[i] = result[end - 1]
        result[end] = i
      }
    }
  }
  let i = result.length;
  let last = result[i - 1]
  while( i-- > 0) {
    result[i] = last;
    last = p[last]
  }
  return result;
}

console.log(getSeq([2, 5, 8, 9, 7, 4, 6, 11]))

// 2  [0]
// 2 5 [0, 1]
// 2 5 8 [0, 1, 2]
// 2 5 8 9 [0, 1, 2, 3]
// 2 5 7 9 [0, 1, 4, 3]
// 2 4 7 9 [0, 5, 4, 3]
// 2 4 6 9 [0, 5, 6, 3]
// 2 4 6 9 11[0, 5, 6, 3, 7]

