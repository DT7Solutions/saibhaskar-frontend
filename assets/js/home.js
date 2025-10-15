let flatpickrInstance;

// Initialize datepicker with given blocked dates
function initDatepicker(blockedDates) {
    console.log("Initializing datepicker with blocked dates:", blockedDates);
    
    if (flatpickrInstance) {
        flatpickrInstance.destroy();
    }
    
    const dateInput = document.getElementById('date');
    if (!dateInput) {
        console.error("Date input #date not found!");
        return;
    }
    
    flatpickrInstance = flatpickr("#date", {
        allowInput: false,
        clickOpens: true,
        minDate: "today",
        disable: blockedDates,
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            console.log("Date selected:", dateStr);
        },
        onReady: function(selectedDates, dateStr, instance) {
            console.log("Flatpickr ready with disabled dates:", blockedDates);
        }
    });
}

// Fetch blocked dates from backend
function fetchBookingdates(doctorId) {
    if (!doctorId) {
        console.log("No doctor ID provided");
        return;
    }
    
    console.log("Fetching blocked dates for doctor:", doctorId);
    
    apiFetch(API_CONFIG.ENDPOINTS.BLOCKED_DATES(parseInt(doctorId)))
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Blocked dates response:", data);
            const blockedDates = data.map(item => item.date);
            console.log("Mapped blocked dates:", blockedDates);
            
            localStorage.setItem("doc_b_d_2", JSON.stringify(data));
            initDatepicker(blockedDates);
        })
        .catch(err => {
            console.error("Error fetching blocked dates:", err);
            initDatepicker([]);
        });
}

// Setup event listeners when modal opens
function setupAppointmentFormListeners() {
    const doctorSelect = document.getElementById('doctorSelect');
    
    if (doctorSelect && !doctorSelect.dataset.listenerAdded) {
        console.log("Setting up doctor select listener");
        
        doctorSelect.addEventListener('change', function() {
            const doctorId = this.value;
            console.log("Doctor selected:", doctorId);
            
            if (doctorId) {
                fetchBookingdates(doctorId);
            } else {
                initDatepicker([]);
            }
        });
        
        // Mark that listener has been added
        doctorSelect.dataset.listenerAdded = "true";
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    
    // Initialize with empty blocked dates
    const storedData = JSON.parse(localStorage.getItem("doc_b_d_2")) || [];
    const blockedDates = storedData.map(item => item.date);
    initDatepicker(blockedDates);
    
    // Setup listeners
    setupAppointmentFormListeners();
});

// Also setup listeners when modal is shown (if using Bootstrap modal)
const appointmentModal = document.getElementById('appointmentModal');
if (appointmentModal) {
    appointmentModal.addEventListener('shown.bs.modal', function () {
        console.log("Appointment modal opened");
        setupAppointmentFormListeners();
        
        // Reinitialize datepicker when modal opens
        const storedData = JSON.parse(localStorage.getItem("doc_b_d_2")) || [];
        const blockedDates = storedData.map(item => item.date);
        initDatepicker(blockedDates);
    });
}