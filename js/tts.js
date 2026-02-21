const TTS = {
    synth: window.speechSynthesis,
    currentUtterance: null,
    isPlaying: false,

    getVoices: function() {
        const voices = this.synth.getVoices();
        const chineseVoices = voices.filter(v => 
            v.lang.includes('zh') || v.lang.includes('CN')
        );
        return chineseVoices.length > 0 ? chineseVoices : voices;
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

    speak: function(text, rate) {
        const settings = Memory.getSettings();

        if (!settings.ttsEnabled) {
            return;
        }

        // 只播放说话内容，不播放场景描述
        const speechContent = Memory.getSpeechContent(text);
        
        // 如果没有说话内容，不播放
        if (!speechContent || speechContent.trim() === '') {
            console.log('没有可播放的说话内容');
            return;
        }

        this.stop();

        const utterance = new SpeechSynthesisUtterance(speechContent);
        utterance.rate = rate || settings.ttsRate || 1.0;
        utterance.pitch = 1.2;
        utterance.lang = 'zh-CN';

        const voice = this.getYoungFemaleVoice();
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => {
            this.isPlaying = true;
        };

        utterance.onend = () => {
            this.isPlaying = false;
        };

        utterance.onerror = () => {
            this.isPlaying = false;
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    },

    stop: function() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        this.isPlaying = false;
        this.currentUtterance = null;
    },

    pause: function() {
        if (this.synth.speaking) {
            this.synth.pause();
        }
    },

    resume: function() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    },

    toggle: function(text, rate) {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.speak(text, rate);
        }
    },

    listVoices: function() {
        const voices = this.getVoices();
        console.log('可用的中文声音:');
        voices.forEach((v, i) => {
            console.log(`${i}: ${v.name} (${v.lang})`);
        });
        return voices;
    }
};

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        TTS.getVoices();
    };
}
