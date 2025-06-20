import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline"

const WelcomeCard = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Hello, John! 👋</h1>
          <p className="text-green-100 mb-4">You have completed 3/5 health tasks today</p>
          <div className="flex items-center space-x-4 text-sm text-green-100">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>Last sync: 2 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="hidden md:block">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${60 * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">60%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeCard
