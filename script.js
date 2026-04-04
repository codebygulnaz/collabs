// Formatting (bold, italic, etc.)
function format(command, value = null) {
  document.execCommand(command, false, value);
}

// Save document
function saveDoc() {
  const content = document.getElementById("editor").innerHTML;
  localStorage.setItem("doc", content);
  alert("Document Saved!");
}

// Load document
function loadDoc() {
  const content = localStorage.getItem("doc");
  if (content) {
    document.getElementById("editor").innerHTML = content;
  } else {
    alert("No saved document found!");
  }
}