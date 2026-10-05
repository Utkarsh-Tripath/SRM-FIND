// SRM CampusFind Frontend App JS

const PRESETS = [
    {
        desc: "I misplaced my black wireless Airdopes earbuds near the central library floor 2.",
        cat: "electronics",
        color: "black",
        coords: "12.8231, 80.0442",
        time: "2026-10-04T10:30:00"
    },
    {
        desc: "Lost my dark blue Nike backpack with laptop inside near Tech Park Java Canteen.",
        cat: "bags",
        color: "navy blue",
        coords: "12.8245, 80.0455",
        time: "2026-10-04T13:00:00"
    },
    {
        desc: "Dropped my student ID card with blue lanyard around UB building food court.",
        cat: "documents",
        color: "blue",
        coords: "12.8220, 80.0430",
        time: "2026-10-03T16:45:00"
    },
    {
        desc: "Misplaced an Apple Watch Series 7 with black silicone strap near sports complex.",
        cat: "electronics",
        color: "black",
        coords: "12.8260, 80.0470",
        time: "2026-10-05T08:00:00"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    setupTabNavigation();
    fetchDatasetInfo();
    runBenchmark();
});

function setupTabNavigation() {
    const btns = document.querySelectorAll(".nav-btn");
    const tabs = document.querySelectorAll(".tab-content");

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => b.classList.remove("active"));
            tabs.forEach(t => t.classList.remove("active"));

            btn.classList.add("active");
            const targetId = btn.getAttribute("data-tab");
            document.getElementById(targetId).classList.add("active");
        });
    });
}

function loadPreset(idx) {
    const p = PRESETS[idx];
    document.getElementById("query-desc").value = p.desc;
    document.getElementById("query-cat").value = p.cat;
    document.getElementById("query-color").value = p.color;
    document.getElementById("query-coords").value = p.coords;
    document.getElementById("query-time").value = p.time;
}

async function fetchDatasetInfo() {
    try {
        const res = await fetch("/api/dataset");
        const data = await res.json();
        document.getElementById("stat-records").innerText = `${data.total_records} Indexed Embeddings`;
    } catch (e) {
        console.error("Error fetching dataset info:", e);
    }
}

