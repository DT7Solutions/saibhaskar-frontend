// Doctor credentials with additional profile information
let currentDoctor = null;
let currentDoctorEmail = null;
let todayAppointmentsData = [];
let upcomingAppointmentsData = [];
let todayPage = 1;
let upcomingPage = 1;
const itemsPerPage = 10;
// let isEditMode = false;
// let originalProfileData = {};

// Doctor-Service mapping based on your hospital's medical staff
const branchServiceDoctorMapping = {
    "Guntur": {
        "Orthopedics": [
            { value: "3", text: "Dr. Busireddy Narendra Reddy", qualification: "M.S.(Ortho).,D.NB(Ortho).,M.Ch(Ortho) - Chief Joint Replacement Surgeon" },
            { value: "5", text: "Dr. Srinavasa Rao Konakandla", qualification: "M.B.B.S.,D.NB(Ortho).,F.I.J.R. - Orthopaedic & Joint Replacement Surgeon" }
        ],
        "Obstetrics & Gynaecology": [
            { value: "4", text: "Dr. B. Deepthi Reddy", qualification: "M.S(OBG) - Consultant Obstetrician & Gynaecologist" }
        ],
        "Pulmonology": [
            { value: "6", text: "Dr. Nageswara Rao Gopathi", qualification: "M.D.,FCCP.,FAPSR. - Pulmonologist & Sleep Specialist" }
        ],
        "General Medicine": [
            { value: "8", text: "Dr. Yogitha Chennupati", qualification: "MD General Medicine, Rheumatologist - Rheumatology Specialist" }
        ],
        "Anaesthesia": [
            { value: "7", text: "Dr. Nune Sankhya", qualification: "M.B.B.S., M.D.(Anaesthesia) - Anesthesiologist & Intensivist" }
        ],
        "Neuro Surgery": [],
        "Plastic Surgery": [],
        "Emergency & Casualty": [],
        "General Surgery": []
    },
    
    "Vijayawada": {
        "Orthopedics": [
            { value: "3", text: "Dr. Busireddy Narendra Reddy", qualification: "M.S.(Ortho).,D.NB(Ortho).,M.Ch(Ortho) - Chief Joint Replacement Surgeon" },
            { value: "9", text: "Dr. Akarsh Kotagiri", qualification: "M.S (Ortho)., F.I.J.R - Orthopaedic & Joint Replacement Surgeon" }
        ],
        "Rheumatology": [
            { value: "8", text: "Dr. Yogitha Chennupati", qualification: "MD General Medicine, Rheumatologist - Rheumatology Specialist" }
        ]
    }
};

// Update Services when Branch changes
function updateServiceDropdown(branchSelect) {
    const serviceSelect = document.querySelector('select[name="service"]');
    const doctorSelect = document.querySelector('select[name="doctor"]');

    serviceSelect.innerHTML = '<option value="" hidden disabled selected>Select Services</option>';
    doctorSelect.innerHTML = '<option value="" hidden disabled selected>Choose Doctor</option>';

    if (!branchSelect.value) return;

    const services = Object.keys(branchServiceDoctorMapping[branchSelect.value]);
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service;
        option.textContent = service;
        serviceSelect.appendChild(option);
    });

    serviceSelect.disabled = false;
    doctorSelect.disabled = true;
}

// Update Doctors when Service changes
function updateDoctorDropdown() {
    const branchSelect = document.querySelector('select[name="branch"]');
    const serviceSelect = document.querySelector('select[name="service"]');
    const doctorSelect = document.querySelector('select[name="doctor"]');

    if (!branchSelect.value || !serviceSelect.value) return;

    const doctors = branchServiceDoctorMapping[branchSelect.value][serviceSelect.value] || [];
    doctorSelect.innerHTML = '<option value="" hidden disabled selected>Choose Doctor</option>';

    if (doctors.length === 0) {
        doctorSelect.innerHTML = '<option value="" hidden disabled selected>No doctors available</option>';
        doctorSelect.disabled = true;
        return;
    }

    doctorSelect.disabled = false;
    doctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.value;
        option.textContent = doc.text;
        option.title = doc.qualification;
        doctorSelect.appendChild(option);
    });
}

// Initialize all dropdown events
function initializeDropdowns() {
    const branchSelect = document.querySelector('select[name="branch"]');
    const serviceSelect = document.querySelector('select[name="service"]');

    if (!branchSelect || !serviceSelect) {
        console.error("Branch or Service select not found");
        return;
    }

    branchSelect.addEventListener('change', function () {
        updateServiceDropdown(this);
    });

    serviceSelect.addEventListener('change', updateDoctorDropdown);
}

