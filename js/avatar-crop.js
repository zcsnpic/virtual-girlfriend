const AvatarCrop = {
    image: null,
    canvas: null,
    ctx: null,
    previewCanvas: null,
    previewCtx: null,
    
    cropX: 0,
    cropY: 0,
    cropSize: 150,
    
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    
    minCropSize: 50,
    initialized: false,
    
    init: function() {
        if (this.initialized) return;
        
        this.canvas = document.getElementById('cropCanvas');
        this.previewCanvas = document.getElementById('cropPreviewCanvas');
        
        if (!this.canvas || !this.previewCanvas) {
            console.log('AvatarCrop: canvas元素未找到，延迟初始化');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        this.bindEvents();
        this.initialized = true;
        console.log('AvatarCrop: 初始化完成');
    },
    
    ensureInit: function() {
        if (!this.initialized) {
            this.init();
        }
        return this.initialized;
    },
    
    bindEvents: function() {
        const wrapper = document.querySelector('.crop-canvas-wrapper');
        if (!wrapper) return;
        
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvas.addEventListener('mousemove', (e) => this.drag(e));
        this.canvas.addEventListener('mouseup', () => this.endDrag());
        this.canvas.addEventListener('mouseleave', () => this.endDrag());
        
        this.canvas.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.endDrag());
        
        const confirmBtn = document.getElementById('confirmCropBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmCrop());
        }
        
        document.querySelectorAll('.crop-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => this.startResize(e));
            handle.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });
        });
    },
    
    loadImage: function(src) {
        console.log('AvatarCrop.loadImage 被调用');
        
        if (!this.ensureInit()) {
            console.log('AvatarCrop: 初始化失败，直接更新头像');
            UI.updateAvatar(src);
            return;
        }
        
        this.image = new Image();
        this.image.onload = () => {
            console.log('AvatarCrop: 图片加载完成');
            this.setupCanvas();
            this.draw();
            UI.showModal('avatarCropModal');
        };
        this.image.onerror = () => {
            console.log('AvatarCrop: 图片加载失败');
            UI.updateAvatar(src);
        };
        this.image.src = src;
    },
    
    setupCanvas: function() {
        const maxWidth = 400;
        const maxHeight = 350;
        
        let width = this.image.width;
        let height = this.image.height;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.scale = width / this.image.width;
        
        this.cropSize = Math.min(150, Math.min(width, height) * 0.8);
        this.cropX = (width - this.cropSize) / 2;
        this.cropY = (height - this.cropSize) / 2;
        
        this.updateOverlay();
    },
    
    draw: function() {
        if (!this.image || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        
        this.updatePreview();
    },
    
    updateOverlay: function() {
        const overlay = document.querySelector('.crop-circle-overlay');
        if (!overlay) return;
        
        overlay.style.width = this.cropSize + 'px';
        overlay.style.height = this.cropSize + 'px';
        overlay.style.left = (this.cropX + this.cropSize / 2) + 'px';
        overlay.style.top = (this.cropY + this.cropSize / 2) + 'px';
        
        const handles = document.querySelectorAll('.crop-handle');
        handles.forEach(handle => {
            handle.style.left = (this.cropX + this.cropSize - 8) + 'px';
            handle.style.top = (this.cropY + this.cropSize - 8) + 'px';
        });
        
        const wrapper = document.querySelector('.crop-canvas-wrapper');
        if (wrapper) {
            const nwHandle = wrapper.querySelector('.crop-handle-nw');
            const neHandle = wrapper.querySelector('.crop-handle-ne');
            const swHandle = wrapper.querySelector('.crop-handle-sw');
            const seHandle = wrapper.querySelector('.crop-handle-se');
            
            if (nwHandle) {
                nwHandle.style.left = (this.cropX - 8) + 'px';
                nwHandle.style.top = (this.cropY - 8) + 'px';
            }
            if (neHandle) {
                neHandle.style.left = (this.cropX + this.cropSize - 8) + 'px';
                neHandle.style.top = (this.cropY - 8) + 'px';
            }
            if (swHandle) {
                swHandle.style.left = (this.cropX - 8) + 'px';
                swHandle.style.top = (this.cropY + this.cropSize - 8) + 'px';
            }
            if (seHandle) {
                seHandle.style.left = (this.cropX + this.cropSize - 8) + 'px';
                seHandle.style.top = (this.cropY + this.cropSize - 8) + 'px';
            }
        }
    },
    
    updatePreview: function() {
        if (!this.previewCtx || !this.image) return;
        
        const srcX = this.cropX / this.scale;
        const srcY = this.cropY / this.scale;
        const srcSize = this.cropSize / this.scale;
        
        this.previewCtx.clearRect(0, 0, 100, 100);
        
        this.previewCtx.save();
        this.previewCtx.beginPath();
        this.previewCtx.arc(50, 50, 50, 0, Math.PI * 2);
        this.previewCtx.clip();
        
        this.previewCtx.drawImage(
            this.image,
            srcX, srcY, srcSize, srcSize,
            0, 0, 100, 100
        );
        
        this.previewCtx.restore();
    },
    
    startDrag: function(e) {
        e.preventDefault();
        this.isDragging = true;
        
        const pos = this.getEventPosition(e);
        this.dragStartX = pos.x - this.cropX;
        this.dragStartY = pos.y - this.cropY;
    },
    
    drag: function(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const pos = this.getEventPosition(e);
        let newX = pos.x - this.dragStartX;
        let newY = pos.y - this.dragStartY;
        
        newX = Math.max(0, Math.min(newX, this.canvas.width - this.cropSize));
        newY = Math.max(0, Math.min(newY, this.canvas.height - this.cropSize));
        
        this.cropX = newX;
        this.cropY = newY;
        
        this.updateOverlay();
        this.updatePreview();
    },
    
    endDrag: function() {
        this.isDragging = false;
    },
    
    startResize: function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const pos = this.getEventPosition(e);
        const startSize = this.cropSize;
        const startX = pos.x;
        const startY = pos.y;
        
        const onMouseMove = (e) => {
            e.preventDefault();
            const currentPos = this.getEventPosition(e);
            const dx = currentPos.x - startX;
            const dy = currentPos.y - startY;
            const delta = Math.max(dx, dy);
            
            let newSize = startSize + delta;
            newSize = Math.max(this.minCropSize, Math.min(newSize, Math.min(this.canvas.width, this.canvas.height)));
            
            if (this.cropX + newSize <= this.canvas.width && this.cropY + newSize <= this.canvas.height) {
                this.cropSize = newSize;
                this.updateOverlay();
                this.updatePreview();
            }
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
    },
    
    getEventPosition: function(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    },
    
    confirmCrop: function() {
        if (!this.image) return;
        
        const outputSize = 200;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = outputSize;
        tempCanvas.height = outputSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        const srcX = this.cropX / this.scale;
        const srcY = this.cropY / this.scale;
        const srcSize = this.cropSize / this.scale;
        
        tempCtx.beginPath();
        tempCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        tempCtx.clip();
        
        tempCtx.drawImage(
            this.image,
            srcX, srcY, srcSize, srcSize,
            0, 0, outputSize, outputSize
        );
        
        const croppedData = tempCanvas.toDataURL('image/png');
        
        UI.updateAvatar(croppedData);
        
        const settings = Memory.getSettings();
        settings.avatar = croppedData;
        Memory.saveSettings(settings);
        
        UI.hideModal('avatarCropModal');
        UI.showToast('头像已更新', 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AvatarCrop.init();
});
