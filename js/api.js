const API = {
    BASE_URL: 'https://api.deepseek.com',

    sendMessage: async function(userMessage, onStream) {
        const settings = Memory.getSettings();

        if (!settings.apiKey) {
            throw new Error('请先在设置中配置 DeepSeek API 密钥');
        }

        Memory.addMessage({
            role: 'user',
            content: userMessage
        });

        // 标记用户消息为重要（如果包含个人信息或重要事件）
        const importantKeywords = ['名字', '生日', '职业', '爱好', '喜欢', '讨厌', '重要', '纪念日', '生日'];
        const isImportant = importantKeywords.some(keyword => 
            userMessage.toLowerCase().includes(keyword)
        );

        if (isImportant) {
            const messages = Memory.getMessages();
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'user') {
                Memory.markAsImportant(lastMessage.id);
            }
        }

        const recentMessages = Memory.getRecentContext(10);
        const systemPrompt = Memory.buildEnhancedContext(recentMessages, userMessage);

        // 获取重要记忆
        const importantMessages = Memory.getImportantMessages(5);
        const importantContext = importantMessages.map(m => ({
            role: m.role,
            content: m.content
        }));
        
        // 获取角色当前情感状态
        const currentEmotion = Memory.getCharacterEmotion();
        const moodMap = {
            'happy': '开心',
            'sad': '难过',
            'angry': '生气',
            'anxious': '焦虑',
            'calm': '平静',
            'excited': '兴奋'
        };
        
        // 在系统提示中添加情感状态信息
        const emotionInfo = `\n你当前的情绪状态：${moodMap[currentEmotion.currentMood]}，请在回复中体现出这种情绪。`;

        // 添加用户消息到记忆系统
        Memory.addMemory(userMessage, recentMessages, { type: 'user_input' });
        
        // 分析用户消息对角色情感的影响
        const emotionImpact = this.analyzeEmotionImpact(userMessage);
        if (emotionImpact) {
            const currentEmotion = Memory.getCharacterEmotion();
            const updatedEmotion = {
                currentMood: emotionImpact.mood || currentEmotion.currentMood,
                emotionalState: {
                    ...currentEmotion.emotionalState,
                    happiness: Math.max(0, Math.min(100, currentEmotion.emotionalState.happiness + (emotionImpact.happinessChange || 0))),
                    energy: Math.max(0, Math.min(100, currentEmotion.emotionalState.energy + (emotionImpact.energyChange || 0))),
                    stress: Math.max(0, Math.min(100, currentEmotion.emotionalState.stress + (emotionImpact.stressChange || 0)))
                }
            };
            Memory.updateCharacterEmotion(updatedEmotion);
        }

        const messages = [
            { role: 'system', content: systemPrompt + emotionInfo },
            ...importantContext,
            ...recentMessages
        ];

        try {
            const response = await fetch(`${this.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API 请求失败');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullContent += content;
                                if (onStream) {
                                    onStream(fullContent);
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }

            Memory.addMessage({
                role: 'assistant',
                content: fullContent
            });

            return fullContent;

        } catch (error) {
            console.error('API 调用失败:', error);
            throw error;
        }
    },

    sendMessageWithoutStream: async function(userMessage) {
        const settings = Memory.getSettings();

        if (!settings.apiKey) {
            throw new Error('请先在设置中配置 DeepSeek API 密钥');
        }

        Memory.addMessage({
            role: 'user',
            content: userMessage
        });

        const recentMessages = Memory.getRecentContext(10);
        const systemPrompt = Memory.buildEnhancedContext(recentMessages, userMessage);

        // 添加用户消息到记忆系统
        Memory.addMemory(userMessage, recentMessages, { type: 'user_input' });
        
        // 分析用户消息对角色情感的影响
        const emotionImpact = this.analyzeEmotionImpact(userMessage);
        if (emotionImpact) {
            const currentEmotion = Memory.getCharacterEmotion();
            const updatedEmotion = {
                currentMood: emotionImpact.mood || currentEmotion.currentMood,
                emotionalState: {
                    ...currentEmotion.emotionalState,
                    happiness: Math.max(0, Math.min(100, currentEmotion.emotionalState.happiness + (emotionImpact.happinessChange || 0))),
                    energy: Math.max(0, Math.min(100, currentEmotion.emotionalState.energy + (emotionImpact.energyChange || 0))),
                    stress: Math.max(0, Math.min(100, currentEmotion.emotionalState.stress + (emotionImpact.stressChange || 0)))
                }
            };
            Memory.updateCharacterEmotion(updatedEmotion);
        }

        // 获取角色当前情感状态
        const currentEmotion = Memory.getCharacterEmotion();
        const moodMap = {
            'happy': '开心',
            'sad': '难过',
            'angry': '生气',
            'anxious': '焦虑',
            'calm': '平静',
            'excited': '兴奋'
        };
        
        // 在系统提示中添加情感状态信息
        const emotionInfo = `\n你当前的情绪状态：${moodMap[currentEmotion.currentMood]}，请在回复中体现出这种情绪。`;

        const messages = [
            { role: 'system', content: systemPrompt + emotionInfo },
            ...recentMessages
        ];

        try {
            const response = await fetch(`${this.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: messages,
                    stream: false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API 请求失败');
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            Memory.addMessage({
                role: 'assistant',
                content: content
            });

            return content;

        } catch (error) {
            console.error('API 调用失败:', error);
            throw error;
        }
    },

    testConnection: async function(apiKey) {
        try {
            const response = await fetch(`${this.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: '你好' }],
                    max_tokens: 10
                })
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    },

    // 分析用户消息对情感的影响
    analyzeEmotionImpact: function(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // 正面情感词汇
        const positiveWords = ['开心', '快乐', '高兴', '喜欢', '爱', '好', '棒', '优秀', '成功', '幸福', '谢谢', '感谢'];
        // 负面情感词汇
        const negativeWords = ['难过', '伤心', '生气', '讨厌', '恨', '坏', '差', '失败', '痛苦', '烦恼', '焦虑', '压力'];
        // 中性情感词汇
        const neutralWords = ['今天', '明天', '昨天', '天气', '吃饭', '睡觉', '工作', '学习', '朋友', '家人'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        // 计算情感词汇出现次数
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) negativeCount++;
        });
        
        // 分析情感影响
        if (positiveCount > negativeCount) {
            return {
                mood: 'happy',
                happinessChange: positiveCount * 5,
                energyChange: positiveCount * 3,
                stressChange: -positiveCount * 2
            };
        } else if (negativeCount > positiveCount) {
            return {
                mood: 'sad',
                happinessChange: -negativeCount * 5,
                energyChange: -negativeCount * 3,
                stressChange: negativeCount * 4
            };
        } else {
            // 中性消息
            return {
                mood: 'calm',
                happinessChange: 0,
                energyChange: 0,
                stressChange: 0
            };
        }
    }
};
