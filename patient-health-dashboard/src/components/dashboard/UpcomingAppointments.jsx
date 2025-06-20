import { CalendarIcon, ClockIcon, VideoCameraIcon } from "@heroicons/react/24/outline"

const appointments = [
  {
    id: 1,
    title: "General Checkup",
    doctor: "Dr. Sarah Wilson",
    date: "2024-01-15",
    time: "10:00 AM",
    type: "in-person",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Cardiology Consultation",
    doctor: "Dr. Michael Chen",
    date: "2024-01-18",
    time: "2:30 PM",
    type: "virtual",
    status: "confirmed",
  },
  {
    id: 3,
    title: "Blood Test Results",
    doctor: "Dr. Emily Rodriguez",
    date: "2024-01-22",
    time: "11:15 AM",
    type: "virtual",
    status: "pending",
  },
]

const UpcomingAppointments = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-medium">View All</button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                {appointment.type === "virtual" ? (
                  <VideoCameraIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{appointment.title}</p>
              <p className="text-sm text-gray-500">{appointment.doctor}</p>
              <div className="flex items-center space-x-2 mt-1">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{appointment.date}</span>
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">{appointment.time}</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {appointment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UpcomingAppointments
