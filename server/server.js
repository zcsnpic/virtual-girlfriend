const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VOLCENGINE_APP_ID = process.env.VOLCENGINE_APP_ID || '';
const VOLCENGINE_ACCESS_KEY = process.env.VOLCENGINE_ACCESS_KEY || '';
const VOLCENGINE_RESOURCE_ID = process.env.VOLCENGINE_RESOURCE_ID || 'volc.service_type.10029';

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function buildHeader(messageType, messageTypeFlags, serializationMethod, compressionMethod) {
    const header = Buffer.alloc(4);
    header.writeUInt8(0x11, 0);
    const byte1 = (messageType << 4) | messageTypeFlags;
    header.writeUInt8(byte1, 1);
    const byte2 = (serializationMethod << 4) | compressionMethod;
    header.writeUInt8(byte2, 2);
    header.writeUInt8(0x00, 3);
    return header;
}

function buildStartConnectionFrame() {
    const header = buildHeader(0x01, 0x00, 0x01, 0x00);
    const event = Buffer.alloc(4);
    event.writeUInt32BE(0x01, 0);
    const payload = Buffer.from(JSON.stringify({
        app: {
            appid: VOLCENGINE_APP_ID,
            token: 'access_token',
            cluster: 'volcano_tts'
        },
        user: {
            uid: 'user_' + Date.now()
        }
    }));
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(payload.length, 0);
    return Buffer.concat([header, event, payloadSize, payload]);
}

function buildStartSessionFrame(voiceType, text) {
    const header = buildHeader(0x01, 0x00, 0x01, 0x00);
    const event = Buffer.alloc(4);
    event.writeUInt32BE(0x02, 0);
    const payload = Buffer.from(JSON.stringify({
        req_params: {
            text: text,
            speaker: voiceType || 'zh_female_cancan_mars_bigtts',
            audio_params: {
                format: 'mp3',
                sample_rate: 24000
            }
        }
    }));
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(payload.length, 0);
    return Buffer.concat([header, event, payloadSize, payload]);
}

function buildFinishSessionFrame() {
    const header = buildHeader(0x01, 0x00, 0x01, 0x00);
    const event = Buffer.alloc(4);
    event.writeUInt32BE(0x03, 0);
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(0, 0);
    return Buffer.concat([header, event, payloadSize]);
}

function buildFinishConnectionFrame() {
    const header = buildHeader(0x01, 0x00, 0x01, 0x00);
    const event = Buffer.alloc(4);
    event.writeUInt32BE(0x04, 0);
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(0, 0);
    return Buffer.concat([header, event, payloadSize]);
}

function parseFrame(data) {
    if (data.length < 4) return null;
    
    const byte0 = data.readUInt8(0);
    const byte1 = data.readUInt8(1);
    const byte2 = data.readUInt8(2);
    
    const protocolVersion = (byte0 >> 4) & 0x0F;
    const headerSize = (byte0 & 0x0F) * 4;
    const messageType = (byte1 >> 4) & 0x0F;
    const messageTypeFlags = byte1 & 0x0F;
    const serializationMethod = (byte2 >> 4) & 0x0F;
    const compressionMethod = byte2 & 0x0F;
    
    let offset = headerSize;
    let eventNumber = null;
    let payloadSize = 0;
    let payload = null;
    
    if (messageType === 0x01 && messageTypeFlags === 0x00) {
        if (data.length >= offset + 8) {
            eventNumber = data.readUInt32BE(offset);
            payloadSize = data.readUInt32BE(offset + 4);
            if (data.length >= offset + 8 + payloadSize) {
                payload = data.slice(offset + 8, offset + 8 + payloadSize);
            }
        }
    } else if (messageType === 0x0B) {
        if (data.length >= offset + 4) {
            payloadSize = data.readUInt32BE(offset);
            if (data.length >= offset + 4 + payloadSize) {
                payload = data.slice(offset + 4, offset + 4 + payloadSize);
            }
        }
    } else if (messageType === 0x0F) {
        if (data.length >= offset + 4) {
            payloadSize = data.readUInt32BE(offset);
            if (data.length >= offset + 4 + payloadSize) {
                payload = data.slice(offset + 4, offset + 4 + payloadSize);
            }
        }
    }
    
    return {
        messageType,
        messageTypeFlags,
        serializationMethod,
        compressionMethod,
        eventNumber,
        payloadSize,
        payload
    };
}

