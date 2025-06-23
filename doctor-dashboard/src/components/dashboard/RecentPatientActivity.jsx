import { BellIcon, ChatBubbleLeftEllipsisIcon, DocumentArrowDownIcon, UserIcon } from "@heroicons/react/24/outline"
import { motion } from 'framer-motion';

const RecentPatientActivity = () => {
  // Placeholder data for recent patient activities
  const activities = [
    {
      id: 1,
      type: "new_data", // new_data, message, alert, document_upload
      patientName: "Alice Johnson",
      summary: "Shared new heart rate data.",
      details: "HR: 60-110bpm range, avg 78bpm.",
      time: "15 min ago",
      icon: DocumentArrowDownIcon,
      iconColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-700/20",
    },
    {
      id: 2,
      type: "critical_alert",
      patientName: "Robert Davis",
      summary: "Critical Alert: Hypoglycemia risk.",
      details: "BG reading: 65 mg/dL.",
      time: "45 min ago",
      icon: BellIcon,
      iconColor: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-700/20",
    },
    {
      id: 3,
      type: "message",
      patientName: "Maria Garcia",
      summary: "Sent a new message.",
      details: "Inquiring about medication side effects...",
      time: "1 hour ago",
      icon: ChatBubbleLeftEllipsisIcon,
      iconColor: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-700/20",
    },
    {
      id: 4,
      type: "new_patient",
      patientName: "William Brown",
      summary: "New patient registered.",
      details: "Awaiting initial consultation scheduling.",
      time: "3 hours ago",
      icon: UserIcon,
      iconColor: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-700/20",
    },
  ];

  return (
    <motion.div 
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg dark:shadow-slate-400/20 border border-white/20 dark:border-slate-700/30"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }} // Adjusted delay
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Patient Activity Feed</h3>
        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-700/30 px-3 py-1 rounded-lg transition-colors">
          Filter Activity
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max height and scroll */}
        {activities.map((activity, index) => {
          const ActivityIcon = activity.icon;
          return (
            <motion.div 
              key={activity.id} 
              className={`p-4 rounded-xl border border-gray-100 dark:border-slate-700/80 hover:shadow-md transition-shadow duration-300 ${activity.bgColor}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }} // Adjusted delay
            >
              <div className="flex items-start space-x-3.5">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-9 h-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center ring-1 ring-inset ring-gray-200 dark:ring-slate-600`}>
                    <ActivityIcon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {activity.patientName} - <span className="font-medium text-gray-600 dark:text-slate-300">{activity.summary}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{activity.details}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{activity.time}</span>
                    <button className={`text-xs font-semibold ${activity.iconColor} hover:underline`}>
                      {activity.type === 'message' ? 'View Message' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
         {activities.length === 0 && (
          <p className="text-center text-gray-500 dark:text-slate-400 py-4">No recent patient activity.</p>
        )}
      </div>
    </motion.div>
  );
};

export default RecentPatientActivity;
