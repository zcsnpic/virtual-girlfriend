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

    splitMessages: function(content) {
        if (!content) return [content];
        
        let messages = [];
        
        if (content.includes('|||')) {
            messages = content.split('|||').map(s => s.trim()).filter(s => s);
        } else {
            messages = [content];
        }
        
        messages = this.splitBySceneDescriptions(messages);
        
        return messages;
    },

    splitBySceneDescriptions: function(messages) {
        const result = [];
        
        for (const msg of messages) {
            const scenePattern = /\[([^\]]+)\]/g;
            const matches = [...msg.matchAll(scenePattern)];
            
            if (matches.length <= 1) {
                result.push(msg);
                continue;
            }
            
            const parts = [];
            let lastIndex = 0;
            
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const sceneStart = match.index;
                const sceneEnd = match.index + match[0].length;
                
                if (sceneStart > lastIndex) {
                    const beforeScene = msg.substring(lastIndex, sceneStart).trim();
                    if (beforeScene) {
                        parts.push({ type: 'text', content: beforeScene });
                    }
                }
                
                parts.push({ type: 'scene', content: match[0] });
                lastIndex = sceneEnd;
            }
            
            if (lastIndex < msg.length) {
                const remaining = msg.substring(lastIndex).trim();
                if (remaining) {
                    parts.push({ type: 'text', content: remaining });
                }
            }
            
            let currentMsg = '';
            for (const part of parts) {
                if (part.type === 'scene') {
                    if (currentMsg.trim()) {
                        result.push(currentMsg.trim());
                        currentMsg = '';
                    }
                    result.push(part.content);
                } else {
                    currentMsg += part.content;
                }
            }
            if (currentMsg.trim()) {
                result.push(currentMsg.trim());
            }
        }
        
        return result.filter(s => s);
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

        // 解析消息内容
        let sceneElement = null;
        let textElement = null;
        
        if (message.role === 'assistant') {
            // AI消息：分离场景和说话内容
            const parsed = Memory.parseMessage(message.content);
            
            // 如果有场景描述，创建场景元素
            if (parsed.hasScene) {
                sceneElement = document.createElement('div');
                sceneElement.className = 'scene-description';
                sceneElement.textContent = parsed.scene;
                bubble.appendChild(sceneElement);
            }
            
            // 创建说话内容元素
            textElement = document.createElement('span');
            textElement.className = 'text';
            textElement.textContent = parsed.hasSpeech ? parsed.speech : message.content;
            bubble.appendChild(textElement);
            
            // 添加语音按钮
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-btn';
            ttsBtn.textContent = '🔊';
            ttsBtn.title = '朗读';
            ttsBtn.onclick = () => {
                TTS.toggle(message.content);
            };
            bubble.appendChild(ttsBtn);
        } else {
            // 用户消息：直接显示
            textElement = document.createElement('span');
            textElement.className = 'text';
            textElement.textContent = message.content;
            bubble.appendChild(textElement);
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
                
                // 加载对应标签页的内容
                if (tab === 'timeline') {
                    UI.loadTimelineMemory();
                } else if (tab === 'important') {
                    UI.loadImportantMemory();
                } else if (tab === 'profile') {
                    UI.loadUserProfile();
                }
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
                    // 创建新记忆
                    const newMessage = Memory.addMessage({
                        role: 'assistant',
                        content: content,
                        important: true
                    });
                    
                    UI.showToast('记忆已保存', 'success');
                    // 清空表单
                    document.getElementById('memoryTitle').value = '';
                    document.getElementById('memoryContent').value = '';
                    // 刷新记忆列表
                    UI.loadTimelineMemory();
                    UI.loadImportantMemory();
                } else {
                    UI.showToast('请填写标题和内容', 'error');
                }
            });
        }

        // 编辑个人档案按钮
        const editProfileBtn = document.querySelector('.edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                UI.showEditProfileModal();
            });
        }
    },
    
    // 加载时间轴记忆
    loadTimelineMemory: function() {
        const timeline = document.getElementById('memoryTimeline');
        if (!timeline) return;
        
        // 获取所有重要记忆
        const importantMessages = Memory.getImportantMessages();
        
        if (importantMessages.length === 0) {
            timeline.innerHTML = '<div class="empty-memory">暂无重要记忆</div>';
            return;
        }
        
        // 按时间分组
        const groupedMessages = this.groupMessagesByDate(importantMessages);
        
        // 生成时间轴HTML
        let html = '';
        Object.keys(groupedMessages).forEach(date => {
            html += `
                <div class="timeline-group">
                    <div class="timeline-time">${date}</div>
                    ${groupedMessages[date].map(msg => {
                        return `
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <div class="memory-card">
                                        <div class="memory-header">
                                            <span class="memory-title">${this.getMemoryTitle(msg.content)}</span>
                                            <span class="memory-indicator">⭐</span>
                                        </div>
                                        <div class="memory-body">
                                            <p>${msg.content}</p>
                                        </div>
                                        <div class="memory-footer">
                                            <button class="edit-btn" onclick="UI.editMemory(${msg.id})">编辑</button>
                                            <button class="delete-btn" onclick="UI.deleteMemory(${msg.id})">删除</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        });
        
        timeline.innerHTML = html;
    },
    
    // 加载重要记忆
    loadImportantMemory: function() {
        const importantMemories = document.getElementById('importantMemories');
        if (!importantMemories) return;
        
        // 获取所有重要记忆
        const messages = Memory.getImportantMessages();
        
        if (messages.length === 0) {
            importantMemories.innerHTML = '<div class="empty-memory">暂无重要记忆</div>';
            return;
        }
        
        // 生成重要记忆HTML
        let html = '';
        messages.forEach(msg => {
            html += `
                <div class="memory-card">
                    <div class="memory-header">
                        <span class="memory-title">${this.getMemoryTitle(msg.content)}</span>
                        <span class="memory-indicator">⭐</span>
                    </div>
                    <div class="memory-body">
                        <p>${msg.content}</p>
                    </div>
                    <div class="memory-footer">
                        <button class="edit-btn" onclick="UI.editMemory(${msg.id})">编辑</button>
                        <button class="delete-btn" onclick="UI.deleteMemory(${msg.id})">删除</button>
                    </div>
                </div>
            `;
        });
        
        importantMemories.innerHTML = html;
    },
    
    // 加载用户档案
    loadUserProfile: function() {
        const userProfile = document.getElementById('userProfile');
        if (!userProfile) return;
        
        // 获取用户信息
        const userInfo = Memory.getUserInfo();
        
        // 生成用户档案HTML
        let html = `
            <div class="profile-card">
                <div class="profile-header">
                    <h3>用户档案</h3>
                    <button class="edit-profile-btn" onclick="UI.showEditProfileModal()">编辑</button>
                </div>
                <div class="profile-body">
                    <div class="profile-item">
                        <label>姓名</label>
                        <span>${userInfo.name || '未设置'}</span>
                    </div>
                    <div class="profile-item">
                        <label>昵称</label>
                        <span>${userInfo.nickname || '未设置'}</span>
                    </div>
                    <div class="profile-item">
                        <label>生日</label>
                        <span>${userInfo.birthday || '未设置'}</span>
                    </div>
                    <div class="profile-item">
                        <label>职业</label>
                        <span>${userInfo.job || '未设置'}</span>
                    </div>
                    <div class="profile-item">
                        <label>爱好</label>
                        <span>${userInfo.hobbies && userInfo.hobbies.length > 0 ? userInfo.hobbies.join('、') : '未设置'}</span>
                    </div>
                    <div class="profile-item">
                        <label>喜欢的食物</label>
                        <span>${userInfo.favoriteFood && userInfo.favoriteFood.length > 0 ? userInfo.favoriteFood.join('、') : '未设置'}</span>
                    </div>
                </div>
            </div>
        `;
        
        userProfile.innerHTML = html;
    },
    
    // 按日期分组消息
    groupMessagesByDate: function(messages) {
        const grouped = {};
        
        messages.forEach(msg => {
            const date = new Date(msg.timestamp);
            const dateStr = this.formatDate(date);
            
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            
            grouped[dateStr].push(msg);
        });
        
        // 按日期降序排序
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            return new Date(b) - new Date(a);
        });
        
        const sortedGrouped = {};
        sortedKeys.forEach(key => {
            sortedGrouped[key] = grouped[key];
        });
        
        return sortedGrouped;
    },
    
    // 格式化日期
    formatDate: function(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return '今天';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return '昨天';
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    },
    
    // 获取记忆标题
    getMemoryTitle: function(content) {
        if (content.length <= 10) {
            return content;
        }
        return content.substring(0, 10) + '...';
    },
    
    // 编辑记忆
    editMemory: function(messageId) {
        const messages = Memory.getMessages();
        const msg = messages.find(m => m.id === messageId);
        
        if (msg) {
            const newContent = prompt('编辑记忆内容:', msg.content);
            if (newContent && newContent !== msg.content) {
                // 更新记忆内容
                const data = JSON.parse(localStorage.getItem('virtual_girlfriend_data'));
                const messageIndex = data.messages.findIndex(m => m.id === messageId);
                if (messageIndex !== -1) {
                    data.messages[messageIndex].content = newContent;
                    localStorage.setItem('virtual_girlfriend_data', JSON.stringify(data));
                    UI.showToast('记忆已更新', 'success');
                    // 刷新记忆列表
                    UI.loadTimelineMemory();
                    UI.loadImportantMemory();
                }
            }
        }
    },
    
    // 删除记忆
    deleteMemory: function(messageId) {
        if (confirm('确定要删除这条记忆吗？')) {
            // 删除记忆
            const data = JSON.parse(localStorage.getItem('virtual_girlfriend_data'));
            const messageIndex = data.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
                data.messages.splice(messageIndex, 1);
                localStorage.setItem('virtual_girlfriend_data', JSON.stringify(data));
                UI.showToast('记忆已删除', 'success');
                // 刷新记忆列表
                UI.loadTimelineMemory();
                UI.loadImportantMemory();
            }
        }
    },
    
    // 显示编辑个人档案模态框
    showEditProfileModal: function() {
        const userInfo = Memory.getUserInfo();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editProfileModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>编辑个人档案</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" id="editName" value="${userInfo.name || ''}" placeholder="请输入姓名">
                    </div>
                    <div class="form-group">
                        <label>昵称</label>
                        <input type="text" id="editNickname" value="${userInfo.nickname || ''}" placeholder="请输入昵称">
                    </div>
                    <div class="form-group">
                        <label>生日</label>
                        <input type="date" id="editBirthday" value="${userInfo.birthday || ''}">
                    </div>
                    <div class="form-group">
                        <label>职业</label>
                        <input type="text" id="editJob" value="${userInfo.job || ''}" placeholder="请输入职业">
                    </div>
                    <div class="form-group">
                        <label>爱好（用逗号分隔）</label>
                        <input type="text" id="editHobbies" value="${userInfo.hobbies && userInfo.hobbies.length > 0 ? userInfo.hobbies.join(', ') : ''}" placeholder="请输入爱好">
                    </div>
                    <div class="form-group">
                        <label>喜欢的食物（用逗号分隔）</label>
                        <input type="text" id="editFavoriteFood" value="${userInfo.favoriteFood && userInfo.favoriteFood.length > 0 ? userInfo.favoriteFood.join(', ') : ''}" placeholder="请输入喜欢的食物">
                    </div>
                    <button class="save-btn" onclick="UI.saveUserProfile()">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },
    
    // 保存用户档案
    saveUserProfile: function() {
        const name = document.getElementById('editName').value.trim();
        const nickname = document.getElementById('editNickname').value.trim();
        const birthday = document.getElementById('editBirthday').value;
        const job = document.getElementById('editJob').value.trim();
        const hobbies = document.getElementById('editHobbies').value.trim().split(',').map(h => h.trim()).filter(h => h);
        const favoriteFood = document.getElementById('editFavoriteFood').value.trim().split(',').map(f => f.trim()).filter(f => f);
        
        // 保存用户档案
        const userInfo = {
            name: name,
            nickname: nickname,
            birthday: birthday,
            job: job,
            hobbies: hobbies,
            favoriteFood: favoriteFood
        };
        
        Memory.saveUserInfo(userInfo);
        UI.showToast('个人档案已保存', 'success');
        
        // 关闭模态框
        document.getElementById('editProfileModal').remove();
        
        // 刷新用户档案
        UI.loadUserProfile();
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

        // 初始化TTS设置
        this.initTtsSettings();
    },

    updateVoiceList: function() {
        const select = document.getElementById('ttsVoice');
        const voiceSelectGroup = select?.closest('.form-group');
        if (!select) {
            console.log('ttsVoice select element not found');
            return;
        }

        const voices = TTS.getVoices();
        const settings = Memory.getSettings();

        console.log('updateVoiceList: 找到', voices.length, '个声音');

        if (voices.length === 0) {
            if (voiceSelectGroup) {
                voiceSelectGroup.style.display = 'none';
            }
            console.log('声音列表为空，隐藏声音选择器');
            return;
        }

        if (voiceSelectGroup) {
            voiceSelectGroup.style.display = '';
        }

        select.innerHTML = '<option value="auto">自动选择（推荐）</option>';

        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (settings.ttsVoice === voice.name) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        console.log('声音列表更新完成');
    },

    updateTtsApiVoiceList: function(provider) {
        const select = document.getElementById('ttsApiVoice');
        if (!select) return;

        const voices = TTSProvider.getVoices(provider);
        const settings = Memory.getSettings();

        select.innerHTML = '';

        if (voices.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '请先配置API';
            select.appendChild(option);
            return;
        }

        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.id;
            option.textContent = voice.name;
            if (settings.ttsApiVoice === voice.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    },

    updateTtsExtraConfig: function(provider) {
        const container = document.getElementById('ttsExtraConfig');
        if (!container) return;

        const extraConfig = TTSProvider.getExtraConfig(provider);
        const settings = Memory.getSettings();

        if (extraConfig.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        extraConfig.forEach(config => {
            const value = settings['tts' + config.key.charAt(0).toUpperCase() + config.key.slice(1)] || config.default || '';
            html += `
                <div class="form-group">
                    <label>${config.label}</label>
                    <input type="${config.type}" id="tts${config.key.charAt(0).toUpperCase() + config.key.slice(1)}" 
                           value="${value}" placeholder="请输入${config.label}">
                </div>
            `;
        });

        container.innerHTML = html;
    },

    initTtsSettings: function() {
        const settings = Memory.getSettings();

        const ttsApiEnabled = document.getElementById('ttsApiEnabled');
        const ttsApiConfig = document.getElementById('ttsApiConfig');
        const ttsProvider = document.getElementById('ttsProvider');
        const ttsCustomConfig = document.getElementById('ttsCustomConfig');
        const ttsApiKeyGroup = document.getElementById('ttsApiKeyGroup');
        const ttsRate = document.getElementById('ttsRate');
        const ttsRateValue = document.getElementById('ttsRateValue');
        const ttsPitch = document.getElementById('ttsPitch');
        const ttsPitchValue = document.getElementById('ttsPitchValue');
        const testVoiceBtn = document.getElementById('testVoiceBtn');
        const testTtsApiBtn = document.getElementById('testTtsApiBtn');
        const ttsTestResult = document.getElementById('ttsTestResult');

        if (ttsApiEnabled && ttsApiConfig) {
            ttsApiEnabled.addEventListener('change', function() {
                ttsApiConfig.style.display = this.checked ? 'block' : 'none';
            });
            ttsApiConfig.style.display = settings.ttsApiEnabled ? 'block' : 'none';
        }

        if (ttsProvider) {
            ttsProvider.addEventListener('change', function() {
                const provider = this.value;
                
                if (ttsCustomConfig) {
                    ttsCustomConfig.style.display = provider === 'custom' ? 'block' : 'none';
                }

                if (ttsApiKeyGroup) {
                    ttsApiKeyGroup.style.display = provider === 'browser' ? 'none' : 'block';
                }

                UI.updateTtsApiVoiceList(provider);
                UI.updateTtsExtraConfig(provider);
            });

            if (settings.ttsProvider && settings.ttsProvider !== 'browser') {
                ttsProvider.value = settings.ttsProvider;
                UI.updateTtsApiVoiceList(settings.ttsProvider);
                UI.updateTtsExtraConfig(settings.ttsProvider);
                if (ttsCustomConfig) {
                    ttsCustomConfig.style.display = settings.ttsProvider === 'custom' ? 'block' : 'none';
                }
            }
        }

        if (ttsRate && ttsRateValue) {
            ttsRate.addEventListener('input', function() {
                ttsRateValue.textContent = parseFloat(this.value).toFixed(1) + 'x';
            });
        }

        if (ttsPitch && ttsPitchValue) {
            ttsPitch.addEventListener('input', function() {
                ttsPitchValue.textContent = parseFloat(this.value).toFixed(1);
            });
        }

        if (testVoiceBtn) {
            testVoiceBtn.addEventListener('click', function() {
                const voiceSelect = document.getElementById('ttsVoice');
                const selectedVoice = voiceSelect ? voiceSelect.value : 'auto';
                TTS.testVoice(selectedVoice);
            });
        }

        if (testTtsApiBtn && ttsTestResult) {
            testTtsApiBtn.addEventListener('click', async function() {
                ttsTestResult.textContent = '测试中...';
                ttsTestResult.style.color = '#666';

                const provider = document.getElementById('ttsProvider').value;
                const config = {
                    provider: provider,
                    apiKey: document.getElementById('ttsApiKey')?.value || '',
                    voice: document.getElementById('ttsApiVoice')?.value || '',
                    appId: document.getElementById('ttsAppId')?.value || '',
                    secretId: document.getElementById('ttsSecretId')?.value || '',
                    secretKey: document.getElementById('ttsSecretKey')?.value || '',
                    token: document.getElementById('ttsToken')?.value || '',
                    region: document.getElementById('ttsRegion')?.value || 'eastasia',
                    endpoint: document.getElementById('ttsEndpoint')?.value || '',
                    customHeaders: document.getElementById('ttsCustomHeaders')?.value || '',
                    customBody: document.getElementById('ttsCustomBody')?.value || ''
                };

                const result = await TTSProvider.testConnection(config);

                if (result.success) {
                    ttsTestResult.textContent = '✓ 测试成功';
                    ttsTestResult.style.color = '#4CAF50';
                } else {
                    ttsTestResult.textContent = '✗ ' + (result.error || '测试失败');
                    ttsTestResult.style.color = '#f44336';
                }
            });
        }

        setTimeout(() => {
            this.updateVoiceList();
        }, 100);

        setTimeout(() => {
            this.updateVoiceList();
        }, 1000);

        setTimeout(() => {
            this.updateVoiceList();
        }, 3000);
    }
};
