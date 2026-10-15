// ============================================
// THEME TOGGLE (Simple icon-based button)
// ============================================
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const root = document.documentElement;

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });
}

// Year update
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================
// GREETING ANIMATION (namaste ↔ hi ↔ hello)
// ============================================
const greetingEl = document.getElementById('greeting-text');
const greetingBtn = document.getElementById('hero-greeting-btn');
const greetings = ['namaste', 'hi', 'hello'];
let currentGreeting = 0;

function cycleGreeting() {
    if (!greetingEl) return;
    greetingEl.classList.add('fade-out');
    greetingEl.classList.remove('fade-in');
    setTimeout(() => {
        currentGreeting = (currentGreeting + 1) % greetings.length;
        greetingEl.textContent = greetings[currentGreeting];
        greetingEl.classList.remove('fade-out');
        greetingEl.classList.add('fade-in');
    }, 200);
}

if (greetingEl) {
    setInterval(cycleGreeting, 4500);
}

if (greetingBtn) {
    greetingBtn.addEventListener('click', cycleGreeting);
}

// ============================================
// CONTACT & MORE EXPANDED DROPDOWN TILE
// ============================================
const contactMoreBtn = document.getElementById('contact-more-btn');
const contactDropdown = document.getElementById('contact-dropdown-panel');

if (contactMoreBtn && contactDropdown) {
    contactMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = contactDropdown.classList.contains('show');
        contactDropdown.classList.toggle('show');
        contactMoreBtn.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', (e) => {
        if (!contactDropdown.contains(e.target) && !contactMoreBtn.contains(e.target)) {
            contactDropdown.classList.remove('show');
            contactMoreBtn.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            contactDropdown.classList.remove('show');
            contactMoreBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Slash shortcut to open "write me a message" on the monkey
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        if (typeof window.openMonkeyMessageInput === 'function') {
            window.openMonkeyMessageInput();
        }
    }
});

// ============================================
// NAVBAR ACTIVE LINK ON SCROLL & CURVED UNDERLINE
// ============================================
const headerNavLinks = document.querySelectorAll('.header-nav-link');
const trackedSections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    trackedSections.forEach(section => {
        const top = section.offsetTop - 120;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            headerNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

headerNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            const el = document.querySelector(targetId);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
                headerNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
});

// Back to top button
const backToTopBtn = document.getElementById('back-to-top-btn');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// WORKS TAB SWITCHER
// ============================================
const worksTabs = document.querySelectorAll('.works-tab');
const tabPanes = document.querySelectorAll('.tab-pane');
const tabIndicator = document.getElementById('works-tab-indicator');

function updateTabIndicator(activeTab) {
    if (!tabIndicator || !activeTab) return;
    tabIndicator.style.width = `${activeTab.offsetWidth}px`;
    tabIndicator.style.transform = `translateX(${activeTab.offsetLeft - 2}px)`;
}

worksTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        worksTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateTabIndicator(tab);

        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `pane-${tabType}`) {
                pane.classList.add('active');
            }
        });

        document.dispatchEvent(new CustomEvent('tabswitched', { detail: { tab: tabType } }));
    });
});

window.addEventListener('load', () => {
    const active = document.querySelector('.works-tab.active');
    if (active) updateTabIndicator(active);
});

// ============================================
// SUDOKU MINI WINDOW
// ============================================
const sudokuOverlay = document.getElementById('sudoku-overlay');
const winClose = document.getElementById('win-close');

const SOLUTION = [
    [1, 4, 5, 2, 3, 6], [2, 3, 6, 1, 5, 4], [4, 6, 1, 3, 2, 5],
    [5, 2, 3, 6, 4, 1], [6, 5, 2, 4, 1, 3], [3, 1, 4, 5, 6, 2]
];
const PUZZLE = [
    [0, 4, 5, 0, 0, 0], [2, 3, 0, 0, 0, 4], [0, 6, 0, 3, 0, 0],
    [0, 0, 3, 0, 0, 1], [0, 5, 0, 0, 1, 3], [3, 0, 4, 0, 6, 0]
];

let board = [], selectedCell = null, moveHistory = [];
const sudokuGrid = document.getElementById('sudoku-grid');
const sudokuWinMsg = document.getElementById('sudoku-win-msg');

