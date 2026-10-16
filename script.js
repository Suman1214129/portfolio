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
// CASE STUDY SIDEBAR
// ============================================
(function () {
    const sidebar  = document.getElementById('cs-sidebar');
    const backdrop = document.getElementById('cs-backdrop');
    const closeBtn = document.getElementById('cs-close');
    const csImg    = document.getElementById('cs-img');
    const csTag    = document.getElementById('cs-tag');
    const csTagline= document.getElementById('cs-tagline');
    const csBody   = document.getElementById('cs-body');
    const csLinks  = document.getElementById('cs-links');
    if (!sidebar) return;

    // Lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'cs-lightbox';
    const lbImg = document.createElement('img');
    lightbox.appendChild(lbImg);
    document.body.appendChild(lightbox);

    function openLightbox(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lightbox.classList.add('cs-lb-open');
    }
    function closeLightbox() {
        lightbox.classList.remove('cs-lb-open');
    }
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
    });

    const csImgWrap = document.querySelector('.cs-img-wrap');
    if (csImgWrap) {
        csImgWrap.addEventListener('click', function() {
            if (csImg.src) openLightbox(csImg.src, csImg.alt);
        });
    }

    function openSidebar(el) {
        const d = el.dataset;
        csTag.textContent     = d.title || '';
        csTagline.textContent = d.tagline || '';
        csImg.src = d.img || '';
        csImg.alt = d.title || '';

        csBody.innerHTML = d.brief ? `<p class="cs-brief">${d.brief}</p>` : '';

        const links = [];
        if (d.dribbble && d.dribbble !== '#' && d.dribbble !== '') links.push(`<a href="${d.dribbble}" target="_blank" rel="noopener noreferrer" class="cs-link-btn"><i class="ph ph-dribbble-logo"></i> Dribbble ↗</a>`);
        if (d.behance  && d.behance  !== '#' && d.behance  !== '') links.push(`<a href="${d.behance}"  target="_blank" rel="noopener noreferrer" class="cs-link-btn"><i class="ph ph-behance-logo"></i> Behance ↗</a>`);
        csLinks.innerHTML = links.join('');

        sidebar.classList.add('cs-open');
        backdrop.classList.add('cs-open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('cs-open');
        backdrop.classList.remove('cs-open');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('.cs-lightbox')) return;
        const trigger = e.target.closest('.cs-trigger');
        if (trigger) {
            // Branding items: open lightbox directly, skip sidebar
            if (trigger.dataset.type === 'branding') {
                openLightbox(trigger.dataset.img || '', trigger.dataset.title || '');
                return;
            }
            openSidebar(trigger);
            return;
        }
        // Close on backdrop click (clicking outside sidebar on desktop)
        if (sidebar.classList.contains('cs-open') && !e.target.closest('#cs-sidebar')) {
            closeSidebar();
        }
    });

    closeBtn.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSidebar();
    });
})();

