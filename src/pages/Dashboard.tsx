import React from 'react'
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard'

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalyticsDashboard />
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Realtime Notifications</h2>
          <div>
            <p>No new notifications</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
