import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    event: {
      title: '',
      description: '',
      creator_name: '',
      creator_email: ''
    },
    time_slots: []
  });

  const [newSlot, setNewSlot] = useState({
    start_time: '',
    end_time: '',
    max_bookings: 1
  });

  const handleEventChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      event: {
        ...prev.event,
        [field]: value
      }
    }));
  };

  const handleSlotChange = (field, value) => {
    setNewSlot(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTimeSlot = () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      setAlert({ message: 'Please fill in both start and end times', type: 'error' });
      return;
    }

    if (new Date(newSlot.start_time) >= new Date(newSlot.end_time)) {
      setAlert({ message: 'End time must be after start time', type: 'error' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      time_slots: [...prev.time_slots, { ...newSlot }]
    }));

    setNewSlot({
      start_time: '',
      end_time: '',
      max_bookings: 1
    });

    setAlert({ message: 'Time slot added successfully!', type: 'success' });
  };

  const removeTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter((_, i) => i !== index)
    }));
    setAlert({ message: 'Time slot removed', type: 'success' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.time_slots.length === 0) {
      setAlert({ message: 'Please add at least one time slot', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create event');
      }

      const result = await response.json();
      setAlert({ message: 'Event created successfully!', type: 'success' });
      setTimeout(() => navigate(`/event/${result.id}`), 1500);
    } catch (error) {
      setAlert({ message: `Error creating event: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
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
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Event
          </h1>
          <p className="text-gray-600">
            Set up your event with available time slots
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.event.title}
                  onChange={(e) => handleEventChange('title', e.target.value)}
                  className="input-field"
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.event.description}
                  onChange={(e) => handleEventChange('description', e.target.value)}
                  className="input-field"
                  rows="4"
                  required
                  placeholder="Describe your event"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.event.creator_name}
                    onChange={(e) => handleEventChange('creator_name', e.target.value)}
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
                    value={formData.event.creator_email}
                    onChange={(e) => handleEventChange('creator_email', e.target.value)}
                    className="input-field"
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Time Slots
            </h2>

            {/* Add New Slot */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Add New Time Slot
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSlot.start_time}
                    onChange={(e) => handleSlotChange('start_time', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSlot.end_time}
                    onChange={(e) => handleSlotChange('end_time', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Bookings *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newSlot.max_bookings}
                    onChange={(e) => handleSlotChange('max_bookings', parseInt(e.target.value))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addTimeSlot}
                className="btn-secondary"
              >
                Add Time Slot
              </button>
            </div>

            {/* Existing Slots */}
            {formData.time_slots.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Added Time Slots ({formData.time_slots.length})
                </h3>
                
                <div className="space-y-3">
                  {formData.time_slots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Max bookings: {slot.max_bookings}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No slots warning */}
            {formData.time_slots.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>Add at least one time slot to create your event</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.time_slots.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage; 