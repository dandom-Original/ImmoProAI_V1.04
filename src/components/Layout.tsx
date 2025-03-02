import React from 'react'
import { Link } from 'react-router-dom'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">ImmoMatch Pro CRM</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/clients">Clients</Link>
              </li>
              <li>
                <Link to="/uploads">Uploads</Link>
              </li>
              <li>
                <Link to="/documents">Documents</Link>
              </li>
              <li>
                <Link to="/notifications">Notifications</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        ImmoMatch Pro CRM © {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default Layout
