const API = "http://localhost:8000/api";
const params = new URLSearchParams(window.location.search);
const CASE_ID = params.get("id");

let chatHistory = [];
let currentCase = null;

// ============================================================
//  INIT
// ============================================================
if (!CASE_ID) {
    alert("No case ID provided");
    window.location.href = "index.html";
}

loadCase();
initTabs();

// ============================================================
//  TABS
// ============================================================
function initTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
        });
    });
}

// ============================================================
//  LOAD CASE
// ============================================================
async function loadCase() {
    try {
        const res = await fetch(`${API}/cases/${CASE_ID}`);
        const data = await res.json();
        currentCase = data;
        renderOverview();
        renderNotes();
        renderDocs();
        renderDeadlines();
    } catch (err) {
        console.error("Error loading case:", err);
        document.getElementById("case-title").textContent = "Error loading case";
    }
}

// ============================================================
//  OVERVIEW
// ============================================================
function renderOverview() {
    const c = currentCase;
    document.getElementById("case-title").textContent = c.title;
    document.getElementById("case-subtitle").textContent = `${c.client_name} · ${c.case_type} · ${c.status}`;
    document.title = `${c.title} — LegalAI`;

    document.getElementById("case-info-grid").innerHTML = `
        <div class="info-item">
            <div class="info-label">Client</div>
            <div class="info-value">${esc(c.client_name)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Case Type</div>
            <div class="info-value">${esc(c.case_type)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">${esc(c.status)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Created</div>
            <div class="info-value">${c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A"}</div>
        </div>
    `;

    document.getElementById("case-description").textContent = c.description || "No description provided.";
}

// ============================================================
//  NOTES
// ============================================================
function renderNotes() {
    const notes = currentCase.notes || [];
    const container = document.getElementById("notes-list");
    if (notes.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No notes yet</p></div>';
        return;
    }
    container.innerHTML = notes
        .slice()
        .reverse()
        .map(
            (n) => `
        <div class="note-item">
            <div>${esc(n.content)}</div>
            <div class="note-date">${n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
        </div>`
        )
        .join("");
}

async function addNote() {
    const input = document.getElementById("note-input");
    const content = input.value.trim();
    if (!content) return;

    try {
        await fetch(`${API}/cases/${CASE_ID}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
        input.value = "";
        await loadCase();
    } catch (err) {
        alert("Error adding note: " + err.message);
    }
}

// ============================================================
//  DOCUMENTS
// ============================================================
function renderDocs() {
    const docs = currentCase.documents || [];
    const container = document.getElementById("docs-list");
    if (docs.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No documents uploaded</p></div>';
        return;
    }
    container.innerHTML = docs
        .map(
            (d) => `
        <div class="doc-item">
            <div class="doc-info">
                <div style="font-weight:600;font-size:0.9rem;">📄 ${esc(d.original_name)}</div>
                <div class="doc-date">${d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : ""}</div>
            </div>
            <div class="doc-actions">
                <button class="btn btn-secondary btn-sm" onclick="summarizeDoc('${d.id}')">🤖 Summarize</button>
                <a class="btn btn-secondary btn-sm" href="${API}/cases/${CASE_ID}/files/${d.filename}" target="_blank">View</a>
                <button class="btn btn-danger btn-sm" onclick="deleteDoc('${d.id}')">🗑️ Delete</button>
            </div>
        </div>`
        )
        .join("");
}

async function uploadDoc() {
    const fileInput = document.getElementById("file-input");
    if (!fileInput.files.length) {
        alert("Please select a PDF file");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const res = await fetch(`${API}/cases/${CASE_ID}/upload`, {
            method: "POST",
            body: formData,
        });
        if (res.ok) {
            fileInput.value = "";
            await loadCase();
        } else {
            const err = await res.json();
            alert(err.detail || "Upload failed");
        }
    } catch (err) {
        alert("Error uploading: " + err.message);
    }
}

async function deleteDoc(documentId) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
        const res = await fetch(`${API}/cases/${CASE_ID}/files/${documentId}`, {
            method: "DELETE",
        });
        if (res.ok) {
            await loadCase();
        } else {
            const err = await res.json();
            alert(err.detail || "Delete failed");
        }
    } catch (err) {
        alert("Error deleting: " + err.message);
    }
}

// ============================================================
//  DEADLINES
// ============================================================
function renderDeadlines() {
    const deadlines = currentCase.deadlines || [];
    const container = document.getElementById("deadlines-list");
    if (deadlines.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No deadlines set</p></div>';
        return;
    }

    const now = new Date();
    container.innerHTML = deadlines
        .map((d) => {
            const due = new Date(d.due_date);
            const overdue = !d.completed && due < now;
            return `
            <div class="deadline-item ${d.completed ? "completed" : ""}">
                <div class="dl-info">
                    <div class="dl-title">${d.completed ? "✅" : overdue ? "🔴" : "⏳"} ${esc(d.title)}</div>
                    <div class="dl-date">Due: ${due.toLocaleDateString()} ${overdue ? '<span style="color:var(--danger);font-weight:600;"> — OVERDUE</span>' : ""}</div>
                </div>
                <button class="btn btn-sm ${d.completed ? "btn-secondary" : "btn-success"}" onclick="toggleDeadline('${d.id}')">
                    ${d.completed ? "Undo" : "Complete"}
                </button>
            </div>`;
        })
        .join("");
}

async function addDeadline() {
    const title = document.getElementById("deadline-title").value.trim();
    const due_date = document.getElementById("deadline-date").value;
    if (!title || !due_date) {
        alert("Please enter title and date");
        return;
    }

    try {
        await fetch(`${API}/cases/${CASE_ID}/deadlines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, due_date }),
        });
        document.getElementById("deadline-title").value = "";
        document.getElementById("deadline-date").value = "";
        await loadCase();
    } catch (err) {
        alert("Error adding deadline: " + err.message);
    }
}

