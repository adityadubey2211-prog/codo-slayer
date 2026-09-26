// ==========================================
// CODO SLAYER - FRONTEND
// ==========================================

const API_URL = "http://127.0.0.1:8000";

let complaints = [];



// ==========================================
// PAGE NAVIGATION
// ==========================================

document.querySelectorAll("[data-page]").forEach(button => {

    button.addEventListener("click", () => {

        openPage(
            button.dataset.page
        );

    });

});


function openPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page = document.getElementById(
        pageName
    );


    if (page) {

        page.classList.add("active");

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.page
                === pageName
            ) {

                button.classList.add("active");

            }

        });


    if (pageName === "complaints") {

        renderComplaints();

    }


    if (pageName === "admin") {

        checkAdminPage();

    }

}



// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById("toast");


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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail
                || "Request failed"
            );

        }


        return data;

    }
    catch (error) {

        showToast(
            error.message
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
            data.complaints;


        updateHome();

        renderComplaints();

        renderRecentComplaints();

        loadAdminAnalytics();

        renderAdminComplaints();

    }
    catch (error) {

        console.error(error);

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
            c =>
                c.status === "SUBMITTED"
                ||
                c.status === "VERIFIED"
        ).length;


    const progress =
        complaints.filter(
            c =>
                c.status === "IN_PROGRESS"
        ).length;


    const resolved =
        complaints.filter(
            c =>
                c.status === "RESOLVED"
                ||
                c.status === "CLOSED"
        ).length;


    document.getElementById(
        "totalReports"
    ).textContent = total;


    document.getElementById(
        "homePending"
    ).textContent = pending;


    document.getElementById(
        "homeProgress"
    ).textContent = progress;


    document.getElementById(
        "homeResolved"
    ).textContent = resolved;


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


    const priorities = [
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW"
    ];


    container.innerHTML =
        priorities.map(priority => {

            const count =
                complaints.filter(
                    c =>
                        c.priority
                        === priority
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

        }).join("");

}



// ==========================================
// CATEGORY OVERVIEW
// ==========================================

function renderCategoryOverview() {

    const container =
        document.getElementById(
            "categoryOverview"
        );


    const counts = {};


    complaints.forEach(c => {

        if (!counts[c.category]) {

            counts[c.category] = 0;

        }

        counts[c.category]++;

    });


    const entries =
        Object.entries(counts);


    if (entries.length === 0) {

        container.innerHTML =
            `<div class="metric-item">
                <span>No data</span>
            </div>`;

        return;

    }


    container.innerHTML =
        entries
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
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

        }).join("");

}



// ==========================================
// RECENT COMPLAINTS
// ==========================================

function renderRecentComplaints() {

    const container =
        document.getElementById(
            "recentComplaints"
        );


    const recent =
        complaints.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            `<div class="complaint-item">
                No complaints yet.
            </div>`;

        return;

    }


    container.innerHTML =
        recent.map(
            complaint =>
                complaintCard(
                    complaint
                )
        ).join("");

}



// ==========================================
// COMPLAINT CARD
// ==========================================

function complaintCard(
    complaint
) {

    return `

        <div class="complaint-item">

            <div>

                <h3>
                    ${escapeHTML(
                        complaint.title
                    )}
                </h3>

                <div class="complaint-meta">

                    ${escapeHTML(
                        complaint.id
                    )}

                    ·

                    ${escapeHTML(
                        complaint.category
                    )}

                    <br>

                    ${escapeHTML(
                        complaint.department
                    )}

                    ·

                    ${escapeHTML(
                        complaint.location
                        || "Location not provided"
                    )}

                </div>

            </div>


            <div class="badges">

                <span class="priority ${String(
                    complaint.priority
                ).toLowerCase()}">

                    ${escapeHTML(
                        complaint.priority
                    )}

                </span>


                <span class="status-badge">

                    ${formatStatus(
                        complaint.status
                    )}

                </span>

            </div>

        </div>

    `;

}



// ==========================================
// REPORT COMPLAINT
// ==========================================

document
    .getElementById("complaintForm")
    .addEventListener(
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
                );


            if (!title || !description) {

                showToast(
                    "Please fill all required fields"
                );

                return;

            }


            try {

                const analysis =
                    await apiRequest(
                        "/complaints/analyze",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                title,
                                description,
                                affected
                            })
                        }
                    );


                showToast(
                    "Complaint analyzed successfully"
                );


                showAnalysisResult(
                    analysis
                );


            }
            catch (error) {

                console.error(error);

            }

        }
    );



