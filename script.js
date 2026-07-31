// ============================================
// THEME TOGGLE (light / dark)
// ============================================
const themeToggleInput = document.getElementById('theme-toggle-input');
const root = document.documentElement;

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

if (themeToggleInput) {
    themeToggleInput.addEventListener('change', (e) => {
        setTheme(e.target.checked ? 'dark' : 'light');
    });

    // Set initial state
    const currentTheme = root.getAttribute('data-theme') || 'light';
    themeToggleInput.checked = (currentTheme === 'dark');
}

// ============================================
// GREETING ANIMATION (namaste ↔ hi)
// ============================================
const greetingEl = document.getElementById('greeting-text');
const greetings = ['namaste', 'hi', 'hello'];
let currentGreeting = 0;

setInterval(() => {
    greetingEl.classList.add('fade-out');
    greetingEl.classList.remove('fade-in');
    setTimeout(() => {
        currentGreeting = (currentGreeting + 1) % greetings.length;
        greetingEl.textContent = greetings[currentGreeting];
        greetingEl.classList.remove('fade-out');
        greetingEl.classList.add('fade-in');
    }, 350);
}, 5000);

// ============================================
// PAGE SWITCHING (About is default, Work is secondary)
// ============================================
const navLinks = document.querySelectorAll('.nav-link[data-page]');
const pageWork = document.getElementById('page-work');
const pageAbout = document.getElementById('page-about');
const pageProjects = document.getElementById('page-projects');
const pageBranding = document.getElementById('page-branding');
const rightSection = document.getElementById('right-section');
const toggleDesigns = document.getElementById('toggle-designs');
const toggleBranding = document.getElementById('toggle-branding');
const toggleProjects = document.getElementById('toggle-projects');

function switchPage(page) {
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    const current = document.querySelector('.page-content.active');
    if (current) {
        current.style.opacity = '0';
        current.style.transform = 'translateY(12px)';
    }

    setTimeout(() => {
        pageWork.classList.remove('active');
        pageAbout.classList.remove('active');
        if (pageProjects) pageProjects.classList.remove('active');
        if (pageBranding) pageBranding.classList.remove('active');

        if (page === 'work') {
            document.getElementById('works-toggle-container').style.display = 'inline-flex';
            document.getElementById('about-title').style.display = 'none';
            if (toggleProjects && toggleProjects.checked) {
                pageProjects.classList.add('active');
            } else if (toggleBranding && toggleBranding.checked) {
                pageBranding.classList.add('active');
            } else {
                pageWork.classList.add('active');
            }
            observeCards();
        } else {
            document.getElementById('works-toggle-container').style.display = 'none';
            document.getElementById('about-title').style.display = 'inline-flex';
            pageAbout.classList.add('active');
        }

        rightSection.scrollTo({ top: 0, behavior: 'instant' });

        const next = document.querySelector('.page-content.active');
        if (next) {
            next.style.opacity = '0';
            next.style.transform = 'translateY(12px)';
            requestAnimationFrame(() => {
                next.style.transition = 'opacity 0.35s var(--ease-out), transform 0.35s var(--ease-out)';
                next.style.opacity = '1';
                next.style.transform = 'translateY(0)';
            });
        }
    }, 250);
}

function handleWorksToggle() {
    // Only switch if we are currently on the 'work' tab section
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink && activeLink.dataset.page !== 'work') return;

    // Reuse switchPage with 'work' to run the transition logic
    switchPage('work');
}

if (toggleDesigns) toggleDesigns.addEventListener('change', handleWorksToggle);
if (toggleBranding) toggleBranding.addEventListener('change', handleWorksToggle);
if (toggleProjects) toggleProjects.addEventListener('change', handleWorksToggle);

// Click logo → go back to Work (home)
document.getElementById('nav-logo').addEventListener('click', () => {
    switchPage('work');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) switchPage(page);
    });
});

// ============================================
// SCROLL PROGRESS + GLASS HEADER
// ============================================
const progressValue = document.getElementById('progress-value');
const rightHeader = document.getElementById('right-header');