// ============================================
// CUTE INTERACTIVE PIXEL MONKEY (SELF-CONTAINED VECTOR SPRITES)
// Poses: IDLE, WALK_RIGHT, WALK_LEFT, RUN_RIGHT, RUN_LEFT, JUMP, WAVE, HANG
// Bubble appears on hover, auto-disappears on mouseleave, preserves typed text
// ============================================
(function () {
    // Single unified head (rows y=0..10) shared by every upright pose — face never changes
    // HEAD: no mouth, blush dots under eyes for cuteness
    const HEAD = "<rect x='4' y='0' width='10' height='1' fill='#5a3821'/><rect x='3' y='1' width='13' height='1' fill='#5a3821'/><rect x='3' y='2' width='13' height='1' fill='#5a3821'/><rect x='0' y='3' width='4' height='1' fill='#5a3821'/><rect x='4' y='3' width='10' height='1' fill='#dda876'/><rect x='14' y='3' width='4' height='1' fill='#5a3821'/><rect x='0' y='4' width='4' height='1' fill='#5a3821'/><rect x='4' y='4' width='10' height='1' fill='#dda876'/><rect x='14' y='4' width='4' height='1' fill='#5a3821'/><rect x='0' y='5' width='1' height='1' fill='#5a3821'/><rect x='1' y='5' width='2' height='1' fill='#dda876'/><rect x='3' y='5' width='1' height='1' fill='#5a3821'/><rect x='4' y='5' width='2' height='1' fill='#dda876'/><rect x='6' y='5' width='1' height='1' fill='#181512'/><rect x='7' y='5' width='4' height='1' fill='#dda876'/><rect x='11' y='5' width='1' height='1' fill='#181512'/><rect x='12' y='5' width='2' height='1' fill='#dda876'/><rect x='14' y='5' width='2' height='1' fill='#5a3821'/><rect x='16' y='5' width='1' height='1' fill='#dda876'/><rect x='17' y='5' width='1' height='1' fill='#5a3821'/><rect x='0' y='6' width='4' height='1' fill='#5a3821'/><rect x='4' y='6' width='2' height='1' fill='#dda876'/><rect x='6' y='6' width='1' height='1' fill='#181512'/><rect x='7' y='6' width='4' height='1' fill='#dda876'/><rect x='11' y='6' width='1' height='1' fill='#181512'/><rect x='12' y='6' width='2' height='1' fill='#dda876'/><rect x='14' y='6' width='4' height='1' fill='#5a3821'/><rect x='0' y='7' width='4' height='1' fill='#5a3821'/><rect x='4' y='7' width='10' height='1' fill='#dda876'/><rect x='14' y='7' width='4' height='1' fill='#5a3821'/><rect x='3' y='8' width='1' height='1' fill='#5a3821'/><rect x='4' y='8' width='4' height='1' fill='#dda876'/><rect x='8' y='8' width='2' height='1' fill='#dda876'/><rect x='10' y='8' width='4' height='1' fill='#dda876'/><rect x='14' y='8' width='2' height='1' fill='#5a3821'/><rect x='5' y='8' width='1' height='1' fill='#e8a0a0'/><rect x='12' y='8' width='1' height='1' fill='#e8a0a0'/><rect x='3' y='9' width='1' height='1' fill='#5a3821'/><rect x='4' y='9' width='10' height='1' fill='#dda876'/><rect x='14' y='9' width='2' height='1' fill='#5a3821'/><rect x='4' y='10' width='10' height='1' fill='#5a3821'/>";

    function makeSVG(body) {
        return "<svg viewBox='0 0 20 20' width='100%' height='100%' shape-rendering='crispEdges'>" + HEAD + body + "</svg>";
    }

    const MONKEY_SVGS = {
        IDLE: makeSVG("<rect x='3' y='11' width='4' height='1' fill='#5a3821'/><rect x='7' y='11' width='4' height='1' fill='#dda876'/><rect x='11' y='11' width='3' height='1' fill='#5a3821'/><rect x='17' y='11' width='3' height='1' fill='#5a3821'/><rect x='3' y='12' width='3' height='1' fill='#5a3821'/><rect x='6' y='12' width='6' height='1' fill='#dda876'/><rect x='12' y='12' width='3' height='1' fill='#5a3821'/><rect x='16' y='12' width='2' height='1' fill='#5a3821'/><rect x='19' y='12' width='1' height='1' fill='#5a3821'/><rect x='3' y='13' width='3' height='1' fill='#5a3821'/><rect x='6' y='13' width='6' height='1' fill='#dda876'/><rect x='12' y='13' width='3' height='1' fill='#5a3821'/><rect x='16' y='13' width='2' height='1' fill='#5a3821'/><rect x='3' y='14' width='3' height='1' fill='#5a3821'/><rect x='6' y='14' width='6' height='1' fill='#dda876'/><rect x='12' y='14' width='3' height='1' fill='#5a3821'/><rect x='16' y='14' width='2' height='1' fill='#5a3821'/><rect x='3' y='15' width='4' height='1' fill='#5a3821'/><rect x='7' y='15' width='4' height='1' fill='#dda876'/><rect x='11' y='15' width='4' height='1' fill='#5a3821'/><rect x='16' y='15' width='2' height='1' fill='#5a3821'/><rect x='4' y='16' width='13' height='1' fill='#5a3821'/><rect x='5' y='17' width='3' height='1' fill='#5a3821'/><rect x='10' y='17' width='3' height='1' fill='#5a3821'/><rect x='5' y='18' width='3' height='1' fill='#5a3821'/><rect x='10' y='18' width='3' height='1' fill='#5a3821'/><rect x='5' y='19' width='3' height='1' fill='#5a3821'/><rect x='10' y='19' width='3' height='1' fill='#5a3821'/>"),
        WALK_RIGHT: makeSVG("<rect x='0' y='11' width='3' height='1' fill='#5a3821'/><rect x='5' y='11' width='4' height='1' fill='#5a3821'/><rect x='9' y='11' width='4' height='1' fill='#dda876'/><rect x='13' y='11' width='3' height='1' fill='#5a3821'/><rect x='0' y='12' width='1' height='1' fill='#5a3821'/><rect x='2' y='12' width='2' height='1' fill='#5a3821'/><rect x='5' y='12' width='3' height='1' fill='#5a3821'/><rect x='8' y='12' width='5' height='1' fill='#dda876'/><rect x='13' y='12' width='3' height='1' fill='#5a3821'/><rect x='2' y='13' width='2' height='1' fill='#5a3821'/><rect x='5' y='13' width='3' height='1' fill='#5a3821'/><rect x='8' y='13' width='5' height='1' fill='#dda876'/><rect x='13' y='13' width='2' height='1' fill='#5a3821'/><rect x='15' y='13' width='1' height='1' fill='#dda876'/><rect x='2' y='14' width='2' height='1' fill='#5a3821'/><rect x='5' y='14' width='3' height='1' fill='#5a3821'/><rect x='8' y='14' width='5' height='1' fill='#dda876'/><rect x='13' y='14' width='2' height='1' fill='#5a3821'/><rect x='2' y='15' width='2' height='1' fill='#5a3821'/><rect x='5' y='15' width='3' height='1' fill='#5a3821'/><rect x='8' y='15' width='5' height='1' fill='#dda876'/><rect x='13' y='15' width='2' height='1' fill='#5a3821'/><rect x='3' y='16' width='11' height='1' fill='#5a3821'/><rect x='5' y='17' width='4' height='1' fill='#5a3821'/><rect x='11' y='17' width='4' height='1' fill='#5a3821'/><rect x='4' y='18' width='4' height='1' fill='#5a3821'/><rect x='12' y='18' width='3' height='1' fill='#5a3821'/><rect x='5' y='19' width='2' height='1' fill='#5a3821'/><rect x='13' y='19' width='1' height='1' fill='#5a3821'/>"),
        WALK_LEFT: makeSVG("<rect x='4' y='11' width='3' height='1' fill='#5a3821'/><rect x='7' y='11' width='5' height='1' fill='#dda876'/><rect x='12' y='11' width='3' height='1' fill='#5a3821'/><rect x='17' y='11' width='3' height='1' fill='#5a3821'/><rect x='3' y='12' width='4' height='1' fill='#5a3821'/><rect x='7' y='12' width='5' height='1' fill='#dda876'/><rect x='12' y='12' width='3' height='1' fill='#5a3821'/><rect x='16' y='12' width='2' height='1' fill='#5a3821'/><rect x='19' y='12' width='1' height='1' fill='#5a3821'/><rect x='3' y='13' width='2' height='1' fill='#dda876'/><rect x='5' y='13' width='2' height='1' fill='#5a3821'/><rect x='7' y='13' width='5' height='1' fill='#dda876'/><rect x='12' y='13' width='3' height='1' fill='#5a3821'/><rect x='16' y='13' width='2' height='1' fill='#5a3821'/><rect x='5' y='14' width='2' height='1' fill='#5a3821'/><rect x='7' y='14' width='5' height='1' fill='#dda876'/><rect x='12' y='14' width='3' height='1' fill='#5a3821'/><rect x='16' y='14' width='2' height='1' fill='#5a3821'/><rect x='5' y='15' width='2' height='1' fill='#5a3821'/><rect x='7' y='15' width='5' height='1' fill='#dda876'/><rect x='12' y='15' width='3' height='1' fill='#5a3821'/><rect x='16' y='15' width='2' height='1' fill='#5a3821'/><rect x='6' y='16' width='11' height='1' fill='#5a3821'/><rect x='5' y='17' width='4' height='1' fill='#5a3821'/><rect x='11' y='17' width='4' height='1' fill='#5a3821'/><rect x='5' y='18' width='3' height='1' fill='#5a3821'/><rect x='12' y='18' width='4' height='1' fill='#5a3821'/><rect x='6' y='19' width='1' height='1' fill='#5a3821'/><rect x='13' y='19' width='2' height='1' fill='#5a3821'/>"),
        RUN_RIGHT: makeSVG("<rect x='1' y='11' width='2' height='1' fill='#5a3821'/><rect x='6' y='11' width='3' height='1' fill='#5a3821'/><rect x='9' y='11' width='4' height='1' fill='#dda876'/><rect x='13' y='11' width='3' height='1' fill='#5a3821'/><rect x='0' y='12' width='4' height='1' fill='#5a3821'/><rect x='5' y='12' width='3' height='1' fill='#5a3821'/><rect x='8' y='12' width='6' height='1' fill='#dda876'/><rect x='14' y='12' width='3' height='1' fill='#5a3821'/><rect x='0' y='13' width='1' height='1' fill='#5a3821'/><rect x='2' y='13' width='2' height='1' fill='#5a3821'/><rect x='5' y='13' width='3' height='1' fill='#5a3821'/><rect x='8' y='13' width='6' height='1' fill='#dda876'/><rect x='14' y='13' width='1' height='1' fill='#5a3821'/><rect x='15' y='13' width='1' height='1' fill='#dda876'/><rect x='16' y='13' width='1' height='1' fill='#5a3821'/><rect x='2' y='14' width='2' height='1' fill='#5a3821'/><rect x='5' y='14' width='3' height='1' fill='#5a3821'/><rect x='8' y='14' width='6' height='1' fill='#dda876'/><rect x='14' y='14' width='1' height='1' fill='#5a3821'/><rect x='3' y='15' width='1' height='1' fill='#5a3821'/><rect x='5' y='15' width='4' height='1' fill='#5a3821'/><rect x='9' y='15' width='4' height='1' fill='#dda876'/><rect x='13' y='15' width='2' height='1' fill='#5a3821'/><rect x='3' y='16' width='11' height='1' fill='#5a3821'/><rect x='6' y='17' width='3' height='1' fill='#5a3821'/><rect x='11' y='17' width='4' height='1' fill='#5a3821'/><rect x='5' y='18' width='3' height='1' fill='#5a3821'/><rect x='12' y='18' width='3' height='1' fill='#5a3821'/><rect x='6' y='19' width='2' height='1' fill='#5a3821'/><rect x='13' y='19' width='1' height='1' fill='#5a3821'/>"),
        RUN_LEFT: makeSVG("<rect x='3' y='11' width='4' height='1' fill='#5a3821'/><rect x='7' y='11' width='4' height='1' fill='#dda876'/><rect x='11' y='11' width='3' height='1' fill='#5a3821'/><rect x='17' y='11' width='2' height='1' fill='#5a3821'/><rect x='3' y='12' width='3' height='1' fill='#5a3821'/><rect x='6' y='12' width='5' height='1' fill='#dda876'/><rect x='11' y='12' width='3' height='1' fill='#5a3821'/><rect x='16' y='12' width='4' height='1' fill='#5a3821'/><rect x='3' y='13' width='1' height='1' fill='#dda876'/><rect x='5' y='13' width='1' height='1' fill='#5a3821'/><rect x='6' y='13' width='5' height='1' fill='#dda876'/><rect x='11' y='13' width='3' height='1' fill='#5a3821'/><rect x='16' y='13' width='1' height='1' fill='#5a3821'/><rect x='19' y='13' width='1' height='1' fill='#5a3821'/><rect x='5' y='14' width='1' height='1' fill='#5a3821'/><rect x='6' y='14' width='5' height='1' fill='#dda876'/><rect x='11' y='14' width='3' height='1' fill='#5a3821'/><rect x='16' y='14' width='1' height='1' fill='#5a3821'/><rect x='5' y='15' width='2' height='1' fill='#5a3821'/><rect x='7' y='15' width='4' height='1' fill='#dda876'/><rect x='11' y='15' width='4' height='1' fill='#5a3821'/><rect x='16' y='15' width='1' height='1' fill='#5a3821'/><rect x='6' y='16' width='11' height='1' fill='#5a3821'/><rect x='5' y='17' width='4' height='1' fill='#5a3821'/><rect x='11' y='17' width='3' height='1' fill='#5a3821'/><rect x='5' y='18' width='3' height='1' fill='#5a3821'/><rect x='12' y='18' width='3' height='1' fill='#5a3821'/><rect x='6' y='19' width='1' height='1' fill='#5a3821'/><rect x='13' y='19' width='1' height='1' fill='#5a3821'/>"),
        JUMP: makeSVG("<rect x='3' y='11' width='5' height='1' fill='#5a3821'/><rect x='8' y='11' width='4' height='1' fill='#dda876'/><rect x='12' y='11' width='5' height='1' fill='#5a3821'/><rect x='2' y='12' width='5' height='1' fill='#5a3821'/><rect x='7' y='12' width='6' height='1' fill='#dda876'/><rect x='13' y='12' width='5' height='1' fill='#5a3821'/><rect x='2' y='13' width='5' height='1' fill='#5a3821'/><rect x='7' y='13' width='6' height='1' fill='#dda876'/><rect x='13' y='13' width='5' height='1' fill='#5a3821'/><rect x='3' y='14' width='1' height='1' fill='#5a3821'/><rect x='5' y='14' width='2' height='1' fill='#5a3821'/><rect x='7' y='14' width='6' height='1' fill='#dda876'/><rect x='13' y='14' width='2' height='1' fill='#5a3821'/><rect x='16' y='14' width='1' height='1' fill='#5a3821'/><rect x='5' y='15' width='2' height='1' fill='#5a3821'/><rect x='7' y='15' width='6' height='1' fill='#dda876'/><rect x='13' y='15' width='2' height='1' fill='#5a3821'/><rect x='5' y='16' width='9' height='1' fill='#5a3821'/><rect x='6' y='17' width='8' height='1' fill='#5a3821'/><rect x='6' y='18' width='3' height='1' fill='#5a3821'/><rect x='11' y='18' width='3' height='1' fill='#5a3821'/><rect x='7' y='19' width='1' height='1' fill='#dda876'/><rect x='8' y='19' width='1' height='1' fill='#5a3821'/><rect x='11' y='19' width='1' height='1' fill='#5a3821'/><rect x='12' y='19' width='1' height='1' fill='#dda876'/>"),
        WAVE: makeSVG("<rect x='0' y='11' width='2' height='1' fill='#5a3821'/><rect x='2' y='10' width='1' height='1' fill='#5a3821'/><rect x='1' y='9' width='2' height='1' fill='#5a3821'/><rect x='0' y='8' width='2' height='1' fill='#5a3821'/><rect x='3' y='11' width='4' height='1' fill='#5a3821'/><rect x='7' y='11' width='4' height='1' fill='#dda876'/><rect x='11' y='11' width='3' height='1' fill='#5a3821'/><rect x='17' y='11' width='3' height='1' fill='#5a3821'/><rect x='3' y='12' width='3' height='1' fill='#5a3821'/><rect x='6' y='12' width='6' height='1' fill='#dda876'/><rect x='12' y='12' width='3' height='1' fill='#5a3821'/><rect x='16' y='12' width='2' height='1' fill='#5a3821'/><rect x='19' y='12' width='1' height='1' fill='#5a3821'/><rect x='3' y='13' width='3' height='1' fill='#5a3821'/><rect x='6' y='13' width='6' height='1' fill='#dda876'/><rect x='12' y='13' width='3' height='1' fill='#5a3821'/><rect x='16' y='13' width='2' height='1' fill='#5a3821'/><rect x='3' y='14' width='3' height='1' fill='#5a3821'/><rect x='6' y='14' width='6' height='1' fill='#dda876'/><rect x='12' y='14' width='3' height='1' fill='#5a3821'/><rect x='16' y='14' width='2' height='1' fill='#5a3821'/><rect x='3' y='15' width='4' height='1' fill='#5a3821'/><rect x='7' y='15' width='4' height='1' fill='#dda876'/><rect x='11' y='15' width='4' height='1' fill='#5a3821'/><rect x='16' y='15' width='2' height='1' fill='#5a3821'/><rect x='4' y='16' width='13' height='1' fill='#5a3821'/><rect x='5' y='17' width='3' height='1' fill='#5a3821'/><rect x='10' y='17' width='3' height='1' fill='#5a3821'/><rect x='5' y='18' width='3' height='1' fill='#5a3821'/><rect x='10' y='18' width='3' height='1' fill='#5a3821'/><rect x='5' y='19' width='3' height='1' fill='#5a3821'/><rect x='10' y='19' width='3' height='1' fill='#5a3821'/>"),
        // HANG: monkey gripping ledge at top — arms raised, body + legs hang below
        // Arms at y=0 grip the ledge, head at y=1..6, body y=7..12, legs dangle y=13..18
        // HANG: arms up gripping ledge — NO side arms on body, clean torso, legs dangle close
        HANG: "<svg viewBox='0 0 20 20' width='100%' height='100%' shape-rendering='crispEdges'><rect x='4' y='0' width='2' height='1' fill='#5a3821'/><rect x='14' y='0' width='2' height='1' fill='#5a3821'/><rect x='3' y='1' width='3' height='1' fill='#5a3821'/><rect x='14' y='1' width='3' height='1' fill='#5a3821'/><rect x='4' y='2' width='12' height='1' fill='#5a3821'/><rect x='3' y='3' width='2' height='1' fill='#5a3821'/><rect x='5' y='3' width='10' height='1' fill='#dda876'/><rect x='15' y='3' width='2' height='1' fill='#5a3821'/><rect x='3' y='4' width='2' height='1' fill='#5a3821'/><rect x='5' y='4' width='10' height='1' fill='#dda876'/><rect x='15' y='4' width='2' height='1' fill='#5a3821'/><rect x='3' y='5' width='2' height='1' fill='#5a3821'/><rect x='5' y='5' width='1' height='1' fill='#dda876'/><rect x='6' y='5' width='1' height='1' fill='#181512'/><rect x='7' y='5' width='6' height='1' fill='#dda876'/><rect x='13' y='5' width='1' height='1' fill='#181512'/><rect x='14' y='5' width='1' height='1' fill='#dda876'/><rect x='15' y='5' width='2' height='1' fill='#5a3821'/><rect x='3' y='6' width='2' height='1' fill='#5a3821'/><rect x='5' y='6' width='10' height='1' fill='#dda876'/><rect x='15' y='6' width='2' height='1' fill='#5a3821'/><rect x='4' y='7' width='1' height='1' fill='#5a3821'/><rect x='5' y='7' width='10' height='1' fill='#dda876'/><rect x='15' y='7' width='1' height='1' fill='#5a3821'/><rect x='6' y='7' width='1' height='1' fill='#e8a0a0'/><rect x='13' y='7' width='1' height='1' fill='#e8a0a0'/><rect x='4' y='8' width='1' height='1' fill='#5a3821'/><rect x='5' y='8' width='10' height='1' fill='#dda876'/><rect x='15' y='8' width='1' height='1' fill='#5a3821'/><rect x='5' y='9' width='10' height='1' fill='#5a3821'/><rect x='5' y='10' width='10' height='1' fill='#dda876'/><rect x='5' y='11' width='10' height='1' fill='#dda876'/><rect x='5' y='12' width='10' height='1' fill='#dda876'/><rect x='5' y='13' width='10' height='1' fill='#5a3821'/><rect x='15' y='10' width='3' height='1' fill='#5a3821'/><rect x='15' y='11' width='2' height='1' fill='#5a3821'/><rect x='19' y='11' width='1' height='1' fill='#5a3821'/><rect x='7' y='14' width='3' height='1' fill='#5a3821'/><rect x='10' y='14' width='3' height='1' fill='#5a3821'/><rect x='7' y='15' width='2' height='1' fill='#5a3821'/><rect x='11' y='15' width='2' height='1' fill='#5a3821'/><rect x='7' y='16' width='2' height='1' fill='#5a3821'/><rect x='11' y='16' width='2' height='1' fill='#5a3821'/><rect x='6' y='17' width='2' height='1' fill='#5a3821'/><rect x='12' y='17' width='2' height='1' fill='#5a3821'/><rect x='6' y='18' width='2' height='1' fill='#5a3821'/><rect x='12' y='18' width='2' height='1' fill='#5a3821'/></svg>"
    };

    const DISPLAY_SIZE = 40;

    // Remove any older monkey instances
    const oldMonkey = document.getElementById('interactive-monkey');
    if (oldMonkey) oldMonkey.remove();

    // Build monkey container matching reference image media_1792062259365.png
    const monkey = document.createElement('div');
    monkey.id = 'interactive-monkey';
    monkey.className = 'interactive-monkey';
    monkey.innerHTML = `
        <div class="monkey-sprite" id="monkey-sprite"></div>
        <div class="monkey-minimal-bubble" id="monkey-minimal-bubble">
            <div class="bubble-inner-row">
                <input type="text" id="monkey-minimal-input" placeholder="write a message..." autocomplete="off" spellcheck="false" />
            </div>
            <div class="bubble-mini-status" id="bubble-mini-status"></div>
        </div>
    `;
    document.body.appendChild(monkey);

    const spriteEl   = document.getElementById('monkey-sprite');
    const bubble     = document.getElementById('monkey-minimal-bubble');
    const minInput   = document.getElementById('monkey-minimal-input');
    const sendBtn    = null;
    const statusMsg  = document.getElementById('bubble-mini-status');

    function setFrame(frameKey) {
        if (!spriteEl) return;
        const svg = MONKEY_SVGS[frameKey] || MONKEY_SVGS.IDLE;
        spriteEl.innerHTML = svg;
    }

    setFrame('IDLE');

    // ---- State ----
    let isJumping = false;
    let isHovered = false;
    let currentStablePose = 'IDLE';
    let currentPerchIndex = -1;
    let walkInterval = null;

    // Each perch: selector, pose rule
    // pose: 'stand' = always stand on top edge
    //       'hang'  = always hang from top edge (body below, arms gripping)
    //       'any'   = randomly stand or hang
    const PERCHES = [
        // Navbar
        { sel: '.header-nav-link',       pose: 'hang'  },  // hang from nav buttons
        { sel: '.contact-more-btn',      pose: 'hang'  },  // hang from contact button
        // Hero
        { sel: '.hero-greeting-btn',     pose: 'hang'  },  // hang from namaste/hi/hello pill
        { sel: '.hero-title-main',       pose: 'stand' },  // stand on hero title text
        // Works images
        { sel: '.work-card-media',       pose: 'any'   },  // stand on top or hang from top of card images
        { sel: '.works-nav',             pose: 'hang'  },  // hang from tab switcher
        { sel: '.branding-item',         pose: 'any'   },  // stand/hang on branding images
        { sel: '.orrery-diagram-card',   pose: 'any'   },  // stand/hang on orrery card
        // Experience
        { sel: '.work-item-banner',      pose: 'any'   },  // stand/hang on experience banner
        // About
        { sel: '.about-album-frame',     pose: 'stand' },  // stand on photo frame
        // Section headings
        { sel: '.section-heading',       pose: 'stand' },  // stand on section titles
        // Footer — stand only on the bottom bar, not the whole footer (avoids illustration area)
        { sel: '.footer-bottom-row',     pose: 'stand' },
    ];

    function getValidPerches() {
        var list = [];
        PERCHES.forEach(function(p) {
            var els = document.querySelectorAll(p.sel);
            els.forEach(function(el) {
                if (el && el.offsetParent !== null) {
                    var rect = el.getBoundingClientRect();
                    if (rect.width > 20 && rect.height > 8) {
                        list.push({ el: el, pose: p.pose });
                    }
                }
            });
        });
        return list;
    }

    function playWalkingAnimation(steps, direction, callback) {
        clearInterval(walkInterval);
        var currentStep = 0;
        var frameA = direction === 'right' ? 'WALK_RIGHT' : 'WALK_LEFT';
        var frameB = direction === 'right' ? 'RUN_RIGHT' : 'RUN_LEFT';
        walkInterval = setInterval(function() {
            currentStep++;
            setFrame(currentStep % 2 === 1 ? frameA : frameB);
            if (currentStep >= steps * 2) {
                clearInterval(walkInterval);
                setFrame(currentStablePose);
                if (callback) callback();
            }
        }, 220);
    }

    function positionAtPerch(item, animate, forceStand) {
        if (!item || !item.el) return;
        var el = item.el;
        var rect = el.getBoundingClientRect();
        var pageScrollX = window.scrollX || window.pageXOffset;
        var pageScrollY = window.scrollY || window.pageYOffset;

        // Resolve whether to hang or stand
        var doHang;
        if (forceStand) {
            doHang = false;
        } else if (item.pose === 'hang') {
            doHang = true;
        } else if (item.pose === 'stand') {
            doHang = false;
        } else {
            // 'any' — 50/50
            doHang = Math.random() > 0.5;
        }

        // For text/heading elements, clamp X to actual text width using scrollWidth
        var elWidth = el.scrollWidth > 0 ? Math.min(el.scrollWidth, rect.width) : rect.width;
        var xMin = rect.left + pageScrollX;
        var xMax = rect.left + pageScrollX + elWidth - DISPLAY_SIZE;
        if (xMax < xMin) xMax = xMin;
        var targetX = xMin + Math.random() * (xMax - xMin);
        var targetY;

        if (doHang) {
            // Arms grip the top edge — sprite top sits at element top
            targetY = rect.top + pageScrollY - 2;
        } else {
            // Feet sit on top edge of element
            targetY = rect.top + pageScrollY - DISPLAY_SIZE;
        }

        var maxX = document.documentElement.clientWidth - DISPLAY_SIZE - 12;
        if (targetX > maxX) targetX = maxX;
        if (targetX < 12) targetX = 12;

        var currentX = parseFloat(monkey.style.left) || 0;
        var dir = targetX > currentX ? 'right' : 'left';

        if (animate) {
            isJumping = true;
            setFrame('JUMP');
            // Distance-based duration: min 0.7s, max 1.4s
            var dx = targetX - (parseFloat(monkey.style.left) || 0);
            var dy = targetY - (parseFloat(monkey.style.top) || 0);
            var dist = Math.sqrt(dx * dx + dy * dy);
            var dur = Math.min(1.4, Math.max(0.7, dist / 600));
            // X smooth ease-in-out, Y gravity arc: fast launch, weighted landing
            monkey.style.transition = 'left ' + dur + 's cubic-bezier(0.45,0,0.55,1), top ' + dur + 's cubic-bezier(0.2,0,0.8,1)';
            monkey.style.left = targetX + 'px';
            monkey.style.top  = targetY + 'px';
            setTimeout(function() {
                isJumping = false;
                if (doHang) {
                    currentStablePose = 'HANG';
                    setFrame('HANG');
                    monkey.classList.add('is-hanging');
                } else {
                    currentStablePose = 'IDLE';
                    monkey.classList.remove('is-hanging');
                    playWalkingAnimation(1, dir, null);
                }
            }, dur * 1000);
        } else {
            monkey.style.transition = 'none';
            monkey.style.left = targetX + 'px';
            monkey.style.top  = targetY + 'px';
            currentStablePose = doHang ? 'HANG' : 'IDLE';
            setFrame(currentStablePose);
            if (doHang) monkey.classList.add('is-hanging');
            else monkey.classList.remove('is-hanging');
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

    // ---- Bubble: shown on hover, auto-hides on mouseleave, preserves typed text ----
    var hideTimer = null;

    function showBubble() {
        clearTimeout(hideTimer);
        isHovered = true;
        monkey.classList.add('show-bubble');
        setTimeout(function() { if (minInput) minInput.focus(); }, 50);
    }

    function hideBubble() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function() {
            isHovered = false;
            monkey.classList.remove('show-bubble');
            // Do NOT reset pose on unhover — pose only changes on click
        }, 180);
    }

    monkey.addEventListener('mouseenter', function() {
        showBubble();
    });

    monkey.addEventListener('mouseleave', function() {
        // Blur input so browser doesn't keep focus locked, but typed value is preserved
        if (minInput) minInput.blur();
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

        minInput.value = '';
        statusMsg.textContent = 'sending...';
        statusMsg.classList.add('active');
        if (sendBtn) sendBtn.disabled = true;

        emailjs.send('my-portfolio-messages', 'template_w7rjff6', {
            from_name: 'Visitor via Monkey Note',
            name: 'Visitor',
            message: text,
            time: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        }).then(function() {
            statusMsg.textContent = 'sent \u2713';

            setTimeout(function() {
                statusMsg.textContent = '';
                statusMsg.classList.remove('active');
                hideBubble();
            }, 2000);
        }).catch(function(err) {
            statusMsg.textContent = 'failed. try again.';
            console.error('EmailJS error:', err);
            setTimeout(function() {
                statusMsg.textContent = '';
                statusMsg.classList.remove('active');
            }, 3000);
        }).finally(function() {
            if (sendBtn) sendBtn.disabled = false;
        });
    }

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    minInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
    });

    // Periodic subtle walk animation every ~20s — only when IDLE, never overrides HANG
    setInterval(function() {
        if (!isJumping && !isHovered && currentStablePose !== 'HANG' && document.activeElement !== minInput) {
            var dir = Math.random() > 0.5 ? 'right' : 'left';
            playWalkingAnimation(1, dir, null);
        }
    }, 20000);

    // Auto-jump every 60-90s (calm, infrequent)
    function scheduleAutoJump() {
        var delay = 60000 + Math.random() * 30000;
        setTimeout(function() {
            if (!isHovered && document.activeElement !== minInput) jumpToRandomPerch();
            scheduleAutoJump();
        }, delay);
    }

    function initPosition() {
        var perches = getValidPerches();
        var heroPerch = perches.find(function(p) { return p.el.classList.contains('hero-title-main'); });
        var startPerch = heroPerch || (perches.length > 0 ? perches[0] : null);
        if (startPerch) {
            currentPerchIndex = perches.indexOf(startPerch);
            positionAtPerch(startPerch, false, true);
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
