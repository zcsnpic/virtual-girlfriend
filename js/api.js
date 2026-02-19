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

        const systemPrompt = Memory.buildMemoryContext();
        const recentMessages = Memory.getRecentContext(10);

        const messages = [
            { role: 'system', content: systemPrompt },
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

        const systemPrompt = Memory.buildMemoryContext();
        const recentMessages = Memory.getRecentContext(10);

        const messages = [
            { role: 'system', content: systemPrompt },
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
    }
};
