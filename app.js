// ==========================================
// CODO SLAYER - FRONTEND
// ==========================================

const API_URL = "https://codo-slayer.onrender.com";

let complaints = [];
let tempComplaint = null;


// ==========================================
// PAGE NAVIGATION
// ==========================================

document.querySelectorAll("[data-page]").forEach(button => {

    button.addEventListener("click", () => {

        openPage(button.dataset.page);

    });

});


function openPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page = document.getElementById(pageName);

    if (page) {

        page.classList.add("active");

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove("active");

            if (button.dataset.page === pageName) {

                button.classList.add("active");

            }

        });


    if (pageName === "complaints") {

        renderComplaints();

    }


    if (pageName === "admin") {

        loadAdminAnalytics();

        renderAdminComplaints();

    }

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ==========================================
// API HELPER
// ==========================================

async function apiRequest(
    url,
    options = {}
) {

    try {

        const response = await fetch(
            API_URL + url,
            options
        );


        let data = {};

        try {

            data = await response.json();

        }
        catch (error) {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                "Request failed"
            );

        }


        return data;

    }
    catch (error) {

        console.error(
            "API Error:",
            error
        );

        showToast(
            error.message ||
            "Something went wrong"
        );

        throw error;

    }

}


// ==========================================
// LOAD COMPLAINTS
// ==========================================

async function loadComplaints() {

    try {

        const data =
            await apiRequest(
                "/complaints"
            );


        complaints =
            data.complaints || [];


        updateHome();

        renderComplaints();

        renderRecentComplaints();

        renderAdminComplaints();

        loadAdminAnalytics();

    }
    catch (error) {

        console.error(
            "Load complaints error:",
            error
        );

    }

}


// ==========================================
// HOME DASHBOARD
// ==========================================

function updateHome() {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                complaint.status === "SUBMITTED"
                ||
                complaint.status === "VERIFIED"
        ).length;


    const progress =
        complaints.filter(
            complaint =>
                complaint.status === "IN_PROGRESS"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status === "RESOLVED"
                ||
                complaint.status === "CLOSED"
        ).length;


    const totalReports =
        document.getElementById(
            "totalReports"
        );

    const homePending =
        document.getElementById(
            "homePending"
        );

    const homeProgress =
        document.getElementById(
            "homeProgress"
        );

    const homeResolved =
        document.getElementById(
            "homeResolved"
        );


    if (totalReports) {

        totalReports.textContent =
            total;

    }


    if (homePending) {

        homePending.textContent =
            pending;

    }


    if (homeProgress) {

        homeProgress.textContent =
            progress;

    }


    if (homeResolved) {

        homeResolved.textContent =
            resolved;

    }


    renderPriorityOverview();

    renderCategoryOverview();

}


// ==========================================
// PRIORITY OVERVIEW
// ==========================================

function renderPriorityOverview() {

    const container =
        document.getElementById(
            "priorityOverview"
        );


    if (!container) {
        return;
    }


    const priorities = [
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW"
    ];


    container.innerHTML =
        priorities
        .map(priority => {

            const count =
                complaints.filter(
                    complaint =>
                        complaint.priority === priority
                ).length;


            return `

                <div class="metric-item">

                    <span>
                        ${priority}
                    </span>

                    <strong>
                        ${count}
                    </strong>

                </div>

            `;

        })
        .join("");

}


// ==========================================
// CATEGORY OVERVIEW
// ==========================================

function renderCategoryOverview() {

    const container =
        document.getElementById(
            "categoryOverview"
        );


    if (!container) {
        return;
    }


    const counts = {};


    complaints.forEach(complaint => {

        const category =
            complaint.category ||
            "Unknown";


        if (!counts[category]) {

            counts[category] = 0;

        }


        counts[category]++;

    });


    const entries =
        Object.entries(counts);


    if (entries.length === 0) {

        container.innerHTML = `

            <div class="metric-item">

                <span>
                    No data
                </span>

            </div>

        `;

        return;

    }


    entries.sort(
        (a, b) =>
            b[1] - a[1]
    );


    container.innerHTML =
        entries
        .map(item => {

            return `

                <div class="metric-item">

                    <span>
                        ${escapeHTML(item[0])}
                    </span>

                    <strong>
                        ${item[1]}
                    </strong>

                </div>

            `;

        })
        .join("");

}


