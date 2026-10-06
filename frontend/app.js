// SRM CampusFind Frontend App JS

const CAMPUS_LOCATIONS = [
    { name: "Central Library", coords: [12.8231, 80.0442] },
    { name: "Tech Park — Java Canteen", coords: [12.8245, 80.0455] },
    { name: "Tech Park — Labs", coords: [12.8246, 80.0456] },
    { name: "University Building (UB)", coords: [12.8220, 80.0430] },
    { name: "Sports Complex", coords: [12.8260, 80.0470] },
    { name: "MTP Canteen", coords: [12.8210, 80.0415] },
    { name: "Architecture Block", coords: [12.8251, 80.0421] },
    { name: "Abode Valley", coords: [12.8205, 80.0390] }
];

const PRESETS = [
    {
        desc: "I misplaced my black wireless Airdopes earbuds near the central library floor 2.",
        cat: "electronics",
        color: "black",
        location: 0,
        time: "2026-10-04T10:30"
    },
    {
        desc: "Lost my dark blue Nike backpack with laptop inside near Tech Park Java Canteen.",
        cat: "bags",
        color: "navy blue",
        location: 1,
        time: "2026-10-04T13:00"
    },
    {
        desc: "Dropped my student ID card with blue lanyard around UB building food court.",
        cat: "documents",
        color: "blue",
        location: 3,
        time: "2026-10-03T16:45"
    },
    {
        desc: "Misplaced an Apple Watch Series 7 with black silicone strap near sports complex.",
        cat: "electronics",
        color: "black",
        location: 4,
        time: "2026-10-05T08:00"
    }
];

const CATEGORY_ICONS = {
    electronics: "🎧",
    bags: "🎒",
    documents: "🪪",
    accessories: "🔑"
};

const TAB_HEADERS = {
    "tab-matching": ["Intelligent Multimodal Matching Engine", "Semantic NLP + Vision Encoder + Geo-Temporal Fusion + GenAI Explanations"],
    "tab-report": ["Report a Lost or Found Item", "New reports are embedded and indexed in the vector database instantly"],
    "tab-evaluation": ["Baseline Evaluation", "Keyword vs TF-IDF vs Transformer vs Vision vs Proposed Multimodal Model"],
    "tab-mapping": ["Objective-to-Module Mapping", "How each course objective maps to the implemented AI technique"],
    "tab-notifications": ["Match Notifications", "Alerts raised when a match crosses the 0.75 confidence threshold"]
};

// Resized photo data URLs, keyed by file input id
const selectedPhotos = {};

document.addEventListener("DOMContentLoaded", () => {
    setupBurgerMenu();
    setupTabNavigation();
    setupLocationSelects();
    setupDropzones();
    fetchDatasetInfo();
    fetchNotifications();
    runBenchmark();
});

// Escape user-provided text before inserting it into HTML
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
}

/* ---------- Navigation ---------- */

function setupBurgerMenu() {
    document.getElementById("burger-btn").addEventListener("click", () => {
        toggleMenu(!document.body.classList.contains("menu-open"));
    });
    document.getElementById("sidebar-overlay").addEventListener("click", () => toggleMenu(false));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") toggleMenu(false);
    });
}

function toggleMenu(open) {
    const burger = document.getElementById("burger-btn");
    document.body.classList.toggle("menu-open", open);
    document.getElementById("sidebar").setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

function setupTabNavigation() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            openTab(btn.getAttribute("data-tab"));
            toggleMenu(false);
        });
    });
}

function openTab(targetId) {
    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-tab") === targetId);
    });
    document.querySelectorAll(".tab-content").forEach(t => {
        t.classList.toggle("active", t.id === targetId);
    });

    const [title, subtitle] = TAB_HEADERS[targetId];
    document.getElementById("page-title").innerText = title;
    document.getElementById("page-subtitle").innerText = subtitle;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Form helpers ---------- */

function setupLocationSelects() {
    const options = CAMPUS_LOCATIONS.map((loc, i) => `<option value="${i}">${escapeHtml(loc.name)}</option>`).join("");
    document.querySelectorAll(".location-select").forEach(sel => {
        sel.innerHTML = options;
    });
}

function setupDropzones() {
    document.querySelectorAll(".dropzone").forEach(zone => {
        const input = zone.querySelector(".dropzone-input");
        const empty = zone.querySelector(".dropzone-empty");
        const preview = zone.querySelector(".dropzone-preview");
        const img = preview.querySelector("img");

        const clear = () => {
            delete selectedPhotos[input.id];
            input.value = "";
            img.removeAttribute("src");
            preview.classList.add("hidden");
            empty.classList.remove("hidden");
            input.classList.remove("hidden");
        };
        zone.clearPhoto = clear;

        input.addEventListener("change", async () => {
            const file = input.files[0];
            if (!file) return;
            try {
                const dataUrl = await resizeImage(file, 640);
                selectedPhotos[input.id] = dataUrl;
                img.src = dataUrl;
                preview.classList.remove("hidden");
                empty.classList.add("hidden");
                input.classList.add("hidden");
            } catch (e) {
                clear();
            }
        });

        zone.querySelector(".dropzone-remove").addEventListener("click", clear);
        zone.addEventListener("dragenter", () => zone.classList.add("dragover"));
        zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
        zone.addEventListener("drop", () => zone.classList.remove("dragover"));
    });
}

