# 火山引擎 TTS 后端代理服务器

这个后端代理服务器用于解决浏览器端直接调用火山引擎 TTS API 的 CORS 问题。

## 架构

```
浏览器 <--WebSocket--> 后端代理服务器 <--WebSocket--> 火山引擎 TTS API
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的火山引擎凭证：

```env
VOLCENGINE_APP_ID=你的AppID
VOLCENGINE_ACCESS_KEY=你的Access Token
VOLCENGINE_RESOURCE_ID=volc.service_type.10029
PORT=3000
```

### 3. 启动服务器

```bash
npm start
```

服务器将在 `ws://localhost:3000` 启动。

### 4. 配置前端

在应用的 TTS 设置中：
1. 选择 **火山引擎 TTS (代理)**
2. 填入代理服务器地址：`ws://localhost:3000`
3. 选择音色
4. 测试连接

## 部署到云服务器

### 部署到 Vercel

```bash
npm install -g vercel
vercel
```

### 部署到 Railway

1. 连接 GitHub 仓库
2. 设置环境变量
3. 自动部署

### 部署到自己的服务器

使用 PM2 保持运行：

```bash
npm install -g pm2
pm2 start server.js --name tts-proxy
```

## API 说明

### WebSocket 消息格式

#### 发送配置
```json
{
    "type": "config",
    "voice": "zh_female_cancan_mars_bigtts"
}
```

#### 发送文本
```json
{
    "type": "text",
    "text": "你好，我是火山引擎的语音合成服务。"
}
```

#### 接收状态
```json
{
    "type": "status",
    "status": "connected"
}
```

#### 接收音频
```json
{
    "type": "audio",
    "data": "base64编码的音频数据"
}
```

#### 接收错误
```json
{
    "type": "error",
    "error": {
        "message": "错误信息"
    }
}
```

## 安全建议

1. **不要在公网暴露服务器** - 使用防火墙限制访问
2. **使用 HTTPS/WSS** - 生产环境使用加密连接
3. **添加认证** - 为代理服务器添加 token 认证
4. **限制并发** - 防止滥用

## 故障排查

### 连接失败
- 检查服务器是否启动
- 检查防火墙设置
- 确认 WebSocket 地址正确

### 合成失败
- 检查火山引擎凭证是否正确
- 确认账号余额充足
- 查看服务器日志

## 获取火山引擎凭证

1. 访问 https://console.volcengine.com/speech/app
2. 创建应用或使用已有应用
3. 获取 AppID 和 Access Token
