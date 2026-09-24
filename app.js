// ==========================================
// SMART GRIEVANCE - FRONTEND
// ==========================================


// ================= API =================

const API_URL = "http://127.0.0.1:8000";


// ================= DATA =================

// Database se data load hone tak empty array
let complaints = [];


// Temporary complaint after AI analysis
window.tempComplaint = null;


// ================= PAGE NAVIGATION =================

const navButtons =
    document.querySelectorAll(".nav-btn");


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const pageName =
            button.dataset.page;

        openPage(pageName);

    });

});


// Also allow buttons inside cards to open pages

document.querySelectorAll("[data-page]").forEach(button => {

    if (!button.classList.contains("nav-btn")) {

        button.addEventListener("click", () => {

            openPage(button.dataset.page);

        });

    }

});


function openPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page =
        document.getElementById(pageName);


    if (page) {

        page.classList.add("active");

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove("active");


            if (
                button.dataset.page === pageName
            ) {

                button.classList.add("active");

            }

        });


    if (pageName === "complaints") {

        renderComplaints();

    }


    if (pageName === "admin") {

        renderAdmin();

    }

}


// ================= FILE NAME =================

const photoInput =
    document.getElementById("photo");


const fileText =
    document.getElementById("fileText");


if (photoInput) {

    photoInput.addEventListener(
        "change",
        () => {

            if (
                photoInput.files.length > 0
            ) {

                fileText.textContent =
                    photoInput.files[0].name;

            }

            else {

                fileText.textContent =
                    "+ Add evidence photo";

            }

        }
    );

}


// ================= LOAD COMPLAINTS =================

async function loadComplaints() {

    try {

        const response =
            await fetch(
                `${API_URL}/complaints`
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Could not load complaints"
            );

        }


        // Backend data ko frontend format mein store karo

        complaints =
            data.complaints.map(complaint => {

                return {

                    id:
                        complaint.id,

                    title:
                        complaint.title,

                    description:
                        complaint.description,

                    location:
                        complaint.location,

                    affected:
                        complaint.affected,

                    category:
                        complaint.category,

                    department:
                        complaint.department,

                    priority:
                        complaint.priority,

                    confidence:
                        complaint.confidence,

                    status:
                        complaint.status

                };

            });


        // Dashboard update

        updateTotalReports();


        renderComplaints();

        renderAdmin();


        console.log(
            "Complaints loaded from database:",
            complaints
        );

    }

    catch (error) {

        console.error(
            "Load Complaints Error:",
            error
        );


        showToast(
            "Could not load complaints from backend"
        );

    }

}


// ================= TOTAL REPORTS =================

function updateTotalReports() {

    const totalReports =
        document.getElementById(
            "totalReports"
        );


    if (totalReports) {

        totalReports.textContent =
            complaints.length;

    }

}


// ================= COMPLAINT FORM =================

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
                    .trim()
                || "Location not provided";


            const affected =
                Number(
                    document
                        .getElementById("affected")
                        .value
                ) || 1;


            // ================= VALIDATION =================

            if (!title) {

                showToast(
                    "Please enter complaint title"
                );

                return;

            }


            if (!description) {

                showToast(
                    "Please enter complaint description"
                );

                return;

            }


            try {

                showToast(
                    "AI is analyzing complaint..."
                );


                // ================= FASTAPI AI =================

                const response =
                    await fetch(
                        `${API_URL}/complaints/analyze`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                title:
                                    title,

                                description:
                                    description,

                                location:
                                    location,

                                affected:
                                    affected

                            })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Server error: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (!data.success) {

                    throw new Error(
                        "AI analysis failed"
                    );

                }


                const result =
                    data.analysis;


                // ================= SHOW RESULT =================

                document
                    .getElementById(
                        "resultCategory"
                    )
                    .textContent =
                    result.category;


                document
                    .getElementById(
                        "resultDepartment"
                    )
                    .textContent =
                    result.department;


                document
                    .getElementById(
                        "resultPriority"
                    )
                    .textContent =
                    result.priority;


                document
                    .getElementById(
                        "complaintId"
                    )
                    .textContent =
                    "Complaint ID: Will be generated after submission";


                document
                    .getElementById(
                        "aiResult"
                    )
                    .classList
                    .remove("hidden");


                // ================= TEMP DATA =================

                window.tempComplaint = {

                    title:
                        title,

                    description:
                        description,

                    location:
                        location,

                    affected:
                        affected,

                    category:
                        result.category,

                    department:
                        result.department,

                    priority:
                        result.priority,

                    confidence:
                        result.confidence,

                    status:
                        "SUBMITTED"

                };


                showToast(
                    "AI analysis completed"
                );

            }

            catch (error) {

                console.error(
                    "AI Analysis Error:",
                    error
                );


                showToast(
                    "Backend connection failed"
                );

            }

        }
    );


// ================= FINAL SUBMIT =================

