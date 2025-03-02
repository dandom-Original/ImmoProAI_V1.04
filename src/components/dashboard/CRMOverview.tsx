import React, { useEffect, useState } from 'react'
import advancedDataCollector from '../../services/AdvancedDataCollector'
import advancedMatchingService from '../../services/AdvancedMatchingService'

interface InvestorProfile {
  id: number
  name: string
  criteria: string
}

interface Property {
  id: number
  type: string
  description: string
}

const CRMOverview: React.FC = () => {
  const [profiles, setProfiles] = useState<InvestorProfile[]>([])
  const [pressItems, setPressItems] = useState<any[]>([])
  const [matchingResults, setMatchingResults] = useState<any[]>([])
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Erweiterte Zustände für zusätzliche Analysen
  const [marketTrends, setMarketTrends] = useState<any[]>([])
  const [investorAnalysis, setInvestorAnalysis] = useState<any>(null)

  // Daten (Investorenprofile und Presstexte) asynchron abrufen
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const profilesData = await advancedDataCollector.fetchInvestmentProfiles()
        setProfiles(profilesData as InvestorProfile<boltArtifact id="crm-overview-extended" title="Erweiterte CRMOverview.tsx">
  <boltAction type="file" filePath="src/components/dashboard/CRMOverview.tsx">import React, { useEffect, useState } from 'react'
import advancedDataCollector from '../../services/AdvancedDataCollector'
import advancedMatchingService from '../../services/AdvancedMatchingService'

interface InvestorProfile {
  id: number
  name: string
  criteria: string
}

interface Property {
  id: number
  type: string
  description: string
}

const CRMOverview: React.FC = () => {
  const [profiles, setProfiles] = useState<InvestorProfile[]>([])
  const [pressItems, setPressItems] = useState<any[]>([])
  const [matchingResults, setMatchingResults] = useState<any[]>([])
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketTrends, setMarketTrends] = useState<any[]>([])
  const [investorAnalysis, setInvestorAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const profilesData = await advancedDataCollector.fetchInvestmentProfiles()
        setProfiles(profilesData as InvestorProfile[])
        const pressData = await advancedDataCollector.processPressAndNews()
        setPressItems(pressData as any[])
        const trendsData = await advancedDataCollector.fetchMarketTrends()
        setMarketTrends(trendsData as any[])
        const analysisData = await advancedDataCollector.analyzeInvestorBehavior()
        setInvestorAnalysis(analysisData)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (property && profiles.length > 0) {
      const basicMatches = advancedMatchingService.matchPropertyWithInvestors(property, profiles)
      const multiCriteriaMatches = advancedMatchingService.matchByMultipleCriteria(property, profiles)
      // Merge und Zusammenführung der Ergebnisse (höchster Score wird priorisiert)
      const mergedMatches = [...basicMatches]
      multiCriteriaMatches.forEach((match) => {
        const existingMatch = mergedMatches.find((m) => m.investor.id === match.investor.id)
        if (existingMatch) {
          existingMatch.score = Math.max(existingMatch.score, match.score)
        } else {
          mergedMatches.push(match)
        }
      })
      setMatchingResults(mergedMatches.sort((a, b) => b.score - a.score))
    }
  }, [property, profiles])

  const handleSetDummyProperty = () => {
    setProperty({ id: 1, type: 'Residential', description: '4 bedroom lovely home with garden and modern amenities' })
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CRM Overview</h1>
      {isLoading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSetDummyProperty}
        >
          Set Dummy Property for Matching
        </button>
      </div>
      {property && (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold">Property Details</h2>
          <p>ID: {property.id}</p>
          <p>Type: {property.type}</p>
          <p>Description: {property.description}</p>
        </div>
      )}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Investor Profiles</h2>
        {profiles.length > 0 ? (
          <ul className="list-disc ml-5">
            {profiles.map((p) => (
              <li key={p.id}>
                {p.name} – Criteria: {p.criteria}
              </li>
            ))}
          </ul>
        ) : (
          <p>No investor profiles available.</p>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Press News</h2>
        {pressItems.length > 0 ? (
          <ul className="list-disc ml-5">
            {pressItems.map((item: any) => (
              <li key={item.id}>{item.headline}</li>
            ))}
          </ul>
        ) : (
          <p>No press news available.</p>
        )}
      </div>
      {matchingResults.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Matching Results</h2>
          <ul className="list-disc ml-5">
            {matchingResults.map((result, index) => (
              <li key={index}>
                Investor: {result.investor.name} (Score: {result.score})
              </li>
            ))}
          </ul>
        </div>
      )}
      {marketTrends.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Market Trends</h2>
          <ul className="list-disc ml-5">
            {marketTrends.map((trend: any) => (
              <li key={trend.id}>{trend.trend}</li>
            ))}
          </ul>
        </div>
      )}
      {investorAnalysis && (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold">Investor Behavior Analysis</h2>
          <p><strong>Risk Appetite:</strong> {investorAnalysis.riskAppetite}</p>
          <p><strong>Investment Frequency:</strong> {investorAnalysis.investmentFrequency}</p>
          <p><strong>Insights:</strong> {investorAnalysis.insights}</p>
        </div>
      )}
    </div>
  )
}

export default CRMOverview