function handleScroll() {
    let scrollTop, scrollHeight, clientHeight;
    if (window.innerWidth <= 900) {
        scrollTop = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
    } else {
        scrollTop = rightSection.scrollTop;
        scrollHeight = rightSection.scrollHeight;
        clientHeight = rightSection.clientHeight;
    }
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 0;
    progressValue.textContent = `(${Math.min(100, Math.max(0, progress))}%)`;
    rightHeader.classList.toggle('scrolled', scrollTop > 8);
}

rightSection.addEventListener('scroll', handleScroll);
window.addEventListener('scroll', handleScroll);

// ============================================
// SAY HI BUTTON — MAGNETIC + OPEN MODAL
// ============================================
const sayHiBtn = document.getElementById('say-hi-btn');

sayHiBtn.addEventListener('mousemove', (e) => {
    const rect = sayHiBtn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    sayHiBtn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
});
sayHiBtn.addEventListener('mouseleave', () => { sayHiBtn.style.transform = ''; });
sayHiBtn.addEventListener('click', openNotesModal);

// ============================================
// SEND NOTES MODAL
// ============================================
const notesOverlay = document.getElementById('notes-overlay');
const notesClose = document.getElementById('notes-close');
const notesMessage = document.getElementById('notes-message');
const notesSend = document.getElementById('notes-send');
const notesBody = document.getElementById('notes-body');
const notesSuccess = document.getElementById('notes-success');
const notesFooter = document.getElementById('notes-footer');

function openNotesModal() {
    notesOverlay.classList.add('active');
    notesBody.style.display = '';
    notesFooter.style.display = '';
    notesSuccess.classList.remove('show');
    notesMessage.value = '';
    notesSend.disabled = false;
    notesSend.textContent = 'send →';
    setTimeout(() => notesMessage.focus(), 300);
}

function closeNotesModal() { notesOverlay.classList.remove('active'); }
notesClose.addEventListener('click', closeNotesModal);
notesOverlay.addEventListener('click', (e) => { if (e.target === notesOverlay) closeNotesModal(); });

notesSend.addEventListener('click', async () => {
    const message = notesMessage.value.trim();
    if (!message) return;

    notesSend.disabled = true;
    notesSend.textContent = 'sending...';

    try {
        const res = await fetch('https://formsubmit.co/ajax/sumankr8586@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ message, _subject: 'New note from portfolio ✉', _template: 'table' })
        });
        if (res.ok) {
            notesBody.style.display = 'none';
            notesFooter.style.display = 'none';
            notesSuccess.classList.add('show');
            setTimeout(closeNotesModal, 2200);
        } else { fallbackMailto(message); }
    } catch { fallbackMailto(notesMessage.value.trim()); }
});

function fallbackMailto(msg) {
    window.open(`mailto:sumankr8586@gmail.com?subject=${encodeURIComponent('Hi from portfolio')}&body=${encodeURIComponent(msg)}`, '_blank');
    closeNotesModal();
}

// ============================================
// PROJECT CARDS — SCROLL REVEAL
// ============================================
// IntersectionObserver removed for manual deterministic staggered load
// ============================================

function observeCards() {
    // Migrated fully to pure CSS @keyframes inside style.css bound to .active container loop
}



// ============================================
// ILLUSTRATION PARALLAX
// ============================================
const architectureIllustration = document.querySelector('.architecture-illustration');
const leftSection = document.querySelector('.left-section');

leftSection.addEventListener('mousemove', (e) => {
    const rect = leftSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (architectureIllustration) {
        architectureIllustration.style.transform = `translateX(-50%) translate(${x * 6}px, ${y * 3}px)`;
    }
});

// ============================================
// MONKEY — Tooltip + easter egg funny strings
// ============================================
const monkeyWrapper = document.getElementById('monkey-wrapper');
const monkeyImg = document.getElementById('monkey-img');
const customCursor = document.getElementById('custom-cursor');
const cursorLabel = document.getElementById('cursor-label');