document
    .getElementById("finalSubmit")
    .addEventListener(
        "click",
        async () => {


            // Check analysis

            if (!window.tempComplaint) {

                showToast(
                    "Please analyze a complaint first"
                );

                return;

            }


            try {

                showToast(
                    "Submitting complaint..."
                );


                const complaint =
                    window.tempComplaint;


                // ================= SAVE TO DATABASE =================

                const response =
                    await fetch(
                        `${API_URL}/complaints`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                title:
                                    complaint.title,

                                description:
                                    complaint.description,

                                location:
                                    complaint.location,

                                affected:
                                    complaint.affected

                            })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Server error: ${response.status}`
                    );

                }


                const data =
                    await response.json();


                if (!data.success) {

                    throw new Error(
                        "Complaint submission failed"
                    );

                }


                const saved =
                    data.complaint;


                // ================= ADD DB RESULT TO FRONTEND =================

                const newComplaint = {

                    id:
                        saved.id,

                    title:
                        saved.title,

                    description:
                        complaint.description,

                    location:
                        complaint.location,

                    affected:
                        complaint.affected,

                    category:
                        saved.category,

                    department:
                        saved.department,

                    priority:
                        saved.priority,

                    confidence:
                        saved.confidence,

                    status:
                        saved.status

                };


                complaints.unshift(
                    newComplaint
                );


                // ================= UPDATE UI =================

                updateTotalReports();


                document
                    .getElementById(
                        "aiResult"
                    )
                    .classList
                    .add("hidden");


                document
                    .getElementById(
                        "complaintForm"
                    )
                    .reset();


                if (fileText) {

                    fileText.textContent =
                        "+ Add evidence photo";

                }


                window.tempComplaint =
                    null;


                renderComplaints();

                renderAdmin();


                showToast(
                    `Complaint ${saved.id} submitted successfully`
                );

            }

            catch (error) {

                console.error(
                    "Submit Error:",
                    error
                );


                showToast(
                    "Could not submit complaint"
                );

            }

        }
    );


// ================= CITIZEN COMPLAINTS =================

function renderComplaints() {

    const container =
        document.getElementById(
            "complaintList"
        );


    if (!container) {

        return;

    }


    if (complaints.length === 0) {

        container.innerHTML =

            `<div class="card">

                No complaints found.

            </div>`;

        return;

    }


    container.innerHTML =

        complaints.map(
            complaint => {

                return `

                    <div class="complaint-item">

                        <div class="complaint-left">

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
                                )}

                            </div>

                        </div>


                        <div>

                            <span
                                class="priority ${complaint.priority.toLowerCase()}"
                            >

                                ${escapeHTML(
                                    complaint.priority
                                )}

                            </span>


                            <span class="status">

                                ${formatStatus(
                                    complaint.status
                                )}

                            </span>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ================= ADMIN =================

function renderAdmin() {

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


    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>

                complaint.status ===
                    "SUBMITTED"

                ||

                complaint.status ===
                    "VERIFIED"

        ).length;


    const progress =
        complaints.filter(
            complaint =>

                complaint.status ===
                    "IN_PROGRESS"

        ).length;


    const resolved =
        complaints.filter(
            complaint =>

                complaint.status ===
                    "RESOLVED"

                ||

                complaint.status ===
                    "CLOSED"

        ).length;


    if (adminTotal) {

        adminTotal.textContent =
            total;

    }


    if (adminPending) {

        adminPending.textContent =
            pending;

    }


    if (adminProgress) {

        adminProgress.textContent =
            progress;

    }


    if (adminResolved) {

        adminResolved.textContent =
            resolved;

    }


    renderAdminComplaints();

}


// ================= ADMIN LIST =================

function renderAdminComplaints() {

    const container =
        document.getElementById(
            "adminComplaints"
        );


    if (!container) {

        return;

    }


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const filter =
        statusFilter
            ? statusFilter.value
            : "ALL";


    let data =
        complaints;


    if (filter !== "ALL") {

        data =
            complaints.filter(
                complaint =>
                    complaint.status === filter
            );

    }


    if (data.length === 0) {

        container.innerHTML =

            `<p style="
                font-size:12px;
                color:#858d9b;
                padding:15px 0;
            ">

                No complaints found.

            </p>`;

        return;

    }


    container.innerHTML =

        data.map(
            complaint => {

                return `

                    <div class="admin-row">

                        <div>

                            <h4>

                                ${escapeHTML(
                                    complaint.title
                                )}

                            </h4>


                            <p>

                                ${escapeHTML(
                                    complaint.id
                                )}

                                ·

                                ${escapeHTML(
                                    complaint.department
                                )}

                                ·

                                ${escapeHTML(
                                    complaint.location
                                )}

                            </p>

                        </div>


                        <div>

                            <span
                                class="priority ${complaint.priority.toLowerCase()}"
                            >

                                ${escapeHTML(
                                    complaint.priority
                                )}

                            </span>


                            <span class="status">

                                ${formatStatus(
                                    complaint.status
                                )}

                            </span>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ================= FILTER =================

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderAdminComplaints
    );

}


// ================= UTILITY =================

function formatStatus(status) {

    if (!status) {

        return "";

    }


    return status
        .replaceAll("_", " ");

}


function escapeHTML(text) {

    return String(text).replace(
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


// ================= TOAST =================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2200
    );

}


// ================= INITIAL LOAD =================


updateTotalReports();

renderComplaints();

renderAdmin();

loadComplaints();