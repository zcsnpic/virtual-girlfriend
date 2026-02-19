const UI = {
    formatTime: function(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) {
            return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) +
                   ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
    },

    createMessageElement: function(message) {
        const div = document.createElement('div');
        div.className = `message ${message.role === 'user' ? 'user' : 'ai'}`;
        if (message.recalled) {
            div.classList.add('recalled');
        }
        div.dataset.id = message.id;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const text = document.createElement('span');
        text.className = 'text';
        text.textContent = message.content;

        bubble.appendChild(text);

        if (message.role === 'assistant') {
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-btn';
            ttsBtn.textContent = '🔊';
            ttsBtn.title = '朗读';
            ttsBtn.onclick = () => {
                TTS.toggle(message.content);
            };
            bubble.appendChild(ttsBtn);
        }

        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = this.formatTime(message.timestamp);

        div.appendChild(bubble);
        div.appendChild(time);

        return div;
    },

    createTypingIndicator: function() {
        const div = document.createElement('div');
        div.className = 'message ai typing';
        div.id = 'typingIndicator';

        const bubble = document.createElement('div');
        bubble.className = 'bubble typing-indicator';
        bubble.innerHTML = '<span></span><span></span><span></span>';

        div.appendChild(bubble);
        return div;
    },

    scrollToBottom: function() {
        const container = document.getElementById('chatContainer');
        container.scrollTop = container.scrollHeight;
    },

    showTyping: function() {
        const messages = document.getElementById('messages');
        const existing = document.getElementById('typingIndicator');
        if (!existing) {
            messages.appendChild(this.createTypingIndicator());
            this.scrollToBottom();
        }
    },

    hideTyping: function() {
        const typing = document.getElementById('typingIndicator');
        if (typing) {
            typing.remove();
        }
    },

    updateTypingContent: function(content) {
        const typing = document.getElementById('typingIndicator');
        if (typing) {
            typing.classList.remove('typing');
            const bubble = typing.querySelector('.bubble');
            bubble.classList.remove('typing-indicator');
            bubble.innerHTML = `<span class="text">${content}</span><button class="tts-btn" title="朗读">🔊</button>`;
        }
    },

    renderMessages: function(messages) {
        const container = document.getElementById('messages');
        container.innerHTML = '';

        messages.forEach(msg => {
            container.appendChild(this.createMessageElement(msg));
        });

        this.scrollToBottom();
    },

    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },

    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    showToast: function(message, type) {
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type || 'info'}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#333'};
            color: white;
            z-index: 2000;
            animation: fadeIn 0.3s;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    updateCharName: function(name) {
        document.getElementById('charName').textContent = name;
    }
};