const funnyTexts = [
    "don't click me!",
    "I said DON'T!",
    "you're still here?",
    "fine. click me.",
    "last warning...",
];
let tooltipIndex = 0;

if (monkeyWrapper) {
    monkeyWrapper.addEventListener('mouseenter', () => {
        if (cursorLabel) {
            cursorLabel.textContent = funnyTexts[tooltipIndex];
            tooltipIndex = (tooltipIndex + 1) % funnyTexts.length;
        }
        if (customCursor) customCursor.classList.add('visible');
    });

    monkeyWrapper.addEventListener('mousemove', (e) => {
        if (customCursor) {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
        }
    });

    monkeyWrapper.addEventListener('mouseleave', () => {
        if (customCursor) customCursor.classList.remove('visible');
    });
}

monkeyImg.addEventListener('click', openSudokuWindow);

const sudokuOverlay = document.getElementById('sudoku-overlay');
const winWindow = document.getElementById('win-window');
const winClose = document.getElementById('win-close');
const winTitlebar = document.getElementById('win-titlebar');

function openSudokuWindow() {
    if (sudokuOverlay) sudokuOverlay.classList.add('active');
    winWindow.style.left = '50%';
    winWindow.style.top = '50%';
    winWindow.style.transform = 'translate(-50%, -50%) scale(1)';
    winWindow.classList.add('active');
    initSudoku();
}

function closeSudokuWindow() {
    if (sudokuOverlay) sudokuOverlay.classList.remove('active');
    winWindow.classList.remove('active');
}

if (winClose) winClose.addEventListener('click', closeSudokuWindow);
if (sudokuOverlay) {
    sudokuOverlay.addEventListener('click', (e) => {
        if (e.target === sudokuOverlay) closeSudokuWindow();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSudokuWindow(); closeNotesModal(); }
});

// ============================================
// DRAGGABLE (truly free-floating)
// ============================================
let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;

winTitlebar.addEventListener('mousedown', (e) => {
    isDragging = true;
    winWindow.classList.add('dragging');
    const rect = winWindow.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    winWindow.style.transform = 'none';
    winWindow.style.left = `${rect.left}px`;
    winWindow.style.top = `${rect.top}px`;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    winWindow.style.left = `${e.clientX - dragOffsetX}px`;
    winWindow.style.top = `${e.clientY - dragOffsetY}px`;
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        winWindow.classList.remove('dragging');
    }
});

// ============================================
// SUDOKU GAME — 6×6 MINI
// ============================================
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
    selectedCell = null; moveHistory = [];
    sudokuWinMsg.classList.remove('show');
    renderGrid();
}

function renderGrid() {
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
            if (selectedCell && Math.floor(r / 2) === Math.floor(selectedCell.row / 2) && Math.floor(c / 3) === Math.floor(selectedCell.col / 3)) cell.classList.add('highlight');
            sudokuGrid.appendChild(cell);
        }
    }
}

function selectCell(r, c) { selectedCell = { row: r, col: c }; renderGrid(); }

function placeNumber(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (PUZZLE[row][col] !== 0) return;
    moveHistory.push({ row, col, prev: board[row][col] });
    board[row][col] = num;
    renderGrid();

    // Check win
    for (let i = 0; i < 6; i++)
        for (let j = 0; j < 6; j++)
            if (board[i][j] !== SOLUTION[i][j]) return;
    sudokuWinMsg.classList.add('show');
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
document.getElementById('undo-btn').addEventListener('click', undoMove);

document.addEventListener('keydown', (e) => {
    if (!winWindow.classList.contains('active')) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 6) placeNumber(num);
    else if (e.key === 'Backspace' || e.key === 'Delete') placeNumber(0);
    else if (e.key === 'z' && e.ctrlKey) undoMove();

    if (selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let { row, col } = selectedCell;
        if (e.key === 'ArrowUp' && row > 0) row--;
        if (e.key === 'ArrowDown' && row < 5) row++;
        if (e.key === 'ArrowLeft' && col > 0) col--;
        if (e.key === 'ArrowRight' && col < 5) col++;
        selectCell(row, col);
    }
});

