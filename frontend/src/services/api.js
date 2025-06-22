const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }
    return response.json();
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        return await handleResponse(response);
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

// Event APIs
export const getEvents = async () => {
    return apiRequest('/events/');
};

export const getEventsWithSlots = async () => {
    return apiRequest('/events/with-slots');
};

export const getEvent = async (id) => {
    return apiRequest(`/events/${id}`);
};

export const createEvent = async (eventData) => {
    return apiRequest('/events/', {
        method: 'POST',
        body: JSON.stringify(eventData),
    });
};

// Booking APIs
export const createBooking = async (bookingData) => {
    return apiRequest('/bookings/', {
        method: 'POST',
        body: JSON.stringify(bookingData),
    });
};

export const getBookingsByEmail = async (email) => {
    return apiRequest(`/bookings/user/${encodeURIComponent(email)}`);
};

export const cancelBooking = async (bookingId, attendeeEmail) => {
    return apiRequest(`/bookings/${bookingId}?attendee_email=${encodeURIComponent(attendeeEmail)}`, {
        method: 'DELETE',
    });
};

// Health check
export const healthAPI = {
    checkHealth: () => apiRequest('/health'),
}; 