// ==========================================
// RECENT COMPLAINTS
// ==========================================

function renderRecentComplaints() {

    const container =
        document.getElementById(
            "recentComplaints"
        );


    if (!container) {
        return;
    }


    const recent =
        complaints.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `

            <div class="complaint-item">

                No complaints yet.

            </div>

        `;

        return;

    }


    container.innerHTML =
        recent
        .map(complaint =>
            complaintCard(complaint)
        )
        .join("");

}


// ==========================================
// COMPLAINT CARD
// ==========================================

function complaintCard(complaint) {

    return `

        <div class="complaint-item">

            <div>

                <h3>

                    ${escapeHTML(
                        complaint.title ||
                        "Untitled Complaint"
                    )}

                </h3>


                <div class="complaint-meta">

                    ${escapeHTML(
                        complaint.id ||
                        ""
                    )}

                    ·

                    ${escapeHTML(
                        complaint.category ||
                        "Unknown"
                    )}

                    <br>

                    ${escapeHTML(
                        complaint.department ||
                        "Unknown Department"
                    )}

                    ·

                    ${escapeHTML(
                        complaint.location ||
                        "Location not provided"
                    )}

                </div>

            </div>


            <div class="badges">

                <span
                    class="priority ${String(
                        complaint.priority ||
                        "LOW"
                    ).toLowerCase()}"
                >

                    ${escapeHTML(
                        complaint.priority ||
                        "LOW"
                    )}

                </span>


                <span class="status-badge">

                    ${formatStatus(
                        complaint.status ||
                        "SUBMITTED"
                    )}

                </span>

            </div>

        </div>

    `;

}


// ==========================================
// REPORT COMPLAINT
// ==========================================

const complaintForm =
    document.getElementById(
        "complaintForm"
    );


if (complaintForm) {

    complaintForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();


            const affected =
                Number(
                    document
                        .getElementById("affected")
                        .value
                ) || 1;


            if (!title || !description) {

                showToast(
                    "Please fill all required fields"
                );

                return;

            }


            const button =
                this.querySelector(
                    "button[type='submit']"
                );


            button.disabled = true;

            button.textContent =
                "Analyzing...";


            try {

                const data =
                    await apiRequest(
                        "/complaints/analyze",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    title,

                                    description,

                                    location,

                                    affected

                                })

                        }
                    );


                // ==================================
                // AI RESPONSE
                // ==================================

                const result =
                    data.analysis?.analysis
                    ||
                    data.analysis
                    ||
                    data;


                console.log(
                    "AI Analysis Response:",
                    data
                );


                document.getElementById(
                    "resultCategory"
                ).textContent =
                    result.category ||
                    "Unknown";


                document.getElementById(
                    "resultDepartment"
                ).textContent =
                    result.department ||
                    "Unknown";


                document.getElementById(
                    "resultPriority"
                ).textContent =
                    result.priority ||
                    "LOW";


                document.getElementById(
                    "resultConfidence"
                ).textContent =
                    (result.confidence ?? 0)
                    + "%";


                document.getElementById(
                    "complaintId"
                ).textContent =
                    "Ready to submit";


                tempComplaint = {

                    title,

                    description,

                    location,

                    affected

                };


                window.tempComplaint =
                    tempComplaint;


                document
                    .getElementById("aiResult")
                    .classList.remove(
                        "hidden"
                    );


                showToast(
                    "AI analysis completed"
                );

            }
            catch (error) {

                console.error(
                    "AI Analysis Error:",
                    error
                );

            }
            finally {

                button.disabled = false;

                button.textContent =
                    "Analyze Complaint";

            }

        }
    );

}


