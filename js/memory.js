const Memory = {
    STORAGE_KEY: 'virtual_girlfriend_data',

    getDefaultData: function() {
        return {
            settings: {
                apiKey: '',
                model: 'deepseek-chat',
                charName: '小雪',
                personality: 'gentle',
                style: 'sweet',
                userName: '亲爱的',
                theme: 'pink',
                ttsEnabled: true,
                ttsRate: 1.0
            },
            userInfo: {
                name: '',
                nickname: '',
                birthday: '',
                job: '',
                hobbies: [],
                favoriteFood: []
            },
            habits: {
                wakeUpTime: '',
                sleepTime: '',
                workSchedule: '',
                frequentPlaces: []
            },
            relationship: {
                startDate: '',
                milestones: [],
                memories: []
            },
            messages: [],
            recalledMessages: []
        };
    },

    load: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('加载数据失败:', e);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    },

    save: function(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    getSettings: function() {
        const data = this.load();
        return data.settings;
    },

    saveSettings: function(settings) {
        const data = this.load();
        data.settings = { ...data.settings, ...settings };
        this.save(data);
    },

    getUserInfo: function() {
        const data = this.load();
        return data.userInfo;
    },

    saveUserInfo: function(userInfo) {
        const data = this.load();
        data.userInfo = { ...data.userInfo, ...userInfo };
        this.save(data);
    },

    getHabits: function() {
        const data = this.load();
        return data.habits;
    },

    saveHabits: function(habits) {
        const data = this.load();
        data.habits = { ...data.habits, ...habits };
        this.save(data);
    },

    getRelationship: function() {
        const data = this.load();
        return data.relationship;
    },

    saveRelationship: function(relationship) {
        const data = this.load();
        data.relationship = { ...data.relationship, ...relationship };
        this.save(data);
    },

    addMessage: function(message) {
        const data = this.load();
        const newMessage = {
            id: Date.now(),
            role: message.role,
            content: message.content,
            timestamp: new Date().toISOString(),
            recalled: false
        };
        data.messages.push(newMessage);
        this.save(data);
        return newMessage;
    },

    getMessages: function(limit) {
        const data = this.load();
        if (limit) {
            return data.messages.slice(-limit);
        }
        return data.messages;
    },

    recallMessage: function(messageId) {
        const data = this.load();
        const message = data.messages.find(m => m.id === messageId);
        if (message) {
            message.recalled = true;
            data.recalledMessages.push({
                ...message,
                recalledAt: new Date().toISOString()
            });
            this.save(data);
            return true;
        }
        return false;
    },

    getRecalledMessages: function() {
        const data = this.load();
        return data.recalledMessages;
    },

    clearMessages: function() {
        const data = this.load();
        data.messages = [];
        data.recalledMessages = [];
        this.save(data);
    },

    searchMessages: function(keyword) {
        const data = this.load();
        return data.messages.filter(m => 
            m.content.toLowerCase().includes(keyword.toLowerCase())
        );
    },

    buildMemoryContext: function() {
        const data = this.load();
        const settings = data.settings;
        const userInfo = data.userInfo;
        const habits = data.habits;
        const relationship = data.relationship;

        let context = `你是${settings.charName}，是一个虚拟女友角色。\n\n`;

        const personalityMap = {
            'gentle': '温柔体贴，善解人意，说话轻柔',
            'lively': '活泼开朗，喜欢开玩笑，充满活力',
            'mature': '成熟稳重，给人建议和指导，有深度'
        };

        const styleMap = {
            'sweet': '甜美可爱，经常使用"~"、"呢"、"呀"等语气词',
            'elegant': '优雅知性，用词文雅，有内涵',
            'playful': '俏皮幽默，喜欢开玩笑，有点调皮'
        };

        context += `你的性格：${personalityMap[settings.personality] || '温柔体贴'}\n`;
        context += `你的说话风格：${styleMap[settings.style] || '甜美可爱'}\n`;
        context += `你称呼用户为：${settings.userName}\n\n`;

        if (userInfo.name) {
            context += `用户的名字是：${userInfo.name}\n`;
        }
        if (userInfo.nickname) {
            context += `用户喜欢被叫：${userInfo.nickname}\n`;
        }
        if (userInfo.birthday) {
            context += `用户的生日是：${userInfo.birthday}\n`;
        }
        if (userInfo.job) {
            context += `用户的职业是：${userInfo.job}\n`;
        }
        if (userInfo.hobbies && userInfo.hobbies.length > 0) {
            context += `用户的爱好：${userInfo.hobbies.join('、')}\n`;
        }
        if (userInfo.favoriteFood && userInfo.favoriteFood.length > 0) {
            context += `用户喜欢的食物：${userInfo.favoriteFood.join('、')}\n`;
        }

        if (habits.wakeUpTime) {
            context += `用户通常${habits.wakeUpTime}起床\n`;
        }
        if (habits.sleepTime) {
            context += `用户通常${habits.sleepTime}睡觉\n`;
        }

        if (relationship.startDate) {
            context += `\n你们从${relationship.startDate}开始认识\n`;
        }
        if (relationship.milestones && relationship.milestones.length > 0) {
            context += `重要事件：${relationship.milestones.join('、')}\n`;
        }

        context += `\n请始终保持角色扮演，用符合你性格和风格的方式回复。要关心用户，记住用户说过的话。`;

        return context;
    },

    getRecentContext: function(limit) {
        const messages = this.getMessages(limit || 10);
        return messages.map(m => ({
            role: m.role,
            content: m.content
        }));
    }
};
