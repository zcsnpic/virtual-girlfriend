const TTS_PRESETS = {
    openai: {
        name: 'OpenAI TTS',
        description: '高质量英文/中文语音',
        endpoint: 'https://api.openai.com/v1/audio/speech',
        method: 'POST',
        authType: 'header',
        authHeader: 'Authorization',
        authPrefix: 'Bearer ',
        headers: {
            'Content-Type': 'application/json'
        },
        bodyTemplate: {
            model: 'tts-1',
            input: '{text}',
            voice: '{voice}'
        },
        responseParser: 'blob',
        voices: [
            { id: 'nova', name: 'Nova（女声，推荐中文）' },
            { id: 'alloy', name: 'Alloy（中性）' },
            { id: 'shimmer', name: 'Shimmer（温柔女声）' },
            { id: 'echo', name: 'Echo（男声）' },
            { id: 'fable', name: 'Fable（英式）' },
            { id: 'onyx', name: 'Onyx（深沉男声）' }
        ],
        extraConfig: []
    },

    azure: {
        name: 'Azure TTS（微软）',
        description: '微软认知服务，中文声音丰富',
        endpoint: 'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1',
        method: 'POST',
        authType: 'header',
        authHeader: 'Ocp-Apim-Subscription-Key',
        authPrefix: '',
        headers: {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        bodyTemplate: 'ssml',
        responseParser: 'blob',
        voices: [
            { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓（女声，推荐）' },
            { id: 'zh-CN-YaoyaoNeural', name: '瑶瑶（女声，活泼）' },
            { id: 'zh-CN-XiaoyiNeural', name: '小艺（女声，温柔）' },
            { id: 'zh-CN-YunxiNeural', name: '云希（男声）' },
            { id: 'zh-CN-YunyangNeural', name: '云扬（男声）' }
        ],
        extraConfig: [
            { key: 'region', label: '区域', type: 'text', default: 'eastasia' }
        ]
    },

    tencent: {
        name: '腾讯云 TTS',
        description: '支持多情感语音',
        endpoint: 'https://tts.cloud.tencent.com/stream',
        method: 'POST',
        authType: 'signature',
        headers: {
            'Content-Type': 'application/json'
        },
        bodyTemplate: {
            Action: 'TextToStreamAudio',
            AppId: '{appId}',
            SecretId: '{secretId}',
            Text: '{text}',
            VoiceType: '{voice}',
            Codec: 'mp3',
            SampleRate: 16000,
            Speed: 1,
            Volume: 5
        },
        responseParser: 'stream',
        voices: [
            { id: '1001', name: '智瑜（女声，情感）' },
            { id: '1002', name: '智聆（女声，温柔）' },
            { id: '1003', name: '智美（女声，客服）' },
            { id: '1004', name: '智云（男声）' },
            { id: '1005', name: '智莉（女声，活泼）' }
        ],
        extraConfig: [
            { key: 'appId', label: 'AppId', type: 'text' },
            { key: 'secretId', label: 'SecretId', type: 'text' },
            { key: 'secretKey', label: 'SecretKey', type: 'password' }
        ]
    },

    aliyun: {
        name: '阿里云 TTS',
        description: '声音丰富，支持方言',
        endpoint: 'https://nls-gateway.aliyuncs.com/stream/v1/tts',
        method: 'POST',
        authType: 'token',
        headers: {
            'Content-Type': 'application/json'
        },
        bodyTemplate: {
            appkey: '{appId}',
            text: '{text}',
            voice: '{voice}',
            format: 'mp3',
            sample_rate: 16000
        },
        responseParser: 'blob',
        voices: [
            { id: 'xiaoyun', name: '小云（标准女声）' },
            { id: 'xiaogang', name: '小刚（标准男声）' },
            { id: 'ruoxi', name: '若兮（温柔女声）' },
            { id: 'siqi', name: '思琪（温柔女声）' },
            { id: 'sijia', name: '思佳（标准女声）' },
            { id: 'sicheng', name: '思诚（标准男声）' }
        ],
        extraConfig: [
            { key: 'appId', label: 'AppKey', type: 'text' },
            { key: 'token', label: 'Token', type: 'password' }
        ]
    },

    volcengine: {
        name: '火山引擎 TTS',
        description: '豆包同款，支持情感控制',
        endpoint: 'https://openspeech.bytedance.com/api/v1/tts',
        method: 'POST',
        authType: 'bearer',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer;{token}'
        },
        bodyTemplate: 'volcengine',
        responseParser: 'json_base64',
        voices: [
            { id: 'BV001_streaming', name: '通用女声' },
            { id: 'BV002_streaming', name: '通用男声' },
            { id: 'BV700_streaming', name: '灿灿（女声）' },
            { id: 'BV701_streaming', name: '梓梓（女声）' },
            { id: 'BV702_streaming', name: '燃燃（女声）' }
        ],
        extraConfig: [
            { key: 'appId', label: 'AppId', type: 'text' },
            { key: 'token', label: 'Token', type: 'password' },
            { key: 'proxyUrl', label: '代理服务器地址', type: 'text', default: 'ws://localhost:3000' }
        ]
    },

    volcengineProxy: {
        name: '火山引擎 TTS (代理)',
        description: '通过后端代理调用，安全稳定',
        endpoint: '',
        method: 'PROXY',
        authType: 'proxy',
        headers: {},
        bodyTemplate: 'proxy',
        responseParser: 'proxy',
        voices: [
            { id: 'BV001_streaming', name: '通用女声' },
            { id: 'BV002_streaming', name: '通用男声' },
            { id: 'BV700_streaming', name: '灿灿（女声）' },
            { id: 'BV701_streaming', name: '梓梓（女声）' },
            { id: 'BV702_streaming', name: '燃燃（女声）' }
        ],
        extraConfig: [
            { key: 'proxyUrl', label: '代理服务器地址', type: 'text', default: 'ws://localhost:3000' }
        ]
    },

    xfyun: {
        name: '讯飞 TTS',
        description: '国内老牌语音服务商',
        endpoint: 'wss://tts-api.xfyun.cn/v2/tts',
        method: 'WEBSOCKET',
        authType: 'signature',
        voices: [
            { id: 'xiaoyan', name: '小燕（女声）' },
            { id: 'aisjiuxu', name: '许久（男声）' },
            { id: 'aisxping', name: '小萍（女声）' },
            { id: 'aisjinger', name: '小婧（女声）' },
            { id: 'x4_lingxiaoxuan_oral', name: '灵小晓萱（女声）' }
        ],
        extraConfig: [
            { key: 'appId', label: 'APPID', type: 'text' },
            { key: 'apiKey', label: 'APIKey', type: 'password' },
            { key: 'secretKey', label: 'APISecret', type: 'password' }
        ]
    },

    elevenlabs: {
        name: 'ElevenLabs',
        description: '顶级音质，支持声音克隆',
        endpoint: 'https://api.elevenlabs.io/v1/text-to-speech/{voice}',
        method: 'POST',
        authType: 'header',
        authHeader: 'xi-api-key',
        authPrefix: '',
        headers: {
            'Content-Type': 'application/json'
        },
        bodyTemplate: {
            text: '{text}',
            model_id: 'eleven_multilingual_v2'
        },
        responseParser: 'blob',
        voices: [
            { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel（女声）' },
            { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi（女声）' },
            { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella（女声）' }
        ],
        extraConfig: []
    },

    custom: {
        name: '自定义 API',
        description: '配置任意TTS服务',
        endpoint: '',
        method: 'POST',
        authType: 'custom',
        headers: {},
        bodyTemplate: '',
        responseParser: 'blob',
        voices: [],
        extraConfig: []
    }
};

const TTSProvider = {
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    getVoices: function(provider) {
        const preset = TTS_PRESETS[provider];
        return preset ? preset.voices : [];
    },

    getExtraConfig: function(provider) {
        const preset = TTS_PRESETS[provider];
        return preset ? preset.extraConfig : [];
    },

    speak: async function(text, config) {
        const preset = TTS_PRESETS[config.provider];
        
        if (!preset) {
            return { success: false, error: '未知的TTS提供商' };
        }

        if (preset.method === 'PROXY') {
            return this.speakViaProxy(text, config, preset);
        }

        if (preset.method === 'WEBSOCKET') {
            return this.speakWebSocket(text, config, preset);
        }

        try {
            const endpoint = this.buildEndpoint(preset, config);
            const headers = this.buildHeaders(preset, config);
            const body = this.buildBody(preset, config, text);

            const response = await fetch(endpoint, {
                method: preset.method,
                headers: headers,
                body: preset.method === 'POST' ? body : null
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API错误 ${response.status}: ${errorText.substring(0, 200)}`);
            }

            let audioBlob;
            
            if (preset.responseParser === 'json_base64') {
                const jsonData = await response.json();
                if (jsonData.code !== 3000) {
                    throw new Error(`火山引擎错误: ${jsonData.message}`);
                }
                const binaryString = atob(jsonData.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                audioBlob = new Blob([bytes], { type: 'audio/mp3' });
            } else {
                audioBlob = await response.blob();
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => URL.revokeObjectURL(audioUrl);

            return { success: true, audio };

        } catch (error) {
            console.error('TTS API调用失败:', error);
            return { success: false, error: error.message };
        }
    },

    buildEndpoint: function(preset, config) {
        let endpoint = config.endpoint || preset.endpoint;
        endpoint = endpoint.replace('{voice}', config.voice || '');
        endpoint = endpoint.replace('{region}', config.region || 'eastasia');
        return endpoint;
    },

    buildHeaders: function(preset, config) {
        const headers = { ...preset.headers };

        if (preset.authType === 'header' && preset.authHeader) {
            const prefix = preset.authPrefix || '';
            headers[preset.authHeader] = prefix + (config.apiKey || '');
        }

        if (preset.authType === 'bearer') {
            headers['Authorization'] = `Bearer ${config.token || config.apiKey}`;
        }

        if (preset.authType === 'token' && config.token) {
            headers['X-NLS-Token'] = config.token;
        }

        for (const key in headers) {
            if (typeof headers[key] === 'string') {
                headers[key] = headers[key]
                    .replace('{apiKey}', config.apiKey || '')
                    .replace('{token}', config.token || '')
                    .replace('{voice}', config.voice || '');
            }
        }

        return headers;
    },

    buildBody: function(preset, config, text) {
        if (preset.bodyTemplate === 'ssml') {
            const voice = config.voice || 'zh-CN-XiaoxiaoNeural';
            return `<speak version="1.0" xml:lang="zh-CN"><voice name="${voice}">${this.escapeXml(text)}</voice></speak>`;
        }

        if (preset.bodyTemplate === 'volcengine') {
            return JSON.stringify({
                app: {
                    appid: config.appId || '',
                    token: config.token || '',
                    cluster: 'volcano_tts'
                },
                user: {
                    uid: 'user001'
                },
                audio: {
                    voice_type: config.voice || 'BV700_streaming',
                    encoding: 'mp3',
                    rate: 24000,
                    speed_ratio: 1.0,
                    volume_ratio: 1.0,
                    pitch_ratio: 1.0
                },
                request: {
                    reqid: this.generateUUID(),
                    text: text,
                    text_type: 'plain',
                    operation: 'query'
                }
            });
        }

        if (typeof preset.bodyTemplate === 'object') {
            const body = JSON.parse(JSON.stringify(preset.bodyTemplate));
            
            for (const key in body) {
                if (body[key] === '{text}') body[key] = text;
                if (body[key] === '{voice}') body[key] = config.voice || '';
                if (body[key] === '{appId}') body[key] = config.appId || '';
                if (body[key] === '{secretId}') body[key] = config.secretId || '';
            }
            
            return JSON.stringify(body);
        }

        if (config.customBody) {
            try {
                const body = JSON.parse(config.customBody);
                const bodyStr = JSON.stringify(body);
                return bodyStr
                    .replace('{text}', text)
                    .replace('{voice}', config.voice || '')
                    .replace('{apiKey}', config.apiKey || '');
            } catch (e) {
                return config.customBody.replace('{text}', text);
            }
        }

        return JSON.stringify({ text: text, voice: config.voice });
    },

    escapeXml: function(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    speakWebSocket: async function(text, config, preset) {
        return { 
            success: false, 
            error: 'WebSocket TTS暂不支持，请使用其他平台或浏览器原生TTS' 
        };
    },

    speakViaProxy: function(text, config, preset) {
        return new Promise((resolve, reject) => {
            const proxyUrl = config.proxyUrl || '/api/tts-proxy';
            
            fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    voice: config.voice || 'BV700_streaming'
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const binaryString = atob(data.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    audio.onended = () => URL.revokeObjectURL(audioUrl);
                    resolve({ success: true, audio });
                } else {
                    resolve({ success: false, error: data.error || '代理服务器错误' });
                }
            })
            .catch(error => {
                resolve({ success: false, error: error.message || '代理服务器连接失败' });
            });
        });
    },

    testConnection: async function(config) {
        const testText = '你好，这是测试。';
        const result = await this.speak(testText, config);
        
        if (result.success) {
            result.audio.play();
        }
        
        return result;
    }
};
