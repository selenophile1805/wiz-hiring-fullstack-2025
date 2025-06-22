import { Link } from 'react-router-dom';
import { formatDate, isPast } from '../utils/dateUtils';

const EventCard = ({ event }) => {
  const allSlots = event.time_slots || [];
  const futureSlots = allSlots.filter(slot => !isPast(slot.end_time));
  const availableSlots = futureSlots.filter(slot => (slot.current_bookings || 0) < slot.max_bookings);

  const getStatus = () => {
    if (availableSlots.length > 0) {
      return <span className="text-green-600 text-sm font-medium">Available</span>;
    }
    if (futureSlots.length > 0) {
      return <span className="text-red-600 text-sm font-medium">Full</span>;
    }
    return <span className="text-gray-500 text-sm font-medium">Unavailable</span>;
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            Created by {event.creator_name}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {formatDate(event.created_at)}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">
        {event.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>📅 {availableSlots.length} available slots</span>
        <span>👥 {event.time_slots?.length || 0} total slots</span>
      </div>

      <div className="flex justify-between items-center">
        <Link
          to={`/event/${event.id}`}
          className="btn-primary text-sm"
        >
          View Details
        </Link>
        
        {getStatus()}
      </div>
    </div>
  );
};

export default EventCard; 