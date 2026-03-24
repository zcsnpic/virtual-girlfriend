const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const https = require('https');
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

function callVolcengineTTS(text, voice) {
    return new Promise((resolve, reject) => {
        const endpoint = 'https://openspeech.bytedance.com/api/v1/tts';
        const data = JSON.stringify({
            app: {
                appid: VOLCENGINE_APP_ID,
                token: VOLCENGINE_ACCESS_KEY,
                cluster: 'volcano_tts'
            },
            user: {
                uid: 'user_' + Date.now()
            },
            audio: {
                voice_type: voice || 'BV700_streaming',
                encoding: 'mp3',
                rate: 24000,
                speed_ratio: 1.0,
                volume_ratio: 1.0,
                pitch_ratio: 1.0
            },
            request: {
                reqid: generateUUID(),
                text: text,
                text_type: 'plain',
                operation: 'query'
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'Authorization': `Bearer;${VOLCENGINE_ACCESS_KEY}`
            }
        };

        const req = https.request(endpoint, options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    if (jsonData.code === 3000) {
                        resolve(jsonData.data);
                    } else {
                        reject(new Error(`Volcengine error: ${jsonData.message}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });

        req.write(data);
        req.end();
    });
}

wss.on('connection', (clientWs, req) => {
    console.log('Client connected');
    
    clientWs.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            if (message.type === 'config') {
                console.log('Config received:', message);
            } else if (message.type === 'text') {
                const text = message.text;
                const voice = message.voice || 'BV700_streaming';
                console.log('Text received:', text);
                
                try {
                    console.log('Calling Volcengine TTS...');
                    console.log('Using appId:', VOLCENGINE_APP_ID);
                    console.log('Using voice:', voice);
                    
                    const audioData = await callVolcengineTTS(text, voice);
                    console.log('TTS API call successful');
                    
                    clientWs.send(JSON.stringify({ 
                        type: 'audio', 
                        data: audioData 
                    }));
                } catch (error) {
                    console.error('TTS API error:', error);
                    clientWs.send(JSON.stringify({ 
                        type: 'error', 
                        error: { message: error.message } 
                    }));
                }
            }
        } catch (e) {
            console.error('Parse error:', e);
        }
    });
    
    clientWs.on('close', () => {
        console.log('Client disconnected');
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