// ==========================================
// SHOW AI ANALYSIS RESULT
// ==========================================

function showAnalysisResult(
    analysis
) {

    const result =
        document.getElementById(
            "aiResult"
        );


    const category =
        document.getElementById(
            "resultCategory"
        );


    const department =
        document.getElementById(
            "resultDepartment"
        );


    const priority =
        document.getElementById(
            "resultPriority"
        );


    const confidence =
        document.getElementById(
            "resultConfidence"
        );


    if (category) {

        category.textContent =
            analysis.category;

    }


    if (department) {

        department.textContent =
            analysis.department;

    }


    if (priority) {

        priority.textContent =
            analysis.priority;

    }


    if (confidence) {

        confidence.textContent =
            analysis.confidence + "%";

    }


    if (result) {

        result.classList.remove(
            "hidden"
        );

    }


    window.tempComplaint = {

        title:
            document
                .getElementById("title")
                .value
                .trim(),

        description:
            document
                .getElementById("description")
                .value
                .trim(),

        location:
            document
                .getElementById("location")
                .value
                .trim(),

        affected:
            Number(
                document
                    .getElementById("affected")
                    .value
            ),

        category:
            analysis.category,

        department:
            analysis.department,

        priority:
            analysis.priority,

        confidence:
            analysis.confidence

    };

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
        async () => {

            if (!window.tempComplaint) {

                showToast(
                    "Please analyze complaint first"
                );

                return;

            }


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
                                    window.tempComplaint
                                )

                        }
                    );


                const complaint =
                    data.complaint;


                document.getElementById(
                    "complaintId"
                ).textContent =
                    complaint.id;


                showToast(
                    "Complaint submitted successfully"
                );


                await loadComplaints();


                openPage(
                    "track"
                );


                document.getElementById(
                    "trackId"
                ).value =
                    complaint.id;


                trackComplaint();


            }
            catch (error) {

                console.error(error);

            }

        }
    );

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


    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase()
            .trim();


    const status =
        document
            .getElementById(
                "statusSearch"
            )
            .value;


    const priority =
        document
            .getElementById(
                "prioritySearch"
            )
            .value;


    let data =
        complaints.filter(
            complaint => {

                const matchesSearch =

                    complaint.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    complaint.id
                        .toLowerCase()
                        .includes(search)

                    ||

                    complaint.category
                        .toLowerCase()
                        .includes(search)

                    ||

                    (
                        complaint.location
                        || ""
                    )
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    status === "ALL"
                    ||
                    complaint.status
                    === status;


                const matchesPriority =
                    priority === "ALL"
                    ||
                    complaint.priority
                    === priority;


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

        container.innerHTML =
            `<div class="complaint-item">
                No complaints found.
            </div>`;

        return;

    }


    container.innerHTML =
        data.map(
            complaint =>
                complaintCard(
                    complaint
                )
        ).join("");

}



// ==========================================
// SEARCH LISTENERS
// ==========================================

document
    .getElementById(
        "searchInput"
    )
    .addEventListener(
        "input",
        renderComplaints
    );


document
    .getElementById(
        "statusSearch"
    )
    .addEventListener(
        "change",
        renderComplaints
    );


document
    .getElementById(
        "prioritySearch"
    )
    .addEventListener(
        "change",
        renderComplaints
    );



// ==========================================
// ADMIN PAGE
// LOGIN REMOVED
// ==========================================

