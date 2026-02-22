const API = {
    BASE_URL: 'https://api.deepseek.com',
    abortController: null,
    currentReader: null,

    abort: function() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        if (this.currentReader) {
            this.currentReader.cancel();
            this.currentReader = null;
        }
    },

    sendMessage: async function(userMessage, onStream, isContinue = false) {
        const settings = Memory.getSettings();

        if (!settings.apiKey) {
            throw new Error('请先在设置中配置 DeepSeek API 密钥');
        }

        if (!isContinue) {
            Memory.addMessage({
                role: 'user',
                content: userMessage
            });
        }

        const recentMessages = Memory.getRecentContext(100);
        let systemPrompt = Memory.buildEnhancedContext(recentMessages, userMessage);
        
        // 如果是继续对话，添加特殊提示
        if (isContinue) {
            systemPrompt += '\n\n【继续对话提示】\n用户希望你继续说话。请主动发起话题、分享你的想法、或者延续之前的对话。可以是：\n- 分享你今天的心情或经历\n- 询问用户的情况\n- 提出一个有趣的话题\n- 继续之前未说完的内容\n\n请自然地开始说话，不要说"好的我继续"之类的话。';
        }

        const multiMessageCount = parseInt(settings.multiMessageCount || '3');
        let multiMessageGuide = '';
        if (multiMessageCount > 1) {
            multiMessageGuide = `

【消息格式要求】
你可以一次发送最多${multiMessageCount}条消息，用"|||"分隔。

【严格限制】
- 最多${multiMessageCount}条消息，不能超过！

【示例】
- 单条：你好呀~
- 两条：[笑了笑]|||你好呀~
- 三条：在干嘛？|||想你了|||嘿嘿~

【注意】
- 每条消息简短（不超过30字）
- 场景描述用[]包裹`;
        }

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
            { role: 'system', content: systemPrompt + emotionInfo + multiMessageGuide },
            ...importantContext,
            ...recentMessages
        ];

        try {
            this.abortController = new AbortController();
            
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
                }),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API 请求失败');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let lastContent = '';
            let repeatCount = 0;
            const MAX_REPEATS = 3;
            const MAX_LENGTH = 2000;

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
                                if (content === lastContent) {
                                    repeatCount++;
                                    if (repeatCount >= MAX_REPEATS) {
                                        break;
                                    }
                                } else {
                                    repeatCount = 0;
                                    lastContent = content;
                                }
                                fullContent += content;
                                if (fullContent.length > MAX_LENGTH) {
                                    break;
                                }
                                if (onStream) {
                                    onStream(fullContent);
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
                
                if (repeatCount >= MAX_REPEATS || fullContent.length > MAX_LENGTH) {
                    break;
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

        const recentMessages = Memory.getRecentContext(100);
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
