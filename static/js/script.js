document.addEventListener('DOMContentLoaded', function() {
    // ------------------------------
    // CHECK FOR MODE URL PARAMETER
    // ------------------------------
    function checkAndApplyURLMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const modeParam = urlParams.get('mode');
        
        if (modeParam === 'advanced') {
            // Switch to advanced mode automatically
            const simpleMode = document.getElementById('simple-mode');
            const advancedMode = document.getElementById('advanced-mode');
            const toggleModeBtn = document.getElementById('toggle-editor-mode');
            
            if (simpleMode && advancedMode && toggleModeBtn) {
                simpleMode.style.display = 'none';
                advancedMode.style.display = 'block';
                toggleModeBtn.textContent = 'Switch to Simple Mode';
                
                // Initialize advanced mode
                initAdvancedOnce();
                
                // Set initial values from simple mode
                if (el.titleInput && adv.advTitle) {
                    adv.advTitle.textContent = el.titleInput.value || 'YOUR TITLE HERE';
                }
                if (el.subtitleInput && adv.advSubtitle) {
                    adv.advSubtitle.textContent = el.subtitleInput.value || 'Your subtitle text';
                }
                
                // Set initial background
                if (el.bgColorInput) {
                    setAdvancedBackground('color', el.bgColorInput.value);
                }
            }
            
            // Clean URL without reloading page
            const newURL = window.location.pathname;
            window.history.replaceState({}, document.title, newURL);
        }
    }

    // ------------------------------
    // TEMPLATE DEFINITIONS
    // ------------------------------
    const PREDEFINED_TEMPLATES = {
        'bold-red': {
            name: 'Bold Red',
            background: 'linear-gradient(135deg, #FF0000, #990000)',
            type: 'gradient',
            title_color: '#FFFFFF',
            subtitle_color: '#FFFFFF'
        },
        'dark-professional': {
            name: 'Dark Professional',
            background: 'linear-gradient(135deg, #000000, #333333)',
            type: 'gradient',
            title_color: '#FFFFFF',
            subtitle_color: '#CCCCCC'
        },
        'bright-yellow': {
            name: 'Bright Yellow',
            background: 'linear-gradient(135deg, #FFCC00, #FF9900)',
            type: 'gradient',
            title_color: '#000000',
            subtitle_color: '#333333'
        },
        // FIXED: Added missing golden-energy template
        'golden-energy': {
            name: 'Golden Energy',
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            type: 'gradient',
            title_color: '#000000',
            subtitle_color: '#333333'
        }
    };

    // ------------------------------
    // CHECK FOR TEMPLATE URL PARAMETER
    // ------------------------------
    function checkAndApplyURLTemplate() {
        const urlParams = new URLSearchParams(window.location.search);
        const templateParam = urlParams.get('template');
        
        if (templateParam && PREDEFINED_TEMPLATES[templateParam]) {
            const template = PREDEFINED_TEMPLATES[templateParam];
            applyPredefinedTemplate(template);
            
            // Clean URL without reloading page
            const newURL = window.location.pathname;
            window.history.replaceState({}, document.title, newURL);
        }
    }

    function applyPredefinedTemplate(template) {
        // Apply to simple mode
        if (template.type === 'gradient') {
            // For gradient backgrounds, we'll use the first color for the color picker
            const colorMatch = template.background.match(/#[0-9a-fA-F]{6}/);
            if (colorMatch) {
                el.bgColorInput.value = colorMatch[0];
            }
            // Set the actual gradient as background
            el.thumbnailPreview.style.background = template.background;
            el.thumbnailPreview.style.backgroundImage = 'none';
        } else {
            el.bgColorInput.value = template.background;
            el.thumbnailPreview.style.background = template.background;
            el.thumbnailPreview.style.backgroundImage = 'none';
        }
        
        el.textColorInput.value = template.title_color;
        
        // Reset other settings
        el.bgImageInput.value = '';
        el.fileNameDisplay.textContent = 'No file selected';
        document.querySelector('input[name="bg_type"][value="color"]').checked = true;
        el.bgColorGroup.style.display = 'block';
        el.bgImageGroup.style.display = 'none';
        
        // Apply the styles
        applySimpleStyles();
        
        // Show success message
        showTemplateAppliedMessage(template.name);
    }

    function showTemplateAppliedMessage(templateName) {
        // Create and show a temporary success message
        const message = document.createElement('div');
        message.className = 'template-success-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${templateName} template applied successfully!</span>
        `;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        // Animate in
        setTimeout(() => {
            message.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            message.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    // ------------------------------
    // SIMPLE MODE (existing features)
    // ------------------------------
    const el = {
        titleInput: document.getElementById('title'),
        subtitleInput: document.getElementById('subtitle'),
        titleSizeInput: document.getElementById('title-size'),
        subtitleSizeInput: document.getElementById('subtitle-size'),
        bgColorInput: document.getElementById('bg-color'),
        textColorInput: document.getElementById('text-color'),
        bgImageInput: document.getElementById('bg-image'),
        textStylesInput: document.getElementById('text-styles'),
        previewTitle: document.getElementById('preview-title'),
        previewSubtitle: document.getElementById('preview-subtitle'),
        thumbnailPreview: document.getElementById('thumbnail-preview'),
        titleSizeValue: document.getElementById('title-size-value'),
        subtitleSizeValue: document.getElementById('subtitle-size-value'),
        downloadBtn: document.getElementById('download-btn'),
        bgColorGroup: document.getElementById('bg-color-group'),
        bgImageGroup: document.getElementById('bg-image-group'),
        fileNameDisplay: document.getElementById('file-name'),
        titleCount: document.getElementById('title-count'),
        subtitleCount: document.getElementById('subtitle-count'),
        shadowToggle: document.getElementById('text-shadow-toggle'),
        shadowColorInput: document.getElementById('shadow-color'),
        shadowOffsetX: document.getElementById('shadow-offset-x'),
        shadowOffsetY: document.getElementById('shadow-offset-y')
    };

    function applySimpleStyles() {
        const styles = el.textStylesInput.value.split(',').filter(Boolean);
        const set = (node, key, val) => node && (node.style[key] = val);

        // Reset
        ['previewTitle','previewSubtitle'].forEach(k=>{
            const n = el[k];
            set(n,'fontWeight','normal');
            set(n,'fontStyle','normal');
            set(n,'textDecoration','none');
            set(n,'textShadow','none');
        });

        el.previewTitle.textContent = el.titleInput.value;
        el.previewSubtitle.textContent = el.subtitleInput.value;

        set(el.previewTitle,'fontSize', `${el.titleSizeInput.value}px`);
        set(el.previewSubtitle,'fontSize', `${el.subtitleSizeInput.value}px`);
        set(el.previewTitle,'color', el.textColorInput.value);
        set(el.previewSubtitle,'color', el.textColorInput.value);

        if (styles.includes('bold')) {
            set(el.previewTitle,'fontWeight','bold');
            set(el.previewSubtitle,'fontWeight','bold');
        }
        if (styles.includes('italic')) {
            set(el.previewTitle,'fontStyle','italic');
            set(el.previewSubtitle,'fontStyle','italic');
        }
        if (styles.includes('underline')) {
            set(el.previewTitle,'textDecoration','underline');
            set(el.previewSubtitle,'textDecoration','underline');
        }

        if (el.shadowToggle && el.shadowToggle.checked) {
            const shadow = `${el.shadowOffsetX.value}px ${el.shadowOffsetY.value}px 2px ${el.shadowColorInput.value}`;
            set(el.previewTitle,'textShadow', shadow);
            set(el.previewSubtitle,'textShadow', shadow);
        }

        // Only set background color if no background image or gradient is set
        if (!el.thumbnailPreview.style.backgroundImage || el.thumbnailPreview.style.backgroundImage === 'none') {
            if (!el.thumbnailPreview.style.background || el.thumbnailPreview.style.background.indexOf('gradient') === -1) {
                el.thumbnailPreview.style.backgroundColor = el.bgColorInput.value;
            }
        }
    }

    function updateCounts() {
        el.titleCount.textContent = el.titleInput.value.length;
        el.subtitleCount.textContent = el.subtitleInput.value.length;
    }

    async function downloadSimple() {
        try {
            const btn = el.downloadBtn;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            const form = document.getElementById('thumbnail-form');
            const fd = new FormData(form);

            const res = await fetch('/generate-thumbnail', { method:'POST', body: fd });
            if (!res.ok) throw new Error(`Server responded ${res.status}`);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'youtube-thumbnail.png';
            document.body.appendChild(a); a.click();
            setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 120);
        } catch (e) {
            console.error('Download error:', e);
            alert('Failed to download thumbnail. Please try again.');
        } finally {
            el.downloadBtn.disabled = false;
            el.downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Thumbnail';
        }
    }

    // Listeners - Simple
    if (el.titleInput) {
        el.titleInput.addEventListener('input', ()=>{ applySimpleStyles(); updateCounts(); });
        el.subtitleInput.addEventListener('input', ()=>{ applySimpleStyles(); updateCounts(); });
        el.titleSizeInput.addEventListener('input', function(){ el.titleSizeValue.textContent = this.value; applySimpleStyles(); });
        el.subtitleSizeInput.addEventListener('input', function(){ el.subtitleSizeValue.textContent = this.value; applySimpleStyles(); });
        el.bgColorInput.addEventListener('input', applySimpleStyles);
        el.textColorInput.addEventListener('input', applySimpleStyles);
        if (el.shadowToggle) el.shadowToggle.addEventListener('change', applySimpleStyles);
        if (el.shadowColorInput) el.shadowColorInput.addEventListener('input', applySimpleStyles);
        if (el.shadowOffsetX) el.shadowOffsetX.addEventListener('input', applySimpleStyles);
        if (el.shadowOffsetY) el.shadowOffsetY.addEventListener('input', applySimpleStyles);

        // FIXED: Enhanced background image upload functionality
        el.bgImageInput.addEventListener('change', function(ev){
            const file = ev.target.files[0];
            if (file) {
                el.fileNameDisplay.textContent = file.name;
                el.fileNameDisplay.style.color = 'var(--primary)';
                
                const reader = new FileReader();
                reader.onload = e => {
                    // Clear any existing background styles
                    el.thumbnailPreview.style.backgroundColor = '';
                    el.thumbnailPreview.style.background = '';
                    
                    // Set the background image
                    el.thumbnailPreview.style.backgroundImage = `url(${e.target.result})`;
                    el.thumbnailPreview.style.backgroundSize = 'cover';
                    el.thumbnailPreview.style.backgroundPosition = 'center';
                    el.thumbnailPreview.style.backgroundRepeat = 'no-repeat';
                    
                    console.log('Background image applied:', e.target.result.substring(0, 50) + '...');
                };
                reader.onerror = () => {
                    alert('Error reading image file. Please try again.');
                    el.fileNameDisplay.textContent = 'No file selected';
                    el.fileNameDisplay.style.color = '';
                };
                reader.readAsDataURL(file);
            } else {
                el.fileNameDisplay.textContent = 'No file selected';
                el.fileNameDisplay.style.color = '';
                el.thumbnailPreview.style.backgroundImage = 'none';
                applySimpleStyles();
            }
        });

        document.getElementById('bold-btn')?.addEventListener('click', ()=>toggleTextStyle('bold'));
        document.getElementById('italic-btn')?.addEventListener('click', ()=>toggleTextStyle('italic'));
        document.getElementById('underline-btn')?.addEventListener('click', ()=>toggleTextStyle('underline'));
        
        document.querySelectorAll('input[name="bg_type"]').forEach(inp=>{
            inp.addEventListener('change', function(){
                if (this.value==='color') {
                    el.bgColorGroup.style.display='block';
                    el.bgImageGroup.style.display='none';
                    el.thumbnailPreview.style.backgroundImage='none';
                    el.thumbnailPreview.style.background='';
                    applySimpleStyles();
                } else {
                    el.bgColorGroup.style.display='none';
                    el.bgImageGroup.style.display='block';
                }
            });
        });
        
        document.querySelectorAll('.template-btn').forEach(btn=>{
            btn.addEventListener('click', function(){
                el.bgColorInput.value = this.getAttribute('data-bg');
                el.textColorInput.value = this.getAttribute('data-text');
                el.thumbnailPreview.style.backgroundImage = 'none';
                el.thumbnailPreview.style.background = '';
                el.bgImageInput.value = '';
                el.fileNameDisplay.textContent = 'No file selected';
                el.fileNameDisplay.style.color = '';
                document.querySelector('input[name="bg_type"][value="color"]').checked = true;
                el.bgColorGroup.style.display = 'block';
                el.bgImageGroup.style.display = 'none';
                applySimpleStyles();
            });
        });
        
        el.downloadBtn.addEventListener('click', downloadSimple);

        function toggleTextStyle(style){
            const arr = el.textStylesInput.value.split(',').filter(Boolean);
            const i = arr.indexOf(style);
            if (i===-1) arr.push(style); else arr.splice(i,1);
            el.textStylesInput.value = arr.join(',');
            applySimpleStyles();
        }

        // Initialize simple mode
        applySimpleStyles(); 
        updateCounts();
        
        // Check for URL parameters after initialization
        checkAndApplyURLTemplate();
        checkAndApplyURLMode();
    }

    // ---------------------------------
    // ADVANCED MODE
    // ---------------------------------
    const toggleModeBtn = document.getElementById('toggle-editor-mode');
    const simpleMode = document.getElementById('simple-mode');
    const advancedMode = document.getElementById('advanced-mode');

    const adv = {
        preview: document.getElementById('advanced-preview'),
        canvasRoot: document.getElementById('thumbnail-canvas'),
        advTitle: document.getElementById('advanced-title'),
        advSubtitle: document.getElementById('advanced-subtitle'),
        addTextBtn: document.getElementById('add-text'),
        addShapeBtn: document.getElementById('add-shape'),
        addIconBtn: document.getElementById('add-icon'),
        uploadImageBtn: document.getElementById('upload-image'),
        templatesBtn: document.getElementById('templates-btn'),
        advDownloadBtn: document.getElementById('advanced-download-btn'),
        propPanel: document.getElementById('element-properties'),
        templatesModal: document.getElementById('templates-modal')
    };

    let selected = null;
    let drag = { active:false, startX:0, startY:0, left:0, top:0 };
    let resizing = false;

    // FIXED: Store current background state for exact matching
    let currentBackground = {
        type: 'color',
        value: '#FF0000',
        imageData: null,
        gradientStops: null
    };

    toggleModeBtn?.addEventListener('click', ()=>{
        if (simpleMode.style.display === 'none') {
            // Back to Simple → sync FROM Advanced to Simple
            el.titleInput.value = adv.advTitle.textContent.trim();
            el.subtitleInput.value = adv.advSubtitle.textContent.trim();
            applySimpleStyles();

            simpleMode.style.display = 'grid';
            advancedMode.style.display = 'none';
            toggleModeBtn.textContent = 'Switch to Advanced Mode';
        } else {
            // To Advanced → sync FROM Simple to Advanced
            initAdvancedOnce();
            adv.advTitle.textContent = el.titleInput.value || 'YOUR TITLE HERE';
            adv.advSubtitle.textContent = el.subtitleInput.value || 'Your subtitle text';
            
            // Set initial background
            setAdvancedBackground('color', el.bgColorInput.value);

            simpleMode.style.display = 'none';
            advancedMode.style.display = 'block';
            toggleModeBtn.textContent = 'Switch to Simple Mode';
        }
    });

    let advancedInitialized = false;
    function initAdvancedOnce(){
        if (advancedInitialized) return;
        advancedInitialized = true;

        // Set up canvas with responsive dimensions
        setupResponsiveCanvas();

        // Set up preview to fill the canvas
        adv.preview.style.width = '100%';
        adv.preview.style.height = '100%';
        adv.preview.style.position = 'relative';
        adv.preview.style.overflow = 'hidden';

        // Position title and subtitle with mobile-responsive positioning
        setupResponsiveElements();

        // Make title/subtitle behave like draggable editable text
        adv.advTitle.classList.add('draggable-element','draggable-text');
        adv.advSubtitle.classList.add('draggable-element','draggable-text');

        makeDraggable(adv.advTitle);
        makeDraggable(adv.advSubtitle);

        // FIXED: Use enhanced editable events for mobile compatibility
        setupEditableEvents(adv.advTitle);
        setupEditableEvents(adv.advSubtitle);

        // Toolbar buttons
        adv.addTextBtn?.addEventListener('click', addTextElement);
        adv.addShapeBtn?.addEventListener('click', openShapeSelector);
        adv.addIconBtn?.addEventListener('click', openIconSelector);
        adv.uploadImageBtn?.addEventListener('click', triggerImageUpload);
        adv.templatesBtn?.addEventListener('click', openTemplates);
        adv.advDownloadBtn?.addEventListener('click', downloadAdvanced);

        adv.propPanel.innerHTML = '<p>Select an element to edit its properties</p>';

        // Add window resize listener for responsive updates
        window.addEventListener('resize', handleCanvasResize);
    }

    // FIXED: Responsive canvas setup function
    function setupResponsiveCanvas() {
        const canvasContainer = adv.canvasRoot;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile: Use full container width with aspect ratio
            canvasContainer.style.width = '100%';
            canvasContainer.style.height = 'auto';
            canvasContainer.style.aspectRatio = '16/9';
            canvasContainer.style.maxWidth = '100vw';
        } else {
            // Desktop: Use fixed dimensions
            canvasContainer.style.width = '1280px';
            canvasContainer.style.height = '720px';
            canvasContainer.style.maxWidth = 'none';
        }
        
        canvasContainer.style.position = 'relative';
        canvasContainer.style.overflow = 'hidden';
        canvasContainer.style.border = '1px solid #ccc';
    }

    // FIXED: Responsive elements positioning
    function setupResponsiveElements() {
        const isMobile = window.innerWidth <= 768;
        const scaleFactor = isMobile ? getScaleFactor() : 1;

        // Position title and subtitle with responsive scaling
        adv.advTitle.style.position = 'absolute';
        adv.advTitle.style.left = '50%';
        adv.advTitle.style.top = `${200 * scaleFactor}px`;
        adv.advTitle.style.transform = 'translateX(-50%)';
        adv.advTitle.style.fontSize = `${48 * scaleFactor}px`;
        adv.advTitle.style.color = '#FFFFFF';
        adv.advTitle.style.fontWeight = 'bold';
        adv.advTitle.style.textAlign = 'center';
        adv.advTitle.style.whiteSpace = 'nowrap';
        adv.advTitle.style.zIndex = '10';

        adv.advSubtitle.style.position = 'absolute';
        adv.advSubtitle.style.left = '50%';
        adv.advSubtitle.style.top = `${300 * scaleFactor}px`;
        adv.advSubtitle.style.transform = 'translateX(-50%)';
        adv.advSubtitle.style.fontSize = `${24 * scaleFactor}px`;
        adv.advSubtitle.style.color = '#FFFFFF';
        adv.advSubtitle.style.textAlign = 'center';
        adv.advSubtitle.style.whiteSpace = 'nowrap';
        adv.advSubtitle.style.zIndex = '10';
    }

    // FIXED: Get scale factor for mobile responsiveness
    function getScaleFactor() {
        if (window.innerWidth <= 480) {
            return 0.3; // Extra small screens
        } else if (window.innerWidth <= 768) {
            return 0.5; // Mobile screens
        }
        return 1; // Desktop
    }

    // FIXED: Handle canvas resize
    function handleCanvasResize() {
        if (!advancedInitialized) return;
        
        setupResponsiveCanvas();
        setupResponsiveElements();
        
        // Rescale all existing elements
        document.querySelectorAll('.draggable-element').forEach(element => {
            if (element.id === 'advanced-title' || element.id === 'advanced-subtitle') {
                // Skip title and subtitle as they're handled by setupResponsiveElements
                return;
            }
            scaleElementForMobile(element);
        });
    }

    // FIXED: Scale individual elements for mobile
    function scaleElementForMobile(element) {
        const scaleFactor = getScaleFactor();
        
        if (element.classList.contains('draggable-text')) {
            const currentSize = parseInt(element.style.fontSize) || 32;
            element.style.fontSize = `${Math.max(12, currentSize * scaleFactor)}px`;
            
            // Scale position
            const currentTop = parseInt(element.style.top) || 0;
            const currentLeft = parseInt(element.style.left) || 0;
            element.style.top = `${currentTop * scaleFactor}px`;
            element.style.left = `${currentLeft * scaleFactor}px`;
        }
        
        if (element.classList.contains('draggable-shape') || element.tagName === 'IMG') {
            const currentWidth = parseInt(element.style.width) || 100;
            const currentHeight = parseInt(element.style.height) || 100;
            element.style.width = `${Math.max(30, currentWidth * scaleFactor)}px`;
            element.style.height = `${Math.max(30, currentHeight * scaleFactor)}px`;
            
            // Scale position
            const currentTop = parseInt(element.style.top) || 0;
            const currentLeft = parseInt(element.style.left) || 0;
            element.style.top = `${currentTop * scaleFactor}px`;
            element.style.left = `${currentLeft * scaleFactor}px`;
        }
        
        if (element.classList.contains('draggable-icon')) {
            const currentSize = parseInt(element.style.fontSize) || 56;
            element.style.fontSize = `${Math.max(16, currentSize * scaleFactor)}px`;
            
            // Scale position
            const currentTop = parseInt(element.style.top) || 0;
            const currentLeft = parseInt(element.style.left) || 0;
            element.style.top = `${currentTop * scaleFactor}px`;
            element.style.left = `${currentLeft * scaleFactor}px`;
        }
    }

    // FIXED: Enhanced background management system for exact preview-to-download matching
    function setAdvancedBackground(type, value, imageData = null) {
        currentBackground = { type, value, imageData };
        
        // Clear any existing background styles
        adv.preview.style.background = '';
        adv.preview.style.backgroundColor = '';
        adv.preview.style.backgroundImage = '';
        adv.preview.style.backgroundSize = '';
        adv.preview.style.backgroundPosition = '';
        adv.preview.style.backgroundRepeat = '';
        
        if (type === 'color') {
            adv.preview.style.backgroundColor = value;
        } else if (type === 'gradient') {
            // FIXED: Apply gradient backgrounds properly in preview
            adv.preview.style.background = value;
        } else if (type === 'image' && imageData) {
            adv.preview.style.backgroundImage = `url(${imageData})`;
            adv.preview.style.backgroundSize = 'cover';
            adv.preview.style.backgroundPosition = 'center';
            adv.preview.style.backgroundRepeat = 'no-repeat';
        }
        
        console.log('Background applied:', { type, value, preview: adv.preview.style.background || adv.preview.style.backgroundColor });
    }

    function editableToggle(){
        this.contentEditable = 'true';
        this.focus();
        selectElement(this);
        // keep single line
        this.addEventListener('input', ()=>fitSingleLine(this), { once:false });
        this.addEventListener('blur', ()=>{ this.contentEditable = 'false'; updateProperties(this); });
    }

    // FIXED: Enhanced double-click/tap detection for mobile
    function setupEditableEvents(element) {
        let tapCount = 0;
        let tapTimeout;
        
        // Double-click for desktop
        element.addEventListener('dblclick', editableToggle);
        
        // Double-tap for mobile
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            tapCount++;
            
            if (tapCount === 1) {
                tapTimeout = setTimeout(() => {
                    tapCount = 0;
                }, 300);
            } else if (tapCount === 2) {
                clearTimeout(tapTimeout);
                tapCount = 0;
                editableToggle.call(this);
            }
        });
    }

    function makeDraggable(elm){
        elm.style.cursor = 'move';
        
        // FIXED: Add both mouse and touch event listeners for mobile compatibility
        elm.addEventListener('mousedown', startDrag);
        elm.addEventListener('touchstart', startTouchDrag, { passive: false });
        
        // For text, ensure single line visuals by default
        if (elm.classList.contains('draggable-text')) {
            elm.style.whiteSpace = 'nowrap';
            elm.style.overflow = 'visible';
            elm.style.textOverflow = 'clip';
            if (!elm.style.fontSize) elm.style.fontSize = '36px';
            fitSingleLine(elm);
        }
    }

    function startDrag(e){
        e.preventDefault(); e.stopPropagation();
        selectElement(this);
        drag.active = true;
        drag.startX = e.clientX;
        drag.startY = e.clientY;
        drag.left = parseInt(this.style.left) || 0;
        drag.top  = parseInt(this.style.top)  || 0;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', stopDrag);
    }

    // FIXED: Touch drag start function for mobile devices
    function startTouchDrag(e){
        e.preventDefault(); e.stopPropagation();
        selectElement(this);
        drag.active = true;
        
        const touch = e.touches[0];
        drag.startX = touch.clientX;
        drag.startY = touch.clientY;
        drag.left = parseInt(this.style.left) || 0;
        drag.top  = parseInt(this.style.top)  || 0;
        
        document.addEventListener('touchmove', touchDragMove, { passive: false });
        document.addEventListener('touchend', stopTouchDrag);
    }

    function dragMove(e){
        if (!drag.active || !selected) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        selected.style.left = `${drag.left + dx}px`;
        selected.style.top  = `${drag.top + dy}px`;
    }

    // FIXED: Touch drag move function for mobile devices
    function touchDragMove(e){
        if (!drag.active || !selected) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const dx = touch.clientX - drag.startX;
        const dy = touch.clientY - drag.startY;
        selected.style.left = `${drag.left + dx}px`;
        selected.style.top  = `${drag.top + dy}px`;
    }

    function stopDrag(){
        drag.active = false;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', stopDrag);
    }

    // FIXED: Stop touch drag function for mobile devices
    function stopTouchDrag(){
        drag.active = false;
        document.removeEventListener('touchmove', touchDragMove);
        document.removeEventListener('touchend', stopTouchDrag);
    }

    // ------- Add Text (single line & shadow-ready with mobile responsiveness) -------
    function addTextElement(){
        const t = document.createElement('div');
        t.className = 'draggable-element draggable-text';
        t.textContent = 'Double click to edit';
        t.style.color = el.textColorInput.value;
        
        const scaleFactor = getScaleFactor();
        const fontSize = Math.max(16, 32 * scaleFactor);
        const topPos = Math.max(60, 120 * scaleFactor);
        const leftPos = Math.max(60, 120 * scaleFactor);
        
        t.style.fontSize = `${fontSize}px`;
        t.style.position = 'absolute';
        t.style.top = `${topPos}px`;
        t.style.left = `${leftPos}px`;
        t.style.whiteSpace = 'nowrap';
        t.style.zIndex = '10';
        t.dataset.shadowEnabled = 'false';
        t.dataset.shadowColor = '#000000';
        t.dataset.shadowX = '2';
        t.dataset.shadowY = '2';
        t.dataset.shadowBlur = '2';
        
        adv.canvasRoot.appendChild(t);
        makeDraggable(t);
        addResizeHandle(t);
        selectElement(t);
        setupEditableEvents(t);
        fitSingleLine(t);
    }

    // -------- Shapes (SIMPLIFIED - removed problematic shapes) ----------
    const SHAPES = [
        {key:'rectangle', label:'Rectangle'},
        {key:'circle', label:'Circle'},
        {key:'oval', label:'Oval'},
        {key:'rounded', label:'Rounded Rectangle'},
        {key:'parallelogram', label:'Parallelogram'},
        {key:'rhombus', label:'Rhombus'}
    ];

    function openShapeSelector(){
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Select a Shape</h2>
                <div class="shape-selector" style="max-height: 400px; overflow-y: auto;">
                    ${SHAPES.map(s=>`
                      <div class="shape-option" data-shape="${s.key}">
                        <div class="shape-preview shape-${s.key}"></div>
                        <p>${s.label}</p>
                      </div>`).join('')}
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.style.display='block';
        modal.querySelector('.close').addEventListener('click',()=>{ modal.remove(); });
        modal.querySelectorAll('.shape-option').forEach(o=>{
            o.addEventListener('click', ()=>{ addShapeElement(o.dataset.shape); modal.remove(); });
        });
    }

    function addShapeElement(type){
        const s = document.createElement('div');
        s.className = `draggable-element draggable-shape shape-${type}`;
        s.dataset.shape = type;
        s.style.position = 'absolute';
        
        const scaleFactor = getScaleFactor();
        const topPos = Math.max(70, 140 * scaleFactor);
        const leftPos = Math.max(70, 140 * scaleFactor);
        const width = Math.max(90, 180 * scaleFactor);
        const height = Math.max(60, 120 * scaleFactor);
        
        s.style.top = `${topPos}px`;
        s.style.left = `${leftPos}px`;
        s.style.width = `${width}px`;
        s.style.height = `${height}px`;
        s.style.display = 'flex';
        s.style.alignItems = 'center';
        s.style.justifyContent = 'center';
        s.style.color = '#ffffff';
        s.style.backgroundColor = el.bgColorInput.value;
        s.style.zIndex = '10';
        s.textContent = 'Text';

        applyShapeCSS(s, type, s.style.backgroundColor);
        adv.canvasRoot.appendChild(s);
        makeDraggable(s);
        addResizeHandle(s);
        selectElement(s);
        
        // FIXED: Enhanced double-click/tap for mobile editing
        s.addEventListener('dblclick', () => {
            const v = prompt('Enter text for shape:', s.textContent);
            if (v !== null) { 
                s.textContent = v; 
                updateProperties(s); 
            }
        });
        
        // Double-tap support for mobile
        let shapeTapCount = 0;
        let shapeTapTimeout;
        s.addEventListener('touchend', function(e) {
            e.stopPropagation(); // Prevent drag interference
            shapeTapCount++;
            
            if (shapeTapCount === 1) {
                shapeTapTimeout = setTimeout(() => {
                    shapeTapCount = 0;
                }, 300);
            } else if (shapeTapCount === 2) {
                clearTimeout(shapeTapTimeout);
                shapeTapCount = 0;
                const v = prompt('Enter text for shape:', this.textContent);
                if (v !== null) { 
                    this.textContent = v; 
                    updateProperties(this); 
                }
            }
        });
    }

    function applyShapeCSS(node, type, color){
        // Reset base
        node.style.transform = '';
        node.style.border = 'none';
        node.style.borderRadius = '0';
        node.style.backgroundColor = color;

        if (type==='rectangle') {
            // default
        } else if (type==='circle') {
            node.style.borderRadius = '50%';
            // ensure width==height for perfect circle
            node.style.height = node.style.width;
        } else if (type==='oval') {
            node.style.borderRadius = '50%';
            // allow width!=height
        } else if (type==='rounded') {
            node.style.borderRadius = '16px';
        } else if (type==='parallelogram') {
            node.style.transform = 'skew(-20deg)';
        } else if (type==='rhombus') {
            node.style.transform = 'rotate(45deg)';
        }
    }

    // -------- Icons ----------
    const ICONS = ['fa-star','fa-heart','fa-thumbs-up','fa-check','fa-play','fa-arrow-right','fa-bell','fa-camera','fa-comment','fa-envelope','fa-flag','fa-gift','fa-home','fa-image','fa-key','fa-lightbulb','fa-map-marker','fa-paperclip','fa-question','fa-share'];

    function openIconSelector(){
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Select an Icon</h2>
            <div class="icon-selector" style="max-height: 400px; overflow-y: auto;">
              ${ICONS.map(ic=>`<div class="icon-option" data-icon="${ic}"><i class="fas ${ic}"></i><p>${ic.replace('fa-','')}</p></div>`).join('')}
            </div>
          </div>`;
        document.body.appendChild(modal);
        modal.style.display='block';
        modal.querySelector('.close').addEventListener('click',()=>modal.remove());
        modal.querySelectorAll('.icon-option').forEach(o=>{
            o.addEventListener('click', ()=>{ addIcon(o.dataset.icon); modal.remove(); });
        });
    }
    function addIcon(icon){
        const d = document.createElement('div');
        d.className = 'draggable-element draggable-icon';
        d.innerHTML = `<i class="fas ${icon}"></i>`;
        
        const scaleFactor = getScaleFactor();
        const fontSize = Math.max(24, 56 * scaleFactor);
        const topPos = Math.max(80, 160 * scaleFactor);
        const leftPos = Math.max(80, 160 * scaleFactor);
        
        d.style.fontSize = `${fontSize}px`;
        d.style.color = el.textColorInput.value || '#ffcc00';
        d.style.position = 'absolute';
        d.style.top = `${topPos}px`;
        d.style.left = `${leftPos}px`;
        d.style.zIndex = '10';
        
        adv.canvasRoot.appendChild(d);
        makeDraggable(d);
        addResizeHandle(d);
        selectElement(d);
    }

    // ------ Image Upload ------
    function triggerImageUpload(){
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = handleImageUpload; input.click();
    }
    function handleImageUpload(e){
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev=>{
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.className = 'draggable-element draggable-image';
            img.style.position='absolute';
            img.style.top='100px'; 
            img.style.left='100px';
            img.style.maxWidth='none'; 
            img.style.maxHeight='none';
            img.style.zIndex = '10';
            img.onload = function(){
                // Set reasonable initial size
                const maxW = 400, maxH = 300;
                let w = img.naturalWidth, h = img.naturalHeight;
                if (w > maxW || h > maxH) {
                    const ratio = Math.min(maxW/w, maxH/h);
                    w *= ratio; h *= ratio;
                }
                img.style.width = `${w}px`;
                img.style.height = `${h}px`;
                adv.canvasRoot.appendChild(img);
                makeDraggable(img);
                addResizeHandle(img);
                selectElement(img);
            };
        };
        reader.readAsDataURL(file);
    }

    // -------- Selection & Resize --------
    function selectElement(node){
        document.querySelectorAll('.draggable-element').forEach(n=>n.classList.remove('selected'));
        node.classList.add('selected');
        selected = node;
        updateProperties(node);
    }

    function addResizeHandle(node){
        const h = document.createElement('div');
        h.className = 'element-resize-handle';
        node.appendChild(h);
        
        // FIXED: Add both mouse and touch events for resize handles
        h.addEventListener('mousedown', startResize);
        h.addEventListener('touchstart', startTouchResize, { passive: false });
        
        function startResize(e) {
            e.stopPropagation();
            resizing = true;
            const sx = e.clientX, sy = e.clientY;
            const sw = parseInt(node.style.width) || node.offsetWidth;
            const sh = parseInt(node.style.height)|| node.offsetHeight;

            function mm(ev){
                if (!resizing) return;
                const w = Math.max(30, sw + (ev.clientX - sx));
                const h = Math.max(30, sh + (ev.clientY - sy));
                node.style.width = `${w}px`;
                node.style.height = `${h}px`;
                if (node.classList.contains('draggable-shape')){
                    // keep text readable
                    node.style.fontSize = `${Math.min(w,h)/3}px`;
                }
                if (node.classList.contains('draggable-text')) {
                    fitSingleLine(node); // ensure single line still fits
                }
                if (selected === node) updateProperties(node);
            }
            function up(){
                resizing = false;
                document.removeEventListener('mousemove', mm);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', mm);
            document.addEventListener('mouseup', up);
        }

        // FIXED: Touch resize functionality for mobile devices
        function startTouchResize(e) {
            e.stopPropagation();
            e.preventDefault();
            resizing = true;
            
            const touch = e.touches[0];
            const sx = touch.clientX, sy = touch.clientY;
            const sw = parseInt(node.style.width) || node.offsetWidth;
            const sh = parseInt(node.style.height) || node.offsetHeight;

            function touchMove(ev){
                if (!resizing) return;
                ev.preventDefault();
                
                const touch = ev.touches[0];
                const w = Math.max(30, sw + (touch.clientX - sx));
                const h = Math.max(30, sh + (touch.clientY - sy));
                node.style.width = `${w}px`;
                node.style.height = `${h}px`;
                
                if (node.classList.contains('draggable-shape')){
                    node.style.fontSize = `${Math.min(w,h)/3}px`;
                }
                if (node.classList.contains('draggable-text')) {
                    fitSingleLine(node);
                }
                if (selected === node) updateProperties(node);
            }
            
            function touchEnd(){
                resizing = false;
                document.removeEventListener('touchmove', touchMove);
                document.removeEventListener('touchend', touchEnd);
            }
            
            document.addEventListener('touchmove', touchMove, { passive: false });
            document.addEventListener('touchend', touchEnd);
        }
    }

    // -------- Properties Panel ----------
    function updateProperties(node){
        const p = adv.propPanel; p.innerHTML = '';
        if (!node) return;

        // TEXT
        if (node.classList.contains('draggable-text')){
            p.innerHTML = `
                <h4>Text Properties</h4>
                <div class="form-group"><label>Text</label>
                  <input type="text" class="prop" data-prop="textContent" value="${escapeHtml(node.textContent)}"></div>
                <div class="form-group"><label>Font Size (px)</label>
                  <input type="range" class="prop" data-prop="fontSize" min="12" max="160" value="${parseInt(node.style.fontSize)||36}">
                  <span class="pv">${parseInt(node.style.fontSize)||36}px</span></div>
                <div class="form-group"><label>Color</label>
                  <input type="color" class="prop" data-prop="color" value="${node.style.color||'#ffffff'}"></div>
                <div class="form-group"><label>Weight</label>
                  <select class="prop" data-prop="fontWeight">
                    <option value="normal" ${node.style.fontWeight==='normal'?'selected':''}>Normal</option>
                    <option value="bold" ${node.style.fontWeight==='bold'?'selected':''}>Bold</option>
                  </select></div>
                <div class="form-group"><label>Style</label>
                  <select class="prop" data-prop="fontStyle">
                    <option value="normal" ${node.style.fontStyle==='normal'?'selected':''}>Normal</option>
                    <option value="italic" ${node.style.fontStyle==='italic'?'selected':''}>Italic</option>
                  </select></div>
                <div class="form-group"><label><input type="checkbox" class="prop" data-prop="shadowEnabled" ${node.dataset.shadowEnabled==='true'?'checked':''}> Shadow</label></div>
                <div class="shadow-block" style="${node.dataset.shadowEnabled==='true'?'':'display:none'}">
                  <div class="form-group"><label>Shadow Color</label>
                    <input type="color" class="prop" data-prop="shadowColor" value="${node.dataset.shadowColor||'#000000'}"></div>
                  <div class="form-group"><label>Shadow X</label>
                    <input type="range" class="prop" data-prop="shadowX" min="-20" max="20" value="${node.dataset.shadowX||'2'}"><span class="pv">${node.dataset.shadowX||'2'}px</span></div>
                  <div class="form-group"><label>Shadow Y</label>
                    <input type="range" class="prop" data-prop="shadowY" min="-20" max="20" value="${node.dataset.shadowY||'2'}"><span class="pv">${node.dataset.shadowY||'2'}px</span></div>
                  <div class="form-group"><label>Shadow Blur</label>
                    <input type="range" class="prop" data-prop="shadowBlur" min="0" max="20" value="${node.dataset.shadowBlur||'2'}"><span class="pv">${node.dataset.shadowBlur||'2'}px</span></div>
                </div>
                <button class="delete-element">Delete Element</button>
            `;
            wireProps(node);
        }
        // SHAPE
        else if (node.classList.contains('draggable-shape')){
            const w = parseInt(node.style.width)||node.offsetWidth;
            const h = parseInt(node.style.height)||node.offsetHeight;
            p.innerHTML = `
                <h4>Shape Properties</h4>
                <div class="form-group"><label>Shape Text</label>
                  <input type="text" class="prop" data-prop="textContent" value="${escapeHtml(node.textContent)}"></div>
                <div class="form-group"><label>Fill Color</label>
                  <input type="color" class="prop" data-prop="shapeColor" value="${node.style.backgroundColor || '#ff0000'}"></div>
                <div class="form-group"><label>Width (px)</label>
                  <input type="range" class="prop" data-prop="width" min="40" max="1000" value="${w}"><span class="pv">${w}px</span></div>
                <div class="form-group"><label>Height (px)</label>
                  <input type="range" class="prop" data-prop="height" min="40" max="800" value="${h}"><span class="pv">${h}px</span></div>
                <div class="form-group"><label>Text Color</label>
                  <input type="color" class="prop" data-prop="color" value="${node.style.color || '#ffffff'}"></div>
                <div class="form-group"><label>Text Size</label>
                  <input type="range" class="prop" data-prop="fontSize" min="10" max="120" value="${parseInt(node.style.fontSize)||24}">
                  <span class="pv">${parseInt(node.style.fontSize)||24}px</span></div>
                <button class="delete-element">Delete Element</button>
            `;
            wireProps(node);
        }
        // ICON
        else if (node.classList.contains('draggable-icon')){
            p.innerHTML = `
                <h4>Icon Properties</h4>
                <div class="form-group"><label>Icon</label>
                  <select class="prop" data-prop="icon">
                    ${ICONS.map(ic=>`<option value="${ic}" ${node.innerHTML.includes(ic)?'selected':''}>${ic.replace('fa-','')}</option>`).join('')}
                  </select></div>
                <div class="form-group"><label>Color</label>
                  <input type="color" class="prop" data-prop="color" value="${node.style.color || '#ffcc00'}"></div>
                <div class="form-group"><label>Size (px)</label>
                  <input type="range" class="prop" data-prop="fontSize" min="12" max="200" value="${parseInt(node.style.fontSize)||56}">
                  <span class="pv">${parseInt(node.style.fontSize)||56}px</span></div>
                <button class="delete-element">Delete Element</button>
            `;
            wireProps(node);
        }
        // IMAGE
        else if (node.tagName === 'IMG'){
            const w = parseInt(node.style.width)||node.naturalWidth||400;
            const h = parseInt(node.style.height)||node.naturalHeight||300;
            const op = node.style.opacity ? parseFloat(node.style.opacity)*100 : 100;
            p.innerHTML = `
                <h4>Image Properties</h4>
                <div class="form-group"><label>Opacity</label>
                  <input type="range" class="prop" data-prop="opacity" min="0" max="100" value="${op}"><span class="pv">${op}%</span></div>
                <div class="form-group"><label>Width (px)</label>
                  <input type="range" class="prop" data-prop="width" min="50" max="1280" value="${w}"><span class="pv">${w}px</span></div>
                <div class="form-group"><label>Height (px)</label>
                  <input type="range" class="prop" data-prop="height" min="50" max="720" value="${h}"><span class="pv">${h}px</span></div>
                <div class="form-group"><button class="fullscreen-btn">Make Full Screen</button></div>
                <div class="form-group"><button class="set-as-bg-btn">Set as Background</button></div>
                <button class="delete-element">Delete Element</button>
            `;
            p.querySelector('.fullscreen-btn').addEventListener('click', ()=>{
                node.style.width = '1280px'; node.style.height='720px'; node.style.left='0'; node.style.top='0';
                updateProperties(node);
            });
            p.querySelector('.set-as-bg-btn').addEventListener('click', ()=>{
                setAdvancedBackground('image', null, node.src);
                node.remove();
                adv.propPanel.innerHTML = '<p>Select an element to edit its properties</p>';
                selected = null;
            });
            wireProps(node);
        }
    }

    function wireProps(node){
        const p = adv.propPanel;
        p.querySelectorAll('.prop').forEach(inp=>{
            inp.addEventListener('input', function(){
                const prop = this.dataset.prop;
                let v = this.value;

                if (prop === 'icon'){
                    node.innerHTML = `<i class="fas ${v}"></i>`;
                    return;
                }
                if (node.classList.contains('draggable-shape') && prop === 'shapeColor'){
                    node.style.backgroundColor = v;
                    applyShapeCSS(node, node.dataset.shape, v);
                    return;
                }
                if (this.type === 'range'){
                    if (prop === 'opacity'){
                        node.style.opacity = (parseInt(v)/100).toString();
                        this.nextElementSibling.textContent = `${v}%`;
                    } else if (prop==='width' || prop==='height' || prop==='fontSize'){
                        node.style[prop] = `${v}px`;
                        this.nextElementSibling.textContent = `${v}px`;
                        if (node.classList.contains('draggable-text')) fitSingleLine(node);
                    } else {
                        this.nextElementSibling.textContent = `${v}px`;
                    }
                } else if (prop === 'textContent'){
                    node.textContent = v;
                    if (node.classList.contains('draggable-text')) fitSingleLine(node);
                } else if (prop === 'shadowEnabled'){
                    const checked = p.querySelector('[data-prop="shadowEnabled"]').checked;
                    node.dataset.shadowEnabled = checked ? 'true' : 'false';
                    p.querySelector('.shadow-block').style.display = checked ? '' : 'none';
                    applyShadow(node);
                } else {
                    // generic style
                    node.style[prop] = v;
                    if (node.classList.contains('draggable-text') && (prop==='fontWeight'||prop==='fontStyle'||prop==='color')) {
                        fitSingleLine(node);
                    }
                }
            });
        });

        p.querySelectorAll('.shadow-block .prop').forEach(inp=>{
            inp.addEventListener('input', function(){
                const prop = this.dataset.prop;
                node.dataset[prop] = this.value;
                if (this.type==='range'){
                    this.nextElementSibling.textContent = `${this.value}px`;
                }
                applyShadow(node);
            });
        });

        p.querySelector('.delete-element')?.addEventListener('click', ()=>{
            node.remove();
            adv.propPanel.innerHTML = '<p>Select an element to edit its properties</p>';
            selected = null;
        });
    }

    function applyShadow(node){
        if (node.dataset.shadowEnabled === 'true'){
            node.style.textShadow = `${node.dataset.shadowX||0}px ${node.dataset.shadowY||0}px ${node.dataset.shadowBlur||0}px ${node.dataset.shadowColor||'#000'}`;
        } else {
            node.style.textShadow = 'none';
        }
    }

    // Keep canvas blank-click to deselect - FIXED: Add touch support
    adv.canvasRoot?.addEventListener('click', function(e){
        if (e.target === this || e.target === adv.preview){
            document.querySelectorAll('.draggable-element').forEach(n=>n.classList.remove('selected'));
            selected = null;
            adv.propPanel.innerHTML = '<p>Select an element to edit its properties</p>';
        }
    });

    // FIXED: Add touch support for canvas deselection
    adv.canvasRoot?.addEventListener('touchend', function(e){
        if (e.target === this || e.target === adv.preview){
            // Only deselect if it's a simple tap, not a drag
            if (!drag.active) {
                document.querySelectorAll('.draggable-element').forEach(n=>n.classList.remove('selected'));
                selected = null;
                adv.propPanel.innerHTML = '<p>Select an element to edit its properties</p>';
            }
        }
    });

    // -------- FIXED Templates Modal (Advanced) with Proper Preview --------
    function openTemplates(){
        const modal = adv.templatesModal;
        if (!modal) return;
        modal.style.display='block';

        // FIXED: Enhanced templates with proper gradient support
        const templates = [
            {name:'Red Gradient', background:'linear-gradient(135deg, #FF0000, #990000)', type:'gradient'},
            {name:'Dark Professional', background:'linear-gradient(135deg, #000000, #333333)', type:'gradient'},
            {name:'Bright Yellow', background:'linear-gradient(135deg, #FFCC00, #FF9900)', type:'gradient'},
            {name:'Blue Ocean', background:'linear-gradient(135deg, #0077b6, #00b4d8)', type:'gradient'},
            {name:'Green Nature', background:'linear-gradient(135deg, #2a9d8f, #e9c46a)', type:'gradient'},
            {name:'Pure Red', background:'#FF0000', type:'color'},
            {name:'Deep Black', background:'#000000', type:'color'},
            {name:'Clean White', background:'#FFFFFF', type:'color'},
            {name:'Royal Blue', background:'#0066FF', type:'color'},
            {name:'Vibrant Green', background:'#00CC66', type:'color'},
            {name:'Premium Gradient', background:'linear-gradient(135deg, #667eea, #764ba2)', type:'gradient'},
            {name:'Dark Elegant', background:'linear-gradient(135deg, #434343, #000000)', type:'gradient'},
            {name:'Summer Vibes', background:'linear-gradient(135deg, #43cea2, #185a9d)', type:'gradient'},
            {name:'Sunset', background:'linear-gradient(135deg, #ff7e5f, #feb47b)', type:'gradient'},
            {name:'Ocean Blue', background:'linear-gradient(135deg, #00c6fb, #005bea)', type:'gradient'},
            {name:'Tech Dark', background:'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', type:'gradient'},
            {name:'Warm Sunset', background:'linear-gradient(135deg, #f12711, #f5af19)', type:'gradient'},
            {name:'Cool Mint', background:'linear-gradient(135deg, #a1ffce, #faffd1)', type:'gradient'},
            {name:'Purple Haze', background:'linear-gradient(135deg, #7b4397, #dc2430)', type:'gradient'},
            {name:'Deep Space', background:'linear-gradient(135deg, #000428, #004e92)', type:'gradient'}
        ];

        const gallery = modal.querySelector('.template-gallery');
        if (gallery){
            gallery.innerHTML = '';
            templates.forEach(t=>{
                const div = document.createElement('div');
                div.className = 'template-thumbnail';
                
                // FIXED: Determine appropriate text color for better visibility
                const textColor = getContrastColor(t.background, t.type);
                
                div.innerHTML = `
                   <div style="background:${t.background};height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:${textColor}">
                      <h3 style="color:${textColor};margin:0;text-shadow:0 1px 3px rgba(0,0,0,0.5)">YOUR TITLE</h3>
                      <p style="color:${textColor};margin:0;opacity:0.9;text-shadow:0 1px 3px rgba(0,0,0,0.5)">Your subtitle</p>
                   </div>
                   <p>${t.name}</p>`;
                div.addEventListener('click', ()=>{
                    applyTemplateAdvanced(t);
                    modal.style.display='none';
                });
                gallery.appendChild(div);
            });
        }

        modal.querySelector('.close')?.addEventListener('click', ()=> modal.style.display='none');
        window.addEventListener('click', function w(e){
            if (e.target===modal){ modal.style.display='none'; window.removeEventListener('click', w); }
        });
    }

    // FIXED: Helper function to determine appropriate text color for templates
    function getContrastColor(background, type) {
        if (type === 'color') {
            // For solid colors, determine if light or dark
            const color = background.replace('#', '');
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return brightness > 128 ? '#000000' : '#FFFFFF';
        } else {
            // For gradients, default to white with shadow for visibility
            return '#FFFFFF';
        }
    }

    // FIXED: Apply template with proper preview update
    function applyTemplateAdvanced(t){
        console.log('Applying template:', t);
        
        // Clear user-added elements except title/subtitle
        document.querySelectorAll('.draggable-element').forEach(n=>{
            if (n.id!=='advanced-title' && n.id!=='advanced-subtitle'){ 
                n.remove(); 
            }
        });
        
        // FIXED: Apply background using enhanced system
        setAdvancedBackground(t.type || 'color', t.background);
        
        // Update title and subtitle with appropriate colors
        const textColor = getContrastColor(t.background, t.type);
        adv.advTitle.textContent = 'YOUR TITLE HERE';
        adv.advTitle.style.color = textColor;
        adv.advSubtitle.textContent = 'Your subtitle text';
        adv.advSubtitle.style.color = textColor === '#FFFFFF' ? '#EEEEEE' : '#666666';

        // Force a visual refresh
        setTimeout(() => {
            console.log('Template applied, background is:', adv.preview.style.background || adv.preview.style.backgroundColor);
        }, 100);

        // Sync to simple mode visually
        el.titleInput.value = 'YOUR TITLE HERE';
        el.subtitleInput.value = 'Your subtitle text';
        applySimpleStyles();
        
        // Deselect any selected elements
        selected = null;
        document.querySelectorAll('.draggable-element').forEach(n=>n.classList.remove('selected'));
        adv.propPanel.innerHTML = '<p>Select an element to edit its properties</p>';
    }

    // -------- Single-line Fit (Text) --------
    function fitSingleLine(node){
        // shrink font-size so that text width <= max canvas width minus margins
        const max = 1240; // 1280 - 40px margin
        const ctx = document.createElement('canvas').getContext('2d');
        let fs = parseInt(node.style.fontSize) || 36;
        const weight = node.style.fontWeight || 'normal';
        const style = node.style.fontStyle || 'normal';
        const family = 'Arial, sans-serif';

        function measure(text, size){
            ctx.font = `${weight} ${style} ${size}px ${family}`;
            return ctx.measureText(text).width;
        }

        let text = node.textContent || '';
        if (text.trim()==='') return;
        // Try reduce until fits
        while (fs > 12 && measure(text, fs) > max){
            fs -= 1;
        }
        node.style.fontSize = `${fs}px`;
        node.style.whiteSpace = 'nowrap';
    }

    // -------- FIXED Advanced Download - EXACT PREVIEW MATCHING for Mobile --------
    async function downloadAdvanced(){
        try {
            const btn = adv.advDownloadBtn;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            // FIXED: Get actual canvas dimensions from preview (mobile or desktop)
            const canvasRect = adv.canvasRoot.getBoundingClientRect();
            const actualWidth = Math.round(canvasRect.width);
            const actualHeight = Math.round(canvasRect.height);

            // Create canvas with actual dimensions being displayed
            const cvs = document.createElement('canvas');
            cvs.width = actualWidth; 
            cvs.height = actualHeight;
            const ctx = cvs.getContext('2d');

            // FIXED: Render background exactly as it appears in preview
            await renderBackgroundToCanvas(ctx, actualWidth, actualHeight);

            // Get all elements and sort by z-index (same as preview)
            const nodes = Array.from(adv.canvasRoot.querySelectorAll('.draggable-element'));
            nodes.sort((a,b)=> (parseInt(a.style.zIndex)||0) - (parseInt(b.style.zIndex)||0));

            // Render all elements exactly as they appear in preview
            for (const n of nodes){
                await renderElementToCanvas(ctx, n, canvasRect);
            }

            // Download the canvas
            cvs.toBlob((blob)=>{
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; 
                a.download = `youtube-thumbnail-${actualWidth}x${actualHeight}.png`;
                document.body.appendChild(a); a.click();
                setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 120);
            }, 'image/png');

        } catch (err) {
            console.error('Advanced download error:', err);
            alert("Error downloading thumbnail: " + err.message);
        } finally {
            adv.advDownloadBtn.disabled = false;
            adv.advDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Thumbnail';
        }
    }

    // FIXED: Enhanced background rendering function with dynamic dimensions
    async function renderBackgroundToCanvas(ctx, canvasWidth, canvasHeight) {
        console.log('Rendering background:', currentBackground, `Size: ${canvasWidth}x${canvasHeight}`);
        
        if (currentBackground.type === 'color') {
            ctx.fillStyle = currentBackground.value;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (currentBackground.type === 'gradient') {
            const gradientValue = currentBackground.value;
            if (gradientValue.includes('linear-gradient')) {
                // Enhanced gradient parsing
                const colorMatches = gradientValue.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g);
                if (colorMatches && colorMatches.length >= 2) {
                    // Create diagonal gradient (135deg approximation)
                    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
                    gradient.addColorStop(0, colorMatches[0]);
                    gradient.addColorStop(1, colorMatches[colorMatches.length - 1]);
                    
                    // Add middle colors if present
                    if (colorMatches.length > 2) {
                        for (let i = 1; i < colorMatches.length - 1; i++) {
                            gradient.addColorStop(i / (colorMatches.length - 1), colorMatches[i]);
                        }
                    }
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = '#FF0000'; // fallback
                }
            } else {
                ctx.fillStyle = gradientValue; // fallback to solid color
            }
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (currentBackground.type === 'image' && currentBackground.imageData) {
            const img = await loadImageSafe(currentBackground.imageData);
            if (img) {
                // Render image to cover the entire canvas (same as CSS background-size: cover)
                const imgAspect = img.width / img.height;
                const canvasAspect = canvasWidth / canvasHeight;
                
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                
                if (imgAspect > canvasAspect) {
                    // Image is wider - fit to height
                    drawHeight = canvasHeight;
                    drawWidth = drawHeight * imgAspect;
                    offsetX = -(drawWidth - canvasWidth) / 2;
                } else {
                    // Image is taller - fit to width
                    drawWidth = canvasWidth;
                    drawHeight = drawWidth / imgAspect;
                    offsetY = -(drawHeight - canvasHeight) / 2;
                }
                
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        }
    }

    // FIXED: Element rendering function with exact positioning from preview
    async function renderElementToCanvas(ctx, node, canvasRect) {
        // Get exact position from computed styles relative to canvas
        const rect = node.getBoundingClientRect();
        
        // Calculate position relative to canvas
        const x = rect.left - canvasRect.left;
        const y = rect.top - canvasRect.top;
        const nodeWidth = rect.width;
        const nodeHeight = rect.height;

        if (node.tagName === 'IMG'){
            const img = await loadImageSafe(node.src);
            if (!img) return;
            const alpha = node.style.opacity ? parseFloat(node.style.opacity) : 1;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.drawImage(img, x, y, nodeWidth, nodeHeight);
            ctx.restore();
            return;
        }

        if (node.classList.contains('draggable-text')){
            const text = node.textContent || '';
            if (!text.trim()) return;
            
            const computedStyle = window.getComputedStyle(node);
            const size = parseFloat(computedStyle.fontSize);
            const weight = computedStyle.fontWeight || 'normal';
            const fontStyle = computedStyle.fontStyle || 'normal';
            const color = computedStyle.color || '#FFFFFF';

            ctx.save();
            ctx.font = `${weight} ${fontStyle} ${size}px Arial, sans-serif`;
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            // Apply shadow if enabled (exactly as it appears in preview)
            if (node.dataset.shadowEnabled === 'true'){
                ctx.shadowOffsetX = parseInt(node.dataset.shadowX)||0;
                ctx.shadowOffsetY = parseInt(node.dataset.shadowY)||0;
                ctx.shadowBlur = parseInt(node.dataset.shadowBlur)||0;
                ctx.shadowColor = node.dataset.shadowColor || '#000000';
            }
            
            ctx.fillText(text, x, y);
            ctx.restore();
            return;
        }

        if (node.classList.contains('draggable-icon')){
            const computedStyle = window.getComputedStyle(node);
            const size = parseFloat(computedStyle.fontSize);
            const color = computedStyle.color || '#FFCC00';
            const char = iconToEmoji(node.innerHTML);
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.fillStyle = color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(char, x, y);
            ctx.restore();
            return;
        }

        if (node.classList.contains('draggable-shape')){
            const type = node.dataset.shape;
            const w = nodeWidth;
            const h = nodeHeight;
            const fill = node.style.backgroundColor || '#FF0000';

            ctx.save();
            ctx.fillStyle = fill;

            if (type==='rectangle'){
                ctx.fillRect(x, y, w, h);
            } else if (type==='circle'){
                ctx.beginPath(); 
                ctx.arc(x + w/2, y + h/2, Math.min(w,h)/2, 0, Math.PI*2); 
                ctx.fill();
            } else if (type==='oval'){
                ctx.beginPath(); 
                ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI*2); 
                ctx.fill();
            } else if (type==='rounded'){
                const radius = Math.min(16, w/4, h/4);
                roundRect(ctx, x, y, w, h, radius); 
                ctx.fill();
            } else if (type==='parallelogram'){
                const skew = Math.min(30, w/6);
                ctx.beginPath();
                ctx.moveTo(x+skew, y);
                ctx.lineTo(x+w, y);
                ctx.lineTo(x+w-skew, y+h);
                ctx.lineTo(x, y+h);
                ctx.closePath(); 
                ctx.fill();
            } else if (type==='rhombus'){
                ctx.beginPath();
                ctx.moveTo(x+w/2, y);
                ctx.lineTo(x+w, y+h/2);
                ctx.lineTo(x+w/2, y+h);
                ctx.lineTo(x, y+h/2);
                ctx.closePath(); 
                ctx.fill();
            } else {
                ctx.fillRect(x,y,w,h);
            }

            // Draw text if present (exactly as it appears in preview)
            if (node.textContent && node.textContent.trim()){
                const txt = node.textContent;
                const computedStyle = window.getComputedStyle(node);
                const txtSize = parseFloat(computedStyle.fontSize);
                const txtColor = computedStyle.color || '#FFFFFF';
                ctx.font = `bold ${txtSize}px Arial`;
                ctx.fillStyle = txtColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(txt, x + w/2, y + h/2);
            }
            ctx.restore();
            return;
        }
    }

    // ------------ Helper Functions ------------
    function extractURL(bgImage){
        return bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
    }

    function loadImageSafe(src){
        return new Promise(resolve=>{
            if (!src) return resolve(null);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = ()=>resolve(img);
            img.onerror = ()=>{ console.warn('Skipped broken image:', src); resolve(null); };
            img.src = src;
        });
    }

    function iconToEmoji(html){
        if (html.includes('fa-star')) return '⭐';
        if (html.includes('fa-heart')) return '❤️';
        if (html.includes('fa-thumbs-up')) return '👍';
        if (html.includes('fa-check')) return '✓';
        if (html.includes('fa-play')) return '▶️';
        if (html.includes('fa-arrow-right')) return '→';
        if (html.includes('fa-bell')) return '🔔';
        if (html.includes('fa-camera')) return '📷';
        if (html.includes('fa-comment')) return '💬';
        if (html.includes('fa-envelope')) return '✉️';
        if (html.includes('fa-flag')) return '🏳️';
        if (html.includes('fa-gift')) return '🎁';
        if (html.includes('fa-home')) return '🏠';
        if (html.includes('fa-image')) return '🖼️';
        if (html.includes('fa-key')) return '🔑';
        if (html.includes('fa-lightbulb')) return '💡';
        if (html.includes('fa-map-marker')) return '📍';
        if (html.includes('fa-paperclip')) return '📎';
        if (html.includes('fa-question')) return '❓';
        if (html.includes('fa-share')) return '↗️';
        return '⭐';
    }

    function roundRect(ctx, x,y,w,h,r){
        ctx.beginPath();
        ctx.moveTo(x+r,y);
        ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.closePath();
    }

    function escapeHtml(str=''){
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
});