// ==========================================
// FINAL SUBMIT
// ==========================================

const finalSubmit =
    document.getElementById(
        "finalSubmit"
    );


if (finalSubmit) {

    finalSubmit.addEventListener(
        "click",
        async function() {

            if (!tempComplaint) {

                showToast(
                    "Analyze complaint first"
                );

                return;

            }


            this.disabled = true;

            this.textContent =
                "Submitting...";


            try {

                const data =
                    await apiRequest(
                        "/complaints",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    tempComplaint
                                )

                        }
                    );


                const complaint =
                    data.complaint;


                document.getElementById(
                    "complaintId"
                ).textContent =
                    "Complaint ID: "
                    +
                    complaint.id;


                showToast(
                    "Complaint submitted successfully"
                );


                document
                    .getElementById(
                        "complaintForm"
                    )
                    .reset();


                document
                    .getElementById(
                        "aiResult"
                    )
                    .classList.add(
                        "hidden"
                    );


                tempComplaint = null;

                window.tempComplaint = null;


                await loadComplaints();


                setTimeout(() => {

                    openPage("track");


                    document.getElementById(
                        "trackId"
                    ).value =
                        complaint.id;


                    trackComplaint();

                }, 700);

            }
            catch (error) {

                console.error(
                    "Submit Error:",
                    error
                );

            }
            finally {

                this.disabled = false;

                this.textContent =
                    "Submit Complaint";

            }

        }
    );

}


// ==========================================
// TRACKING
// ==========================================

const trackBtn =
    document.getElementById(
        "trackBtn"
    );


if (trackBtn) {

    trackBtn.addEventListener(
        "click",
        trackComplaint
    );

}


