import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import UploadsPage from './pages/UploadsPage'
import SettingsPage from './pages/SettingsPage'
import DocumentsPage from './pages/DocumentsPage'
import NotificationsPage from './pages/NotificationsPage'
import TagsPage from './pages/TagsPage'
import DataImportPage from './pages/DataImportPage'
import PurchaseProfilePage from './pages/PurchaseProfilePage'
import TasksPage from './pages/TasksPage'
import MatchDetailPage from './pages/MatchDetailPage'
import AIAgentsPage from './pages/AIAgentsPage'
import PropertiesPage from './pages/PropertiesPage'
import MatchingPage from './pages/MatchingPage'
import PropertyDetailPage from './pages/PropertyDetailPage'

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/uploads" element={<UploadsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/data-import" element={<DataImportPage />} />
        <Route path="/purchase-profiles" element={<PurchaseProfilePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/ai-agents" element={<AIAgentsPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/matching" element={<MatchingPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
      </Routes>
    </Layout>
  )
}

export default App