async function toggleDeadline(deadlineId) {
    try {
        await fetch(`${API}/cases/${CASE_ID}/deadlines/${deadlineId}`, {
            method: "PATCH",
        });
        await loadCase();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// ============================================================
//  AI FEATURES
// ============================================================
function showAILoading(msg) {
    document.getElementById("ai-result").innerHTML = `<div class="loading-text"><span class="spinner"></span> ${msg}</div>`;
}

function showAIResult(text) {
    document.getElementById("ai-result").textContent = text;
}

// --- Research ---
async function doResearch() {
    const topic = document.getElementById("research-topic").value.trim();
    if (!topic) { alert("Enter a research topic"); return; }

    showAILoading("Researching...");
    try {
        const res = await fetch(`${API}/ai/research`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, case_id: parseInt(CASE_ID) }),
        });
        const data = await res.json();
        showAIResult(data.result || data.detail || "No result");
    } catch (err) {
        showAIResult("Error: " + err.message);
    }
}

// --- Generate Document ---
async function generateDoc() {
    const document_type = document.getElementById("doc-type").value;
    const details = document.getElementById("doc-details").value.trim();
    if (!details) { alert("Enter document details"); return; }

    showAILoading(`Generating ${document_type}...`);
    try {
        const res = await fetch(`${API}/ai/generate-document`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document_type, details, case_id: parseInt(CASE_ID) }),
        });
        const data = await res.json();
        showAIResult(data.result || data.detail || "No result");
    } catch (err) {
        showAIResult("Error: " + err.message);
    }
}

// --- Summarize Document ---
async function summarizeDoc(documentId) {
    showAILoading("Summarizing document...");
    // Switch to AI tab to show result
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="ai"]').classList.add("active");
    document.getElementById("tab-ai").classList.add("active");

    try {
        const res = await fetch(`${API}/ai/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ case_id: parseInt(CASE_ID), document_id: parseInt(documentId) }),
        });
        const data = await res.json();

        showAIResult(data.result || data.detail || "No result");
    } catch (err) {
        showAIResult("Error: " + err.message);
    }
}

// --- Prepare Case ---
async function prepareCase() {
    showAILoading("Preparing comprehensive case brief... This may take a moment.");
    try {
        const res = await fetch(`${API}/ai/prepare-case`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ case_id: parseInt(CASE_ID) }),
        });
        const data = await res.json();
        showAIResult(data.result || data.detail || "No result");
    } catch (err) {
        showAIResult("Error: " + err.message);
    }
}

// --- Whole Case Analysis ---
async function analyzeWholeCase() {
    showAILoading("Running deep synthesis across all case documents... This analyzes every file uploaded.");
    try {
        const res = await fetch(`${API}/ai/analyze-case`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ case_id: parseInt(CASE_ID) }),
        });
        const data = await res.json();
        showAIResult(data.result || data.detail || "No result");
    } catch (err) {
        showAIResult("Error: " + err.message);
    }
}

// ============================================================
//  CHAT
// ============================================================
async function sendChat() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    // Show user message
    appendChatMsg("user", message);
    input.value = "";

    // Show loading indicator
    const loadingId = appendChatMsg("assistant", '<span class="loading-text"><span class="spinner"></span> Thinking...</span>', true);

    try {
        const res = await fetch(`${API}/ai/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                case_id: parseInt(CASE_ID),
                message,
                history: chatHistory,
            }),
        });
        const data = await res.json();
        const reply = data.result || "Sorry, I couldn't process that.";

        // Update chat history
        chatHistory.push({ role: "user", content: message });
        chatHistory.push({ role: "assistant", content: reply });

        // Keep history manageable (last 10 turns)
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        // Replace loading with actual response
        removeChatMsg(loadingId);
        appendChatMsg("assistant", reply);
    } catch (err) {
        removeChatMsg(loadingId);
        appendChatMsg("assistant", "Error: " + err.message);
    }
}

let chatMsgCounter = 0;

function appendChatMsg(role, content, isHtml = false) {
    const container = document.getElementById("chat-messages");
    const id = `chat-msg-${++chatMsgCounter}`;
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;
    div.id = id;
    div.innerHTML = `<div class="msg-bubble">${isHtml ? content : esc(content)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeChatMsg(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ============================================================
//  UTILITY
// ============================================================
function esc(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

// ============================================================
//  CASE DELETION
// ============================================================
async function deleteCase() {
    if (!confirm("Are you sure you want to delete this ENTIRE case? This will delete all notes, deadlines, documents, and AI memory for this case. This cannot be undone.")) return;

    try {
        const res = await fetch(`${API}/cases/${CASE_ID}`, {
            method: "DELETE",
        });
        if (res.ok) {
            alert("Case deleted successfully.");
            window.location.href = "index.html";
        } else {
            const err = await res.json();
            alert(err.detail || "Delete failed");
        }
    } catch (err) {
        alert("Error deleting case: " + err.message);
    }
}
