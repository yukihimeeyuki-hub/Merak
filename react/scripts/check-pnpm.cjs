NEW_FILE_CODE
const { execSync } = require('child_process')

const npmExecPath = process.env.npm_execpath || ''

if (npmExecPath.indexOf('pnpm') === -1) {
  console.error('\x1b[31m错误: 请使用 pnpm 安装依赖\x1b[0m')
  console.error('\x1b[33m示例: pnpm install\x1b[0m')
  process.exit(1)
}

try {
  const version = execSync('pnpm -v').toString().trim()
  const majorVersion = parseInt(version.split('.')[0], 10)

  if (majorVersion < 10) {
    console.error(`\x1b[31m错误: pnpm 版本必须 >= 10，当前版本: ${version}\x1b[0m`)
    console.error('\x1b[33m请升级 pnpm: pnpm add -g pnpm\x1b[0m')
    process.exit(1)
  }
} catch (error) {
  console.error('\x1b[31m错误: 无法获取 pnpm 版本，请确保已安装 pnpm\x1b[0m')
  process.exit(1)
}
