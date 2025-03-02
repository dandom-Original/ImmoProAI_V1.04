import React from 'react'
import CRMOverview from '../components/dashboard/CRMOverview'
import PropertyUploader from '../components/uploads/PropertyUploader'

const CRMMainPage: React.FC = () => {
  return (
    <div className="p-4">
      <section className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to ImmoMatch Pro CRM</h1>
        <p className="mt-2 text-lg">
          Experience our state-of-the-art real estate matching system built with advanced algorithms and comprehensive data analysis.
          Manage investor profiles, press news, market trends and much more – all in one platform.
        </p>
      </section>
      <CRMOverview />
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Upload New Property</h2>
        <PropertyUploader />
      </section>
    </div>
  )
}

export default CRMMainPage
