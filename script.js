// ============================================
// GREETING ANIMATION (namaste ↔ hi)
// ============================================
const greetingEl = document.getElementById('greeting-text');
const greetings = ['namaste', 'hi'];
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
}, 3200);

// ============================================
// PAGE SWITCHING (About is default, Work is secondary)
// ============================================
const navLinks = document.querySelectorAll('.nav-link[data-page]');
const pageWork = document.getElementById('page-work');
const pageAbout = document.getElementById('page-about');
const rightTitle = document.getElementById('right-title');
const rightSection = document.getElementById('right-section');

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

        if (page === 'work') {
            rightTitle.querySelector('.design-text').textContent = 'SELECTED';
            rightTitle.querySelector('.works-text').textContent = 'Works';
            pageWork.classList.add('active');
            observeCards();
        } else {
            rightTitle.querySelector('.design-text').textContent = 'ABOUT';
            rightTitle.querySelector('.works-text').textContent = 'Me';
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

// Click logo → go back to Work (home)
document.getElementById('nav-logo').addEventListener('click', () => {
    switchPage('work');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const page = link.dataset.page;
        if (page === 'resume') {
            return; // Allow native link navigation
        }
        e.preventDefault();
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
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function observeCards() {
    document.querySelectorAll('.project-card').forEach((card, i) => {
        observer.unobserve(card);
        card.classList.remove('visible');
        card.style.transitionDelay = `${i * 0.08}s`;
        
        // Use requestAnimationFrame to ensure layout is calculated after removing 'visible'
        requestAnimationFrame(() => {
            observer.observe(card);
        });
    });
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
// MONKEY — Figma-style cursor + easter egg funny strings
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

monkeyWrapper.addEventListener('mouseenter', () => {
    cursorLabel.textContent = funnyTexts[tooltipIndex];
    tooltipIndex = (tooltipIndex + 1) % funnyTexts.length;
    customCursor.classList.add('active');
    document.body.style.cursor = 'none';
});

monkeyWrapper.addEventListener('mousemove', (e) => {
    // Fast following
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
});

monkeyWrapper.addEventListener('mouseleave', () => {
    customCursor.classList.remove('active');
    document.body.style.cursor = '';
});

monkeyImg.addEventListener('click', openSudokuWindow);

// ============================================
// SUDOKU — FLOATING WINDOW (no overlay)
// ============================================
const winWindow = document.getElementById('win-window');
const winClose = document.getElementById('win-close');
const winTitlebar = document.getElementById('win-titlebar');

function openSudokuWindow() {
    winWindow.style.left = '50%';
    winWindow.style.top = '50%';
    winWindow.style.transform = 'translate(-50%, -50%) scale(1)';
    winWindow.classList.add('active');
    initSudoku();
}

function closeSudokuWindow() {
    winWindow.classList.remove('active');
}

winClose.addEventListener('click', closeSudokuWindow);

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
    [1,4,5,2,3,6],[2,3,6,1,5,4],[4,6,1,3,2,5],
    [5,2,3,6,4,1],[6,5,2,4,1,3],[3,1,4,5,6,2]
];
const PUZZLE = [
    [0,4,5,0,0,0],[2,3,0,0,0,4],[0,6,0,3,0,0],
    [0,0,3,0,0,1],[0,5,0,0,1,3],[3,0,4,0,6,0]
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
            if (selectedCell && Math.floor(r/2) === Math.floor(selectedCell.row/2) && Math.floor(c/3) === Math.floor(selectedCell.col/3)) cell.classList.add('highlight');
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

    if (selectedCell && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
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
