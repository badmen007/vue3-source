
const esbuild = require('esbuild')
const { resolve } = require('path')

const target = 'runtime-dom'

esbuild.context({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
  bundle: true, // 将依赖的恶模块全部打包
  sourcemap: true,
  format: "esm",
  platform: "browser",
}).then(ctx => ctx.watch());
