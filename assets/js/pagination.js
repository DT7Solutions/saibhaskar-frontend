// pagination.js - Fixed version

function createPagination(containerId, totalItems, itemsPerPage, currentPage) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Clear if only one page or no items
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-wrapper">';
    
    // Previous button
    html += `<button class="page-btn nav-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage('${containerId}', ${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
             </button>`;
    
    // Page numbers with ellipsis logic
    for (let i = 1; i <= totalPages; i++) {
        // Show first page, last page, current page, and pages around current
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage('${containerId}', ${i})">
                        ${i}
                     </button>`;
        } 
        // Add ellipsis
        else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Next button
    html += `<button class="page-btn nav-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage('${containerId}', ${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
             </button>`;
    
    html += '</div>';
    container.innerHTML = html;
}

// Global change page function
function changePage(containerId, newPage) {
    if (containerId === 'todayPagination') {
        todayPage = newPage;
        renderAppointments("todayAppointments", todayAppointmentsData, todayPage, itemsPerPage);
        createPagination('todayPagination', todayAppointmentsData.length, itemsPerPage, todayPage);
    } else if (containerId === 'upcomingPagination') {
        upcomingPage = newPage;
        renderAppointments("upcomingAppointments", upcomingAppointmentsData, upcomingPage, itemsPerPage);
        createPagination('upcomingPagination', upcomingAppointmentsData.length, itemsPerPage, upcomingPage);
    }
}