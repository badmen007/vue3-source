import esbuild from 'esbuild'
import minimist from 'minimist'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// import.meta.url; 当前文件在电脑中的绝对路径
// 解析成node路径 去掉了file://
const __dirname = dirname(fileURLToPath(import.meta.url));
const args = minimist(process.argv.slice(2))
const target = args._[0] || 'reactivity'
const format = args.f || 'iife'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.js`)

esbuild.context({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)], // 入口
  outfile, // 输出路径
  bundle: true,
  sourcemap: true, 
  format, // 格式化
}).then(ctx => ctx.watch())