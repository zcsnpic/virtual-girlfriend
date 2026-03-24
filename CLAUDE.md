# 虚拟女友聊天应用

## 项目简介
这是一个基于 DeepSeek API 的虚拟女友聊天应用，支持长期记忆、语音朗读等功能。

## 技术栈
- 前端：HTML + CSS + JavaScript
- AI 服务：DeepSeek API
- 语音：Web Speech API（浏览器原生）
- 存储：LocalStorage

## 项目结构
```
virtual-girlfriend/
├── index.html             # 主页面（聊天界面）
├── pages/
│   ├── settings.html      # 设置页面
│   └── memory.html        # 记忆管理页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── app.js             # 主程序
│   ├── api.js             # DeepSeek API 调用
│   ├── memory.js          # 记忆系统
│   ├── tts.js             # 语音功能
│   └── ui.js              # 界面交互
└── assets/
    └── icons/             # 图标资源
```

## 核心功能
1. 聊天对话 - 调用 DeepSeek API
2. 长期记忆 - 对话历史、个人信息、生活习惯、关系记忆
3. 撤回缓存 - 被撤回的消息仍可查看
4. 语音朗读 - 点击消息可转为语音
5. 角色设置 - 自定义角色名字、性格、说话风格
6. 主题切换 - 多种配色主题

## 编码规范
- 使用中文注释
- 变量和函数命名用英文，有意义
- 代码风格简洁易懂
- 每个函数要有功能说明

## 工作流程
- 每次修改后测试功能
- 保持代码整洁