function initSudoku() {
    board = PUZZLE.map(r => [...r]);
    selectedCell = null;
    moveHistory = [];
    if (sudokuWinMsg) sudokuWinMsg.classList.remove('show');
    renderGrid();
}

function renderGrid() {
    if (!sudokuGrid) return;
    sudokuGrid.innerHTML = '';
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            if (c === 2) cell.classList.add('box-right');
            if (r === 1 || r === 3) cell.classList.add('box-bottom');
            if (PUZZLE[r][c] !== 0) {
                cell.classList.add('given');
                cell.textContent = PUZZLE[r][c];
            } else {
                if (board[r][c] !== 0) {
                    cell.textContent = board[r][c];
                    if (board[r][c] !== SOLUTION[r][c]) cell.classList.add('error');
                }
                cell.addEventListener('click', () => selectCell(r, c));
            }
            if (selectedCell && selectedCell.row === r && selectedCell.col === c) cell.classList.add('selected');
            if (selectedCell && (r === selectedCell.row || c === selectedCell.col)) cell.classList.add('highlight');
            sudokuGrid.appendChild(cell);
        }
    }
}

function selectCell(r, c) {
    selectedCell = { row: r, col: c };
    renderGrid();
}

function placeNumber(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (PUZZLE[row][col] !== 0) return;
    moveHistory.push({ row, col, prev: board[row][col] });
    board[row][col] = num;
    renderGrid();

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            if (board[i][j] !== SOLUTION[i][j]) return;
        }
    }
    if (sudokuWinMsg) sudokuWinMsg.classList.add('show');
}

function undoMove() {
    if (!moveHistory.length) return;
    const { row, col, prev } = moveHistory.pop();
    board[row][col] = prev;
    selectedCell = { row, col };
    renderGrid();
}

document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
    btn.addEventListener('click', () => placeNumber(parseInt(btn.dataset.num)));
});
const undoBtn = document.getElementById('undo-btn');
if (undoBtn) undoBtn.addEventListener('click', undoMove);

window.openSudokuWindow = function() {
    if (sudokuOverlay) sudokuOverlay.classList.add('active');
    initSudoku();
};

window.closeSudokuWindow = function() {
    if (sudokuOverlay) sudokuOverlay.classList.remove('active');
};

if (winClose) winClose.addEventListener('click', window.closeSudokuWindow);
if (sudokuOverlay) {
    sudokuOverlay.addEventListener('click', (e) => {
        if (e.target === sudokuOverlay) window.closeSudokuWindow();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeSudokuWindow();
    }
    if (sudokuOverlay && sudokuOverlay.classList.contains('active')) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) placeNumber(num);
        else if (e.key === 'Backspace' || e.key === 'Delete') placeNumber(0);
        else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) undoMove();
    }
});

// ============================================
// IMAGE LIGHTBOX VIEWER
// ============================================
(function() {
    const ivOverlay = document.getElementById('iv-overlay');
    const ivBackdrop = document.getElementById('iv-backdrop');
    const ivClose = document.getElementById('iv-close');
    const ivImg = document.getElementById('iv-img');
    const ivTag = document.getElementById('iv-tag');
    const ivDribbble = document.getElementById('iv-dribbble-link');
    const ivBehance = document.getElementById('iv-behance-link');
    const ivPrev = document.getElementById('iv-prev');
    const ivNext = document.getElementById('iv-next');
    const ivAmbientGlow = document.getElementById('iv-ambient-glow');

    if (!ivOverlay) return;

    function getTriggers() {
        return Array.from(document.querySelectorAll('.img-viewer-trigger'));
    }

    let currentIndex = 0;

    function openViewer(index) {
        const triggers = getTriggers();
        if (index < 0 || index >= triggers.length) return;
        currentIndex = index;
        const trigger = triggers[index];

        const src = trigger.dataset.img || '';
        const title = trigger.dataset.title || '';
        const dribbble = trigger.dataset.dribbble || '#';
        const behance = trigger.dataset.behance || '#';

        if (ivTag) ivTag.textContent = title;
        if (ivDribbble) {
            ivDribbble.href = dribbble;
            ivDribbble.style.display = (dribbble && dribbble !== '#') ? 'inline-flex' : 'none';
        }
        if (ivBehance) {
            ivBehance.href = behance;
            ivBehance.style.display = (behance && behance !== '#') ? 'inline-flex' : 'none';
        }
        if (ivImg) {
            ivImg.src = src;
            ivImg.alt = title;
        }
        if (ivAmbientGlow && src) {
            ivAmbientGlow.style.backgroundImage = `url("${src}")`;
        }

        ivOverlay.classList.add('iv-active');
        document.body.style.overflow = 'hidden';

        if (ivPrev) ivPrev.classList.toggle('iv-nav-disabled', index === 0);
        if (ivNext) ivNext.classList.toggle('iv-nav-disabled', index === triggers.length - 1);
    }

    function closeViewer() {
        ivOverlay.classList.remove('iv-active');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.img-viewer-trigger');
        if (!trigger) return;
        const triggers = getTriggers();
        const idx = triggers.indexOf(trigger);
        if (idx !== -1) openViewer(idx);
    });

    if (ivClose) ivClose.addEventListener('click', closeViewer);
    if (ivBackdrop) ivBackdrop.addEventListener('click', closeViewer);
    if (ivPrev) ivPrev.addEventListener('click', () => openViewer(currentIndex - 1));
    if (ivNext) ivNext.addEventListener('click', () => openViewer(currentIndex + 1));
})();