// Downscale a photo in the browser so uploads stay small
function resizeImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const image = new Image();
            image.onerror = reject;
            image.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function localTimestamp(date = new Date()) {
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
}

function loadPreset(idx) {
    const p = PRESETS[idx];
    document.getElementById("query-desc").value = p.desc;
    document.getElementById("query-cat").value = p.cat;
    document.getElementById("query-color").value = p.color;
    document.getElementById("query-location").value = p.location;
    document.getElementById("query-time").value = p.time;
}

/* ---------- Data loading ---------- */

async function fetchDatasetInfo() {
    try {
        const res = await fetch("/api/dataset");
        const data = await res.json();
        const records = data.records || [];
        const lost = records.filter(r => r.status === "LOST").length;

        document.getElementById("stat-records").innerText = `${data.total_records} Indexed Embeddings`;
        document.getElementById("nav-status-text").innerText = `Engine online · ${data.total_records} reports`;
        document.getElementById("stat-total").innerText = data.total_records;
        document.getElementById("stat-lost").innerText = lost;
        document.getElementById("stat-found").innerText = records.length - lost;
    } catch (e) {
        console.error("Error fetching dataset info:", e);
    }
}

/* ---------- Matching ---------- */

async function executeSearch(event) {
    event.preventDefault();

    const loc = CAMPUS_LOCATIONS[document.getElementById("query-location").value];
    const time = document.getElementById("query-time").value;

    const payload = {
        query_description: document.getElementById("query-desc").value,
        target_status: "FOUND",
        category: document.getElementById("query-cat").value,
        color: document.getElementById("query-color").value,
        location_name: loc.name,
        coordinates: loc.coords,
        timestamp: time ? `${time}:00` : localTimestamp(),
        image_data: selectedPhotos["query-photo"] || null
    };

    const container = document.getElementById("results-container");
    const submitBtn = event.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    document.getElementById("results-count").innerText = "";
    container.innerHTML = `<div class="loader"><div class="spinner"></div>Fusing text, vision &amp; geo-temporal embeddings…</div>`;

    try {
        const res = await fetch("/api/search/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`server returned ${res.status}`);

        const data = await res.json();
        renderMatches(data.matches);
        fetchNotifications();
    } catch (e) {
        container.innerHTML = `<div class="genai-box error">Error searching matches: ${escapeHtml(e.message)}</div>`;
    } finally {
        submitBtn.disabled = false;
    }
}

function subscoreBar(label, value) {
    if (value === null || value === undefined) {
        return `
            <div class="bar-item na">
                <div class="bar-label"><span>${label}</span><b>No photo</b></div>
                <div class="progress-track"></div>
            </div>`;
    }
    const pct = Math.round(value * 100);
    return `
        <div class="bar-item">
            <div class="bar-label"><span>${label}</span><b>${pct}%</b></div>
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>`;
}

function renderMatches(matches) {
    const container = document.getElementById("results-container");
    if (!matches || matches.length === 0) {
        container.innerHTML = `<div class="placeholder-state"><span class="placeholder-icon">🔎</span><p>No candidate matches found.</p></div>`;
        return;
    }

    document.getElementById("results-count").innerText = `${matches.length} candidates ranked`;

    container.innerHTML = matches.map((m, i) => {
        const cand = m.candidate_record;
        const scorePct = Math.round(m.multimodal_score * 100);
        let tagClass = "tag-high", ringColor = "var(--success)";
        if (m.classification.includes("POSSIBLE")) { tagClass = "tag-possible"; ringColor = "var(--warning)"; }
        if (m.classification.includes("LOW")) { tagClass = "tag-low"; ringColor = "var(--danger)"; }

        const thumb = cand.image_url
            ? `<img src="${escapeHtml(cand.image_url)}" alt="Photo of found item">`
            : (CATEGORY_ICONS[cand.category] || "📦");
        const sub = m.subscores;

        return `
            <div class="match-card ${i === 0 ? "best" : ""}" style="animation-delay:${i * 60}ms">
                <div class="match-top">
                    <div class="match-thumb">${thumb}</div>
                    <div class="match-info">
                        <div class="match-title"><span class="match-rank">#${i + 1}</span>Found Item ${escapeHtml(cand.id)}</div>
                        <div class="match-location">📍 ${escapeHtml(cand.location_name)}</div>
                    </div>
                    <div class="score-ring" style="--pct:${scorePct}; --ring-color:${ringColor}" title="Multimodal confidence">
                        <span>${scorePct}%</span>
                    </div>
                </div>

                <p class="match-desc">"${escapeHtml(cand.description)}"</p>
                <span class="confidence-tag ${tagClass}">${escapeHtml(m.classification)}</span>

                <div class="subscore-bars">
                    ${subscoreBar("Text similarity", sub.text_similarity)}
                    ${subscoreBar("Vision similarity", sub.image_similarity)}
                    ${subscoreBar("Geo-proximity", sub.location_similarity)}
                    ${subscoreBar("Time proximity", sub.time_similarity)}
                    ${subscoreBar("Attribute match", sub.attribute_similarity)}
                </div>

                <div class="genai-box">
                    <strong>🤖 GenAI Grounded Explanation</strong><br>
                    ${escapeHtml(m.genai_explanation)}
                </div>
            </div>
        `;
    }).join("");
}

/* ---------- Reporting ---------- */

async function submitReport(event) {
    event.preventDefault();
    const form = event.target;
    const status = form.querySelector("input[name=rep-status]:checked").value;
    const loc = CAMPUS_LOCATIONS[document.getElementById("rep-location").value];
    const detail = document.getElementById("rep-location-detail").value.trim();

    const payload = {
        status: status,
        description: document.getElementById("rep-desc").value,
        category: document.getElementById("rep-category").value,
        brand: document.getElementById("rep-brand").value || "unknown",
        color: document.getElementById("rep-color").value || "unspecified",
        location_name: detail ? `${loc.name}, ${detail}` : loc.name,
        coordinates: loc.coords,
        timestamp: localTimestamp(),
        image_data: selectedPhotos["rep-photo"] || null
    };

    const endpoint = status === "LOST" ? "/api/report/lost" : "/api/report/found";
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`server returned ${res.status}`);
        const data = await res.json();
        const photoNote = data.record.image_url ? " with photo" : "";
        showReportStatus(`✅ ${data.message} — indexed as ${data.record.id}${photoNote}`, false);
        form.reset();
        form.querySelector(".dropzone").clearPhoto();
        fetchDatasetInfo();
    } catch (e) {
        showReportStatus("Error submitting report: " + e.message, true);
    } finally {
        submitBtn.disabled = false;
    }
}

