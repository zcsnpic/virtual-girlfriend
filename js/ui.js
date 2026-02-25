const UI = {
    currentScene: null,
    subtitleTimer: null,

    showScene: function(scene) {
        if (!scene) {
            console.log('showScene: 场景为空，跳过');
            return;
        }

        const sceneBar = document.getElementById('sceneBar');
        const sceneText = document.getElementById('sceneText');
        
        if (!sceneBar || !sceneText) {
            console.error('showScene: 找不到场景元素');
            return;
        }

        sceneText.textContent = scene;
        sceneBar.classList.add('active');
        
        this.currentScene = scene;
        console.log('showScene: 显示场景', scene);
    },

    hideScene: function() {
        const sceneBar = document.getElementById('sceneBar');
        const sceneText = document.getElementById('sceneText');
        if (sceneBar && sceneBar.classList.contains('active')) {
            sceneBar.classList.add('hiding');
            setTimeout(() => {
                sceneBar.classList.remove('active', 'hiding');
                if (sceneText) {
                    sceneText.textContent = '';
                }
            }, 400);
            console.log('hideScene: 隐藏场景');
        }
        this.currentScene = null;
    },

    clearAllScenes: function() {
        this.hideScene();
    },

    showSubtitle: function(text) {
        if (!text) return;
        
        const subtitleBar = document.getElementById('subtitleBar');
        const subtitleText = document.getElementById('subtitleText');
        
        if (!subtitleBar || !subtitleText) return;
        
        if (this.subtitleTimer) {
            clearInterval(this.subtitleTimer);
            this.subtitleTimer = null;
        }
        
        subtitleText.textContent = '';
        subtitleText.classList.add('typing');
        subtitleBar.classList.remove('hiding');
        subtitleBar.classList.add('active');
        
        let index = 0;
        const chars = text.split('');
        const charDelay = Math.max(30, Math.min(50, 2000 / chars.length));
        
        this.subtitleTimer = setInterval(() => {
            if (index < chars.length) {
                subtitleText.textContent += chars[index];
                index++;
            } else {
                clearInterval(this.subtitleTimer);
                this.subtitleTimer = null;
                subtitleText.classList.remove('typing');
            }
        }, charDelay);
    },

    hideSubtitle: function() {
        const subtitleBar = document.getElementById('subtitleBar');
        const subtitleText = document.getElementById('subtitleText');
        
        if (this.subtitleTimer) {
            clearInterval(this.subtitleTimer);
            this.subtitleTimer = null;
        }
        
        if (subtitleBar && subtitleBar.classList.contains('active')) {
            subtitleBar.classList.add('hiding');
            setTimeout(() => {
                subtitleBar.classList.remove('active', 'hiding');
                if (subtitleText) {
                    subtitleText.textContent = '';
                    subtitleText.classList.remove('typing');
                }
            }, 300);
        }
    },

    setPlayingState: function(messageId, isPlaying) {
        const messageEl = document.querySelector(`.message[data-id="${messageId}"]`);
        if (messageEl) {
            if (isPlaying) {
                messageEl.classList.add('playing');
            } else {
                messageEl.classList.remove('playing');
            }
        }
    },

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
        console.log('UI.splitMessages 输入:', content);
        if (!content) return [content];
        
        let messages = [];
        
        if (content.includes('|||')) {
            messages = content.split('|||').map(s => s.trim()).filter(s => s);
            console.log('按|||拆分结果:', messages);
        } else {
            messages = [content];
        }
        
        messages = this.splitBySceneDescriptions(messages);
        console.log('UI.splitMessages 输出:', messages);
        
        return messages;
    },

    splitBySceneDescriptions: function(messages) {
        console.log('splitBySceneDescriptions 输入:', messages);
        const result = [];
        
        for (const msg of messages) {
            const scenePattern = /\[([^\]]+)\]/g;
            const speechPattern = /"([^"]+)"/g;
            const sceneMatches = [...msg.matchAll(scenePattern)];
            const speechMatches = [...msg.matchAll(speechPattern)];
            
            console.log('消息:', msg, '场景数:', sceneMatches.length, '语音数:', speechMatches.length);
            
            if (sceneMatches.length <= 1) {
                result.push(msg);
                continue;
            }
            
            if (sceneMatches.length === speechMatches.length) {
                for (let i = 0; i < sceneMatches.length; i++) {
                    const sceneContent = sceneMatches[i][0];
                    const speechContent = speechMatches[i][0];
                    result.push(`${sceneContent} ${speechContent}`);
                }
                console.log('按场景-语音配对拆分:', result);
                continue;
            }
            
            const parts = [];
            let lastIndex = 0;
            
            for (let i = 0; i < sceneMatches.length; i++) {
                const match = sceneMatches[i];
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
        
        console.log('splitBySceneDescriptions 输出:', result);
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

        if (message.role === 'assistant') {
            const parsed = Memory.parseMessage(message.content);
            
            // 场景和语音合并显示
            if (parsed.hasScene && parsed.hasSpeech) {
                // 场景突出显示
                const sceneElement = document.createElement('div');
                sceneElement.className = 'scene-text';
                sceneElement.textContent = `『${parsed.scene}』`;
                bubble.appendChild(sceneElement);
                
                // 语音内容
                const textElement = document.createElement('div');
                textElement.className = 'speech-text';
                textElement.textContent = parsed.speech;
                bubble.appendChild(textElement);
            } else if (parsed.hasScene && !parsed.hasSpeech) {
                // 只有场景
                div.classList.add('scene-only');
                const sceneElement = document.createElement('div');
                sceneElement.className = 'scene-text';
                sceneElement.textContent = `『${parsed.scene}』`;
                bubble.appendChild(sceneElement);
            } else if (parsed.hasSpeech && parsed.speech.trim()) {
                // 只有语音
                const textElement = document.createElement('span');
                textElement.className = 'text';
                textElement.textContent = parsed.speech;
                bubble.appendChild(textElement);
            } else {
                // 默认显示内容
                const textElement = document.createElement('span');
                textElement.className = 'text';
                textElement.textContent = Memory.getSpeechContent(message.content);
                bubble.appendChild(textElement);
            }
        } else {
            const textElement = document.createElement('span');
            textElement.className = 'text';
            textElement.textContent = message.content;
            bubble.appendChild(textElement);
        }

        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = this.formatTime(message.timestamp);

        div.appendChild(bubble);
        div.appendChild(time);

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
            bubble.innerHTML = `<span class="text">${content}</span>`;
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
            case 'add-to-core':
                this.addToCoreMemory(messageId);
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

    addToCoreMemory: function(messageId) {
        const success = Memory.markAsCore(messageId);
        if (success) {
            this.showToast('已设为核心记忆', 'success');
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.classList.add('important');
                const bubble = messageElement.querySelector('.bubble');
                if (bubble && !bubble.querySelector('.core-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'core-indicator';
                    indicator.textContent = '⭐⭐';
                    indicator.title = '核心记忆';
                    bubble.appendChild(indicator);
                }
            }
        } else {
            this.showToast('核心记忆已达上限（最多10条）', 'error');
        }
    },

    unmarkAsCore: function(messageId) {
        const success = Memory.unmarkAsCore(messageId);
        if (success) {
            this.showToast('已取消核心记忆', 'success');
            this.loadImportantMemory();
        } else {
            this.showToast('操作失败', 'error');
        }
    },

    markAsCore: function(messageId) {
        const success = Memory.markAsCore(messageId);
        if (success) {
            this.showToast('已设为核心记忆', 'success');
            this.loadImportantMemory();
        } else {
            this.showToast('核心记忆已达上限（最多10条）', 'error');
        }
    },

    showAddMemoryModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'addMemoryModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>添加重要记忆</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>记忆内容</label>
                        <textarea id="addMemoryContent" rows="3" placeholder="请输入记忆内容..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>消息来源</label>
                        <select id="addMemoryRole">
                            <option value="user">用户说（"你"=角色，"我"=用户）</option>
                            <option value="assistant">角色说（"我"=角色，"你"=用户）</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="addMemoryCore">
                            设为核心记忆（最高优先级，最多10条）
                        </label>
                    </div>
                    <button class="save-btn" onclick="UI.saveNewMemory()">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    saveNewMemory: function() {
        const content = document.getElementById('addMemoryContent').value.trim();
        const role = document.getElementById('addMemoryRole').value;
        const isCore = document.getElementById('addMemoryCore').checked;
        
        if (!content) {
            this.showToast('请输入记忆内容', 'error');
            return;
        }
        
        const message = Memory.addImportantMemory({
            role: role,
            content: content,
            core: isCore
        });
        
        if (message) {
            this.showToast('记忆已添加', 'success');
            document.getElementById('addMemoryModal').remove();
            this.loadImportantMemory();
        } else {
            this.showToast('添加失败', 'error');
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

        // 获取所有重要记忆（包括禁用的，用于显示）
        const data = Memory.load();
        const allImportantMessages = data.messages.filter(m => m.important).sort((a, b) => {
            if (a.core !== b.core) {
                return b.core ? 1 : -1;
            }
            if (b.reviewCount !== a.reviewCount) {
                return b.reviewCount - a.reviewCount;
            }
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        if (allImportantMessages.length === 0) {
            importantMemories.innerHTML = '<div class="empty-memory">暂无重要记忆</div>';
            return;
        }

        let html = '';
        allImportantMessages.forEach(msg => {
            const roleLabel = msg.role === 'user' ? '<span class="role-tag user">用户说</span>' : '<span class="role-tag assistant">角色说</span>';
            const isCore = msg.core;
            const isEnabled = msg.enabled !== false;
            const coreClass = isCore ? 'core' : '';
            const disabledClass = isEnabled ? '' : 'disabled';
            const starIcon = isCore ? '⭐⭐' : '⭐';
            const coreBtn = isCore
                ? `<button class="uncore-btn" onclick="UI.unmarkAsCore(${msg.id})">取消核心</button>`
                : `<button class="core-btn" onclick="UI.markAsCore(${msg.id})">设为核心</button>`;
            const checkedAttr = isEnabled ? 'checked' : '';
            html += `
                <div class="memory-card ${coreClass} ${disabledClass}">
                    <div class="memory-header">
                        <label class="enable-checkbox">
                            <input type="checkbox" ${checkedAttr} onchange="UI.toggleMemoryEnabled(${msg.id})" title="启用/禁用">
                        </label>
                        ${roleLabel}
                        <span class="memory-title">${this.escapeHtml(this.getMemoryTitle(msg.content))}</span>
                        <span class="memory-indicator">${starIcon}</span>
                    </div>
                    <div class="memory-body">
                        <p>${this.escapeHtml(msg.content)}</p>
                    </div>
                    <div class="memory-footer">
                        ${coreBtn}
                        <button class="edit-btn" onclick="UI.editMemory(${msg.id})">编辑</button>
                        <button class="delete-btn" onclick="UI.deleteMemory(${msg.id})">删除</button>
                    </div>
                </div>
            `;
        });

        importantMemories.innerHTML = html;
    },

    // 切换记忆启用状态
    toggleMemoryEnabled: function(messageId) {
        const newState = Memory.toggleMessageEnabled(messageId);
        if (newState !== null) {
            this.loadImportantMemory();
        }
    },

    // 清除对话上下文
    clearContext: function() {
        if (confirm('确定要清除对话上下文吗？\n\n这将删除所有普通对话消息，但会保留重要记忆和核心记忆。')) {
            const result = Memory.clearContext();
            if (result.success) {
                alert(`对话上下文已清除！\n删除了 ${result.clearedCount} 条普通消息\n保留了 ${result.keptCount} 条重要记忆`);
                // 刷新消息列表
                UI.loadMessages();
            }
        }
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
    
    // 转义HTML字符
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                UI.loadImportantMemory();
                UI.loadUserProfile();
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
        this.initAvatarSettings();
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

        if (voiceSelectGroup) {
            voiceSelectGroup.style.display = '';
        }

        select.innerHTML = '<option value="auto">自动选择（推荐）</option>';

        if (voices.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '（浏览器未提供可选声音）';
            option.disabled = true;
            select.appendChild(option);
            console.log('声音列表为空，显示提示');
            return;
        }

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

    updateAvatar: function(avatar) {
        console.log('updateAvatar 被调用，avatar:', avatar ? avatar.substring(0, 50) + '...' : '空');
        const mainAvatar = document.getElementById('mainAvatar');
        const avatarPreview = document.getElementById('avatarPreview');
        
        const defaultAvatar = '💕';
        const avatarValue = avatar || defaultAvatar;
        
        const isImage = avatarValue.startsWith('data:') || avatarValue.startsWith('http');
        console.log('isImage:', isImage, 'avatarValue:', avatarValue.substring(0, 30));
        
        if (mainAvatar) {
            if (isImage) {
                mainAvatar.innerHTML = `<img src="${avatarValue}" alt="头像">`;
                console.log('mainAvatar 设置为图片');
            } else {
                mainAvatar.textContent = avatarValue;
                console.log('mainAvatar 设置为文本:', avatarValue);
            }
        } else {
            console.log('mainAvatar 元素未找到');
        }
        
        if (avatarPreview) {
            if (isImage) {
                avatarPreview.innerHTML = `<img src="${avatarValue}" alt="头像">`;
            } else {
                avatarPreview.textContent = avatarValue;
            }
        }
    },

    initAvatarSettings: function() {
        const settings = Memory.getSettings();
        const avatarInput = document.getElementById('avatarInput');
        const avatarUrl = document.getElementById('avatarUrl');
        const avatarEmoji = document.getElementById('avatarEmoji');
        const resetAvatarBtn = document.getElementById('resetAvatarBtn');

        this.updateAvatar(settings.avatar);

        if (avatarInput) {
            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                console.log('头像文件选择事件触发, file:', file);
                if (!file) return;

                if (file.size > 500 * 1024) {
                    UI.showToast('图片太大，建议小于500KB', 'error');
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    UI.showToast('请选择图片文件', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64 = event.target.result;
                    console.log('图片读取完成, base64长度:', base64.length);
                    console.log('AvatarCrop 是否存在:', typeof AvatarCrop !== 'undefined');
                    
                    if (typeof AvatarCrop !== 'undefined' && AvatarCrop) {
                        console.log('调用 AvatarCrop.loadImage');
                        AvatarCrop.loadImage(base64);
                    } else {
                        console.log('AvatarCrop 不存在，直接更新头像');
                        UI.updateAvatar(base64);
                    }
                    
                    if (avatarUrl) avatarUrl.value = '';
                    if (avatarEmoji) avatarEmoji.value = '';
                };
                reader.readAsDataURL(file);
            });
        }

        if (avatarUrl) {
            avatarUrl.addEventListener('change', function() {
                const url = this.value.trim();
                if (url) {
                    UI.updateAvatar(url);
                    if (avatarEmoji) avatarEmoji.value = '';
                    if (avatarInput) avatarInput.value = '';
                }
            });
        }

        if (avatarEmoji) {
            avatarEmoji.addEventListener('input', function() {
                const emoji = this.value.trim();
                if (emoji) {
                    UI.updateAvatar(emoji);
                    if (avatarUrl) avatarUrl.value = '';
                    if (avatarInput) avatarInput.value = '';
                }
            });
        }

        if (resetAvatarBtn) {
            resetAvatarBtn.addEventListener('click', function() {
                UI.updateAvatar('');
                if (avatarInput) avatarInput.value = '';
                if (avatarUrl) avatarUrl.value = '';
                if (avatarEmoji) avatarEmoji.value = '';
                UI.showToast('已恢复默认头像', 'success');
            });
        }

        const applyAvatarBtn = document.getElementById('applyAvatarBtn');
        if (applyAvatarBtn) {
            applyAvatarBtn.addEventListener('click', function() {
                const avatarPreview = document.getElementById('avatarPreview');
                let avatar = '';
                if (avatarPreview) {
                    const img = avatarPreview.querySelector('img');
                    if (img) {
                        avatar = img.src;
                    } else {
                        avatar = avatarPreview.textContent.trim();
                    }
                }
                
                const settings = Memory.getSettings();
                settings.avatar = avatar;
                Memory.saveSettings(settings);
                
                UI.updateAvatar(avatar);
                UI.showToast('头像已应用', 'success');
                console.log('应用头像按钮点击, avatar:', avatar ? avatar.substring(0, 50) + '...' : '空');
            });
        }
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
