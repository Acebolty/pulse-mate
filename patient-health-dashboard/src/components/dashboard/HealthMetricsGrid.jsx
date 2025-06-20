import { HeartIcon, BeakerIcon, FireIcon, MoonIcon } from "@heroicons/react/24/outline"

const metrics = [
  {
    id: 1,
    name: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "normal",
    change: "+2",
    icon: HeartIcon,
    color: "text-red-500",
    bgColor: "bg-red-50",
    lastUpdated: "2 min ago",
  },
  {
    id: 2,
    name: "Blood Glucose",
    value: "95",
    unit: "mg/dL",
    status: "normal",
    change: "-3",
    icon: BeakerIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    lastUpdated: "15 min ago",
  },
  {
    id: 3,
    name: "Calories Burned",
    value: "1,247",
    unit: "kcal",
    status: "good",
    change: "+156",
    icon: FireIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    lastUpdated: "1 hour ago",
  },
  {
    id: 4,
    name: "Sleep Quality",
    value: "8.2",
    unit: "/10",
    status: "excellent",
    change: "+0.3",
    icon: MoonIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    lastUpdated: "Last night",
  },
]

const getStatusColor = (status) => {
  switch (status) {
    case "excellent":
      return "text-green-600 bg-green-100"
    case "good":
      return "text-green-600 bg-green-100"
    case "normal":
      return "text-blue-600 bg-blue-100"
    case "warning":
      return "text-yellow-600 bg-yellow-100"
    case "critical":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const HealthMetricsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
              {metric.status}
            </span>
          </div>

          <div className="mb-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{metric.name}</p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={`flex items-center ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
              {metric.change} from yesterday
            </span>
            <span>{metric.lastUpdated}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HealthMetricsGrid