function checkAdminPage() {

    const login =
        document.getElementById(
            "adminLogin"
        );


    const content =
        document.getElementById(
            "adminContent"
        );


    const authArea =
        document.getElementById(
            "adminAuthArea"
        );


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


        document.getElementById(
            "adminTotal"
        ).textContent =
            data.total;


        document.getElementById(
            "adminPending"
        ).textContent =

            data.status.SUBMITTED
            +
            data.status.VERIFIED;


        document.getElementById(
            "adminProgress"
        ).textContent =
            data.status.IN_PROGRESS;


        document.getElementById(
            "adminResolved"
        ).textContent =

            data.status.RESOLVED
            +
            data.status.CLOSED;


        document.getElementById(
            "resolutionRate"
        ).textContent =
            data.resolution_rate
            + "%";


        document.getElementById(
            "averageResolution"
        ).textContent =
            data.average_resolution_hours
            + " hrs";


        renderMetrics(
            "adminCategories",
            data.categories
        );


        renderMetrics(
            "adminDepartments",
            data.departments
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

        container.innerHTML =
            `<div class="metric-item">
                <span>No data</span>
            </div>`;

        return;

    }


    container.innerHTML =
        entries
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
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


    if (complaints.length === 0) {

        container.innerHTML =
            `<div class="complaint-item">
                No complaints yet.
            </div>`;

        return;

    }


    container.innerHTML =
        complaints.map(
            complaint => {

                return `

                    <div
                        class="admin-complaint"
                    >

                        <div
                            class="admin-complaint-main"
                        >

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        complaint.title
                                    )}
                                </h3>

                                <p
                                    class="complaint-meta"
                                >

                                    ${escapeHTML(
                                        complaint.id
                                    )}

                                    ·

                                    ${escapeHTML(
                                        complaint.category
                                    )}

                                    ·

                                    ${escapeHTML(
                                        complaint.department
                                    )}

                                </p>

                            </div>


                            <div
                                class="badges"
                            >

                                <span
                                    class="priority ${String(
                                        complaint.priority
                                    ).toLowerCase()}"
                                >

                                    ${escapeHTML(
                                        complaint.priority
                                    )}

                                </span>


                                <span
                                    class="status-badge"
                                >

                                    ${formatStatus(
                                        complaint.status
                                    )}

                                </span>

                            </div>

                        </div>


                        <div
                            class="admin-complaint-actions"
                        >

                            <select
                                onchange="updateComplaintStatus(
                                    '${complaint.id}',
                                    this.value
                                )"
                            >

                                <option
                                    value="SUBMITTED"
                                    ${
                                        complaint.status
                                        === "SUBMITTED"
                                        ? "selected"
                                        : ""
                                    }
                                >
                                    Submitted
                                </option>


                                <option
                                    value="VERIFIED"
                                    ${
                                        complaint.status
                                        === "VERIFIED"
                                        ? "selected"
                                        : ""
                                    }
                                >
                                    Verified
                                </option>


                                <option
                                    value="IN_PROGRESS"
                                    ${
                                        complaint.status
                                        === "IN_PROGRESS"
                                        ? "selected"
                                        : ""
                                    }
                                >
                                    In Progress
                                </option>


                                <option
                                    value="RESOLVED"
                                    ${
                                        complaint.status
                                        === "RESOLVED"
                                        ? "selected"
                                        : ""
                                    }
                                >
                                    Resolved
                                </option>


                                <option
                                    value="CLOSED"
                                    ${
                                        complaint.status
                                        === "CLOSED"
                                        ? "selected"
                                        : ""
                                    }
                                >
                                    Closed
                                </option>

                            </select>


                            <button
                                class="ghost-btn"
                                onclick="viewComplaint(
                                    '${complaint.id}'
                                )"
                            >
                                View
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}



// ==========================================
// UPDATE COMPLAINT STATUS
// ==========================================

async function updateComplaintStatus(
    complaintId,
    newStatus
) {

    const note =
        prompt(
            "Enter a note for this status update:"
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

                        status:
                            newStatus,

                        note:
                            note

                    })

            }
        );


        showToast(
            "Complaint status updated"
        );


        await loadComplaints();

        checkAdminPage();

    }
    catch (error) {

        console.error(error);

    }

}



// ==========================================
// VIEW COMPLAINT
// ==========================================

function viewComplaint(
    complaintId
) {

    openPage(
        "track"
    );


    document.getElementById(
        "trackId"
    ).value =
        complaintId;


    trackComplaint();

}



// ==========================================
// TRACK COMPLAINT
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


    const result =
        document.getElementById(
            "trackResult"
        );


    if (!input || !result) {

        return;

    }


    const complaintId =
        input.value
            .trim();


    if (!complaintId) {

        showToast(
            "Enter complaint ID"
        );

        return;

    }


    try {

        const data =
            await loadComplaintDetails(
                complaintId
            );


        if (!data) {

            result.innerHTML =
                `<div class="panel">
                    <h3>Complaint not found</h3>
                    <p>Please check the complaint ID.</p>
                </div>`;

            return;

        }


        const history =
            data.history || [];


        result.innerHTML = `

            <div class="panel">

                <div class="panel-heading">

                    <div>

                        <p class="eyebrow">
                            COMPLAINT DETAILS
                        </p>

                        <h2>
                            ${escapeHTML(
                                data.id
                            )}
                        </h2>

                    </div>


                    <span class="status-badge">
                        ${formatStatus(
                            data.status
                        )}
                    </span>

                </div>


                <div class="result-grid">

                    <div>

                        <span>
                            Title
                        </span>

                        <strong>
                            ${escapeHTML(
                                data.title
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Category
                        </span>

                        <strong>
                            ${escapeHTML(
                                data.category
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Department
                        </span>

                        <strong>
                            ${escapeHTML(
                                data.department
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Priority
                        </span>

                        <strong>
                            ${escapeHTML(
                                data.priority
                            )}
                        </strong>

                    </div>

                </div>


                <div class="track-description">

                    <h3>
                        Description
                    </h3>

                    <p>
                        ${escapeHTML(
                            data.description
                        )}
                    </p>

                </div>


                <div class="track-description">

                    <h3>
                        Location
                    </h3>

                    <p>
                        ${escapeHTML(
                            data.location
                            || "Location not provided"
                        )}
                    </p>

                </div>


                <div class="track-history">

                    <h3>
                        Complaint History
                    </h3>

                    ${
                        history.length === 0
                        ?
                        `
                            <p>
                                No history available.
                            </p>
                        `
                        :
                        history.map(
                            item => `
                                <div class="history-item">

                                    <div>

                                        <strong>
                                            ${formatStatus(
                                                item.status
                                            )}
                                        </strong>

                                        <p>
                                            ${escapeHTML(
                                                item.note
                                                || ""
                                            )}
                                        </p>

                                    </div>

                                    <span>
                                        ${formatDate(
                                            item.created_at
                                        )}
                                    </span>

                                </div>
                            `
                        ).join("")
                    }

                </div>

            </div>

        `;

    }
    catch (error) {

        console.error(
            error
        );

    }

}



// ==========================================
// STATUS FORMATTER
// ==========================================

function formatStatus(status) {

    if (!status) {

        return "Unknown";

    }


    return status
        .replaceAll(
            "_",
            " "
        )
        .toLowerCase()
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}



// ==========================================
// DATE FORMATTER
// ==========================================

function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString
        );


    if (isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null
        ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}



// ==========================================
// COMPLAINT DETAILS
// ==========================================

async function loadComplaintDetails(
    complaintId
) {

    try {

        const data =
            await apiRequest(
                `/complaints/${encodeURIComponent(
                    complaintId
                )}`
            );


        return data.complaint;

    }
    catch (error) {

        console.error(
            error
        );

        return null;

    }

}



// ==========================================
// ADMIN SEARCH
// ==========================================

const adminSearch =
    document.getElementById(
        "adminSearch"
    );


if (adminSearch) {

    adminSearch.addEventListener(
        "input",
        function() {

            const search =
                this.value
                    .toLowerCase()
                    .trim();


            const items =
                document.querySelectorAll(
                    ".admin-complaint"
                );


            items.forEach(item => {

                const text =
                    item.textContent
                        .toLowerCase();


                if (
                    text.includes(search)
                ) {

                    item.style.display =
                        "";

                }
                else {

                    item.style.display =
                        "none";

                }

            });

        }
    );

}



// ==========================================
// STATUS FILTER - ADMIN
// ==========================================

const adminStatusFilter =
    document.getElementById(
        "adminStatusFilter"
    );


if (adminStatusFilter) {

    adminStatusFilter.addEventListener(
        "change",
        function() {

            const selected =
                this.value;


            const items =
                document.querySelectorAll(
                    ".admin-complaint"
                );


            items.forEach(item => {

                if (
                    selected === "ALL"
                    ||
                    item.textContent
                        .includes(
                            formatStatus(
                                selected
                            )
                        )
                ) {

                    item.style.display =
                        "";

                }
                else {

                    item.style.display =
                        "none";

                }

            });

        }
    );

}



// ==========================================
// NAVIGATION BUTTONS
// ==========================================

const homeBtn =
    document.getElementById(
        "homeBtn"
    );


if (homeBtn) {

    homeBtn.addEventListener(
        "click",
        () => {

            openPage(
                "home"
            );

        }
    );

}


const reportBtn =
    document.getElementById(
        "reportBtn"
    );


if (reportBtn) {

    reportBtn.addEventListener(
        "click",
        () => {

            openPage(
                "report"
            );

        }
    );

}


const trackNavBtn =
    document.getElementById(
        "trackNavBtn"
    );


if (trackNavBtn) {

    trackNavBtn.addEventListener(
        "click",
        () => {

            openPage(
                "track"
            );

        }
    );

}


const complaintsNavBtn =
    document.getElementById(
        "complaintsNavBtn"
    );


if (complaintsNavBtn) {

    complaintsNavBtn.addEventListener(
        "click",
        () => {

            openPage(
                "complaints"
            );

        }
    );

}


const adminNavBtn =
    document.getElementById(
        "adminNavBtn"
    );


if (adminNavBtn) {

    adminNavBtn.addEventListener(
        "click",
        () => {

            openPage(
                "admin"
            );

        }
    );

}



// ==========================================
// BACK TO HOME BUTTONS
// ==========================================

document
    .querySelectorAll(
        "[data-home]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPage(
                    "home"
                );

            }
        );

    });



// ==========================================
// REPORT RESET
// ==========================================

const resetComplaintBtn =
    document.getElementById(
        "resetComplaint"
    );


if (resetComplaintBtn) {

    resetComplaintBtn.addEventListener(
        "click",
        () => {

            const form =
                document.getElementById(
                    "complaintForm"
                );


            if (form) {

                form.reset();

            }


            const result =
                document.getElementById(
                    "aiResult"
                );


            if (result) {

                result.classList.add(
                    "hidden"
                );

            }


            window.tempComplaint =
                null;

        }
    );

}



// ==========================================
// LOCATION BUTTON
// ==========================================

const locationBtn =
    document.getElementById(
        "useLocation"
    );


if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        () => {

            if (
                !navigator.geolocation
            ) {

                showToast(
                    "Location is not supported"
                );

                return;

            }


            locationBtn.disabled =
                true;


            locationBtn.textContent =
                "Getting location...";


            navigator
                .geolocation
                .getCurrentPosition(

                    position => {

                        const latitude =
                            position.coords.latitude;


                        const longitude =
                            position.coords.longitude;


                        const locationInput =
                            document.getElementById(
                                "location"
                            );


                        if (
                            locationInput
                        ) {

                            locationInput.value =
                                `${latitude}, ${longitude}`;

                        }


                        locationBtn.disabled =
                            false;


                        locationBtn.textContent =
                            "Use My Location";


                        showToast(
                            "Location added"
                        );

                    },


                    error => {

                        console.error(
                            error
                        );


                        locationBtn.disabled =
                            false;


                        locationBtn.textContent =
                            "Use My Location";


                        showToast(
                            "Unable to get location"
                        );

                    }

                );

        }
    );

}



// ==========================================
// SMOOTH SCROLL
// ==========================================

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                const target =
                    document.querySelector(
                        this.getAttribute(
                            "href"
                        )
                    );


                if (target) {

                    event.preventDefault();


                    target.scrollIntoView(
                        {
                            behavior:
                                "smooth"
                        }
                    );

                }

            }
        );

    });



// ==========================================
// ENTER KEY - TRACKING
// ==========================================

const trackInput =
    document.getElementById(
        "trackId"
    );


if (trackInput) {

    trackInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                trackComplaint();

            }

        }
    );

}



// ==========================================
// THEME TOGGLE
// ==========================================

const themeToggle =
    document.getElementById(
        "themeToggle"
    );


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-theme"
            );


            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );


            localStorage.setItem(
                "codo_theme",
                isLight
                    ? "light"
                    : "dark"
            );

        }
    );

}



// ==========================================
// LOAD SAVED THEME
// ==========================================

const savedTheme =
    localStorage.getItem(
        "codo_theme"
    );


if (
    savedTheme === "light"
) {

    document.body.classList.add(
        "light-theme"
    );

}



// ==========================================
// INITIAL PAGE
// ==========================================

openPage(
    "home"
);



// ==========================================
// INITIAL DATA LOAD
// ==========================================

loadComplaints();



// ==========================================
// INITIAL ADMIN DASHBOARD
// LOGIN NOT REQUIRED
// ==========================================

checkAdminPage();



// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log(
    "Codo Slayer frontend loaded successfully."
);