async function trackComplaint() {

    const input =
        document.getElementById(
            "trackId"
        );


    if (!input) {
        return;
    }


    const id =
        input.value
        .trim()
        .toUpperCase();


    if (!id) {

        showToast(
            "Enter complaint ID"
        );

        return;

    }


    const container =
        document.getElementById(
            "trackResult"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="panel">

            Loading complaint...

        </div>

    `;


    try {

        const data =
            await apiRequest(
                `/complaints/${encodeURIComponent(id)}`
            );


        renderTracking(
            data.complaint
        );

    }
    catch (error) {

        container.innerHTML = `

            <div class="panel">

                Complaint not found.

            </div>

        `;

    }

}


// ==========================================
// TRACKING UI
// ==========================================

function renderTracking(complaint) {

    const container =
        document.getElementById(
            "trackResult"
        );


    if (!container) {
        return;
    }


    const history =
        complaint.history || [];


    container.innerHTML = `

        <div class="track-card">


            <div class="track-head">

                <div>

                    <h2>

                        ${escapeHTML(
                            complaint.title ||
                            "Complaint"
                        )}

                    </h2>


                    <div class="track-meta">

                        ${escapeHTML(
                            complaint.id ||
                            ""
                        )}

                        <br>

                        ${escapeHTML(
                            complaint.category ||
                            "Unknown"
                        )}

                        ·

                        ${escapeHTML(
                            complaint.department ||
                            "Unknown"
                        )}

                        <br>

                        ${escapeHTML(
                            complaint.location ||
                            "Location not provided"
                        )}

                    </div>

                </div>


                <div class="badges">

                    <span
                        class="priority ${String(
                            complaint.priority ||
                            "LOW"
                        ).toLowerCase()}"
                    >

                        ${escapeHTML(
                            complaint.priority ||
                            "LOW"
                        )}

                    </span>


                    <span class="status-badge">

                        ${formatStatus(
                            complaint.status ||
                            "SUBMITTED"
                        )}

                    </span>

                </div>

            </div>


            <p class="track-meta">

                ${escapeHTML(
                    complaint.description ||
                    ""
                )}

            </p>


            ${
                complaint.location

                ?

                `
                    <br>

                    <a
                        class="ghost-btn"
                        target="_blank"
                        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            complaint.location
                        )}"
                    >
                        Open Location in Maps
                    </a>
                `

                :

                ""
            }


            <div class="timeline">

                ${
                    history.length === 0

                    ?

                    `
                        <p class="track-meta">
                            No status history available.
                        </p>
                    `

                    :

                    history
                    .map(
                        (item, index) => {

                            const current =
                                index ===
                                history.length - 1
                                    ? "current"
                                    : "";


                            return `

                                <div
                                    class="timeline-item ${current}"
                                >

                                    <div
                                        class="timeline-dot"
                                    ></div>


                                    <strong>

                                        ${formatStatus(
                                            item.status
                                        )}

                                    </strong>


                                    <p>

                                        ${escapeHTML(
                                            item.note ||
                                            ""
                                        )}

                                    </p>


                                    <small>

                                        ${formatDate(
                                            item.created_at
                                        )}

                                    </small>

                                </div>

                            `;

                        }
                    )
                    .join("")

                }

            </div>


        </div>

    `;

}


// ==========================================
// COMPLAINT LIST
// ==========================================

function renderComplaints() {

    const container =
        document.getElementById(
            "complaintList"
        );


    if (!container) {
        return;
    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusSearch =
        document.getElementById(
            "statusSearch"
        );


    const prioritySearch =
        document.getElementById(
            "prioritySearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const status =
        statusSearch
            ? statusSearch.value
            : "ALL";


    const priority =
        prioritySearch
            ? prioritySearch.value
            : "ALL";


    const data =
        complaints.filter(
            complaint => {

                const title =
                    String(
                        complaint.title || ""
                    )
                    .toLowerCase();


                const id =
                    String(
                        complaint.id || ""
                    )
                    .toLowerCase();


                const category =
                    String(
                        complaint.category || ""
                    )
                    .toLowerCase();


                const location =
                    String(
                        complaint.location || ""
                    )
                    .toLowerCase();


                const matchesSearch =

                    title.includes(search)

                    ||

                    id.includes(search)

                    ||

                    category.includes(search)

                    ||

                    location.includes(search);


                const matchesStatus =

                    status === "ALL"

                    ||

                    complaint.status === status;


                const matchesPriority =

                    priority === "ALL"

                    ||

                    complaint.priority === priority;


                return (

                    matchesSearch

                    &&

                    matchesStatus

                    &&

                    matchesPriority

                );

            }
        );


    if (data.length === 0) {

        container.innerHTML = `

            <div class="complaint-item">

                No complaints found.

            </div>

        `;

        return;

    }


    container.innerHTML =
        data
        .map(
            complaint =>
                complaintCard(
                    complaint
                )
        )
        .join("");

}


// ==========================================
// SEARCH LISTENERS
// ==========================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderComplaints
    );

}


const statusSearch =
    document.getElementById(
        "statusSearch"
    );


if (statusSearch) {

    statusSearch.addEventListener(
        "change",
        renderComplaints
    );

}


const prioritySearch =
    document.getElementById(
        "prioritySearch"
    );


if (prioritySearch) {

    prioritySearch.addEventListener(
        "change",
        renderComplaints
    );

}


// ==========================================
// ADMIN PAGE
// ==========================================

function checkAdminPage() {

    const content =
        document.getElementById(
            "adminContent"
        );


    const login =
        document.getElementById(
            "adminLogin"
        );


    const authArea =
        document.getElementById(
            "adminAuthArea"
        );


    // Login is removed.
    // Admin page is directly accessible.

    if (login) {

        login.classList.add(
            "hidden"
        );

    }


    if (content) {

        content.classList.remove(
            "hidden"
        );

    }


    if (authArea) {

        authArea.innerHTML = "";

    }


    loadAdminAnalytics();

    renderAdminComplaints();

}


// ==========================================
// ADMIN ANALYTICS
// ==========================================

async function loadAdminAnalytics() {

    try {

        const data =
            await apiRequest(
                "/analytics"
            );


        const status =
            data.status || {};


        const adminTotal =
            document.getElementById(
                "adminTotal"
            );


        const adminPending =
            document.getElementById(
                "adminPending"
            );


        const adminProgress =
            document.getElementById(
                "adminProgress"
            );


        const adminResolved =
            document.getElementById(
                "adminResolved"
            );


        const resolutionRate =
            document.getElementById(
                "resolutionRate"
            );


        const averageResolution =
            document.getElementById(
                "averageResolution"
            );


        if (adminTotal) {

            adminTotal.textContent =
                data.total || 0;

        }


        if (adminPending) {

            adminPending.textContent =
                (status.SUBMITTED || 0)
                +
                (status.VERIFIED || 0);

        }


        if (adminProgress) {

            adminProgress.textContent =
                status.IN_PROGRESS || 0;

        }


        if (adminResolved) {

            adminResolved.textContent =
                (status.RESOLVED || 0)
                +
                (status.CLOSED || 0);

        }


        if (resolutionRate) {

            resolutionRate.textContent =
                (data.resolution_rate || 0)
                + "%";

        }


        if (averageResolution) {

            averageResolution.textContent =
                (data.average_resolution_hours || 0)
                + " hrs";

        }


        renderMetrics(
            "adminCategories",
            data.categories || {}
        );


        renderMetrics(
            "adminDepartments",
            data.departments || {}
        );

    }
    catch (error) {

        console.error(
            "Analytics error:",
            error
        );

    }

}


// ==========================================
// METRICS
// ==========================================

function renderMetrics(
    elementId,
    object
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {
        return;
    }


    const entries =
        Object.entries(
            object || {}
        );


    if (entries.length === 0) {

        container.innerHTML = `

            <div class="metric-item">

                <span>
                    No data
                </span>

            </div>

        `;

        return;

    }


    entries.sort(
        (a, b) =>
            b[1] - a[1]
    );


    container.innerHTML =
        entries
        .map(item => {

            return `

                <div class="metric-item">

                    <span>

                        ${escapeHTML(
                            item[0]
                        )}

                    </span>

                    <strong>

                        ${item[1]}

                    </strong>

                </div>

            `;

        })
        .join("");

}


// ==========================================
// ADMIN COMPLAINTS
// ==========================================

function renderAdminComplaints() {

    const container =
        document.getElementById(
            "adminComplaints"
        );


    if (!container) {
        return;
    }


    const filterElement =
        document.getElementById(
            "adminStatusFilter"
        );


    const filter =
        filterElement
            ? filterElement.value
            : "ALL";


    let data =
        complaints.filter(
            complaint => {

                return (

                    filter === "ALL"

                    ||

                    complaint.status === filter

                );

            }
        );


    // ======================================
    // PRIORITY SORT
    // ======================================

    const priorityOrder = {

        "CRITICAL": 1,

        "HIGH": 2,

        "MEDIUM": 3,

        "LOW": 4

    };


    data.sort(
        (a, b) => {

            return (

                (priorityOrder[a.priority] || 5)

                -

                (priorityOrder[b.priority] || 5)

            );

        }
    );


    if (data.length === 0) {

        container.innerHTML = `

            <p class="track-meta">

                No complaints found.

            </p>

        `;

        return;

    }


    container.innerHTML =
        data
        .map(
            complaint =>
                adminComplaintCard(
                    complaint
                )
        )
        .join("");

}


// ==========================================
// ADMIN COMPLAINT CARD
// ==========================================

function adminComplaintCard(
    complaint
) {

    return `

        <div class="admin-row">


            <div class="admin-row-main">

                <div>

                    <h3>

                        ${escapeHTML(
                            complaint.title ||
                            "Untitled Complaint"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            complaint.id ||
                            ""
                        )}

                        ·

                        ${escapeHTML(
                            complaint.category ||
                            "Unknown"
                        )}

                        ·

                        ${escapeHTML(
                            complaint.department ||
                            "Unknown"
                        )}

                        <br>

                        ${escapeHTML(
                            complaint.location ||
                            "No location"
                        )}

                    </p>

                </div>


                <div class="badges">

                    <span
                        class="priority ${String(
                            complaint.priority ||
                            "LOW"
                        ).toLowerCase()}"
                    >

                        ${escapeHTML(
                            complaint.priority ||
                            "LOW"
                        )}

                    </span>

                </div>

            </div>


            <div class="admin-actions">


                <select
                    id="status-${escapeHTML(
                        complaint.id
                    )}"
                >

                    ${statusOption(
                        "SUBMITTED",
                        complaint.status
                    )}

                    ${statusOption(
                        "VERIFIED",
                        complaint.status
                    )}

                    ${statusOption(
                        "IN_PROGRESS",
                        complaint.status
                    )}

                    ${statusOption(
                        "RESOLVED",
                        complaint.status
                    )}

                    ${statusOption(
                        "CLOSED",
                        complaint.status
                    )}

                </select>


                <button
                    class="primary-btn"
                    onclick="updateComplaintStatus('${escapeHTML(
                        complaint.id
                    )}')"
                >

                    Update

                </button>


                <button
                    class="ghost-btn"
                    onclick="trackFromAdmin('${escapeHTML(
                        complaint.id
                    )}')"
                >

                    View

                </button>


            </div>

        </div>

    `;

}


// ==========================================
// STATUS OPTION
// ==========================================

function statusOption(
    value,
    current
) {

    return `

        <option
            value="${value}"
            ${
                value === current
                    ? "selected"
                    : ""
            }
        >

            ${formatStatus(value)}

        </option>

    `;

}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateComplaintStatus(
    complaintId
) {

    const select =
        document.getElementById(
            `status-${complaintId}`
        );


    if (!select) {

        showToast(
            "Status selector not found"
        );

        return;

    }


    const status =
        select.value;


    const note =
        prompt(
            "Add status update note:",
            `Status changed to ${formatStatus(
                status
            )}`
        );


    if (note === null) {

        return;

    }


    try {

        await apiRequest(
            `/complaints/${encodeURIComponent(
                complaintId
            )}/status`,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        status,

                        note

                    })

            }
        );


        showToast(
            "Status updated successfully"
        );


        await loadComplaints();

        await loadAdminAnalytics();

        renderAdminComplaints();

    }
    catch (error) {

        console.error(
            "Status update error:",
            error
        );

    }

}


// ==========================================
// TRACK FROM ADMIN
// ==========================================

function trackFromAdmin(
    complaintId
) {

    openPage("track");


    const trackInput =
        document.getElementById(
            "trackId"
        );


    if (trackInput) {

        trackInput.value =
            complaintId;

    }


    trackComplaint();

}


// ==========================================
// ADMIN FILTER
// ==========================================

const adminStatusFilter =
    document.getElementById(
        "adminStatusFilter"
    );


if (adminStatusFilter) {

    adminStatusFilter.addEventListener(
        "change",
        renderAdminComplaints
    );

}


// ==========================================
// UTILITY - FORMAT STATUS
// ==========================================

function formatStatus(status) {

    return String(
        status || ""
    )
    .replaceAll(
        "_",
        " "
    );

}


// ==========================================
// UTILITY - FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {

        return "";

    }


    try {

        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {

                dateStyle: "medium",

                timeStyle: "short"

            }
        );

    }
    catch (error) {

        return "";

    }

}


// ==========================================
// UTILITY - ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    return String(
        text || ""
    ).replace(
        /[&<>"']/g,
        function(char) {

            return {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[char];

        }
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

checkAdminPage();

loadComplaints();