wss.on('connection', (clientWs, req) => {
    console.log('Client connected');
    
    let volcengineWs = null;
    let audioChunks = [];
    let isConnected = false;
    let currentText = '';
    let currentVoice = 'zh_female_cancan_mars_bigtts';
    
    clientWs.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            if (message.type === 'config') {
                currentVoice = message.voice || 'zh_female_cancan_mars_bigtts';
                console.log('Config received:', message);
            } else if (message.type === 'text') {
                currentText = message.text;
                console.log('Text received:', currentText);
                
                if (!isConnected) {
                    connectToVolcengine();
                } else {
                    sendTextToVolcengine(currentText, currentVoice);
                }
            }
        } catch (e) {
            console.error('Parse error:', e);
        }
    });
    
    function connectToVolcengine() {
        const connectId = generateUUID();
        const headers = {
            'X-Api-App-Key': VOLCENGINE_APP_ID,
            'X-Api-Access-Key': VOLCENGINE_ACCESS_KEY,
            'X-Api-Resource-Id': VOLCENGINE_RESOURCE_ID,
            'X-Api-Connect-Id': connectId
        };
        
        const headerStr = Object.entries(headers).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        const wsUrl = `wss://openspeech.bytedance.com/api/v3/tts/bidirection?${headerStr}`;
        
        console.log('Connecting to Volcengine...');
        
        const WebSocket = require('ws');
        volcengineWs = new WebSocket(wsUrl);
        
        volcengineWs.on('open', () => {
            console.log('Connected to Volcengine');
            isConnected = true;
            
            const startConnection = buildStartConnectionFrame();
            volcengineWs.send(startConnection);
            console.log('Sent StartConnection');
        });
        
        volcengineWs.on('message', (data) => {
            const frame = parseFrame(data);
            if (!frame) return;
            
            console.log('Received frame:', frame.messageType, frame.eventNumber);
            
            if (frame.messageType === 0x01 && frame.eventNumber === 0x01) {
                console.log('ConnectionStarted');
                clientWs.send(JSON.stringify({ type: 'status', status: 'connected' }));
                
                if (currentText) {
                    sendTextToVolcengine(currentText, currentVoice);
                }
            } else if (frame.messageType === 0x01 && frame.eventNumber === 0x02) {
                console.log('SessionStarted');
            } else if (frame.messageType === 0x01 && frame.eventNumber === 0x03) {
                console.log('SessionFinished');
                clientWs.send(JSON.stringify({ type: 'audio', data: Buffer.concat(audioChunks).toString('base64') }));
                audioChunks = [];
            } else if (frame.messageType === 0x0B) {
                if (frame.payload && frame.payload.length > 0) {
                    audioChunks.push(frame.payload);
                }
            } else if (frame.messageType === 0x0F) {
                console.log('Error frame received');
                if (frame.payload) {
                    const errorInfo = JSON.parse(frame.payload.toString());
                    console.error('Error:', errorInfo);
                    clientWs.send(JSON.stringify({ type: 'error', error: errorInfo }));
                }
            }
        });
        
        volcengineWs.on('error', (error) => {
            console.error('Volcengine WebSocket error:', error);
            clientWs.send(JSON.stringify({ type: 'error', error: error.message }));
        });
        
        volcengineWs.on('close', () => {
            console.log('Volcengine connection closed');
            isConnected = false;
        });
    }
    
    function sendTextToVolcengine(text, voice) {
        if (!volcengineWs || !isConnected) return;
        
        audioChunks = [];
        const startSession = buildStartSessionFrame(voice, text);
        volcengineWs.send(startSession);
        console.log('Sent StartSession with text');
        
        setTimeout(() => {
            const finishSession = buildFinishSessionFrame();
            volcengineWs.send(finishSession);
            console.log('Sent FinishSession');
        }, 100);
    }
    
    clientWs.on('close', () => {
        console.log('Client disconnected');
        if (volcengineWs) {
            volcengineWs.close();
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/config', (req, res) => {
    res.json({
        appId: VOLCENGINE_APP_ID ? 'configured' : 'not configured',
        hasAccessKey: !!VOLCENGINE_ACCESS_KEY
    });
});

server.listen(PORT, () => {
    console.log(`TTS Proxy Server running on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
