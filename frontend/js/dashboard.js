const API = "http://localhost:8000/api";

// --- Load Cases ---
async function loadCases() {
    try {
        const res = await fetch(`${API}/cases`);
        const data = await res.json();
        const cases = data.cases || [];
        const list = document.getElementById("cases-list");
        const empty = document.getElementById("empty-state");
        const count = document.getElementById("case-count");

        if (cases.length === 0) {
            list.innerHTML = "";
            list.appendChild(empty);
            empty.style.display = "block";
            count.textContent = "0 cases";
            return;
        }

        empty.style.display = "none";
        count.textContent = `${cases.length} case${cases.length !== 1 ? "s" : ""}`;

        list.innerHTML = cases
            .map((c) => {
                const statusClass =
                    c.status === "Active"
                        ? "badge-active"
                        : c.status === "Pending"
                        ? "badge-pending"
                        : "badge-closed";
                const date = c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : "";
                return `
                <div class="card case-card" onclick="openCase('${c._id}')">
                    <div class="case-header">
                        <div>
                            <h3>${escHtml(c.title)}</h3>
                            <div class="case-meta">
                                <span>👤 ${escHtml(c.client_name)}</span>
                                <span>📁 ${escHtml(c.case_type)}</span>
                                <span>📅 ${date}</span>
                            </div>
                        </div>
                        <span class="badge ${statusClass}">${c.status}</span>
                    </div>
                    <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px;">
                        ${escHtml((c.description || "").substring(0, 120))}${(c.description || "").length > 120 ? "..." : ""}
                    </p>
                    <div class="case-meta" style="margin-top:12px;">
                        <span>📝 ${(c.notes || []).length} notes</span>
                        <span>📄 ${(c.documents || []).length} docs</span>
                        <span>⏰ ${(c.deadlines || []).length} deadlines</span>
                    </div>
                </div>`;
            })
            .join("");
    } catch (err) {
        console.error("Error loading cases:", err);
    }
}

// --- Create Case ---
async function createCase(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-case");
    btn.disabled = true;
    btn.textContent = "Creating...";

    const body = {
        title: document.getElementById("case-title").value.trim(),
        client_name: document.getElementById("client-name").value.trim(),
        case_type: document.getElementById("case-type").value,
        description: document.getElementById("case-desc").value.trim(),
    };

    try {
        const res = await fetch(`${API}/cases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            closeModal();
            document.getElementById("create-case-form").reset();
            await loadCases();
        } else {
            alert("Failed to create case");
        }
    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Create Case";
    }
}

// --- Navigate to case detail ---
function openCase(id) {
    window.location.href = `case.html?id=${id}`;
}

// --- Modal ---
function openModal() {
    document.getElementById("modal-overlay").classList.add("active");
}

function closeModal() {
    document.getElementById("modal-overlay").classList.remove("active");
}

// Close modal on backdrop click
document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// --- Utility ---
function escHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

// --- Init ---
loadCases();
