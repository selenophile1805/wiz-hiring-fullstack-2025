import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { getBookingsByEmail } from '../services/api';
import { formatDate, formatTime, isPast } from '../utils/dateUtils';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      setAlert({ message: 'Please enter an email address', type: 'error' });
      return;
    }

    setLoading(true);
    setError(null);
    setBookings(null); 
    setAlert(null);

    try {
      const bookingsData = await getBookingsByEmail(searchEmail);
      setBookings(bookingsData);
      
      if (bookingsData.length === 0) {
        setAlert({ message: 'No bookings found for this email address', type: 'info' });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to fetch bookings');
      setAlert({ message: 'Failed to fetch bookings. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatus = (booking) => {
    if (!booking.time_slots) return {};
    const slotStartTime = new Date(booking.time_slots.start_time);
    const now = new Date();
    
    if (isPast(booking.time_slots.start_time)) {
      return {
        status: 'past',
        label: 'Past',
        color: 'bg-gray-100 text-gray-800'
      };
    } else if (slotStartTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        color: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return {
        status: 'future',
        label: 'Future',
        color: 'bg-green-100 text-green-800'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">View and manage your event bookings</p>
          </div>
          <Link to="/" className="btn-secondary">Back to Events</Link>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Bookings</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="flex gap-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter the email used for booking"
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {loading && (
            <div className="card text-center">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-xl font-medium text-gray-900">Searching for bookings...</h3>
          </div>
        )}

        {error && (
          <div className="card border-red-200 bg-red-50">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Bookings</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={() => { setError(null); setBookings(null); }} className="btn-secondary">
                Try Again
              </button>
            </div>
          </div>
        )}

        {bookings && !error && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Bookings for {searchEmail}</h2>
              {bookings.length > 0 && (
                <span className="text-sm text-gray-600">{bookings.length} booking(s) found</span>
              )}
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">No bookings were found for this email address.</p>
                <Link to="/" className="btn-primary">Browse Events</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  if (!booking.events || !booking.time_slots) return null;
                  const status = getBookingStatus(booking);
                  
                  return (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.events.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Created by {booking.events.creator_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Booked by: {booking.attendee_name}</span>
                            <span>Email: {booking.attendee_email}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Event Date:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(booking.time_slots.start_time)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-2 font-medium">
                            {formatTime(booking.time_slots.start_time)} - {formatTime(booking.time_slots.end_time)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Booking ID:</span>
                          <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {booking.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Booked on:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(booking.created_at)}
                          </span>
                        </div>
                      </div>

                      {booking.events.description && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-gray-700 text-sm">
                            {booking.events.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!bookings && !loading && !error && (
          <div className="card text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Search for Your Bookings</h3>
            <p className="text-gray-600">Enter the email address you used when making your bookings to view them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage; 