function showReportStatus(message, isError) {
    const box = document.getElementById("report-status");
    box.innerText = message;
    box.classList.toggle("error", isError);
    box.classList.remove("hidden");
}

/* ---------- Evaluation ---------- */

async function runBenchmark() {
    const tbody = document.getElementById("eval-tbody");
    const note = document.getElementById("eval-note");
    tbody.innerHTML = `<tr><td colspan="8"><div class="loader"><div class="spinner"></div>Running benchmark suite across baseline models…</div></td></tr>`;
    note.innerText = "";

    try {
        const res = await fetch("/api/evaluation");
        if (!res.ok) throw new Error(`server returned ${res.status}`);
        const data = await res.json();
        const cols = ["Accuracy", "Precision", "Recall", "F1 Score", "Recall@1", "Recall@3", "MRR"];
        let hasNA = false;

        tbody.innerHTML = data.comparison_matrix.map(row => {
            const cells = cols.map(c => {
                const v = row[c];
                if (typeof v !== "number") {
                    hasNA = true;
                    return `<td class="na">${escapeHtml(v)}</td>`;
                }
                return `<td>${v.toFixed(4)}</td>`;
            }).join("");
            const cls = row.Model.includes("Proposed") ? ' class="row-proposed"' : "";
            return `<tr${cls}><td>${escapeHtml(row.Model)}</td>${cells}</tr>`;
        }).join("");

        note.innerText = `Evaluated on ${data.total_eval_queries} curated lost→found query pairs.` + (hasNA
            ? " N/A: the curated test set has no item photos, so the image-only baseline cannot be measured; visual matching is used whenever photos are uploaded."
            : "");
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:var(--danger);">Failed to load evaluation: ${escapeHtml(e.message)}</td></tr>`;
    }
}

/* ---------- Notifications ---------- */

async function fetchNotifications() {
    try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        const list = document.getElementById("notif-list");

        const notifs = data.notifications || [];
        document.getElementById("notif-badge").innerText = notifs.length;
        document.getElementById("stat-alerts").innerText = notifs.length;
        document.getElementById("burger-dot").classList.toggle("hidden", notifs.length === 0);

        if (notifs.length === 0) {
            list.innerHTML = `<div class="placeholder-state"><span class="placeholder-icon">🔕</span><p>No notifications triggered yet. Run a match search to generate alerts.</p></div>`;
            return;
        }

        list.innerHTML = notifs.slice().reverse().map(n => `
            <div class="genai-box alert">
                <strong>${escapeHtml(n.recipient_alert.title)}</strong> · ${escapeHtml(n.timestamp.substring(11, 19))}
                <p style="margin-top:4px;">${escapeHtml(n.recipient_alert.message)}</p>
            </div>
        `).join("");
    } catch (e) {
        console.error("Error fetching notifications:", e);
    }
}
