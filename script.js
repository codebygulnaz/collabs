// --- STATE MANAGEMENT ---
let currentDocId = null;
let allDocs = JSON.parse(localStorage.getItem('all_docs')) || {
    "doc_1": { title: "Untitled Document 1", content: "Start typing here..." }
};

const editor = document.getElementById('editor');
const docTitle = document.getElementById('doc-title');
const tabsBar = document.getElementById('tabs-bar');
const tabColors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#a142f4', '#ff6d00'];

// --- SELECTION TRACKER ---
let savedRange = null;
editor.addEventListener('keyup', saveSelection);
editor.addEventListener('mouseup', saveSelection);

function saveSelection() {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        savedRange = sel.getRangeAt(0);
    }
}

function restoreSelection() {
    if (savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
    }
}

// --- FORMATTING ENGINE ---
function format(command, value = null) {
    restoreSelection();
    editor.focus();

    if (command === 'copy' || command === 'cut' || command === 'paste') {
        handleClipboard(command);
        return;
    }
    document.execCommand(command, false, value);
}

async function handleClipboard(command) {
    try {
        if (command === 'copy') {
            const text = window.getSelection().toString();
            await navigator.clipboard.writeText(text);
        } else if (command === 'cut') {
            const text = window.getSelection().toString();
            await navigator.clipboard.writeText(text);
            document.execCommand('delete');
        } else if (command === 'paste') {
            const text = await navigator.clipboard.readText();
            document.execCommand('insertText', false, text);
        }
    } catch (err) {
        alert("Please allow clipboard permissions or use Ctrl+C / Ctrl+V");
    }
}

// --- DOCUMENT & TAB LOGIC ---
window.addEventListener('load', () => {
    const docIds = Object.keys(allDocs);
    if (docIds.length === 0) {
        createNewDoc();
    } else {
        renderTabs();
        switchTab(docIds[0]);
    }
    updateWordCount();
});

function renderTabs() {
    tabsBar.innerHTML = "";
    const docIds = Object.keys(allDocs);
    docIds.forEach((id, index) => {
        const doc = allDocs[id];
        const tab = document.createElement('div');
        tab.className = `tab ${id === currentDocId ? 'active' : ''}`;
        const color = tabColors[index % tabColors.length];
        if (id !== currentDocId) tab.style.borderLeftColor = color;

        tab.innerHTML = `
            <i class="fa-regular fa-file-lines" style="margin-right: 10px;"></i>
            <span>${doc.title}</span>
            <i class="fa-solid fa-xmark close-tab" onclick="closeTab(event, '${id}')"></i>
        `;
        tab.onclick = () => switchTab(id);
        tabsBar.appendChild(tab);
    });
}

// UPDATED switchTab function to include responsive logic
function switchTab(id) {
    if (currentDocId) {
        allDocs[currentDocId].content = editor.innerHTML;
        allDocs[currentDocId].title = docTitle.value;
    }
    currentDocId = id;
    editor.innerHTML = allDocs[id].content;
    docTitle.value = allDocs[id].title;
    renderTabs();
    updateWordCount();

    // CLOSE SIDEBAR ON MOBILE after selecting a doc
    handleMobileTabClick(); 
}

function createNewDoc() {
    const id = "doc_" + Date.now();
    allDocs[id] = {
        title: "Untitled Document " + (Object.keys(allDocs).length + 1),
        content: "Start typing here..."
    };
    saveToStorage();
    renderTabs();
    switchTab(id);
}

function closeTab(event, id) {
    event.stopPropagation();
    if (Object.keys(allDocs).length === 1) return alert("Must have one doc open.");
    delete allDocs[id];
    saveToStorage();
    if (currentDocId === id) switchTab(Object.keys(allDocs)[0]);
    else renderTabs();
}

function saveToStorage() {
    localStorage.setItem('all_docs', JSON.stringify(allDocs));
}

setInterval(() => {
    if (currentDocId) {
        allDocs[currentDocId].content = editor.innerHTML;
        allDocs[currentDocId].title = docTitle.value;
        saveToStorage();
    }
}, 2000);

// --- ADDITIONAL MENU FUNCTIONS ---
function newDoc() { createNewDoc(); }
function downloadDoc() {
    const blob = new Blob([`<html><body style="font-family: Arial">${editor.innerHTML}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${docTitle.value}.html`;
    a.click();
}
function insertImage() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => format('insertImage', event.target.result);
        reader.readAsDataURL(file);
    };
    fileInput.click();
}
function insertTable() {
    const r = prompt("Rows?"), c = prompt("Cols?");
    if (r && c) {
        let t = `<table border="1" style="width:100%; border-collapse:collapse;">`;
        for(let i=0; i<r; i++) { t += "<tr>"; for(let j=0; j<c; j++) t += "<td>&nbsp;</td>"; t += "</tr>"; }
        t += "</table><br>";
        format("insertHTML", t);
    }
}
function insertPageBreak() {
    format("insertHTML", "<hr style='border: 1px dashed #ccc;'>");
}
function toggleRuler() { alert("Ruler feature not available in basic HTML editor."); }

// --- WORD-LIKE SCALING ---
function changeZoom(value) {
    const zoomDecimal = value / 100;
    editor.style.zoom = zoomDecimal;
    const zoomPercent = document.getElementById('zoom-percent');
    if (zoomPercent) zoomPercent.innerText = value + "%";
}

// --- REAL-TIME WORD COUNT ---
function updateWordCount() {
    const wordCountBar = document.getElementById('word-count-bar');
    if (!wordCountBar) return;
    const text = editor.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    wordCountBar.innerText = `Words: ${words} | Characters: ${chars}`;
}

editor.addEventListener('input', updateWordCount);

// --- RESPONSIVE MENU LOGIC ---
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        document.body.classList.toggle('sidebar-closed');
    });
}

function handleMobileTabClick() {
    // Only close sidebar if screen is tablet/mobile size
    if (window.innerWidth <= 768) {
        sidebar.classList.add('closed');
        document.body.classList.add('sidebar-closed');
    }
}