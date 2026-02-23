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

        // 只有非继续对话时才添加用户消息
        if (!isContinue) {
            Memory.addMessage({
                role: 'user',
                content: userMessage
            });

            // 智能判断消息重要性
            const importantKeywords = {
                high: ['名字', '生日', '职业', '爱好', '喜欢', '讨厌', '重要', '纪念日', '结婚', '分手', '告白', '第一次', '永远', '承诺', '约定'],
                medium: ['记得', '忘记', '知道', '了解', '认识', '朋友', '家人', '工作', '学校', '公司', '住', '地址', '电话', '号码', '微信', 'QQ', '邮箱'],
                low: ['今天', '昨天', '明天', '周末', '假期', '计划', '想', '希望', '梦想', '目标', '心情', '感觉', '开心', '难过', '生气']
            };
            
            const checkImportance = (message) => {
                const lowerMessage = message.toLowerCase();
                const highMatch = importantKeywords.high.some(kw => lowerMessage.includes(kw));
                const mediumMatch = importantKeywords.medium.some(kw => lowerMessage.includes(kw));
                const lowMatch = importantKeywords.low.some(kw => lowerMessage.includes(kw));
                
                if (highMatch) return 3;
                if (mediumMatch) return 2;
                if (lowMatch) return 1;
                return 0;
            };
            
            const userImportance = checkImportance(userMessage);
            if (userImportance >= 2) {
                const messages = Memory.getMessages();
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.role === 'user') {
                    Memory.markAsImportant(lastMessage.id);
                }
            }
        }

        const recentMessages = Memory.getRecentContext(100);
        let systemPrompt = Memory.buildEnhancedContext(recentMessages, userMessage);
        
        // 如果是继续对话（空输入），添加特殊提示
        if (isContinue) {
            systemPrompt += '\n\n【继续对话提示】\n用户没有输入具体内容，希望你主动说话。请根据对话上下文自然地回应，可以是：\n- 回应用户之前的话题\n- 分享你的想法或感受\n- 提出一个新的话题\n\n注意：不要重复之前说过的内容，保持对话的新鲜感。';
        }

        const multiMessageCount = parseInt(settings.multiMessageCount || '3');
        let multiMessageGuide = '';
        if (multiMessageCount > 1) {
            multiMessageGuide = `

【消息格式要求 - 非常重要】
请务必发送 ${multiMessageCount} 条消息，让对话更自然真实。
每条消息之间用三个竖线"|||"分隔。

【拆分消息的时机】
以下情况应该拆分成多条消息：
1. **场景动作与说话分开**：先描述动作，再说话
   例如："[轻轻笑了笑]|||你今天看起来心情不错呢~"
   
2. **多个场景动作**：每个场景动作单独一条
   例如："[双手托腮]|||嗯...|||让我想想|||[眼睛一亮]|||有主意了！"

3. **情感/话题转换**：当情绪或话题发生变化时拆分
   例如："今天好累呀~|||不过看到你消息就好开心|||你呢？今天过得怎么样？"

4. **强调效果**：想要强调某些内容时单独发送
   例如："告诉你一个秘密|||...|||其实我一直都在想你 😊"

【格式示例】
好的例子（${multiMessageCount}条消息）：
- "在干嘛呢？|||今天天气真好呀~|||我刚刚在想你呢 😊|||你呢？|||有什么有趣的事吗？|||想听听你的故事~|||嗯嗯|||我在听呢"
- "[微微脸红]|||那个...|||其实我想说...|||算了没什么啦~|||不对|||还是说吧|||其实我...|||算了下次再说"

不好的例子：
- 一条很长的消息包含所有内容
- 只发送1-2条消息（除非设置值为1）

【注意事项】
- 必须发送接近 ${multiMessageCount} 条消息，用|||分隔
- 每条消息应该简短自然（一般不超过30字）
- 场景描述用方括号[]包裹，如[轻轻笑了笑]
- 分隔符"|||"只用于分割消息，不要在其他地方使用`;
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
