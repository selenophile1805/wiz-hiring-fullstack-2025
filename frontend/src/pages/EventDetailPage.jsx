import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { getEvent, createBooking } from '../services/api';
import { isPast } from '../utils/dateUtils';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [bookingData, setBookingData] = useState({
    attendee_name: '',
    attendee_email: '',
    time_slot_id: null
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const eventData = await getEvent(id);
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      setAlert({ message: 'Event not found', type: 'error' });
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBooking = async (slotId) => {
    setBookingData(prev => ({ ...prev, time_slot_id: slotId }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.attendee_name.trim() || !bookingData.attendee_email.trim() || !bookingData.time_slot_id) {
      setAlert({ message: 'Please fill in all fields and select a time slot', type: 'error' });
      return;
    }

    setBookingLoading(true);

    const payload = {
      ...bookingData,
      event_id: id,
    };

    try {
      await createBooking(payload);
      setAlert({ message: 'Booking successful!', type: 'success' });
      
      // Reset form
      setBookingData({
        attendee_name: '',
        attendee_email: '',
        time_slot_id: null
      });
      
      // Refresh event data to update availability
      await fetchEvent();
    } catch (error) {
      console.error('Booking error:', error);
      if (error.message.includes('409')) {
        setAlert({ message: 'You have already booked this time slot.', type: 'error' });
      } else {
        setAlert({ message: `Booking failed: ${error.message}`, type: 'error' });
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getSlotStatus = (slot) => {
    if (isPast(slot.end_time)) {
      return {
        isPast: true,
        isAvailable: false,
        isFull: false,
        label: 'Past',
        color: 'bg-gray-100 text-gray-800',
        textColor: 'text-gray-500',
      };
    }

    const currentBookings = slot.current_bookings || 0;
    const isAvailable = currentBookings < slot.max_bookings;

    if (isAvailable) {
      return {
        isPast: false,
        isAvailable: true,
        isFull: false,
        label: 'Available',
        color: 'bg-green-100 text-green-800',
        textColor: 'text-green-600',
        remainingSlots: slot.max_bookings - currentBookings,
      };
    }

    return {
      isPast: false,
      isAvailable: false,
      isFull: true,
      label: 'Full',
      color: 'bg-red-100 text-red-800',
      textColor: 'text-red-600',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="card mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              <p className="text-gray-600 mb-4">
                Created by {event.creator_name}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Back to Events
            </button>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Book Your Slot
          </h2>

          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={bookingData.attendee_name}
                  onChange={(e) => handleBookingChange('attendee_name', e.target.value)}
                  className="input-field"
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={bookingData.attendee_email}
                  onChange={(e) => handleBookingChange('attendee_email', e.target.value)}
                  className="input-field"
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {bookingData.time_slot_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Selected Slot:</strong> {
                    event.time_slots.find(slot => slot.id === bookingData.time_slot_id)?.start_time
                  } - {
                    event.time_slots.find(slot => slot.id === bookingData.time_slot_id)?.end_time
                  }
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={bookingLoading || !bookingData.time_slot_id}
              className="btn-primary disabled:opacity-50"
            >
              {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        {/* Time Slots */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Time Slots
          </h2>

          {event.time_slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No time slots available for this event.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {event.time_slots.map((slot) => {
                const status = getSlotStatus(slot);
                
                return (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      status.isAvailable
                        ? 'border-gray-200 hover:border-blue-300 bg-white'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(slot.start_time).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(slot.start_time).toLocaleTimeString()} - {new Date(slot.end_time).toLocaleTimeString()}
                            </p>
                          </div>
                          
                          <div className="text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {status.isPast
                            ? 'This slot has passed.'
                            : `${slot.current_bookings} of ${slot.max_bookings} spots booked`
                          }
                          {status.isAvailable && ` (${status.remainingSlots} remaining)`}
                        </p>
                      </div>

                      <div className="ml-4">
                        {status.isAvailable ? (
                          <button
                            onClick={() => handleBooking(slot.id)}
                            className={`btn-primary ${
                              bookingData.time_slot_id === slot.id ? 'bg-blue-700' : ''
                            }`}
                          >
                            {bookingData.time_slot_id === slot.id ? 'Selected' : 'Book Slot'}
                          </button>
                        ) : (
                          <span className={`text-sm ${status.textColor}`}>{status.label}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 