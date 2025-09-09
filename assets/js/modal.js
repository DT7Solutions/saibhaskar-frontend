// Doctor credentials with additional profile information
let currentDoctor = null;
let currentDoctorEmail = null;
// let isEditMode = false;
// let originalProfileData = {};

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

// Initialize doctor session from localStorage
// function initializeDoctorSession() {
//     loadDoctorCredentials();
    
//     const loggedInDoctor = localStorage.getItem('loggedInDoctor');
//     const loggedInEmail = localStorage.getItem('loggedInEmail');
    
//     if (loggedInDoctor && loggedInEmail) {
//         currentDoctor = JSON.parse(loggedInDoctor);
//         currentDoctorEmail = loggedInEmail;
//         return true;
//     }
//     return false;
// }

// Check if already logged in
// window.onload = function() {
//     if (initializeDoctorSession()) {
//         showDashboard();
//     }
// };


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

    const payload = {
        name: formData.get("user_name"),
        email: formData.get("user_email"),
        phone: formData.get("user_phone"),
        service: formData.get("service"),
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

function loadAppointments() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        console.error("No doctor info found in localStorage.");
        return;
    }
    
    console.log("Loading appointments for doctor ID:", user.id);
    
    // Use the ENDPOINTS function to get the correct URL
    const endpoint = API_CONFIG.ENDPOINTS.GET_APPOINTMENTS(user.id);
    console.log("API endpoint:", endpoint);
    
    apiFetch(endpoint, {
        method: "GET"
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch appointments: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Appointments data received:", data);
        document.getElementById("todayCount").textContent = data.today?.length || 0;
        document.getElementById("upcomingCount").textContent = data.upcoming?.length || 0;
        renderAppointments("todayAppointments", data.today);
        renderAppointments("upcomingAppointments", data.upcoming);
    })
    .catch(error => {
        console.error("Error loading appointments:", error);
    });
}

function renderAppointments(tableId, appointments) {
    const tbody = document.getElementById(tableId);
    console.log(`Rendering appointments for ${tableId}:`, appointments);
    
    if (!tbody) {
        console.error(`Table body with ID '${tableId}' not found`);
        return;
    }
    
    tbody.innerHTML = ""; // Clear old rows
    
    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No appointments</td></tr>`;
        return;
    }
    
    appointments.forEach(appt => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appt.user_name || 'N/A'}</td>
            <td>${appt.user_email || 'N/A'}</td>
            <td>${appt.user_phone || 'N/A'}</td>
            <td>${appt.appointment_date || 'N/A'}</td>
            <td>${appt.status || 'N/A'}</td>
            <td onclick="statusaction(${appt.id})"><a href="#">Edit</a></td>
        `;
        tbody.appendChild(row);
    });
}

// Make sure to call loadAppointments when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAppointments();
});

let selectedAppointmentId = null;

// Open modal
function statusaction(id) {
    selectedAppointmentId = id;
    document.getElementById("statusModal").style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";
}

