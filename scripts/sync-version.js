#!/usr/bin/env node

/**
 * 版本号同步脚本
 * 功能：从 package.json 读取版本号，并自动更新到 src/index.ts 中
 * 使用场景：在执行 npm version 命令后自动运行，保持版本号一致
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

try {
  // 读取 package.json
  const packageJsonPath = join(rootDir, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const version = packageJson.version

  console.log(`📦 从 package.json 读取版本号: ${version}`)

  // 读取 src/index.ts
  const indexTsPath = join(rootDir, 'src', 'index.ts')
  const indexTsContent = readFileSync(indexTsPath, 'utf-8')

  // 替换版本号
  const versionRegex = /export const version = ['"][\d.]+['"]/
  if (versionRegex.test(indexTsContent)) {
    const newContent = indexTsContent.replace(
      versionRegex,
      `export const version = '${version}'`
    )
    writeFileSync(indexTsPath, newContent, 'utf-8')
    console.log(`✅ 已更新 src/index.ts 中的版本号为: ${version}`)
  } else {
    console.warn('⚠️  在 src/index.ts 中未找到版本号声明')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ 版本号同步失败:', error.message)
  process.exit(1)
}
