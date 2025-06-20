import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "High Blood Pressure Detected",
    message: "Your blood pressure reading of 145/90 is above normal range.",
    time: "2 hours ago",
    action: "Contact Doctor",
  },
  {
    id: 2,
    type: "info",
    title: "Medication Reminder",
    message: "Time to take your evening medication (Metformin 500mg).",
    time: "4 hours ago",
    action: "Mark as Taken",
  },
  {
    id: 3,
    type: "success",
    title: "Daily Goal Achieved",
    message: "Congratulations! You've reached your daily step goal of 10,000 steps.",
    time: "6 hours ago",
    action: "View Progress",
  },
]

const getAlertIcon = (type) => {
  switch (type) {
    case "warning":
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
    case "info":
      return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    case "success":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    default:
      return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
  }
}

const getAlertBgColor = (type) => {
  switch (type) {
    case "warning":
      return "bg-yellow-50 border-yellow-200"
    case "info":
      return "bg-blue-50 border-blue-200"
    case "success":
      return "bg-green-50 border-green-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

const RecentAlerts = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-medium">View All</button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-lg border ${getAlertBgColor(alert.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">{alert.time}</span>
                  <button className="text-xs font-medium text-green-600 hover:text-green-700">{alert.action}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentAlerts
