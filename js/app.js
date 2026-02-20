const App = {
    isSending: false,

    init: function() {
        this.loadSettings();
        this.loadMessages();
        this.bindEvents();
        this.setupScrollEffects();
        this.initMemoryReview();
        // 初始化记忆管理系统
        Memory.initMemoryManagement();
        // 初始化故事系统
        Memory.initStorySystem();
        // 初始化演化系统
        Memory.initEvolutionSystem();
        // 确保设置模态框在初始化时是隐藏的
        UI.hideModal('settingsModal');
    },

    loadSettings: function() {
        const settings = Memory.getSettings();

        document.getElementById('apiKey').value = settings.apiKey || '';
        document.getElementById('modelSelect').value = settings.model || 'deepseek-chat';
        document.getElementById('charNameInput').value = settings.charName || '小雪';
        document.getElementById('personalitySelect').value = settings.personality || 'gentle';
        document.getElementById('styleSelect').value = settings.style || 'sweet';
        document.getElementById('userNameInput').value = settings.userName || '亲爱的';
        document.getElementById('themeSelect').value = settings.theme || 'blue';
        document.getElementById('ttsEnabled').checked = settings.ttsEnabled !== false;
        document.getElementById('ttsRate').value = settings.ttsRate || 1.0;
        document.getElementById('ttsRateValue').textContent = (settings.ttsRate || 1.0) + 'x';

        UI.applyTheme(settings.theme || 'blue');
        UI.updateCharName(settings.charName || '小雪');
    },

    loadMessages: function() {
        const messages = Memory.getMessages();
        if (messages.length > 0) {
            UI.renderMessages(messages);
        }
    },

    bindEvents: function() {
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettings = document.getElementById('closeSettings');
        const saveSettings = document.getElementById('saveSettings');
        const themeSelect = document.getElementById('themeSelect');
        const ttsRate = document.getElementById('ttsRate');

        sendBtn.addEventListener('click', () => this.sendMessage());

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        settingsBtn.addEventListener('click', () => {
            UI.showModal('settingsModal');
        });

        closeSettings.addEventListener('click', () => {
            UI.hideModal('settingsModal');
        });

        saveSettings.addEventListener('click', () => this.saveSettings());

        themeSelect.addEventListener('change', (e) => {
            UI.applyTheme(e.target.value);
        });

        ttsRate.addEventListener('input', (e) => {
            document.getElementById('ttsRateValue').textContent = e.target.value + 'x';
        });

        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                UI.hideModal('settingsModal');
            }
        });

        // 初始化UI事件监听器
        UI.initEventListeners();
    },

    setupScrollEffects: function() {
        const chatContainer = document.getElementById('chatContainer');
        const header = document.querySelector('.header');

        chatContainer.addEventListener('scroll', () => {
            if (chatContainer.scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    },

    // 初始化记忆复习机制
    initMemoryReview: function() {
        // 检查是否需要复习
        this.checkMemoryReview();
        
        // 每小时检查一次
        setInterval(() => this.checkMemoryReview(), 60 * 60 * 1000);
    },

    // 检查记忆复习
    checkMemoryReview: function() {
        const lastReview = localStorage.getItem('last_memory_review');
        const now = new Date();
        
        // 如果今天还没有复习，或者已经过了一天
        if (!lastReview || new Date(lastReview).toDateString() !== now.toDateString()) {
            this.performMemoryReview();
            localStorage.setItem('last_memory_review', now.toISOString());
        }
    },

    // 执行记忆复习
    performMemoryReview: function() {
        const messagesForReview = Memory.getMessagesForReview();
        if (messagesForReview.length > 0) {
            // 在控制台记录复习内容
            console.log('📝 开始记忆复习:', messagesForReview);
            
            // 复习每条记忆
            messagesForReview.forEach(msg => {
                Memory.reviewMessage(msg.id);
            });
            
            // 可以在这里添加主动对话，提及复习的内容
            // 例如：根据复习的记忆内容，生成一个相关的问题或话题
        }
    },

    sendMessage: async function() {
        if (this.isSending) return;

        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message) return;

        const settings = Memory.getSettings();
        if (!settings.apiKey) {
            UI.showToast('请先在设置中配置 DeepSeek API 密钥', 'error');
            UI.showModal('settingsModal');
            return;
        }

        this.isSending = true;
        document.getElementById('sendBtn').disabled = true;
        input.value = '';
        input.style.height = 'auto';
        
        // 记录交互
        Memory.recordInteraction();

        const userMsg = Memory.addMessage({ role: 'user', content: message });
        const msgElement = UI.createMessageElement(userMsg);
        document.getElementById('messages').appendChild(msgElement);
        UI.scrollToBottom();

        UI.showTyping();

        try {
            let typingElement = document.getElementById('typingIndicator');

            await API.sendMessage(message, (content) => {
                if (!typingElement) {
                    typingElement = document.createElement('div');
                    typingElement.className = 'message ai';
                    typingElement.id = 'typingIndicator';
                    document.getElementById('messages').appendChild(typingElement);
                }
                typingElement.innerHTML = '';
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.innerHTML = `<span class="text">${content}</span><button class="tts-btn" title="朗读">🔊</button>`;
                typingElement.appendChild(bubble);
                UI.scrollToBottom();
            });

            const messages = Memory.getMessages();
            const lastMsg = messages[messages.length - 1];
            const msgElement = UI.createMessageElement(lastMsg);
            
            if (typingElement) {
                typingElement.replaceWith(msgElement);
            } else {
                document.getElementById('messages').appendChild(msgElement);
            }

            UI.scrollToBottom();

        } catch (error) {
            UI.hideTyping();
            UI.showToast(error.message || '发送失败，请重试', 'error');
            console.error('发送消息失败:', error);
        }

        this.isSending = false;
        document.getElementById('sendBtn').disabled = false;
        input.focus();
    },

    saveSettings: function() {
        const settings = {
            apiKey: document.getElementById('apiKey').value.trim(),
            model: document.getElementById('modelSelect').value,
            charName: document.getElementById('charNameInput').value.trim() || '小雪',
            personality: document.getElementById('personalitySelect').value,
            style: document.getElementById('styleSelect').value,
            userName: document.getElementById('userNameInput').value.trim() || '亲爱的',
            theme: document.getElementById('themeSelect').value,
            ttsEnabled: document.getElementById('ttsEnabled').checked,
            ttsRate: parseFloat(document.getElementById('ttsRate').value)
        };

        Memory.saveSettings(settings);
        UI.applyTheme(settings.theme);
        UI.updateCharName(settings.charName);
        UI.hideModal('settingsModal');
        UI.showToast('设置已保存', 'success');
    },

    showHistory: function() {
        const messages = Memory.getMessages();
        const historyList = document.getElementById('historyList');

        if (messages.length === 0) {
            historyList.innerHTML = '<p class="empty-tip">暂无历史记录</p>';
            return;
        }

        let html = '';
        messages.slice().reverse().forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            const roleLabel = msg.role === 'user' ? '我' : '她';
            const roleClass = msg.role === 'user' ? 'user-msg' : 'ai-msg';
            const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
            
            html += `
                <div class="history-item ${roleClass}" data-id="${msg.id}" onclick="App.showFullMessage(${msg.id})">
                    <div class="msg-header">
                        <span class="role">${roleLabel}</span>
                        <span class="time">${time}</span>
                    </div>
                    <div class="preview">${preview}</div>
                </div>
            `;
        });

        historyList.innerHTML = html;
    },

    showFullMessage: function(msgId) {
        const messages = Memory.getMessages();
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        const time = new Date(msg.timestamp).toLocaleString('zh-CN');
        const roleLabel = msg.role === 'user' ? '我' : '她';

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'messageDetailModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>${roleLabel} · ${time}</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="full-message">${msg.content}</div>
                    ${msg.recalled ? '<div class="recalled-tag">此消息已被标记为撤回</div>' : ''}
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    },

    searchHistory: function(keyword) {
        if (!keyword.trim()) {
            this.showHistory();
            return;
        }

        const results = Memory.searchMessages(keyword);
        const historyList = document.getElementById('historyList');

        if (results.length === 0) {
            historyList.innerHTML = '<p class="empty-tip">未找到相关记录</p>';
            return;
        }

        let html = '';
        results.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            const roleLabel = msg.role === 'user' ? '我' : '她';
            const roleClass = msg.role === 'user' ? 'user-msg' : 'ai-msg';
            const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
            
            html += `
                <div class="history-item ${roleClass}" data-id="${msg.id}" onclick="App.showFullMessage(${msg.id})">
                    <div class="msg-header">
                        <span class="role">${roleLabel}</span>
                        <span class="time">${time}</span>
                    </div>
                    <div class="preview">${preview}</div>
                </div>
            `;
        });

        historyList.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
