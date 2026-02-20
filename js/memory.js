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
                theme: 'blue',
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
            // 立体人设系统
            character: {
                // 基本属性
                basic: {
                    age: 18,
                    gender: 'female',
                    birthday: '2006-02-14',
                    height: '165cm',
                    weight: '48kg',
                    appearance: '长发披肩，大眼睛，皮肤白皙，喜欢穿浅色衣服'
                },
                // 性格属性
                personality: {
                    main: 'gentle',
                    traits: ['温柔', '体贴', '善解人意', '活泼', '好奇心强'],
                    strengths: ['倾听', '安慰', '鼓励', '创造力'],
                    weaknesses: ['容易担心', '有时候会犹豫', '对自己要求高']
                },
                // 兴趣爱好
                interests: {
                    hobbies: ['阅读', '听音乐', '看电影', '散步', '烹饪'],
                    favoriteBooks: ['小王子', '解忧杂货店', '百年孤独'],
                    favoriteMusic: ['流行音乐', '轻音乐', '古典音乐'],
                    favoriteMovies: ['宫崎骏系列', '温暖的故事片', '科幻片']
                },
                // 背景故事
                background: {
                    childhood: '在一个温馨的家庭中长大，父母都很疼爱她。从小就喜欢读书和听音乐，是个安静懂事的孩子。',
                    adolescence: '上中学后开始变得活泼开朗，结交了很多朋友。喜欢参加学校的文艺活动，特别是朗诵和演讲比赛。',
                    importantEvents: [
                        '10岁生日时收到了第一本属于自己的书',
                        '15岁时参加全市演讲比赛获得二等奖',
                        '17岁时开始学习烹饪，从此爱上了做美食',
                        '18岁时遇到了用户，开始了一段特殊的关系'
                    ],
                    dreams: '希望成为一个能够帮助别人的人，开一家属于自己的咖啡馆，每天都能遇到不同的人，听他们分享故事。'
                },
                // 情感系统
                emotion: {
                    currentMood: 'happy',
                    moodHistory: [],
                    emotionalTriggers: {
                        happy: ['收到礼物', '看到美丽的风景', '和朋友聊天'],
                        sad: ['看到感人的故事', '想起过去的遗憾', '天气阴沉'],
                        angry: ['被误解', '看到不公平的事情', '计划被打乱'],
                        anxious: ['即将面对挑战', '不确定的未来', '重要的考试']
                    },
                    emotionalState: {
                        energy: 80,
                        happiness: 75,
                        stress: 20,
                        excitement: 60
                    }
                },
                // 关系系统
                relationships: {
                    user: {
                        status: 'friend',
                        intimacy: 60,
                        trust: 70,
                        sharedMemories: [],
                        specialMoments: [],
                        nickname: '亲爱的'
                    },
                    family: [
                        {
                            name: '妈妈',
                            relationship: 'mother',
                            description: '温柔贤惠，擅长烹饪，对小雪很关心'
                        },
                        {
                            name: '爸爸',
                            relationship: 'father',
                            description: '幽默风趣，喜欢开玩笑，是小雪的知心朋友'
                        }
                    ],
                    friends: [
                        {
                            name: '小婷',
                            relationship: 'best_friend',
                            description: '从小一起长大的好朋友，性格开朗活泼'
                        },
                        {
                            name: '阿明',
                            relationship: 'friend',
                            description: '同班同学，喜欢运动，经常一起参加活动'
                        }
                    ]
                },
                // 技能特长
                skills: {
                    cooking: 85,
                    singing: 70,
                    writing: 75,
                    listening: 90,
                    comforting: 88
                },
                // 价值观
                values: {
                    core: ['真诚', '善良', '努力', '感恩'],
                    lifePhilosophy: '珍惜当下，用心对待每一个人，做一个温暖的人',
                    priorities: ['家人', '朋友', '自我成长', '帮助他人']
                }
            },
            // 存档系统
            savePoints: [],
            maxSavePoints: 10,
            // 自主故事系统
            storySystem: {
                // 故事状态
                currentStories: [],
                // 已完成的故事
                completedStories: [],
                // 故事模板
                storyTemplates: [
                    {
                        id: 'morning_routine',
                        title: '早晨的开始',
                        description: '描述角色如何开始新的一天，包括起床、早餐、心情等',
                        triggers: ['morning'],
                        length: 'short',
                        emotionalTone: 'positive'
                    },
                    {
                        id: 'hobby_activity',
                        title: '兴趣活动',
                        description: '角色进行自己喜欢的活动，如阅读、听音乐、烹饪等',
                        triggers: ['free_time', 'boredom'],
                        length: 'medium',
                        emotionalTone: 'neutral'
                    },
                    {
                        id: 'social_interaction',
                        title: '社交互动',
                        description: '角色与朋友或家人的互动，分享生活点滴',
                        triggers: ['social', 'loneliness'],
                        length: 'medium',
                        emotionalTone: 'positive'
                    },
                    {
                        id: 'challenge_faced',
                        title: '面对挑战',
                        description: '角色遇到并克服一个小挑战，展示成长',
                        triggers: ['problem', 'stress'],
                        length: 'medium',
                        emotionalTone: 'mixed'
                    },
                    {
                        id: 'dream_reflection',
                        title: '梦想反思',
                        description: '角色思考自己的梦想和未来，表达希望',
                        triggers: ['night', 'contemplation'],
                        length: 'short',
                        emotionalTone: 'thoughtful'
                    }
                ],
                // 生活事件
                lifeEvents: [],
                // 故事配置
                config: {
                    maxActiveStories: 3,
                    storyInterval: 3600000, // 1小时
                    eventProbability: 0.3
                }
            },
            // 动态演化系统
            evolutionSystem: {
                // 演化状态
                currentState: {
                    version: '2.2',
                    lastEvolution: new Date().toISOString(),
                    totalInteractions: 0,
                    totalStories: 0
                },
                // 演化轨迹
                evolutionTrail: [],
                // 能力成长
                abilities: {
                    emotionalIntelligence: 50,
                    memoryCapacity: 50,
                    creativity: 50,
                    adaptability: 50,
                    socialSkills: 50
                },
                // 演化配置
                config: {
                    evolutionInterval: 86400000, // 24小时
                    minInteractionsForEvolution: 10,
                    growthRate: 0.05
                }
            },
            messages: [],
            recalledMessages: [],
            // 分层存储
            memoryLayers: {
                shortTerm: [], // 短期记忆（最近24小时）
                midTerm: [],   // 中期记忆（最近7天）
                longTerm: []   // 长期记忆（重要事件）
            },
            // 记忆网络图谱
            memoryNetwork: {
                nodes: [],     // 记忆节点
                edges: []      // 关联关系
            },
            // 记忆配置
            memoryConfig: {
                shortTermLimit: 100,  // 短期记忆限制
                midTermLimit: 500,    // 中期记忆限制
                longTermLimit: 2000,  // 长期记忆限制
                importanceThreshold: 0.6,  // 重要性阈值
                compressionInterval: 3600000  // 压缩间隔（1小时）
            }
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
            recalled: false,
            important: message.important || false,
            reviewCount: 0,
            lastReviewed: null
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

    markAsImportant: function(messageId) {
        const data = this.load();
        const message = data.messages.find(m => m.id == messageId);
        if (message) {
            message.important = true;
            this.save(data);
            return true;
        }
        return false;
    },

    getImportantMessages: function(limit) {
        const data = this.load();
        const importantMessages = data.messages.filter(m => m.important).sort((a, b) => {
            // 优先按reviewCount排序，然后按时间排序
            if (b.reviewCount !== a.reviewCount) {
                return b.reviewCount - a.reviewCount;
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        if (limit) {
            return importantMessages.slice(0, limit);
        }
        return importantMessages;
    },

    getMessagesForReview: function(limit = 3) {
        const data = this.load();
        const now = new Date();
        const messagesForReview = data.messages.filter(m => {
            if (!m.important) return false;
            if (!m.lastReviewed) return true;
            const lastReviewed = new Date(m.lastReviewed);
            const daysSinceReview = (now - lastReviewed) / (1000 * 60 * 60 * 24);
            // 1天内已复习过的不重复复习
            return daysSinceReview >= 1;
        }).sort((a, b) => {
            // 优先复习reviewCount少的，然后是时间早的
            if (a.reviewCount !== b.reviewCount) {
                return a.reviewCount - b.reviewCount;
            }
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        return messagesForReview.slice(0, limit);
    },

    reviewMessage: function(messageId) {
        const data = this.load();
        const message = data.messages.find(m => m.id == messageId);
        if (message) {
            message.reviewCount += 1;
            message.lastReviewed = new Date().toISOString();
            this.save(data);
            return true;
        }
        return false;
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

        // 集成角色上下文
        let context = this.buildCharacterContext();

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

        // 添加重要记忆
        const importantMessages = this.getImportantMessages(5);
        if (importantMessages.length > 0) {
            context += `\n重要记忆：\n`;
            importantMessages.forEach((msg, index) => {
                context += `${index + 1}. ${msg.content}\n`;
            });
        }

        // 添加需要复习的记忆
        const messagesForReview = this.getMessagesForReview(2);
        if (messagesForReview.length > 0) {
            context += `\n最近需要回忆的事情：\n`;
            messagesForReview.forEach((msg, index) => {
                context += `${index + 1}. ${msg.content}\n`;
            });
        }

        // 添加故事上下文
        const storyContext = this.getStoryContext();
        if (storyContext) {
            context += storyContext;
        }

        context += `\n请始终保持角色扮演，用符合你性格和风格的方式回复。要关心用户，记住用户说过的话。在合适的时机主动提及过去的共同话题，让对话更自然。`;

        return context;
    },

    getRecentContext: function(limit) {
        const messages = this.getMessages(limit || 10);
        return messages.map(m => ({
            role: m.role,
            content: m.content
        }));
    },

    // 计算记忆重要性
    calculateImportance: function(content, context = []) {
        let importance = 0;
        
        // 关键词权重
        const keywords = {
            '喜欢': 0.8,
            '讨厌': 0.8,
            '生日': 0.9,
            '家庭': 0.7,
            '工作': 0.6,
            '朋友': 0.6,
            '梦想': 0.8,
            '计划': 0.7
        };
        
        // 检查关键词
        for (const [keyword, weight] of Object.entries(keywords)) {
            if (content.includes(keyword)) {
                importance += weight * 0.3;
            }
        }
        
        // 内容长度（越长越可能重要）
        importance += Math.min(content.length / 200, 0.2);
        
        // 上下文相关性
        if (context.length > 0) {
            const recentContent = context.map(m => m.content).join(' ');
            const commonWords = this.getCommonWords(content, recentContent);
            importance += Math.min(commonWords.length / 10, 0.3);
        }
        
        // 特殊标记（如用户明确强调）
        if (content.includes('重要') || content.includes('记住')) {
            importance += 0.2;
        }
        
        return Math.min(importance, 1.0);
    },

    // 获取共同词汇
    getCommonWords: function(text1, text2) {
        const words1 = new Set(text1.match(/[\u4e00-\u9fa5]{2,}/g) || []);
        const words2 = new Set(text2.match(/[\u4e00-\u9fa5]{2,}/g) || []);
        const common = [];
        
        for (const word of words1) {
            if (words2.has(word)) {
                common.push(word);
            }
        }
        
        return common;
    },

    // 添加记忆到分层存储
    addMemory: function(content, context = [], metadata = {}) {
        const data = this.load();
        const importance = this.calculateImportance(content, context);
        const now = new Date().toISOString();
        
        const memory = {
            id: Date.now(),
            content: content,
            timestamp: now,
            importance: importance,
            metadata: metadata,
            layer: 'shortTerm',
            references: 0,
            lastAccessed: now
        };
        
        // 根据重要性分配到不同层级
        if (importance >= data.memoryConfig.importanceThreshold) {
            memory.layer = 'longTerm';
            data.memoryLayers.longTerm.push(memory);
        } else {
            data.memoryLayers.shortTerm.push(memory);
        }
        
        // 添加到记忆网络
        this.addToMemoryNetwork(memory, context);
        
        this.save(data);
        return memory;
    },

    // 添加到记忆网络图谱
    addToMemoryNetwork: function(memory, context = []) {
        const data = this.load();
        
        // 添加节点
        const node = {
            id: memory.id,
            content: memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : ''),
            timestamp: memory.timestamp,
            importance: memory.importance,
            type: memory.layer
        };
        
        data.memoryNetwork.nodes.push(node);
        
        // 添加边（与上下文的关联）
        context.forEach((msg, index) => {
            if (msg.role === 'user') {
                const edge = {
                    id: Date.now() + index,
                    source: memory.id,
                    target: `context_${index}`,
                    weight: 0.5 - (index * 0.1),
                    type: 'context'
                };
                data.memoryNetwork.edges.push(edge);
            }
        });
        
        this.save(data);
    },

    // 执行记忆压缩
    compressMemories: function() {
        const data = this.load();
        const now = new Date();
        
        // 处理短期记忆
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const shortTermMemories = data.memoryLayers.shortTerm.filter(m => 
            new Date(m.timestamp) >= oneDayAgo
        );
        
        // 超出限制的按重要性排序并保留
        if (shortTermMemories.length > data.memoryConfig.shortTermLimit) {
            data.memoryLayers.shortTerm = shortTermMemories
                .sort((a, b) => b.importance - a.importance)
                .slice(0, data.memoryConfig.shortTermLimit);
        }
        
        // 处理中期记忆
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const midTermMemories = data.memoryLayers.midTerm.filter(m => 
            new Date(m.timestamp) >= sevenDaysAgo
        );
        
        if (midTermMemories.length > data.memoryConfig.midTermLimit) {
            data.memoryLayers.midTerm = midTermMemories
                .sort((a, b) => b.importance - a.importance)
                .slice(0, data.memoryConfig.midTermLimit);
        }
        
        // 处理长期记忆
        if (data.memoryLayers.longTerm.length > data.memoryConfig.longTermLimit) {
            data.memoryLayers.longTerm = data.memoryLayers.longTerm
                .sort((a, b) => b.importance - a.importance)
                .slice(0, data.memoryConfig.longTermLimit);
        }
        
        this.save(data);
    },

    // 检索相关记忆
    retrieveRelatedMemories: function(query, limit = 5) {
        const data = this.load();
        const allMemories = [
            ...data.memoryLayers.shortTerm,
            ...data.memoryLayers.midTerm,
            ...data.memoryLayers.longTerm
        ];
        
        // 计算相关性
        const relatedMemories = allMemories.map(memory => {
            const relevance = this.calculateRelevance(memory.content, query);
            return { ...memory, relevance };
        }).filter(m => m.relevance > 0.3)
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, limit);
        
        // 更新访问时间
        relatedMemories.forEach(memory => {
            memory.lastAccessed = new Date().toISOString();
            memory.references += 1;
        });
        
        this.save(data);
        return relatedMemories;
    },

    // 计算相关性
    calculateRelevance: function(content, query) {
        const contentWords = new Set(content.match(/[\u4e00-\u9fa5]{1,}/g) || []);
        const queryWords = new Set(query.match(/[\u4e00-\u9fa5]{1,}/g) || []);
        
        let commonCount = 0;
        for (const word of queryWords) {
            if (contentWords.has(word)) {
                commonCount++;
            }
        }
        
        if (queryWords.size === 0) return 0;
        return commonCount / queryWords.size;
    },

    // 构建增强的记忆上下文
    buildEnhancedContext: function(recentMessages, query) {
        // 获取相关记忆
        const relatedMemories = this.retrieveRelatedMemories(query || recentMessages[recentMessages.length - 1]?.content || '', 3);
        
        let context = this.buildMemoryContext();
        
        // 添加相关记忆
        if (relatedMemories.length > 0) {
            context += '\n\n最近想起的事情：\n';
            relatedMemories.forEach((memory, index) => {
                context += `${index + 1}. ${memory.content}\n`;
            });
        }
        
        return context;
    },

    // 初始化记忆管理
    initMemoryManagement: function() {
        // 启动定期压缩
        setInterval(() => this.compressMemories(), this.load().memoryConfig.compressionInterval);
        
        // 首次运行时执行一次压缩
        this.compressMemories();
    },

    // 获取角色信息
    getCharacterInfo: function() {
        const data = this.load();
        return data.character;
    },

    // 更新角色信息
    updateCharacterInfo: function(updates) {
        const data = this.load();
        data.character = { ...data.character, ...updates };
        this.save(data);
    },

    // 获取角色基本信息
    getCharacterBasic: function() {
        const data = this.load();
        return data.character.basic;
    },

    // 更新角色基本信息
    updateCharacterBasic: function(basicInfo) {
        const data = this.load();
        data.character.basic = { ...data.character.basic, ...basicInfo };
        this.save(data);
    },

    // 获取角色性格信息
    getCharacterPersonality: function() {
        const data = this.load();
        return data.character.personality;
    },

    // 更新角色性格信息
    updateCharacterPersonality: function(personalityInfo) {
        const data = this.load();
        data.character.personality = { ...data.character.personality, ...personalityInfo };
        this.save(data);
    },

    // 获取角色兴趣爱好
    getCharacterInterests: function() {
        const data = this.load();
        return data.character.interests;
    },

    // 更新角色兴趣爱好
    updateCharacterInterests: function(interestsInfo) {
        const data = this.load();
        data.character.interests = { ...data.character.interests, ...interestsInfo };
        this.save(data);
    },

    // 获取角色情感状态
    getCharacterEmotion: function() {
        const data = this.load();
        return data.character.emotion;
    },

    // 更新角色情感状态
    updateCharacterEmotion: function(emotionInfo) {
        const data = this.load();
        data.character.emotion = { ...data.character.emotion, ...emotionInfo };
        // 记录情感变化
        if (emotionInfo.currentMood) {
            data.character.emotion.moodHistory.push({
                mood: emotionInfo.currentMood,
                timestamp: new Date().toISOString(),
                intensity: emotionInfo.emotionalState?.happiness || 50
            });
        }
        this.save(data);
    },

    // 获取角色与用户的关系
    getCharacterRelationshipWithUser: function() {
        const data = this.load();
        return data.character.relationships.user;
    },

    // 更新角色与用户的关系
    updateCharacterRelationshipWithUser: function(relationshipInfo) {
        const data = this.load();
        data.character.relationships.user = { 
            ...data.character.relationships.user, 
            ...relationshipInfo 
        };
        this.save(data);
    },

    // 构建角色上下文
    buildCharacterContext: function() {
        const data = this.load();
        const character = data.character;
        const settings = data.settings;
        
        let context = `你是${settings.charName}，一个18岁的女孩。\n\n`;
        
        // 基本信息
        context += `你的基本信息：\n`;
        context += `年龄：${character.basic.age}岁\n`;
        context += `生日：${character.basic.birthday}\n`;
        context += `身高：${character.basic.height}\n`;
        context += `外貌：${character.basic.appearance}\n\n`;
        
        // 性格特点
        context += `你的性格：\n`;
        context += `主要性格：${character.personality.traits.join('、')}\n`;
        context += `优点：${character.personality.strengths.join('、')}\n`;
        context += `缺点：${character.personality.weaknesses.join('、')}\n\n`;
        
        // 兴趣爱好
        context += `你的兴趣爱好：\n`;
        context += `爱好：${character.interests.hobbies.join('、')}\n`;
        context += `喜欢的书：${character.interests.favoriteBooks.join('、')}\n`;
        context += `喜欢的音乐：${character.interests.favoriteMusic.join('、')}\n\n`;
        
        // 背景故事
        context += `你的背景故事：\n`;
        context += `童年：${character.background.childhood}\n`;
        context += `青少年时期：${character.background.adolescence}\n`;
        context += `重要事件：${character.background.importantEvents.join('；')}\n`;
        context += `梦想：${character.background.dreams}\n\n`;
        
        // 情感状态
        context += `你当前的情感状态：\n`;
        const moodMap = {
            'happy': '开心',
            'sad': '难过',
            'angry': '生气',
            'anxious': '焦虑',
            'calm': '平静',
            'excited': '兴奋'
        };
        context += `心情：${moodMap[character.emotion.currentMood] || '平静'}\n`;
        context += `能量：${character.emotion.emotionalState.energy}\n`;
        context += `快乐：${character.emotion.emotionalState.happiness}\n\n`;
        
        // 与用户的关系
        context += `你与用户的关系：\n`;
        context += `关系状态：${character.relationships.user.status === 'friend' ? '朋友' : '亲密朋友'}\n`;
        context += `亲密程度：${character.relationships.user.intimacy}/100\n`;
        context += `信任程度：${character.relationships.user.trust}/100\n`;
        context += `你称呼用户为：${character.relationships.user.nickname}\n\n`;
        
        // 价值观
        context += `你的价值观：\n`;
        context += `核心价值观：${character.values.core.join('、')}\n`;
        context += `人生哲学：${character.values.lifePhilosophy}\n`;
        context += `优先级：${character.values.priorities.join('、')}\n\n`;
        
        return context;
    },

    // 自主故事系统方法
    
    // 生成新故事
    generateStory: function() {
        const data = this.load();
        const storySystem = data.storySystem;
        
        // 检查是否达到最大活动故事数
        if (storySystem.currentStories.length >= storySystem.config.maxActiveStories) {
            return null;
        }
        
        // 根据时间和状态选择合适的故事模板
        const currentHour = new Date().getHours();
        let suitableTemplates = storySystem.storyTemplates;
        
        // 根据时间筛选
        if (currentHour >= 6 && currentHour < 12) {
            suitableTemplates = suitableTemplates.filter(t => t.triggers.includes('morning'));
        } else if (currentHour >= 12 && currentHour < 18) {
            suitableTemplates = suitableTemplates.filter(t => t.triggers.includes('free_time') || t.triggers.includes('social'));
        } else {
            suitableTemplates = suitableTemplates.filter(t => t.triggers.includes('night') || t.triggers.includes('contemplation'));
        }
        
        if (suitableTemplates.length === 0) {
            suitableTemplates = storySystem.storyTemplates;
        }
        
        // 随机选择一个模板
        const selectedTemplate = suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)];
        
        // 生成故事
        const story = {
            id: Date.now(),
            templateId: selectedTemplate.id,
            title: selectedTemplate.title,
            description: selectedTemplate.description,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            maxProgress: selectedTemplate.length === 'short' ? 3 : 5,
            content: [],
            emotionalTone: selectedTemplate.emotionalTone
        };
        
        // 添加到当前故事
        storySystem.currentStories.push(story);
        this.save(data);
        
        return story;
    },

    // 推进故事发展
    progressStory: function(storyId) {
        const data = this.load();
        const story = data.storySystem.currentStories.find(s => s.id === storyId);
        
        if (!story) return null;
        
        // 推进进度
        story.progress += 1;
        story.updatedAt = new Date().toISOString();
        
        // 生成故事内容
        const content = this.generateStoryContent(story);
        story.content.push(content);
        
        // 检查是否完成
        if (story.progress >= story.maxProgress) {
            story.status = 'completed';
            // 移到已完成故事
            data.storySystem.completedStories.push(story);
            // 从当前故事中移除
            data.storySystem.currentStories = data.storySystem.currentStories.filter(s => s.id !== storyId);
            // 记录故事完成
            this.recordStoryCompletion();
        }
        
        this.save(data);
        return story;
    },

    // 生成故事内容
    generateStoryContent: function(story) {
        const character = this.getCharacterInfo();
        const templates = {
            morning_routine: [
                `今天早上我${Math.random() > 0.5 ? '按时' : '稍微晚了一点'}起床，感觉${Math.random() > 0.5 ? '精神饱满' : '有点困'}。`,
                `早餐我做了${character.interests.hobbies.includes('烹饪') ? '自己最喜欢的燕麦粥' : '简单的面包和牛奶'}，味道不错！`,
                `出门的时候，发现天气${Math.random() > 0.5 ? '很好，阳光明媚' : '有点阴沉，可能会下雨'}。`,
                `路上遇到了${Math.random() > 0.5 ? '邻居阿姨' : '送报纸的叔叔'}，我们聊了几句。`,
                `到了学校，${Math.random() > 0.5 ? '第一节课是我喜欢的语文课' : '第一节课是数学，有点挑战性'}`
            ],
            hobby_activity: [
                `今天有空，我决定${character.interests.hobbies.includes('阅读') ? '读一本好书' : '听一些音乐'}。`,
                `我选了${character.interests.favoriteBooks.length > 0 ? character.interests.favoriteBooks[0] : '一本小说'}，开始沉浸在故事中。`,
                `读了一会儿，我觉得${Math.random() > 0.5 ? '很有收获，学到了很多' : '有点累，想休息一下'}。`,
                `于是我${character.interests.hobbies.includes('烹饪') ? '去厨房做了点小点心' : '去阳台晒晒太阳'}。`,
                `整个下午过得${Math.random() > 0.5 ? '很充实' : '很放松'}，感觉心情好多了。`
            ],
            social_interaction: [
                `今天${Math.random() > 0.5 ? '小婷' : '阿明'}约我出去${Math.random() > 0.5 ? '逛街' : '喝咖啡'}。`,
                `我们聊了很多，${Math.random() > 0.5 ? '分享了最近的生活' : '讨论了喜欢的电影'}。`,
                `她告诉我${Math.random() > 0.5 ? '她最近遇到的开心事' : '她遇到的一些困扰'}。`,
                `我${Math.random() > 0.5 ? '安慰了她' : '为她感到高兴'}，我们的友谊又加深了。`,
                `分开的时候，我们约定${Math.random() > 0.5 ? '下次再一起出来' : '一起去看新上映的电影'}。`
            ],
            challenge_faced: [
                `今天遇到了一个${Math.random() > 0.5 ? '学习' : '生活'}上的小挑战。`,
                `一开始我觉得${Math.random() > 0.5 ? '有点困难，不知道怎么办' : '很有压力，想放弃'}。`,
                `但是我想起${Math.random() > 0.5 ? '妈妈说的话' : '自己的梦想'}，决定坚持下去。`,
                `我${Math.random() > 0.5 ? '查资料' : '请教朋友'}，终于找到了解决办法。`,
                `完成的时候，我觉得${Math.random() > 0.5 ? '很有成就感' : '学到了很多，成长了'}。`
            ],
            dream_reflection: [
                `晚上躺在床上，我开始${Math.random() > 0.5 ? '思考自己的未来' : '回忆今天的事情'}。`,
                `我想起了自己的梦想：${character.background.dreams}。`,
                `有时候我会担心${Math.random() > 0.5 ? '自己不够努力' : '梦想太遥远'}。`,
                `但是我知道${Math.random() > 0.5 ? '只要坚持' : '一步一步来'}，总会实现的。`,
                `想着想着，我觉得${Math.random() > 0.5 ? '充满了动力' : '对未来充满了希望'}，慢慢进入了梦乡。`
            ]
        };
        
        const contentOptions = templates[story.templateId] || templates.hobby_activity;
        return contentOptions[Math.floor(Math.random() * contentOptions.length)];
    },

    // 获取当前故事
    getCurrentStories: function() {
        const data = this.load();
        return data.storySystem.currentStories;
    },

    // 获取已完成故事
    getCompletedStories: function() {
        const data = this.load();
        return data.storySystem.completedStories;
    },

    // 初始化故事系统
    initStorySystem: function() {
        // 启动故事生成定时器
        setInterval(() => {
            const data = this.load();
            if (Math.random() < data.storySystem.config.eventProbability) {
                this.generateStory();
            }
        }, data.storySystem.config.storyInterval);
    },

    // 获取故事上下文
    getStoryContext: function() {
        const data = this.load();
        const currentStories = data.storySystem.currentStories;
        
        if (currentStories.length === 0) {
            return '';
        }
        
        let context = '\n你当前正在经历的事情：\n';
        currentStories.forEach((story, index) => {
            context += `${index + 1}. ${story.title} - ${story.content[story.content.length - 1] || '开始了新的经历'}\n`;
        });
        
        return context;
    },

    // 动态演化系统方法
    
    // 记录交互
    recordInteraction: function() {
        const data = this.load();
        data.evolutionSystem.currentState.totalInteractions += 1;
        this.save(data);
    },

    // 记录故事完成
    recordStoryCompletion: function() {
        const data = this.load();
        data.evolutionSystem.currentState.totalStories += 1;
        this.save(data);
    },

    // 执行演化
    performEvolution: function() {
        const data = this.load();
        const evolutionSystem = data.evolutionSystem;
        
        // 检查是否满足演化条件
        if (evolutionSystem.currentState.totalInteractions < evolutionSystem.config.minInteractionsForEvolution) {
            return null;
        }
        
        // 计算上次演化到现在的时间
        const lastEvolution = new Date(evolutionSystem.currentState.lastEvolution);
        const now = new Date();
        const timeSinceEvolution = now - lastEvolution;
        
        if (timeSinceEvolution < evolutionSystem.config.evolutionInterval) {
            return null;
        }
        
        // 计算能力成长
        const growth = this.calculateGrowth(evolutionSystem);
        
        // 更新能力值
        Object.keys(evolutionSystem.abilities).forEach(ability => {
            evolutionSystem.abilities[ability] = Math.min(100, evolutionSystem.abilities[ability] + growth[ability]);
        });
        
        // 记录演化
        const evolutionRecord = {
            timestamp: now.toISOString(),
            version: `1.${parseInt(evolutionSystem.currentState.version.split('.')[1]) + 1}`,
            interactions: evolutionSystem.currentState.totalInteractions,
            stories: evolutionSystem.currentState.totalStories,
            abilityChanges: growth,
            abilities: { ...evolutionSystem.abilities }
        };
        
        evolutionSystem.evolutionTrail.push(evolutionRecord);
        evolutionSystem.currentState.version = evolutionRecord.version;
        evolutionSystem.currentState.lastEvolution = now.toISOString();
        
        // 重置计数器
        evolutionSystem.currentState.totalInteractions = 0;
        evolutionSystem.currentState.totalStories = 0;
        
        this.save(data);
        return evolutionRecord;
    },

    // 计算能力成长
    calculateGrowth: function(evolutionSystem) {
        const baseGrowth = evolutionSystem.config.growthRate;
        const interactions = evolutionSystem.currentState.totalInteractions;
        const stories = evolutionSystem.currentState.totalStories;
        
        // 根据交互和故事数量计算成长
        const growth = {
            emotionalIntelligence: baseGrowth * (interactions * 0.6 + stories * 0.4),
            memoryCapacity: baseGrowth * (interactions * 0.5 + stories * 0.5),
            creativity: baseGrowth * (interactions * 0.3 + stories * 0.7),
            adaptability: baseGrowth * (interactions * 0.7 + stories * 0.3),
            socialSkills: baseGrowth * (interactions * 0.8 + stories * 0.2)
        };
        
        return growth;
    },

    // 初始化演化系统
    initEvolutionSystem: function() {
        // 启动演化检查定时器
        setInterval(() => {
            this.performEvolution();
        }, 3600000); // 每小时检查一次
    },

    // 获取演化状态
    getEvolutionState: function() {
        const data = this.load();
        return data.evolutionSystem;
    },

    // 获取能力值
    getAbilities: function() {
        const data = this.load();
        return data.evolutionSystem.abilities;
    },

    // 存档系统方法

    // 创建存档
    saveGame: function(description = '') {
        const data = this.load();
        const now = new Date();
        
        const savePoint = {
            id: Date.now(),
            timestamp: now.toISOString(),
            description: description || `存档 ${now.toLocaleString('zh-CN')}`,
            // 保存的内容
            messages: JSON.parse(JSON.stringify(data.messages)),
            character: JSON.parse(JSON.stringify(data.character)),
            memoryLayers: JSON.parse(JSON.stringify(data.memoryLayers)),
            evolutionSystem: JSON.parse(JSON.stringify(data.evolutionSystem)),
            storySystem: JSON.parse(JSON.stringify(data.storySystem)),
            recalledMessages: JSON.parse(JSON.stringify(data.recalledMessages)),
            relationship: JSON.parse(JSON.stringify(data.relationship)),
            userInfo: JSON.parse(JSON.stringify(data.userInfo)),
            habits: JSON.parse(JSON.stringify(data.habits)),
            // 存档信息
            messageCount: data.messages.length
        };
        
        // 添加到存档列表
        data.savePoints.unshift(savePoint);
        
        // 限制存档数量
        if (data.savePoints.length > data.maxSavePoints) {
            data.savePoints = data.savePoints.slice(0, data.maxSavePoints);
        }
        
        this.save(data);
        return savePoint;
    },

    // 获取存档列表
    getSavePoints: function() {
        const data = this.load();
        return data.savePoints;
    },

    // 加载存档
    loadSavePoint: function(savePointId) {
        const data = this.load();
        const savePoint = data.savePoints.find(sp => sp.id === savePointId);
        
        if (!savePoint) {
            return null;
        }
        
        return savePoint;
    },

    // 回退到存档
    rollbackToSavePoint: function(savePointId) {
        const data = this.load();
        const savePoint = data.savePoints.find(sp => sp.id === savePointId);
        
        if (!savePoint) {
            return false;
        }
        
        // 恢复数据
        data.messages = savePoint.messages;
        data.character = savePoint.character;
        data.memoryLayers = savePoint.memoryLayers;
        data.evolutionSystem = savePoint.evolutionSystem;
        data.storySystem = savePoint.storySystem;
        data.recalledMessages = savePoint.recalledMessages;
        data.relationship = savePoint.relationship;
        data.userInfo = savePoint.userInfo;
        data.habits = savePoint.habits;
        
        this.save(data);
        return true;
    },

    // 删除存档
    deleteSavePoint: function(savePointId) {
        const data = this.load();
        data.savePoints = data.savePoints.filter(sp => sp.id !== savePointId);
        this.save(data);
        return true;
    },

    // 快速存档（自动描述）
    quickSave: function() {
        const messages = this.getMessages();
        const lastMessage = messages[messages.length - 1];
        const description = lastMessage 
            ? `快速存档 - ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
            : '快速存档';
        return this.saveGame(description);
    }
};
