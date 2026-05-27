const { execSync } = require('child_process')

try {
  debugger
  const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim()
  const majorVersion = parseInt(pnpmVersion.split('.')[0], 10)

  if (majorVersion < 10) {
    console.error('\x1b[31m%s\x1b[0m', '错误: 需要 pnpm 版本 >= 10.0.0')
    console.error('\x1b[31m%s\x1b[0m', `当前版本: ${pnpmVersion}`)
    console.error('\x1b[31m%s\x1b[0m', '请运行以下命令升级: corepack enable && corepack prepare pnpm@latest --activate')
    process.exit(1)
  }

  console.log(`pnpm 版本检查通过: ${pnpmVersion}`)
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '错误: 未检测到 pnpm')
  console.error('\x1b[31m%s\x1b[0m', '请使用 pnpm 作为包管理器')
  console.error('\x1b[31m%s\x1b[0m', '安装命令: corepack enable && corepack prepare pnpm@latest --activate')
  process.exit(1)
}
