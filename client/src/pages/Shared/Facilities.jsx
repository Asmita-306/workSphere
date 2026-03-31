import { useState } from 'react';
import { Building2, Users, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react';

const Facilities = () => {
  const [seats, setSeats] = useState([
    { id: 'S1', name: 'Desk A1', status: 'occupied', user: 'John Doe' },
    { id: 'S2', name: 'Desk A2', status: 'available', user: null },
    { id: 'S3', name: 'Desk A3', status: 'available', user: null },
    { id: 'S4', name: 'Desk B1', status: 'occupied', user: 'Sarah Miller' },
    { id: 'S5', name: 'Desk B2', status: 'available', user: null },
    { id: 'S6', name: 'Desk B3', status: 'occupied', user: 'Mike Chen' },
  ]);

  const [rooms, setRooms] = useState([
    { id: 'R1', name: 'Boardroom Alpha', type: 'Boardroom', status: 'booked', time: '10:00 AM - 12:00 PM' },
    { id: 'R2', name: 'Conference Room 1', type: 'Conference', status: 'available', time: null },
    { id: 'R3', name: 'Conference Room 2', type: 'Conference', status: 'booked', time: '02:00 PM - 03:00 PM' },
  ]);

  const [bookingRoom, setBookingRoom] = useState(null);

  const handleBooking = (e) => {
    e.preventDefault();
    alert(`Booking confirmed for ${bookingRoom.name}`);
    setBookingRoom(null);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facilities & Resources</h1>
        <p className="text-gray-500">View seat allocations and book meeting rooms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Seat Allocation Section */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">Seat Allocation</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {seats.map((seat) => (
              <div 
                key={seat.id} 
                className={`p-4 rounded-xl border text-center transition ${
                  seat.status === 'occupied' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200 hover:border-green-500 cursor-pointer'
                }`}
              >
                <p className="font-bold text-sm mb-1">{seat.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  seat.status === 'occupied' ? 'bg-gray-200 text-gray-600' : 'bg-green-200 text-green-700'
                }`}>
                  {seat.status}
                </span>
                {seat.user && <p className="text-[10px] text-gray-400 mt-2 truncate">{seat.user}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Meeting Rooms Section */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold">Meeting Rooms</h2>
          </div>

          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="p-4 rounded-xl border flex items-center justify-between transition hover:border-blue-500">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    room.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{room.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">{room.type}</p>
                    {room.time && (
                      <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold mt-1">
                        <Clock className="w-3 h-3" />
                        {room.time}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {room.status === 'available' ? (
                    <button 
                      onClick={() => setBookingRoom(room)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Book Now
                    </button>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wider">
                      Booked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {bookingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-6">Book {bookingRoom.name}</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input type="time" required className="w-full p-2 bg-gray-50 border rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input type="time" required className="w-full p-2 bg-gray-50 border rounded-lg outline-none" />
                </div>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium mt-4">
                Confirm Booking
              </button>
              <button 
                type="button"
                onClick={() => setBookingRoom(null)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 transition text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities;