// Close modal
function closeModal() {
    document.getElementById("statusModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
    selectedAppointmentId = null;
}

// Handle form submit
document.getElementById("statusForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const newStatus = document.getElementById("statusSelect").value;

    if (!newStatus || !selectedAppointmentId) {
        alert("Please select a status.");
        return;
    }

    apiFetch(API_CONFIG.ENDPOINTS.STATUS_UPDATE(selectedAppointmentId, newStatus), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(data => {
        console.log("Appointment updated:", data);
        closeModal();
        window.location.reload();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to update appointment");
    });
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











// // Load doctor credentials from localStorage on page load
// function loadDoctorCredentials() {
//     const storedCredentials = localStorage.getItem('doctorCredentials');
//     if (storedCredentials) {
//         try {
//             const parsedCredentials = JSON.parse(storedCredentials);
//             doctorCredentials = { ...doctorCredentials, ...parsedCredentials };
//         } catch (e) {
//             console.error('Error loading doctor credentials:', e);
//         }
//     }
// }

// //  Save doctor credentials to localStorage
// function saveDoctorCredentials() {
//     localStorage.setItem('doctorCredentials', JSON.stringify(doctorCredentials));
// }

// function showDashboard() {
//     hideAllSections();
//     const dashboardSection = document.getElementById('dashboardSection');
//     if (dashboardSection) {
//         dashboardSection.classList.remove('hidden');
//         const doctorNameElement = document.getElementById('doctorName');
//         if (doctorNameElement) {
//             doctorNameElement.textContent = `Welcome, ${currentDoctor.name}`;
//         }
//         loadDashboardData();
//     }
// }


// function changePassword() {
//     window.location.href = "modal-changepassword.html";
//     hideAllSections();
//     const changePasswordSection = document.getElementById('changePasswordSection');
//     if (changePasswordSection) {
//         changePasswordSection.classList.remove('hidden');
//         const form = document.getElementById('changePasswordForm');
//         if (form) form.reset();
//         const errorDiv = document.getElementById('passwordError');
//         const successDiv = document.getElementById('passwordSuccess');
//         if (errorDiv) errorDiv.classList.add('hidden');
//         if (successDiv) successDiv.classList.add('hidden');
//     }
// }


// // function hideAllSections() {
// //     const sections = ['loginSection', 'dashboardSection', 'profileSection', 'changePasswordSection'];
// //     sections.forEach(sectionId => {
// //         const section = document.getElementById(sectionId);
// //         if (section) {
// //             section.classList.add('hidden');
// //         }
// //     });
// // }

// function loadProfileData() {
//     const profileName = document.getElementById('profileName');
//     const profileEmail = document.getElementById('profileEmail');
//     const profilePhone = document.getElementById('profilePhone');
//     const profileAddress = document.getElementById('profileAddress');
    
//     if (profileName) profileName.textContent = currentDoctor.name;
//     if (profileEmail) profileEmail.textContent = currentDoctorEmail;
//     if (profilePhone) profilePhone.textContent = currentDoctor.phone;
//     if (profileAddress) profileAddress.textContent = currentDoctor.address;
    
//     // Store original data
//     originalProfileData = {
//         email: currentDoctorEmail,
//         phone: currentDoctor.phone,
//         address: currentDoctor.address
//     };
// }

// function toggleEditMode() {
//     isEditMode = !isEditMode;
//     const profileCard = document.getElementById('profileCard');
    
//     if (isEditMode) {
//         profileCard.classList.add('edit-mode');
        
//         // Convert email to input
//         const emailSpan = document.getElementById('profileEmail');
//         emailSpan.innerHTML = `<input type="email" class="form-control" value="${currentDoctorEmail}" id="editEmail">`;
        
//         // Convert phone to input
//         const phoneSpan = document.getElementById('profilePhone');
//         phoneSpan.innerHTML = `<input type="tel" class="form-control" value="${currentDoctor.phone}" id="editPhone">`;
        
//         // Convert address to textarea
//         const addressSpan = document.getElementById('profileAddress');
//         addressSpan.innerHTML = `<textarea class="form-control" id="editAddress">${currentDoctor.address}</textarea>`;
        
//         // Show/hide buttons
//         document.getElementById('editBtn').classList.add('hidden');
//         document.getElementById('saveBtn').classList.remove('hidden');
//         document.getElementById('cancelBtn').classList.remove('hidden');
//     }
// }

// function cancelEdit() {
//     isEditMode = false;
//     const profileCard = document.getElementById('profileCard');
//     profileCard.classList.remove('edit-mode');
    
//     // Restore original data
//     document.getElementById('profileEmail').textContent = originalProfileData.email;
//     document.getElementById('profilePhone').textContent = originalProfileData.phone;
//     document.getElementById('profileAddress').textContent = originalProfileData.address;
    
//     // Show/hide buttons
//     document.getElementById('editBtn').classList.remove('hidden');
//     document.getElementById('saveBtn').classList.add('hidden');
//     document.getElementById('cancelBtn').classList.add('hidden');
// }

// function saveProfile() {
//     const newEmail = document.getElementById('editEmail').value;
//     const newPhone = document.getElementById('editPhone').value;
//     const newAddress = document.getElementById('editAddress').value;
    
//     // Validate email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(newEmail)) {
//         alert('Please enter a valid email address');
//         return;
//     }
    
//     // Validate phone
//     if (newPhone.length < 10) {
//         alert('Please enter a valid phone number');
//         return;
//     }
    
//     // Update credentials if email changed
//     if (newEmail !== currentDoctorEmail) {
//         // Move credentials to new email key
//         doctorCredentials[newEmail] = doctorCredentials[currentDoctorEmail];
//         delete doctorCredentials[currentDoctorEmail];
//         currentDoctorEmail = newEmail;
//         localStorage.setItem('loggedInEmail', newEmail);
//     }
    
//     // Update doctor data
//     currentDoctor.phone = newPhone;
//     currentDoctor.address = newAddress;
//     doctorCredentials[currentDoctorEmail].phone = newPhone;
//     doctorCredentials[currentDoctorEmail].address = newAddress;
    
//     // Update localStorage
//     localStorage.setItem('loggedInDoctor', JSON.stringify(currentDoctor));
    
//     // Exit edit mode
//     isEditMode = false;
//     const profileCard = document.getElementById('profileCard');
//     profileCard.classList.remove('edit-mode');
    
//     // Update display
//     document.getElementById('profileEmail').textContent = currentDoctorEmail;
//     document.getElementById('profilePhone').textContent = currentDoctor.phone;
//     document.getElementById('profileAddress').textContent = currentDoctor.address;
    
//     // Update original data
//     originalProfileData = {
//         email: currentDoctorEmail,
//         phone: currentDoctor.phone,
//         address: currentDoctor.address
//     };
    
//     // Show/hide buttons
//     document.getElementById('editBtn').classList.remove('hidden');
//     document.getElementById('saveBtn').classList.add('hidden');
//     document.getElementById('cancelBtn').classList.add('hidden');
    
//     alert('Profile updated successfully!');
// }

// // Change Password Form Handler
// document.addEventListener('DOMContentLoaded', function() {
//     const changePasswordForm = document.getElementById('changePasswordForm');
//     if (changePasswordForm) {
//         changePasswordForm.addEventListener('submit', function(e) {
//             e.preventDefault();
            
//             const currentPassword = document.getElementById('currentPassword').value;
//             const newPassword = document.getElementById('newPassword').value;
//             const confirmPassword = document.getElementById('confirmPassword').value;
//             const errorDiv = document.getElementById('passwordError');
//             const successDiv = document.getElementById('passwordSuccess');
            
//             // Hide previous messages
//             if (errorDiv) errorDiv.classList.add('hidden');
//             if (successDiv) successDiv.classList.add('hidden');
            
//             // Validate current password
//             if (currentPassword !== currentDoctor.password) {
//                 if (errorDiv) {
//                     errorDiv.textContent = 'Current password is incorrect';
//                     errorDiv.classList.remove('hidden');
//                 }
//                 return;
//             }
            
//             // Validate new password
//             if (newPassword.length < 6) {
//                 if (errorDiv) {
//                     errorDiv.textContent = 'New password must be at least 6 characters long';
//                     errorDiv.classList.remove('hidden');
//                 }
//                 return;
//             }
            
//             // Validate password confirmation
//             if (newPassword !== confirmPassword) {
//                 if (errorDiv) {
//                     errorDiv.textContent = 'New passwords do not match';
//                     errorDiv.classList.remove('hidden');
//                 }
//                 return;
//             }
            
//             // Check if new password is same as current
//             if (newPassword === currentPassword) {
//                 if (errorDiv) {
//                     errorDiv.textContent = 'New password must be different from current password';
//                     errorDiv.classList.remove('hidden');
//                 }
//                 return;
//             }
            
//             // Update password
//             doctorCredentials[currentDoctorEmail].password = newPassword;
//             currentDoctor.password = newPassword;
//             saveDoctorCredentials();
//             localStorage.setItem('loggedInDoctor', JSON.stringify(currentDoctor));

//             console.log('Password updated for:', currentDoctorEmail);
//             console.log('New password saved:', newPassword);
            
//             // Show success message
//             if (successDiv) {
//                 successDiv.textContent = 'Password updated successfully!';
//                 successDiv.classList.remove('hidden');
//             }
            
//             // Clear form
//             changePasswordForm.reset();
            
//             // Auto-redirect to dashboard after 2 seconds
//             setTimeout(() => {
//                 showDashboard();
//             }, 2000);
//         });
//     }
// });




// function displayAppointments(containerId, appointments) {
//     const container = document.getElementById(containerId);
//     if (!container) return;
    
//     if (appointments.length === 0) {
//         container.innerHTML = '<p class="text-muted text-center">No appointments found</p>';
//         return;
//     }

//     container.innerHTML = appointments.map(apt => `
//         <div class="appointment-card">
//             <div class="row align-items-center">
//                 <div class="col-md-8">
//                     <h6 class="mb-1">${apt.user_name}</h6>
//                     <p class="mb-1"><i class="fas fa-envelope"></i> ${apt.user_email}</p>
//                     <p class="mb-1"><i class="fas fa-phone"></i> ${apt.user_phone}</p>
//                     <p class="mb-0"><i class="fas fa-stethoscope"></i> ${apt.service}</p>
//                 </div>
//                 <div class="col-md-4 text-end">
//                     <span class="badge bg-primary">${apt.appointment_date}</span>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }


// function updateStats() {
//     // Stats are updated in loadAppointments and loadBlockedDates
// }

// // Initialize when page loads - THIS IS THE KEY FIX
// window.addEventListener('DOMContentLoaded', function() {
//     loadDoctorCredentials();
//     // Initialize doctor session first
//     initializeDoctorSession();
    
//     // Check if this is the admin page (has blockedDatesList element)
//     const blockedDatesContainer = document.getElementById('blockedDatesList');
    
//     if (blockedDatesContainer) {
//         // This is the admin page
//         if (currentDoctor && currentDoctorEmail) {
//             // Update doctor name
//             const doctorNameElement = document.getElementById('doctorName');
//             if (doctorNameElement) {
//                 doctorNameElement.textContent = `Welcome, ${currentDoctor.name}`;
//             }
            
//             // Load blocked dates IMMEDIATELY
//             loadBlockedDates();
            
//             // Then load other dashboard data
//             loadDashboardData();
            
//             // Set minimum date for date picker
//             const blockDateInput = document.getElementById('blockDate');
//             if (blockDateInput) {
//                 blockDateInput.min = new Date(Date.now() + 86400000).toISOString().split('T')[0];
//             }
//         } 
//     }
// });