// Bootstrap Modal Initialization
function initializeOnModalShow() {
    const appointmentModal = document.getElementById('appointmentModal');
    if (appointmentModal) {
        appointmentModal.addEventListener('shown.bs.modal', initializeDropdowns);
    }
}

// Initialize cleanly
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    initializeOnModalShow();
});
window.addEventListener('load', initializeDropdowns);

// Password toggle functionality
function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(fieldId + '-eye');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}


function login_functionality() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginError = document.getElementById('loginError');

    // Clear previous errors
    loginError.classList.add('d-none');
    loginError.textContent = "";

    if (!email || !password) {
        loginError.textContent = "Please enter both email and password.";
        loginError.classList.remove('d-none');
        return;
    }

    const payload = {
        email: email,
        password: password
    };

    // Use the config instead of hardcoded URL
    apiFetch(API_CONFIG.ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Login Response:", data);

        if (data.status_code === 200) {
            localStorage.setItem("user", JSON.stringify(data.data));
            
            // Remove the leading slash
            window.location.href = "/admin.html";
        } else {
            alert(data.message);
            loginError.textContent = data.message || "Invalid credentials.";
            loginError.classList.remove('d-none');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        loginError.textContent = "Something went wrong. Please try again.";
        loginError.classList.remove('d-none');
    });
}

function logout() {
    apiFetch(API_CONFIG.ENDPOINTS.LOGOUT, {
        method: "POST"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Logout Response:", data);

        // Clear frontend storage
        localStorage.removeItem("user");
        window.location.href = "/login.html";
    })
    .catch(error => {
        console.error("Logout Error:", error);

        // Even if API fails, clear local storage
        localStorage.removeItem("user");
        window.location.href = "/login.html";
    });
}

