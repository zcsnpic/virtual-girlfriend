# 🚀 Vercel 部署指南

## 🔧 前置准备

### 1. 安装必要软件

| 软件 | 用途 | 下载地址 |
|------|------|----------|
| **Git** | 版本控制工具 | https://git-scm.com/download/win |
| **Node.js** | JavaScript 运行环境 | https://nodejs.org/en/download |

### 2. 注册账号

| 账号 | 用途 | 注册地址 |
|------|------|----------|
| **GitHub** | 代码托管 | https://github.com |
| **Vercel** | 网站部署 | https://vercel.com |

> 💡 Vercel 可以直接用 GitHub 账号登录

## 📁 项目准备

### 1. 检查项目结构

确保你的项目结构如下：

```
virtual-girlfriend/
├── css/
│   └── style.css
├── js/
│   ├── api.js
│   ├── app.js
│   ├── memory.js
│   ├── tts.js
│   └── ui.js
└── index.html
```

### 2. 创建 .gitignore 文件

在项目根目录创建 `.gitignore` 文件：

```gitignore
# 依赖包
node_modules/

# 构建产物
build/
dist/
www/

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 编辑器文件
.vscode/
.idea/
*.swp
*.swo
*~

# 系统文件
.DS_Store
Thumbs.db

# Capacitor 相关
android/
ios/
```

## 🚀 部署流程

### 步骤 1：初始化 Git 仓库

打开 PowerShell，进入项目目录：

```powershell
# 进入项目目录
cd path/to/virtual-girlfriend

# 初始化 Git 仓库
git init

# 添加文件
git add .

# 第一次提交
git commit -m "Initial commit"
```

### 步骤 2：创建 GitHub 仓库

1. 登录 GitHub（https://github.com）
2. 点击右上角 **"+"** → **"New repository"**
3. 填写仓库信息：
   - Repository name: `virtual-girlfriend`
   - Description: 虚拟女友应用
   - Visibility: Public（公开）
4. 点击 **"Create repository"**

### 步骤 3：推送代码到 GitHub

在 PowerShell 中执行：

```powershell
# 添加远程仓库
git remote add origin https://github.com/你的用户名/virtual-girlfriend.git

# 推送代码
git push -u origin main
```

### 步骤 4：Vercel 部署

1. 登录 Vercel（https://vercel.com）
2. 点击 **"Add New"** → **"Project"**
3. 选择你的 GitHub 账号
4. 找到并选择 `virtual-girlfriend` 仓库
5. 点击 **"Import"**
6. 保持默认设置，点击 **"Deploy"**

### 步骤 5：获取访问链接

部署完成后，Vercel 会生成一个访问链接，类似：
`https://virtual-girlfriend-yourusername.vercel.app`

## 🎯 完成！

现在你可以在手机浏览器中访问这个链接，使用虚拟女友应用了！

## 💡 注意事项

1. **API Key 安全**：应用会在本地存储你的 DeepSeek API Key，不会发送到服务器
2. **数据存储**：所有聊天记录都存储在浏览器的 localStorage 中
3. **离线使用**：部署后可以添加到手机主屏幕，实现近似原生应用的体验

## ❓ 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台是否有错误，可能是文件路径问题

### Q: API Key 不生效？
A: 确保在设置中正确输入了 DeepSeek API Key

### Q: 手机访问速度慢？
A: Vercel 在全球有 CDN 节点，首次加载可能较慢，后续会更快

---

## 📞 遇到问题？

如果在部署过程中遇到任何问题，请查看：
- [Vercel 官方文档](https://vercel.com/docs)
- [GitHub 帮助文档](https://docs.github.com/en)

或者联系我获取进一步的帮助！