async function executeSearch(event) {
    event.preventDefault();

    const desc = document.getElementById("query-desc").value;
    const cat = document.getElementById("query-cat").value;
    const color = document.getElementById("query-color").value;
    const coordsStr = document.getElementById("query-coords").value;
    const time = document.getElementById("query-time").value;

    const coords = coordsStr.split(",").map(c => parseFloat(c.trim()));

    const payload = {
        query_description: desc,
        target_status: "FOUND",
        category: cat,
        color: color,
        coordinates: coords.length === 2 ? coords : [12.8231, 80.0442],
        timestamp: time
    };

    const container = document.getElementById("results-container");
    container.innerHTML = `<div class="loader">Fusing multimodal text, vision & geo embeddings...</div>`;

    try {
        const res = await fetch("/api/search/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        renderMatches(data.matches);
        fetchNotifications();
    } catch (e) {
        container.innerHTML = `<div class="genai-box" style="border-color: red;">Error searching matches: ${e.message}</div>`;
    }
}

function renderMatches(matches) {
    const container = document.getElementById("results-container");
    if (!matches || matches.length === 0) {
        container.innerHTML = `<p class="placeholder-state">No candidate matches found.</p>`;
        return;
    }

    let html = "";
    matches.forEach(m => {
        const cand = m.candidate_record;
        const scorePct = Math.round(m.multimodal_score * 100);
        let tagClass = "tag-high";
        if (m.classification.includes("POSSIBLE")) tagClass = "tag-possible";
        if (m.classification.includes("LOW")) tagClass = "tag-low";

        const sub = m.subscores;

        html += `
            <div class="match-card">
                <div class="match-header">
                    <div>
                        <strong>Found Item #${cand.id}</strong> — <span style="color:var(--text-muted)">${cand.location_name}</span>
                    </div>
                    <span class="confidence-tag ${tagClass}">${m.classification} (${scorePct}%)</span>
                </div>

                <p style="font-size:0.9rem; margin-bottom:8px;">"${cand.description}"</p>

                <div class="subscore-bars">
                    <div class="bar-item">
                        Text Similarity: ${Math.round(sub.text_similarity * 100)}%
                        <div class="progress-track"><div class="progress-fill" style="width:${sub.text_similarity * 100}%"></div></div>
                    </div>
                    <div class="bar-item">
                        Vision Similarity: ${Math.round(sub.image_similarity * 100)}%
                        <div class="progress-track"><div class="progress-fill" style="width:${sub.image_similarity * 100}%"></div></div>
                    </div>
                    <div class="bar-item">
                        Geo-Proximity: ${Math.round(sub.location_similarity * 100)}%
                        <div class="progress-track"><div class="progress-fill" style="width:${sub.location_similarity * 100}%"></div></div>
                    </div>
                    <div class="bar-item">
                        Temporal Similarity: ${Math.round(sub.time_similarity * 100)}%
                        <div class="progress-track"><div class="progress-fill" style="width:${sub.time_similarity * 100}%"></div></div>
                    </div>
                </div>

                <div class="genai-box">
                    <strong>🤖 GenAI Grounded Explanation:</strong><br>
                    ${m.genai_explanation}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

async function submitReport(event) {
    event.preventDefault();
    const status = document.getElementById("rep-status").value;
    const cat = document.getElementById("rep-category").value;
    const desc = document.getElementById("rep-desc").value;
    const brand = document.getElementById("rep-brand").value;
    const color = document.getElementById("rep-color").value;
    const location = document.getElementById("rep-location").value;

    const payload = {
        status: status,
        description: desc,
        category: cat,
        brand: brand,
        color: color,
        location_name: location,
        coordinates: [12.8231, 80.0442],
        timestamp: new Date().toISOString()
    };

    const endpoint = status === "LOST" ? "/api/report/lost" : "/api/report/found";
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(`Success! ${data.message} (${data.record.id})`);
        fetchDatasetInfo();
    } catch (e) {
        alert("Error submitting report: " + e.message);
    }
}

async function runBenchmark() {
    const tbody = document.getElementById("eval-tbody");
    tbody.innerHTML = `<tr><td colspan="8">Executing experimental benchmark suite across baseline models...</td></tr>`;

    try {
        const res = await fetch("/api/evaluation");
        const data = await res.json();

        let html = "";
        data.comparison_matrix.forEach(row => {
            const isProposed = row.Model.includes("Proposed");
            const rowStyle = isProposed ? 'style="font-weight:700; background:rgba(99,102,241,0.15); color:#6366f1;"' : '';

            html += `
                <tr ${rowStyle}>
                    <td>${row.Model}</td>
                    <td>${row.Accuracy}</td>
                    <td>${row.Precision}</td>
                    <td>${row.Recall}</td>
                    <td>${row["F1 Score"]}</td>
                    <td>${row["Recall@1"]}</td>
                    <td>${row["Recall@3"]}</td>
                    <td>${row.MRR}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red;">Failed to load evaluation: ${e.message}</td></tr>`;
    }
}

async function fetchNotifications() {
    try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        const badge = document.getElementById("notif-badge");
        const list = document.getElementById("notif-list");

        const notifs = data.notifications || [];
        badge.innerText = notifs.length;

        if (notifs.length === 0) {
            list.innerHTML = `<p class="placeholder-state">No notifications triggered yet.</p>`;
            return;
        }

        let html = "";
        notifs.forEach(n => {
            html += `
                <div class="genai-box" style="margin-bottom:12px; border-left-color: var(--success);">
                    <strong>${n.recipient_alert.title}</strong> [${n.timestamp.substring(11, 19)}]<br>
                    <p style="margin-top:4px;">${n.recipient_alert.message}</p>
                </div>
            `;
        });
        list.innerHTML = html;
    } catch (e) {
        console.error("Error fetching notifications:", e);
    }
}
