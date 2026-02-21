const TTS = {
    synth: window.speechSynthesis,
    currentUtterance: null,
    isPlaying: false,
    currentAudio: null,
    voicesLoaded: false,

    isSupported: function() {
        return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    },

    getSupportInfo: function() {
        const info = {
            supported: this.isSupported(),
            voicesCount: 0,
            hasChineseVoice: false,
            platform: 'unknown'
        };

        if (!info.supported) {
            return info;
        }

        const voices = this.synth.getVoices();
        info.voicesCount = voices.length;
        info.hasChineseVoice = voices.some(v => 
            v.lang.includes('zh') || v.lang.includes('CN')
        );

        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/.test(ua)) {
            info.platform = 'iOS';
        } else if (/Android/.test(ua)) {
            info.platform = 'Android';
        } else if (/Windows/.test(ua)) {
            info.platform = 'Windows';
        } else if (/Mac/.test(ua)) {
            info.platform = 'Mac';
        }

        return info;
    },

    EMOTION_CONFIG: {
        happy: { rate: 1.1, pitch: 1.3, description: '开心' },
        sad: { rate: 0.9, pitch: 0.9, description: '难过' },
        excited: { rate: 1.2, pitch: 1.4, description: '兴奋' },
        calm: { rate: 1.0, pitch: 1.1, description: '平静' },
        shy: { rate: 0.85, pitch: 1.0, description: '害羞' },
        angry: { rate: 1.15, pitch: 1.0, description: '生气' },
        gentle: { rate: 0.95, pitch: 1.15, description: '温柔' },
        surprised: { rate: 1.1, pitch: 1.25, description: '惊讶' }
    },

    EMOTION_KEYWORDS: {
        happy: ['开心', '高兴', '快乐', '哈哈', '嘻嘻', '太好了', '真好', '棒', '喜欢', '幸福', '！', '耶'],
        sad: ['难过', '伤心', '眼泪', '呜呜', '遗憾', '可惜', '心疼', '不舍', '想念'],
        excited: ['太棒了', '好期待', '真的吗', '哇', '太厉害', '太酷了', '激动'],
        shy: ['害羞', '脸红', '不好意思', '那个...', '嗯...', '别说了'],
        angry: ['生气', '讨厌', '烦人', '哼', '气死', '不可理喻'],
        gentle: ['温柔', '轻声', '慢慢', '静静', '安心', '放心'],
        surprised: ['啊', '咦', '真的假的', '没想到', '居然', '竟然']
    },

    getVoices: function() {
        const voices = this.synth.getVoices();
        console.log('原始声音列表:', voices.length, '个');
        
        if (voices.length === 0) {
            return [];
        }
        
        const chineseVoices = voices.filter(v => 
            v.lang.includes('zh') || v.lang.includes('CN') || v.lang.includes('chinese')
        );
        
        console.log('中文声音:', chineseVoices.length, '个');
        
        if (chineseVoices.length > 0) {
            return chineseVoices;
        }
        
        console.log('没有中文声音，返回所有声音');
        return voices;
    },

    getVoiceList: function() {
        return this.getVoices().map(v => ({
            name: v.name,
            lang: v.lang,
            voice: v
        }));
    },

    getYoungFemaleVoice: function() {
        const voices = this.getVoices();
        
        const youngKeywords = [
            'Xiaoxiao', '晓晓',
            'Yaoyao', '瑶瑶',
            'Huihui', '慧慧',
            'Xiaoyi', '小艺',
            'Female', '女',
            'Ting-Ting', '婷婷',
            'Sin-Ji',
            'Ya-Ling',
            'Yaoyao'
        ];

        for (const keyword of youngKeywords) {
            const found = voices.find(v => 
                v.name.toLowerCase().includes(keyword.toLowerCase())
            );
            if (found) {
                console.log('使用声音:', found.name);
                return found;
            }
        }

        return voices.length > 0 ? voices[0] : null;
    },

    getSelectedVoice: function() {
        const settings = Memory.getSettings();
        
        if (settings.ttsVoice && settings.ttsVoice !== 'auto') {
            const voices = this.getVoices();
            const selected = voices.find(v => v.name === settings.ttsVoice);
            if (selected) {
                return selected;
            }
        }
        
        return this.getYoungFemaleVoice();
    },

    detectEmotion: function(text) {
        let maxScore = 0;
        let detectedEmotion = 'calm';
        
        for (const [emotion, keywords] of Object.entries(this.EMOTION_KEYWORDS)) {
            let score = 0;
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    score += keyword.length;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                detectedEmotion = emotion;
            }
        }
        
        return detectedEmotion;
    },

    getEmotionParams: function(text, settings) {
        if (!settings.ttsEmotion) {
            return { rate: settings.ttsRate || 1.0, pitch: settings.ttsPitch || 1.2 };
        }
        
        const emotion = this.detectEmotion(text);
        const config = this.EMOTION_CONFIG[emotion] || this.EMOTION_CONFIG.calm;
        const baseRate = settings.ttsRate || 1.0;
        const basePitch = settings.ttsPitch || 1.2;
        
        return {
            rate: baseRate * config.rate,
            pitch: basePitch * config.pitch,
            emotion: emotion,
            emotionName: config.description
        };
    },

    speak: function(text, rate, messageId) {
        const settings = Memory.getSettings();

        if (!settings.ttsEnabled) {
            return;
        }

        if (!this.isSupported()) {
            console.warn('当前浏览器不支持语音合成');
            return;
        }

        if (settings.ttsApiEnabled && settings.ttsProvider && settings.ttsProvider !== 'browser') {
            return this.speakExternal(text);
        }

        const speechContent = Memory.getSpeechContent(text);
        
        if (!speechContent || speechContent.trim() === '') {
            console.log('没有可播放的说话内容');
            return;
        }

        this.stop();

        const parsed = Memory.parseMessage(text);
        if (parsed.hasScene && typeof UI !== 'undefined') {
            UI.showScene(parsed.scene);
        }

        if (messageId && typeof UI !== 'undefined') {
            UI.setPlayingState(messageId, true);
        }

        const utterance = new SpeechSynthesisUtterance(speechContent);
        
        const emotionParams = this.getEmotionParams(speechContent, settings);
        utterance.rate = rate || emotionParams.rate;
        utterance.pitch = emotionParams.pitch;
        utterance.lang = 'zh-CN';

        const voice = this.getSelectedVoice();
        if (voice) {
            utterance.voice = voice;
        } else {
            console.log('使用浏览器默认声音');
        }

        if (emotionParams.emotion && emotionParams.emotion !== 'calm') {
            console.log(`情感语音: ${emotionParams.emotionName} (${emotionParams.emotion})`);
        }

        utterance.onstart = () => {
            this.isPlaying = true;
        };

        utterance.onend = () => {
            this.isPlaying = false;
            if (typeof UI !== 'undefined') {
                UI.hideScene();
                if (messageId) {
                    UI.setPlayingState(messageId, false);
                }
            }
        };

        utterance.onerror = (e) => {
            console.error('TTS播放错误:', e);
            this.isPlaying = false;
            if (typeof UI !== 'undefined') {
                UI.hideScene();
                if (messageId) {
                    UI.setPlayingState(messageId, false);
                }
            }
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    },

    speakExternal: async function(text) {
        const settings = Memory.getSettings();
        const speechContent = Memory.getSpeechContent(text);
        
        if (!speechContent || speechContent.trim() === '') {
            console.log('没有可播放的说话内容');
            return;
        }

        this.stop();

        try {
            const result = await TTSProvider.speak(speechContent, {
                provider: settings.ttsProvider,
                apiKey: settings.ttsApiKey,
                voice: settings.ttsApiVoice,
                appId: settings.ttsAppId,
                secretId: settings.ttsSecretId,
                secretKey: settings.ttsSecretKey,
                token: settings.ttsToken,
                region: settings.ttsRegion,
                endpoint: settings.ttsEndpoint,
                customHeaders: settings.ttsCustomHeaders,
                customBody: settings.ttsCustomBody
            });

            if (result.success) {
                this.currentAudio = result.audio;
                this.isPlaying = true;
                
                result.audio.onended = () => {
                    this.isPlaying = false;
                    this.currentAudio = null;
                };
            } else {
                console.error('外部TTS调用失败:', result.error);
                this.speak(text);
            }
        } catch (error) {
            console.error('外部TTS异常:', error);
            this.speak(text);
        }
    },

    stop: function() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        this.isPlaying = false;
        this.currentUtterance = null;
        
        if (typeof UI !== 'undefined') {
            UI.hideScene();
        }
    },

    pause: function() {
        if (this.synth.speaking) {
            this.synth.pause();
        }
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
    },

    resume: function() {
        if (this.synth.paused) {
            this.synth.resume();
        }
        if (this.currentAudio) {
            this.currentAudio.play();
        }
    },

    toggle: function(text, rate, messageId) {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.speak(text, rate, messageId);
        }
    },

    listVoices: function() {
        const voices = this.getVoices();
        console.log('可用的中文声音:');
        voices.forEach((v, i) => {
            console.log(`${i}: ${v.name} (${v.lang})`);
        });
        return voices;
    },

    testVoice: function(voiceName) {
        const settings = Memory.getSettings();
        const originalVoice = settings.ttsVoice;
        
        settings.ttsVoice = voiceName;
        this.speak('你好，这是声音测试。');
        settings.ttsVoice = originalVoice;
    },

    init: function() {
        const supportInfo = this.getSupportInfo();
        console.log('TTS兼容性检测:', supportInfo);

        if (!supportInfo.supported) {
            console.warn('当前浏览器不支持Web Speech API');
            return;
        }

        const loadVoices = () => {
            const voices = this.synth.getVoices();
            console.log('声音列表加载完成，共', voices.length, '个声音');
            this.voicesLoaded = true;
            
            if (typeof UI !== 'undefined' && UI.updateVoiceList) {
                UI.updateVoiceList();
            }
        };

        if (this.synth.getVoices().length > 0) {
            loadVoices();
        }

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        const retryTimes = [100, 500, 1500, 3000];
        retryTimes.forEach((time, index) => {
            setTimeout(() => {
                if (!this.voicesLoaded || this.synth.getVoices().length === 0) {
                    console.log(`第${index + 1}次重试加载声音列表...`);
                    loadVoices();
                }
            }, time);
        });

        setTimeout(() => {
            const finalVoices = this.synth.getVoices();
            if (finalVoices.length === 0) {
                console.warn('声音列表最终为空，可能是移动端浏览器限制');
                console.log('提示: TTS仍可使用默认声音播放，但无法选择声音');
                if (typeof UI !== 'undefined' && UI.updateVoiceList) {
                    UI.updateVoiceList();
                }
            }
        }, 5000);
    }
};

TTS.init();