// ============================================
// CUTE INTERACTIVE PIXEL MONKEY
// Uses assets/monkey-strip.png (8 frames, perfectly aligned, transparent)
// Frames: IDLE(0), WALK_R(1), WALK_L(2), RUN_R(3), RUN_L(4), JUMP(5), WAVE(6), HANG(7)
// Bubble appears ONLY on hover/focus and disappears when not hovering
// ============================================
(function () {
    const SPRITE_SRC = 'assets/monkey-strip.png';
    const TOTAL_FRAMES = 8;
    const DISPLAY_SIZE = 48;

    const FRAME = {
        IDLE:       0,
        WALK_RIGHT: 1,
        WALK_LEFT:  2,
        RUN_RIGHT:  3,
        RUN_LEFT:   4,
        JUMP:       5,
        WAVE:       6,
        HANG:       7,
    };

    // Remove any older monkey instances
    const oldMonkey = document.getElementById('interactive-monkey');
    if (oldMonkey) oldMonkey.remove();

    // Build monkey container
    const monkey = document.createElement('div');
    monkey.id = 'interactive-monkey';
    monkey.className = 'interactive-monkey';
    monkey.innerHTML = `
        <div class="monkey-sprite" id="monkey-sprite"></div>
        <div class="monkey-minimal-bubble" id="monkey-minimal-bubble">
            <div class="bubble-inner-row">
                <input type="text" id="monkey-minimal-input" placeholder="say something..." autocomplete="off" spellcheck="false" />
                <button type="button" class="bubble-sudoku-icon" id="bubble-sudoku-trigger" title="Play Sudoku">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                        <rect x="3" y="3" width="18" height="18" rx="1"/>
                        <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
                    </svg>
                </button>
                <button type="button" class="bubble-send-btn" id="bubble-send-btn" title="Send message">&#x21B5;</button>
            </div>
            <div class="bubble-mini-status" id="bubble-mini-status"></div>
        </div>
    `;
    document.body.appendChild(monkey);

    const spriteEl   = document.getElementById('monkey-sprite');
    const bubble     = document.getElementById('monkey-minimal-bubble');
    const minInput   = document.getElementById('monkey-minimal-input');
    const sudokuTrig = document.getElementById('bubble-sudoku-trigger');
    const sendBtn    = document.getElementById('bubble-send-btn');
    const statusMsg  = document.getElementById('bubble-mini-status');

    function setFrame(frameIndex) {
        if (!spriteEl) return;
        spriteEl.style.backgroundImage = "url('" + SPRITE_SRC + "')";
        spriteEl.style.backgroundRepeat = 'no-repeat';
        spriteEl.style.imageRendering = 'pixelated';
        spriteEl.style.width  = DISPLAY_SIZE + 'px';
        spriteEl.style.height = DISPLAY_SIZE + 'px';
        spriteEl.style.backgroundSize = (TOTAL_FRAMES * DISPLAY_SIZE) + 'px ' + DISPLAY_SIZE + 'px';
        spriteEl.style.backgroundPosition = (-frameIndex * DISPLAY_SIZE) + 'px 0px';
    }

    setFrame(FRAME.IDLE);

    // ---- State ----
    let isJumping = false;
    let isHovered = false;
    let currentPerchIndex = -1;
    let walkInterval = null;

    const perchSelectors = [
        '.hero-status-pill',
        '.hero-greeting-btn',
        '.hero-title-main',
        '.works-nav',
        '.work-card:nth-child(1)',
        '.work-card:nth-child(2)',
        '.work-item-banner',
        '.about-album-frame',
        '.site-footer',
        '.header-actions',
        '.orrery-diagram-card',
    ];

    function getValidPerches() {
        var list = [];
        perchSelectors.forEach(function(sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function(el) {
                if (el && el.offsetParent !== null) {
                    var rect = el.getBoundingClientRect();
                    if (rect.width > 20 && rect.height > 10) {
                        list.push({ el: el, selector: sel });
                    }
                }
            });
        });
        return list;
    }

    function playWalkingAnimation(steps, direction, callback) {
        clearInterval(walkInterval);
        var currentStep = 0;
        var frameA = direction === 'right' ? FRAME.WALK_RIGHT : FRAME.WALK_LEFT;
        var frameB = direction === 'right' ? FRAME.RUN_RIGHT : FRAME.RUN_LEFT;

        walkInterval = setInterval(function() {
            currentStep++;
            setFrame(currentStep % 2 === 1 ? frameA : frameB);
            if (currentStep >= steps * 2) {
                clearInterval(walkInterval);
                setFrame(FRAME.IDLE);
                if (callback) callback();
            }
        }, 150);
    }

    function positionAtPerch(item, animate) {
        if (!item || !item.el) return;
        var el = item.el;
        var rect = el.getBoundingClientRect();
        var pageScrollX = window.scrollX || window.pageXOffset;
        var pageScrollY = window.scrollY || window.pageYOffset;

        var hangRandom = Math.random() > 0.55;
        var targetX, targetY;

        if (hangRandom) {
            targetX = rect.left + pageScrollX + (Math.random() * rect.width * 0.6 + rect.width * 0.2);
            targetY = rect.bottom + pageScrollY - 6;
        } else {
            targetX = rect.left + pageScrollX + (Math.random() * rect.width * 0.5 + rect.width * 0.25);
            targetY = rect.top + pageScrollY - DISPLAY_SIZE - 4;
        }

        var maxX = document.documentElement.clientWidth - DISPLAY_SIZE - 12;
        if (targetX > maxX) targetX = maxX;
        if (targetX < 12) targetX = 12;

        var currentX = parseFloat(monkey.style.left) || 0;
        var dir = targetX > currentX ? 'right' : 'left';

        if (animate) {
            isJumping = true;
            setFrame(FRAME.JUMP);
            monkey.style.transition = 'left 0.5s cubic-bezier(0.22,1,0.36,1), top 0.5s cubic-bezier(0.22,1,0.36,1)';
            monkey.style.left = targetX + 'px';
            monkey.style.top  = targetY + 'px';

            setTimeout(function() {
                isJumping = false;
                if (hangRandom) {
                    setFrame(FRAME.HANG);
                } else {
                    playWalkingAnimation(1, dir, function() { setFrame(FRAME.IDLE); });
                }
            }, 520);
        } else {
            monkey.style.transition = 'none';
            monkey.style.left = targetX + 'px';
            monkey.style.top  = targetY + 'px';
            setFrame(hangRandom ? FRAME.HANG : FRAME.IDLE);
        }
    }

    function jumpToRandomPerch() {
        if (isJumping) return;
        var perches = getValidPerches();
        if (perches.length === 0) return;
        var nextIndex;
        if (perches.length === 1) {
            nextIndex = 0;
        } else {
            do { nextIndex = Math.floor(Math.random() * perches.length); }
            while (nextIndex === currentPerchIndex);
        }
        currentPerchIndex = nextIndex;
        positionAtPerch(perches[nextIndex], true);
    }

    spriteEl.addEventListener('click', function(e) {
        e.stopPropagation();
        jumpToRandomPerch();
    });

    // ---- Bubble: only shown on hover/focus ----
    var hideTimer = null;

    function showBubble() {
        clearTimeout(hideTimer);
        isHovered = true;
        monkey.classList.add('show-bubble');
        if (!isJumping) setFrame(FRAME.WAVE);
    }

    function hideBubble() {
        hideTimer = setTimeout(function() {
            isHovered = false;
            monkey.classList.remove('show-bubble');
            if (!isJumping) setFrame(FRAME.IDLE);
        }, 350);
    }

    monkey.addEventListener('mouseenter', function() {
        showBubble();
        setTimeout(function() { if (!minInput.value) minInput.focus(); }, 80);
    });

    monkey.addEventListener('mouseleave', function() {
        if (document.activeElement === minInput) return;
        hideBubble();
    });

    minInput.addEventListener('focus', function() {
        clearTimeout(hideTimer);
        isHovered = true;
        monkey.classList.add('show-bubble');
        if (!isJumping) setFrame(FRAME.WAVE);
    });

    minInput.addEventListener('blur', function() {
        hideBubble();
    });

    // Global helper: open bubble
    window.openMonkeyMessageInput = function() {
        var pageScrollY = window.scrollY || window.pageYOffset;
        var monkeyTop   = parseFloat(monkey.style.top) || 0;
        var viewHeight  = window.innerHeight;

        if (monkeyTop < pageScrollY || monkeyTop > pageScrollY + viewHeight - 60) {
            var perches = getValidPerches();
            var inView  = perches.filter(function(p) {
                var r = p.el.getBoundingClientRect();
                return r.top >= 80 && r.bottom <= viewHeight - 80;
            });
            if (inView.length > 0) positionAtPerch(inView[0], true);
        }

        showBubble();
        setTimeout(function() { minInput.focus(); }, 80);
    };

    // Global '/' key shortcut to open monkey bubble
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            window.openMonkeyMessageInput();
        }
    });

    // ---- Send message ----
    function handleSend() {
        var text = minInput.value.trim();
        if (!text) { minInput.focus(); return; }

        statusMsg.textContent = 'sending...';
        statusMsg.classList.add('active');

        var doSend = function() {
            if (window.emailjs) {
                emailjs.send('my-portfolio-messages', 'template_w7rjff6', {
                    from_name: 'Visitor via Monkey Note',
                    name: 'Visitor',
                    message: text,
                    time: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                }).catch(function() {});
            }
            statusMsg.textContent = 'sent \u2713';
            minInput.value = '';
            setTimeout(function() {
                statusMsg.textContent = '';
                statusMsg.classList.remove('active');
                hideBubble();
            }, 2000);
        };

        doSend();
    }

    sendBtn.addEventListener('click', handleSend);
    minInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
    });

    sudokuTrig.addEventListener('click', function(e) {
        e.stopPropagation();
        if (typeof window.openSudokuWindow === 'function') window.openSudokuWindow();
    });

    // Periodic idle animations every ~11s
    setInterval(function() {
        if (!isJumping && !isHovered && document.activeElement !== minInput) {
            if (Math.random() < 0.4) {
                setFrame(FRAME.WAVE);
                setTimeout(function() {
                    if (!isJumping && !isHovered) setFrame(FRAME.IDLE);
                }, 900);
            } else {
                var dir = Math.random() > 0.5 ? 'right' : 'left';
                playWalkingAnimation(1, dir, function() { setFrame(FRAME.IDLE); });
            }
        }
    }, 11000);

    // Auto-jump every 28-40s
    function scheduleAutoJump() {
        var delay = 28000 + Math.random() * 12000;
        setTimeout(function() {
            if (!isHovered && document.activeElement !== minInput) jumpToRandomPerch();
            scheduleAutoJump();
        }, delay);
    }

    function initPosition() {
        var perches = getValidPerches();
        if (perches.length > 0) {
            currentPerchIndex = 0;
            positionAtPerch(perches[0], false);
        } else {
            monkey.style.left = '78vw';
            monkey.style.top  = '120px';
        }
        scheduleAutoJump();
    }

    window.addEventListener('resize', function() {
        var perches = getValidPerches();
        if (perches[currentPerchIndex]) positionAtPerch(perches[currentPerchIndex], false);
    });

    if (document.readyState === 'complete') {
        setTimeout(initPosition, 300);
    } else {
        window.addEventListener('load', function() { setTimeout(initPosition, 300); });
    }
})();
