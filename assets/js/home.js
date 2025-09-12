let flatpickrInstance;

// Initialize datepicker with given blocked dates
function initDatepicker(blockedDates) {
    if (flatpickrInstance) {
        flatpickrInstance.destroy();
    }
    flatpickrInstance = flatpickr("#date", {
        allowInput: true,
        clickOpens: true,
        minDate: "today",
        disable: blockedDates,
        dateFormat: "Y-m-d"
    });
}

// Fetch blocked dates from backend
function fetchBookingdates(doctorId) {
    if (!doctorId) return;
    apiFetch(API_CONFIG.ENDPOINTS.BLOCKED_DATES(parseInt(doctorId)))
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Blocked dates response:", data);
            // alert(JSON.stringify(data));
            const blockedDates = data.map(item => item.date);
            localStorage.setItem("doc_b_d_2", JSON.stringify(data));
            initDatepicker(blockedDates);
        })
        .catch(err => {
            console.error("Error fetching blocked dates:", err);
            document.getElementById('blockedDatesList').innerHTML =
                '<span class="text-danger">Failed to load blocked dates</span>';
        });

}

// On page load
document.addEventListener('DOMContentLoaded', () => {
    const storedData = JSON.parse(localStorage.getItem("doc_b_d_2")) || [];
    const blockedDates = storedData.map(item => item.date);

    initDatepicker(blockedDates);
});