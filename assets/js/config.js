// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://codkraft.com/',
    ENDPOINTS: {
        LOGIN: '/api/login/',
        LOGOUT: '/api/logout/',
        BLOCKED_DATES: (doctorId) => `/api/blocked-dates/${doctorId}/`,
        BLOCK_DATE: '/api/block-date/',
        UNBLOCK_DATE: (doctorId, date) => `/api/unblock-date/${doctorId}/${date}/`,
        BOOK_APPOINTMENT: '/api/book-appointment/',
        GET_APPOINTMENTS: (doctorId) => `/api/appointments/${doctorId}/`,
        STATUS_UPDATE: (selectedAppointmentId, newStatus) => `/api/update-appointment-status/${selectedAppointmentId}/${newStatus}/`,
        USER_PROFILE: (userId) => `/api/user-profile/${userId}/`,
        CHANGE_PASSWORD: (userId) => `/api/change-password/${userId}/`,
    },
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Helper function to make API calls
function apiFetch(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: API_CONFIG.HEADERS,
        ...options
    };

    return fetch(url, defaultOptions);
}

// Export for use in other files
window.API_CONFIG = API_CONFIG;
window.apiFetch = apiFetch;