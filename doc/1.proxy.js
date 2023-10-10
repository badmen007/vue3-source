const person = {
  name: 'xz',
  get aliasName() {
    return '00' + this.name + '00'
  }
}


const proxyPerson = new Proxy(person, {
  get(target, key, receiver) {
    console.log("取值了", key);
    // return target[key]
    return Reflect.get(target, key, receiver); // 这样就能收集aliasName 和依赖的属性name 让this指向proxyPerson 
  }
})


//console.log(proxyPerson.aliasName) //aliasName依赖了name 但是name 并没有收集，导致name修改了，页面不回更新

proxyPerson.aliasName; // 就是我希望的是person的name修改了 也会走proxyPerson


