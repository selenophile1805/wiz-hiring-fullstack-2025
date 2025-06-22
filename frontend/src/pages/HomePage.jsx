import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { getEventsWithSlots } from '../services/api';
import EventCard from '../components/EventCard';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all events with their time slots and booking data
      const eventsData = await getEventsWithSlots();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to load events');
      setAlert({ message: 'Failed to load events. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchEvents}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book My Slot
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find and book available time slots for events
          </p>
          <Link
            to="/create"
            className="btn-primary text-lg px-8 py-3"
          >
            Create New Event
          </Link>
        </div>

        {/* Events Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Events
            </h2>
            <Link
              to="/bookings"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View My Bookings →
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No events available
              </h3>
              <p className="text-gray-600 mb-6">
                There are no events with available time slots at the moment.
              </p>
              <Link
                to="/create"
                className="btn-primary"
              >
                Create the First Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 