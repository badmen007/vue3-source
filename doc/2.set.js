
const set1 = new Set()
const set2 = new Set()

const arr = [set1, set2]

set1.add(3)
set1.add(4)

set2.add(5)
set2.add(6)

for(let i = 0; i < arr.length; i++) {
  arr[i].delete(3)
}
// 有了才能删除 没有不能删除
console.dir(arr)