initSudoku();

// ============================================
// IMAGE VIEWER MODAL — with prev/next nav
// ============================================
(function () {
    const ivOverlay   = document.getElementById('iv-overlay');
    const ivBackdrop  = document.getElementById('iv-backdrop');
    const ivClose     = document.getElementById('iv-close');
    const ivPrev      = document.getElementById('iv-prev');
    const ivNext      = document.getElementById('iv-next');
    const ivImg       = document.getElementById('iv-img');
    const ivImgLoader = document.getElementById('iv-img-loader');
    const ivTag       = document.getElementById('iv-tag');
    const ivDesc      = document.getElementById('iv-desc');
    const ivDribbble  = document.getElementById('iv-dribbble-link');
    const ivBehance   = document.getElementById('iv-behance-link');

    if (!ivOverlay) return;

    const ivImgWrap   = document.getElementById('iv-img-wrap');
    let isZoomed = false;
    let touchStartDist = 0;
    let touchScale = 1;
    let isPinching = false;
    let lastTapTime = 0;
    let panX = 0, panY = 0;
    let panStartX = 0, panStartY = 0;
    let panBaseX = 0, panBaseY = 0;
    let isPanning = false;

    function getTouchDist(e) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }

    function resetZoom() {
        isZoomed = false;
        touchScale = 1;
        isPinching = false;
        isPanning = false;
        panX = 0; panY = 0;
        panBaseX = 0; panBaseY = 0;
        if (ivImgWrap) ivImgWrap.classList.remove('is-zoomed');
        if (ivImg) {
            ivImg.style.transformOrigin = 'center center';
            ivImg.style.transform = 'translateX(0)';
        }
    }

    function clampPan(x, y) {
        const rect = ivImgWrap.getBoundingClientRect();
        const maxX = (rect.width * (touchScale - 1)) / 2;
        const maxY = (rect.height * (touchScale - 1)) / 2;
        return {
            x: Math.min(maxX, Math.max(-maxX, x)),
            y: Math.min(maxY, Math.max(-maxY, y))
        };
    }

    function applyTransform(instant) {
        ivImg.style.transition = instant ? 'none' : 'transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        ivImg.style.transform = `translate(${panX}px, ${panY}px) scale(${touchScale})`;
    }

    if (ivImgWrap) {
        ivImgWrap.addEventListener('click', (e) => {
            if (isPinching) return;
            isZoomed = !isZoomed;
            ivImgWrap.classList.toggle('is-zoomed', isZoomed);
            if (isZoomed) {
                touchScale = 2.2;
                panX = 0; panY = 0;
                ivImg.style.transformOrigin = 'center center';
                updateZoomOrigin(e);
                applyTransform(false);
            } else {
                resetZoom();
            }
        });

        ivImgWrap.addEventListener('mousemove', (e) => {
            if (isZoomed && !isPinching) {
                updateZoomOrigin(e);
            }
        });

        // Touch Pinch-to-Zoom & Double-Tap Zoom & Single-finger Pan for Mobile
        ivImgWrap.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                isPanning = false;
                touchStartDist = getTouchDist(e);
                ivImg.style.transformOrigin = 'center center';
            } else if (e.touches.length === 1) {
                const now = Date.now();
                if (now - lastTapTime < 300) {
                    // Double-tap zoom
                    e.preventDefault();
                    if (touchScale > 1.05) {
                        resetZoom();
                    } else {
                        touchScale = 2.5;
                        isZoomed = true;
                        ivImgWrap.classList.add('is-zoomed');
                        const rect = ivImgWrap.getBoundingClientRect();
                        const ox = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * rect.width;
                        const oy = ((e.touches[0].clientY - rect.top) / rect.height - 0.5) * rect.height;
                        const clamped = clampPan(
                            -ox * (touchScale - 1) / touchScale,
                            -oy * (touchScale - 1) / touchScale
                        );
                        panX = clamped.x;
                        panY = clamped.y;
                        ivImg.style.transformOrigin = 'center center';
                        applyTransform(false);
                    }
                } else if (touchScale > 1.05) {
                    // Start pan
                    isPanning = true;
                    panStartX = e.touches[0].clientX;
                    panStartY = e.touches[0].clientY;
                    panBaseX = panX;
                    panBaseY = panY;
                }
                lastTapTime = now;
            }
        }, { passive: false });

        ivImgWrap.addEventListener('touchmove', (e) => {
            if (isPinching && e.touches.length === 2 && ivImg) {
                e.preventDefault();
                const currentDist = getTouchDist(e);
                if (touchStartDist > 0) {
                    const factor = currentDist / touchStartDist;
                    touchScale = Math.min(Math.max(1, touchScale * factor), 4);
                    touchStartDist = currentDist;
                    const rect = ivImgWrap.getBoundingClientRect();
                    const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
                    const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;
                    ivImg.style.transformOrigin = `${midX}% ${midY}%`;
                    applyTransform(true);
                    ivImgWrap.classList.toggle('is-zoomed', touchScale > 1.05);
                }
            } else if (isPanning && e.touches.length === 1 && touchScale > 1.05) {
                e.preventDefault();
                const raw = clampPan(
                    panBaseX + (e.touches[0].clientX - panStartX),
                    panBaseY + (e.touches[0].clientY - panStartY)
                );
                panX = raw.x;
                panY = raw.y;
                applyTransform(true);
            }
        }, { passive: false });

        ivImgWrap.addEventListener('touchend', (e) => {
            if (e.touches.length < 2 && isPinching) {
                isPinching = false;
                if (touchScale <= 1.05) {
                    resetZoom();
                } else {
                    isZoomed = true;
                    // Start pan from where pinch ended
                    if (e.touches.length === 1) {
                        isPanning = true;
                        panStartX = e.touches[0].clientX;
                        panStartY = e.touches[0].clientY;
                        panBaseX = panX;
                        panBaseY = panY;
                    }
                }
            }
            if (e.touches.length === 0) isPanning = false;
        });
    }

    function updateZoomOrigin(e) {
        if (!ivImgWrap || !ivImg) return;
        const rect = ivImgWrap.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        ivImg.style.transformOrigin = `${x}% ${y}%`;
    }

    function getTriggers() {
        return Array.from(document.querySelectorAll('.img-viewer-trigger'));
    }

    let currentIndex = 0;

    function loadImage(index, direction) {
        resetZoom();
        const triggers = getTriggers();
        if (index < 0 || index >= triggers.length) return;
        const trigger  = triggers[index];
        const src      = trigger.dataset.img || '';
        const title    = trigger.dataset.title || '';
        const desc     = trigger.dataset.desc || '';
        const dribbble = trigger.dataset.dribbble || '#';
        const behance  = trigger.dataset.behance || '#';

        // Direction-aware slide: fade out current image
        const slideOut = direction === 'next' ? '-8px' : '8px';
        ivImg.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        ivImg.style.opacity    = '0';
        ivImg.style.transform  = `translateX(${slideOut})`;
        ivImg.style.transformOrigin = 'center center';

        setTimeout(() => {
            // Populate info
            ivTag.textContent  = title;
            if (ivDesc) {
                ivDesc.textContent = desc;
                ivDesc.style.display = desc ? '' : 'none';
            }
            ivDribbble.href    = dribbble;
            ivBehance.href     = behance;
            // Hide action links if no external URL provided (e.g., branding cards)
            const hasLinks = dribbble !== '#' || behance !== '#';
            ivDribbble.style.display = dribbble !== '#' ? '' : 'none';
            ivBehance.style.display  = behance  !== '#' ? '' : 'none';
            const actionsContainer = document.querySelector('.iv-info-actions');
            if (actionsContainer) actionsContainer.style.display = hasLinks ? '' : 'none';

            // Show spinner
            ivImgLoader.classList.remove('iv-hidden');

            // Reset image transform for slide-in direction
            const slideIn = direction === 'next' ? '8px' : '-8px';
            ivImg.style.transition = 'none';
            ivImg.style.transform  = `translateX(${slideIn})`;

            // Load HD image & Ambient Glow
            const tmp = new Image();
            const ivAmbientGlow = document.getElementById('iv-ambient-glow');
            if (ivAmbientGlow && src) {
                ivAmbientGlow.style.backgroundImage = `url("${src}")`;
            }
            tmp.onload = () => {
                ivImg.src = src;
                ivImg.alt = title;
                requestAnimationFrame(() => {
                    ivImg.style.transition = 'opacity 0.32s ease, transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    ivImg.style.opacity    = '1';
                    ivImg.style.transform  = 'translateX(0)';
                    ivImg.classList.add('iv-loaded');
                    setTimeout(() => ivImgLoader.classList.add('iv-hidden'), 60);
                });
            };
            tmp.onerror = () => {
                // fallback to compressed thumb (.project-img-real or .branding-img)
                const thumb = trigger.querySelector('.project-img-real, .branding-img');
                if (thumb) {
                    ivImg.src = thumb.src;
                    ivImg.alt = title;
                    if (ivAmbientGlow) ivAmbientGlow.style.backgroundImage = `url("${thumb.src}")`;
                }
                ivImg.style.transition = 'opacity 0.32s ease, transform 0.32s ease';
                ivImg.style.opacity    = '1';
                ivImg.style.transform  = 'translateX(0)';
                ivImg.classList.add('iv-loaded');
                ivImgLoader.classList.add('iv-hidden');
            };
            tmp.src = src;
        }, 180);

        // Update nav disabled states
        updateNavState(index);
    }

    function updateNavState(index) {
        const triggers = getTriggers();
        ivPrev.classList.toggle('iv-nav-disabled', index === 0);
        ivNext.classList.toggle('iv-nav-disabled', index === triggers.length - 1);
    }

    function openViewer(index) {
        currentIndex = index;
        resetZoom();

        // Full reset for fresh open
        ivImg.src = '';
        ivImg.style.transition = 'none';
        ivImg.style.opacity    = '0';
        ivImg.style.transform  = 'translateX(0)';
        ivImg.classList.remove('iv-loaded');
        ivImgLoader.classList.remove('iv-hidden');

        ivOverlay.classList.add('iv-active');
        document.body.style.overflow = 'hidden';

        // Load first image with no direction offset
        loadImage(index, 'none');
    }

    function closeViewer() {
        resetZoom();
        ivOverlay.classList.remove('iv-active');
        document.body.style.overflow = '';
        setTimeout(() => {
            ivImg.src = '';
            ivImg.style.opacity   = '0';
            ivImg.style.transform = 'translateX(0)';
            ivImg.classList.remove('iv-loaded');
            ivImgLoader.classList.remove('iv-hidden');
        }, 420);
    }

    function goNext() {
        const triggers = getTriggers();
        if (currentIndex < triggers.length - 1) {
            currentIndex++;
            loadImage(currentIndex, 'next');
        }
    }

    function goPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            loadImage(currentIndex, 'prev');
        }
    }

    // Dynamic trigger delegation
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.img-viewer-trigger');
        if (!trigger) return;
        const triggers = getTriggers();
        const index = triggers.indexOf(trigger);
        if (index !== -1) {
            openViewer(index);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const trigger = e.target.closest('.img-viewer-trigger');
            if (trigger) {
                e.preventDefault();
                const triggers = getTriggers();
                const index = triggers.indexOf(trigger);
                if (index !== -1) openViewer(index);
            }
        }
    });

    // Nav buttons
    ivNext.addEventListener('click', goNext);
    ivPrev.addEventListener('click', goPrev);

    // Close handlers
    ivClose.addEventListener('click', closeViewer);
    ivBackdrop.addEventListener('click', closeViewer);

    // Keyboard: ESC closes, arrows navigate
    document.addEventListener('keydown', (e) => {
        if (!ivOverlay.classList.contains('iv-active')) return;
        if (e.key === 'Escape')      closeViewer();
        if (e.key === 'ArrowRight')  goNext();
        if (e.key === 'ArrowLeft')   goPrev();
    });
})();
