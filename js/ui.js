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
        if (message.important) {
            div.classList.add('important');
        }
        div.dataset.id = message.id;
        div.dataset.messageId = message.id;

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

        if (message.important) {
            const memoryIndicator = document.createElement('span');
            memoryIndicator.className = 'memory-indicator';
            memoryIndicator.textContent = '⭐';
            memoryIndicator.title = '重要记忆';
            bubble.appendChild(memoryIndicator);
        }

        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = this.formatTime(message.timestamp);

        div.appendChild(bubble);
        div.appendChild(time);

        // 添加长按事件
        this.addLongPressEvent(div);

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
    },

    // 长按事件处理
    addLongPressEvent: function(element) {
        let longPressTimer;
        
        element.addEventListener('mousedown', function(e) {
            longPressTimer = setTimeout(() => {
                UI.showLongPressMenu(e, element);
            }, 500);
        });
        
        element.addEventListener('mouseup', function() {
            clearTimeout(longPressTimer);
        });
        
        element.addEventListener('mouseleave', function() {
            clearTimeout(longPressTimer);
        });
        
        // 触摸设备支持
        element.addEventListener('touchstart', function(e) {
            longPressTimer = setTimeout(() => {
                UI.showLongPressMenu(e, element);
            }, 500);
        });
        
        element.addEventListener('touchend', function() {
            clearTimeout(longPressTimer);
        });
        
        element.addEventListener('touchcancel', function() {
            clearTimeout(longPressTimer);
        });
    },

    // 显示长按菜单
    showLongPressMenu: function(e, element) {
        e.preventDefault();
        
        // 高亮显示被长按的消息
        element.classList.add('long-press-highlight');
        setTimeout(() => {
            element.classList.remove('long-press-highlight');
        }, 500);
        
        const menu = document.getElementById('longPressMenu');
        const rect = element.getBoundingClientRect();
        
        // 定位菜单
        menu.style.left = `${e.clientX || rect.left + rect.width / 2}px`;
        menu.style.top = `${e.clientY || rect.bottom}px`;
        menu.classList.add('active');
        
        // 存储当前选中的消息元素
        menu.dataset.selectedElement = element.dataset.messageId;
        
        // 点击外部关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(event) {
                if (!menu.contains(event.target) && event.target !== element) {
                    menu.classList.remove('active');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    },

    // 初始化长按菜单事件
    initLongPressMenu: function() {
        const menu = document.getElementById('longPressMenu');
        
        menu.addEventListener('click', function(e) {
            const action = e.target.dataset.action;
            if (action) {
                const messageId = menu.dataset.selectedElement;
                UI.handleLongPressAction(action, messageId);
                menu.classList.remove('active');
            }
        });
    },

    // 处理长按菜单操作
    handleLongPressAction: function(action, messageId) {
        switch (action) {
            case 'add-to-memory':
                this.addToMemory(messageId);
                break;
            case 'view-details':
                this.viewMessageDetails(messageId);
                break;
            case 'copy':
                this.copyMessageContent(messageId);
                break;
            case 'delete':
                this.deleteMessage(messageId);
                break;
        }
    },

    // 添加到记忆
    addToMemory: function(messageId) {
        // 调用Memory模块的方法标记消息为重要
        const success = Memory.markAsImportant(messageId);
        if (success) {
            this.showToast('已添加到永久记忆', 'success');
            // 为消息添加记忆标识
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement && !messageElement.querySelector('.memory-indicator')) {
                const bubble = messageElement.querySelector('.bubble');
                if (bubble) {
                    const memoryIndicator = document.createElement('span');
                    memoryIndicator.className = 'memory-indicator';
                    memoryIndicator.textContent = '⭐';
                    memoryIndicator.title = '重要记忆';
                    bubble.appendChild(memoryIndicator);
                }
            }
        } else {
            this.showToast('添加记忆失败', 'error');
        }
    },

    // 查看消息详情
    viewMessageDetails: function(messageId) {
        this.showToast('查看消息详情', 'info');
    },

    // 复制消息内容
    copyMessageContent: function(messageId) {
        const message = document.querySelector(`[data-message-id="${messageId}"]`);
        if (message) {
            const text = message.querySelector('.text').textContent;
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('已复制到剪贴板', 'success');
            });
        }
    },

    // 删除消息
    deleteMessage: function(messageId) {
        const message = document.querySelector(`[data-message-id="${messageId}"]`);
        if (message) {
            message.remove();
            this.showToast('消息已删除', 'success');
        }
    },

    // 初始化记忆管理界面
    initMemoryManagement: function() {
        // 标签页切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.dataset.tab;
                
                // 移除所有标签页的active状态
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // 添加当前标签页的active状态
                this.classList.add('active');
                document.getElementById(`${tab}Tab`).classList.add('active');
            });
        });

        // 保存记忆按钮
        const saveMemoryBtn = document.getElementById('saveMemory');
        if (saveMemoryBtn) {
            saveMemoryBtn.addEventListener('click', function() {
                const title = document.getElementById('memoryTitle').value;
                const content = document.getElementById('memoryContent').value;
                const category = document.getElementById('memoryCategory').value;
                
                if (title && content) {
                    UI.showToast('记忆已保存', 'success');
                    // 清空表单
                    document.getElementById('memoryTitle').value = '';
                    document.getElementById('memoryContent').value = '';
                } else {
                    UI.showToast('请填写标题和内容', 'error');
                }
            });
        }

        // 编辑和删除按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                UI.showToast('编辑记忆', 'info');
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('确定要删除这条记忆吗？')) {
                    UI.showToast('记忆已删除', 'success');
                }
            });
        });

        // 编辑个人档案按钮
        const editProfileBtn = document.querySelector('.edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                UI.showToast('编辑个人档案', 'info');
            });
        }
    },

    // 初始化事件监听器
    initEventListeners: function() {
        // 长期记忆按钮
        const memoryBtn = document.getElementById('memoryBtn');
        if (memoryBtn) {
            memoryBtn.addEventListener('click', function() {
                UI.showModal('memoryModal');
            });
        }

        // 关闭长期记忆模态框
        const closeMemoryBtn = document.getElementById('closeMemory');
        if (closeMemoryBtn) {
            closeMemoryBtn.addEventListener('click', function() {
                UI.hideModal('memoryModal');
            });
        }

        // 点击模态框外部关闭
        const memoryModal = document.getElementById('memoryModal');
        if (memoryModal) {
            memoryModal.addEventListener('click', function(e) {
                if (e.target === memoryModal) {
                    UI.hideModal('memoryModal');
                }
            });
        }

        // 初始化长按菜单
        this.initLongPressMenu();

        // 初始化记忆管理界面
        this.initMemoryManagement();
    }
};
