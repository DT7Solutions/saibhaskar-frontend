// Enhanced appointment form handling with doctor availability check

// Initialize EmailJS (if not already done)
(function() {
    emailjs.init("-dH2HZ2kSwRVINVSK"); // Replace with your actual EmailJS public key
})();

// Function to check if date is blocked by doctor
function isDateBlocked(doctorId, date) {
    const blockedDates = JSON.parse(localStorage.getItem(`blockedDates_${doctorId}`) || '[]');
    return blockedDates.includes(date);
}

// Function to get available dates for calendar
function getAvailableDates(doctorId) {
    const blockedDates = JSON.parse(localStorage.getItem(`blockedDates_${doctorId}`) || '[]');
    return blockedDates;
}

// Enhanced date picker initialization
function initializeDatePicker() {
    const datePickers = document.querySelectorAll('.dateTime-pick');
    
    datePickers.forEach(picker => {
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        picker.min = tomorrow.toISOString().split('T')[0];
        
        picker.addEventListener('change', function() {
            const selectedDate = this.value;
            const form = this.closest('form');
            const doctorSelect = form.querySelector('select[name="doctor"]');
            const selectedDoctor = doctorSelect.value;
            
            if (selectedDoctor && isDateBlocked(selectedDoctor, selectedDate)) {
                alert('Sorry, the selected doctor is not available on this date. Please choose another date.');
                this.value = '';
            }
        });
    });
    
    // Update date picker when doctor changes
    const doctorSelects = document.querySelectorAll('select[name="doctor"]');
    doctorSelects.forEach(select => {
        select.addEventListener('change', function() {
            const form = this.closest('form');
            const datePicker = form.querySelector('.dateTime-pick');
            const selectedDate = datePicker.value;
            
            if (selectedDate && isDateBlocked(this.value, selectedDate)) {
                alert('Sorry, the selected doctor is not available on this date. Please choose another date.');
                datePicker.value = '';
            }
        });
    });
}

// Enhanced appointment form submission
function handleAppointmentSubmission(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const appointmentData = {
            user_name: formData.get('user_name'),
            user_email: formData.get('user_email'),
            user_phone: formData.get('user_phone'),
            appointment_date: formData.get('appointment_date'),
            service: formData.get('service'),
            doctor: formData.get('doctor'),
            submission_date: new Date().toISOString().split('T')[0],
            id: 'apt_' + Date.now()
        };
        
        // Validate form data
        if (!appointmentData.user_name || !appointmentData.user_email || 
            !appointmentData.user_phone || !appointmentData.appointment_date || 
            !appointmentData.service || !appointmentData.doctor) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Check if date is blocked
        if (isDateBlocked(appointmentData.doctor, appointmentData.appointment_date)) {
            alert('Sorry, the selected doctor is not available on this date. Please choose another date.');
            return;
        }
        
        // Save appointment to localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(appointmentData);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Send email notification using EmailJS
        const emailParams = {
            to_name: appointmentData.user_name,
            to_email: appointmentData.user_email,
            doctor_name: appointmentData.doctor,
            appointment_date: appointmentData.appointment_date,
            service: appointmentData.service,
            phone: appointmentData.user_phone,
            hospital_name: 'Sai Bhaskar Hospitals'
        };
        
        // Send email to patient
        emailjs.send('service_uryai1f', 'template_i9fmm1f', emailParams)
            .then(function(response) {
                console.log('Email sent successfully', response);
            }, function(error) {
                console.log('Email failed to send', error);
            });
        
        // Show success message
        alert('Appointment booked successfully! We will contact you soon to confirm your appointment.');
        
        // Reset form
        form.reset();
        
        // Close modal if it's in a modal
        const modal = form.closest('.modal');
        if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current submission date
    const submissionDateInputs = document.querySelectorAll('input[name="submission_date"]');
    const currentDate = new Date().toISOString().split('T')[0];
    submissionDateInputs.forEach(input => {
        input.value = currentDate;
    });
    
    // Initialize date pickers
    initializeDatePicker();
    
    // Handle appointment forms
    handleAppointmentSubmission('appointmentForm');
    handleAppointmentSubmission('appointmentForm1');
    
    // Handle any additional appointment forms that might be added dynamically
    document.addEventListener('submit', function(e) {
        if (e.target.matches('form[id*="appointment"]') || e.target.matches('form.appointment-form')) {
            e.preventDefault();
            // Handle the form submission here if not already handled
        }
    });
});

// Function to display blocked dates in calendar (for future calendar integration)
function updateCalendarWithBlockedDates(doctorId) {
    const blockedDates = getAvailableDates(doctorId);
    // This function can be expanded when you implement a visual calendar
    return blockedDates;
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Function to get appointments for a specific doctor (useful for dashboard)
function getDoctorAppointments(doctorId) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    return appointments.filter(apt => apt.doctor === doctorId);
}

// Export functions for use in other scripts
window.hospitalApp = {
    isDateBlocked,
    getAvailableDates,
    getDoctorAppointments,
    formatDate,
    updateCalendarWithBlockedDates
};