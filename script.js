// --- STATE MANAGEMENT ---
let currentDocId = null;
let allDocs = JSON.parse(localStorage.getItem('all_docs')) || {
    "doc_1": { title: "Untitled Document 1", content: "Start typing here..." }
};

const editor = document.getElementById('editor');
const docTitle = document.getElementById('doc-title');
const tabsBar = document.getElementById('tabs-bar');

// Google's vibrant color palette
const tabColors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#a142f4', '#ff6d00'];

window.addEventListener('load', () => {
    const docIds = Object.keys(allDocs);
    if (docIds.length === 0) {
        createNewDoc();
    } else {
        renderTabs();
        switchTab(docIds[0]);
    }
});

function renderTabs() {
    tabsBar.innerHTML = "";
    const docIds = Object.keys(allDocs);

    docIds.forEach((id, index) => {
        const doc = allDocs[id];
        const tab = document.createElement('div');
        tab.className = `tab ${id === currentDocId ? 'active' : ''}`;
        
        // Assign color to the LEFT border of the tab
        const color = tabColors[index % tabColors.length];
        if (id !== currentDocId) {
            tab.style.borderLeftColor = color;
        }

        tab.innerHTML = `
            <i class="fa-regular fa-file-lines" style="margin-right: 10px;"></i>
            <span>${doc.title}</span>
            <i class="fa-solid fa-xmark close-tab" onclick="closeTab(event, '${id}')"></i>
        `;
        
        tab.onclick = () => switchTab(id);
        tabsBar.appendChild(tab);
    });
}

function switchTab(id) {
    if (currentDocId) {
        allDocs[currentDocId].content = editor.innerHTML;
        allDocs[currentDocId].title = docTitle.value;
    }

    currentDocId = id;
    const doc = allDocs[id];
    editor.innerHTML = doc.content;
    docTitle.value = doc.title;

    renderTabs();
}

function createNewDoc() {
    const id = "doc_" + Date.now();
    const newTitle = "Untitled Document " + (Object.keys(allDocs).length + 1);
    
    allDocs[id] = {
        title: newTitle,
        content: "Start typing here..."
    };
    
    saveToStorage();
    renderTabs();
    switchTab(id);
}

function closeTab(event, id) {
    event.stopPropagation();
    if (Object.keys(allDocs).length === 1) {
        alert("You must have at least one document open.");
        return;
    }
    delete allDocs[id];
    saveToStorage();
    if (currentDocId === id) {
        switchTab(Object.keys(allDocs)[0]);
    } else {
        renderTabs();
    }
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

// Basic formatting and download functions
function format(command, value = null) {
    document.execCommand(command, false, value);
}

function downloadDoc() {
    const content = editor.innerHTML;
    const title = docTitle.value || "Untitled";
    const blob = new Blob([content], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.html`;
    a.click();
}