function loadBlockedDates() {
    const user = JSON.parse(localStorage.getItem("user"));
    const doctor_id = `${user.id}`;
    apiFetch(API_CONFIG.ENDPOINTS.BLOCKED_DATES(doctor_id))
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('blockedDatesList');
            const dateInput = document.getElementById('blockDate');
            container.innerHTML = '';
        
            if (data.length === 0) {
                container.innerHTML = '<span class="text-muted">No blocked dates</span>';
            } else {
                data.forEach(d => {
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-secondary p-2 d-flex align-items-center';
                    badge.innerHTML = `
                        ${d.date}
                        <button class="btn btn-sm btn-link text-white ms-2 p-0" onclick="unblockDate('${d.date}')">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    container.appendChild(badge);
                    document.getElementById('blocked-Count').textContent = data.length;
                    localStorage.setItem("doc_b_d", JSON.stringify(data));
                    

                });
                

            }

            // Prevent selecting already blocked date
            if (dateInput) {
                dateInput.oninput = function () {
                    const selected = this.value;
                    if (data.some(item => item.date === selected)) {
                        alert("This date is already blocked");
                        this.value = '';
                    }
                };
            }
        })
        .catch(err => console.error(err));
}

function blockDate() {
    const dateInput = document.getElementById('blockDate').value;
    if (!dateInput) {
        alert("Please select a date");
        return;
    }
    const user = JSON.parse(localStorage.getItem("user"));

    const doctor_id = `${user.id}`;

    apiFetch(API_CONFIG.ENDPOINTS.BLOCK_DATE, {
        method: "POST",
        body: JSON.stringify({ doctor: parseInt(doctor_id),  date: dateInput })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            loadBlockedDates();
            document.getElementById('blockDate').value = '';
        }
    })
    .catch(err => console.error(err));
}

function unblockDate(date) {
    const user = JSON.parse(localStorage.getItem("user"));
    const doctor_id = `${user.id}`;
    apiFetch(API_CONFIG.ENDPOINTS.UNBLOCK_DATE(doctor_id, date), { method: "DELETE" })
        .then(res => res.json())
        .then(() => loadBlockedDates())
        .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", loadBlockedDates);

function bookAppointment(event) {

    const form = document.getElementById("appointmentForm2");
    const formData = new FormData(form);
    let patient_phonenumber = formData.get("user_phone");
    let patient_name = formData.get("user_name");
    let patient_email = formData.get("user_email");

    // Validate patient name
    if (!patient_name || patient_name.trim() === "") {
        alert("Please enter the patient's name");
        return;
    }

    // Validate patient phone number
    if (!patient_phonenumber || patient_phonenumber.trim() === "") {
        alert("Please enter the patient's phone number");
        return;
    }

    // Validate patient email
    if (!patient_email || patient_email.trim() === "") {
        alert("Please enter the patient's email address");
        return;
    }
    
    const payload = {
        name: formData.get("user_name"),
        email: formData.get("user_email"),
        phone: formData.get("user_phone"),
        service: formData.get("service"),
        branch: formData.get("branch"),
        doctor: formData.get("doctor"),
        appointment_date: formData.get("appointment_date")
    };
    console.log("Booking Payload:", payload);

    apiFetch(API_CONFIG.ENDPOINTS.BOOK_APPOINTMENT, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to book appointment");
        }
        return response.json();
    })
    .then(data => {
        console.log("Book Appointment Response:", data);
        alert("Appointment booked successfully!");
        form.reset();
    })
    .catch(error => {
        console.error("Book Appointment Error:", error);
        alert("Failed to book appointment. Please try again.");
    });
}


let selectedAppointmentId = null;

// ----------------------
// Load Appointments
// ----------------------
function loadAppointments() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        console.error("No doctor info found in localStorage.");
        return;
    }

    const endpoint = API_CONFIG.ENDPOINTS.GET_APPOINTMENTS(user.id);

    apiFetch(endpoint, { method: "GET" })
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch appointments: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // ✅ STORE DATA GLOBALLY
            todayAppointmentsData = data.today || [];
            upcomingAppointmentsData = data.upcoming || [];
            
            // Update counts
            document.getElementById("todayCount").textContent = todayAppointmentsData.length;
            document.getElementById("upcomingCount").textContent = upcomingAppointmentsData.length;
            
            // ✅ RENDER WITH PAGE 1
            renderAppointments("todayAppointments", todayAppointmentsData, 1, itemsPerPage);
            renderAppointments("upcomingAppointments", upcomingAppointmentsData, 1, itemsPerPage);
            
            // Initialize pagination
            if (todayAppointmentsData.length > itemsPerPage) {
                createPagination('todayPagination', todayAppointmentsData.length, itemsPerPage, 1);
            }
            if (upcomingAppointmentsData.length > itemsPerPage) {
                createPagination('upcomingPagination', upcomingAppointmentsData.length, itemsPerPage, 1);
            }
        })
        .catch(error => console.error("Error loading appointments:", error));
}

// ----------------------
// Render Table Rows
// ----------------------

function renderAppointments(tableId, appointments, page = 1, itemsPerPage = 10) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No appointments</td></tr>`;
        return;
    }

    // Calculate pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAppointments = appointments.slice(startIndex, endIndex);

    // Render only current page appointments
    paginatedAppointments.forEach(appt => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appt.user_name || 'N/A'}</td>
            <td>${appt.user_email || 'N/A'}</td>
            <td>${appt.user_phone || 'N/A'}</td>
            <td>${appt.branch || 'N/A'}</td>
            <td>${appt.appointment_date || 'N/A'}</td>
            <td>${appt.status || 'N/A'}</td>
            <td onclick="statusaction(${appt.id})"><a href="#">Edit</a></td>
        `;
        tbody.appendChild(row);
    });
}

// ----------------------
// Change Page Function
// ----------------------
function changePage(containerId, newPage) {
    if (containerId === 'todayPagination') {
        todayPage = newPage;
        // ✅ USE STORED DATA
        renderAppointments("todayAppointments", todayAppointmentsData, todayPage, itemsPerPage);
        createPagination('todayPagination', todayAppointmentsData.length, itemsPerPage, todayPage);
    } else if (containerId === 'upcomingPagination') {
        upcomingPage = newPage;
        // ✅ USE STORED DATA
        renderAppointments("upcomingAppointments", upcomingAppointmentsData, upcomingPage, itemsPerPage);
        createPagination('upcomingPagination', upcomingAppointmentsData.length, itemsPerPage, upcomingPage);
    }
}
// ----------------------
// Modal Functions
// ----------------------
function statusaction(appointmentId) {
    selectedAppointmentId = appointmentId;

    const modal = document.getElementById("statusModal");
    const overlay = document.getElementById("modalOverlay");

    if (modal && overlay) {
        modal.style.display = "block";
        overlay.style.display = "block";
    }

    // Reset dropdown
    const dropdown = document.getElementById("statusSelect");
    if (dropdown) dropdown.value = ""; // or set current status
}

function closeModal() {
    document.getElementById("statusModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
    selectedAppointmentId = null;
}

// ----------------------
// Handle Status Update
// ----------------------
document.getElementById("statusForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const newStatus = document.getElementById("statusSelect").value;

    if (!selectedAppointmentId || !newStatus) {
        alert("Please select a valid status.");
        return;
    }

    const url = API_CONFIG.ENDPOINTS.STATUS_UPDATE(selectedAppointmentId, newStatus);

    apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to update status");
        }
        return response.json();
    })
    .then(data => {
        alert(`Appointment status updated to "${newStatus}"`);
        closeModal();
        loadAppointments(); // refresh the table only
    })
    .catch(error => {
        console.error("Error updating appointment:", error);
        alert(`Error: ${error.message}`);
    });
});

// ----------------------
// Initialize on Page Load
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
});


// Profile Management - Code
function loadProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) return;

    // Always fetch fresh data from API using config
    apiFetch(API_CONFIG.ENDPOINTS.USER_PROFILE(user.id))
        .then(res => res.json())
        .then(data => {
            // Update all fields
            document.getElementById('profileFirstName').value = data.fname || '';
            document.getElementById('profileFirstNameText').textContent = data.fname || '';
            document.getElementById('profileLastName').value = data.lname || '';
            document.getElementById('profileLastNameText').textContent = data.lname || '';
            document.getElementById('profileUsername').value = data.username || '';
            document.getElementById('profileUsernameText').textContent = data.username || '';
            document.getElementById('profileEmail').value = data.email || '';
            document.getElementById('profileEmailText').textContent = data.email || '';
            document.getElementById('profilePhone').value = data.phonenumber || '';
            document.getElementById('profilePhoneText').textContent = data.phonenumber || '';
            document.getElementById('profileDOB').value = data.date_of_birth || '';
            document.getElementById('profileDOBText').textContent = data.date_of_birth || '';
            document.getElementById('profilePincode').value = data.pincode || '';
            document.getElementById('profilePincodeText').textContent = data.pincode || '';
            document.getElementById('profileAddress').value = data.address || '';
            document.getElementById('profileAddressText').textContent = data.address || '';
            
            // Update header name
            document.getElementById('doctor-name').textContent = ` Dr. ${data.fname} ${data.lname}`;
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify({...user, ...data}));
        })
        .catch(err => alert('Failed to load profile'));
}

function toggleEditMode() {
    document.querySelectorAll('#profileCard input').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('#profileCard span:not(.info-label)').forEach(el => el.classList.add('hidden'));
    document.getElementById('editBtn').classList.add('hidden');
    document.getElementById('saveBtn').classList.remove('hidden');
    document.getElementById('cancelBtn').classList.remove('hidden');
}

function cancelEdit() {
    document.querySelectorAll('#profileCard input').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#profileCard span:not(.info-label)').forEach(el => el.classList.remove('hidden'));
    document.getElementById('editBtn').classList.remove('hidden');
    document.getElementById('saveBtn').classList.add('hidden');
    document.getElementById('cancelBtn').classList.add('hidden');
    loadProfile(); // Reload fresh data
}

function saveProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) return;

    const formData = {
        fname: document.getElementById('profileFirstName').value,
        lname: document.getElementById('profileLastName').value,
        username: document.getElementById('profileUsername').value,
        email: document.getElementById('profileEmail').value,
        phonenumber: document.getElementById('profilePhone').value,
        date_of_birth: document.getElementById('profileDOB').value,
        pincode: document.getElementById('profilePincode').value,
        address: document.getElementById('profileAddress').value
    };

    apiFetch(API_CONFIG.ENDPOINTS.USER_PROFILE(user.id), {
        method: 'PUT',
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        alert('Profile updated successfully!');
        cancelEdit();
    })
    .catch(err => alert('Failed to update profile'));
}

// Initialize profile loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('profileCard')) {
        loadProfile();
    }
});

// update password   
function updatePassword() {
    const form = document.getElementById('changePasswordForm');
    if (!form) return alert("Form not found");

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return alert("Please login again.");

    const data = {
        current_password: document.getElementById('currentPassword').value,
        new_password: document.getElementById('newPassword').value,
        confirm_password: document.getElementById('confirmPassword').value
    };

    if (!data.current_password || !data.new_password || !data.confirm_password)
        return alert("All fields are required.");

    if (data.new_password !== data.confirm_password)
        return alert("New passwords do not match.");
    doctorid= user.id
  
    apiFetch(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD(doctorid), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.text().then(text => text ? JSON.parse(text) : {}))
    .then(body => {
        if (body.message) {
            alert(body.message);
            form.reset();
            // Optional: log out user after password change
            localStorage.removeItem('user'); 
            // window.location.href = '/login/'; // redirect to login
            window.location.href = "/login.html";
        }
    })
    .catch(err => {
        console.error(err);
        alert("An error occurred. Please try again.");
    });
}



