import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Match } from '../../hooks/useMatching';
import { useClients } from '../../hooks/useClients';
import { useProperties } from '../../hooks/useProperties';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface MatchListProps {
  clientId?: string;
  propertyId?: string;
  profileId?: string;
  limit?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  onMatchSelect?: (match: Match) => void;
}

export default function MatchList({
  clientId,
  propertyId,
  profileId,
  limit = 0,
  showFilters = true,
  showSearch = true,
  onMatchSelect
}: MatchListProps) {
  const { clients } = useClients();
  const { properties } = useProperties();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  
  useEffect(() => {
    fetchMatches();
  }, [clientId, propertyId, profileId]);
  
  const fetchMatches = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('matches')
        .select('*, property:properties(*), client:clients(*), profile:purchase_profiles(*)');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      
      const { data, error } = await query.order('score', { ascending: false });
      
      if (error) throw error;
      
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend';
      case 'approved':
        return 'Genehmigt';
      case 'rejected':
        return 'Abgelehnt';
      case 'contacted':
        return 'Kontaktiert';
      default:
        return status;
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Filter matches based on search term, status, and score
  const filteredMatches = matches.filter(match => {
    const clientName = match.client?.name?.toLowerCase() || '';
    const propertyTitle = match.property?.title?.toLowerCase() || '';
    const profileName = match.profile?.name?.toLowerCase() || '';
    
    const matchesSearch = 
      searchTerm === '' ||
      clientName.includes(searchTerm.toLowerCase()) ||
      propertyTitle.includes(searchTerm.toLowerCase()) ||
      profileName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    
    const matchesScore = 
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && match.score >= 80) ||
      (scoreFilter === 'medium' && match.score >= 60 && match.score < 80) ||
      (scoreFilter === 'low' && match.score < 60);
    
    return matchesSearch && matchesStatus && matchesScore;
  });
  
  // Sort matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'score') {
      comparison = a.score - b.score;
    } else if (sortField === 'date') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === 'client') {
      comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
    } else if (sortField === 'property') {
      comparison = (a.property?.title || '').localeCompare(b.property?.title || '');
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });
  
  // Limit the number of matches if specified
  const displayedMatches = limit > 0 ? sortedMatches.slice(0, limit) : sortedMatches;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div>
      {(showSearch || showFilters) && (
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          {showSearch && (
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Suche nach Kunde, Immobilie oder Profil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          {showFilters && (
            <>
              <div className="sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Alle Status</option>
                    <option value="pending">Ausstehend</option>
                    <option value="approved">Genehmigt</option>
                    <option value="rejected">Abgelehnt</option>
                    <option value="contacted">Kontaktiert</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:w-48">
                <select
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                >
                  <option value="all">Alle Scores</option>
                  <option value="high">Hoch (80-100%)</option>
                  <option value="medium">Mittel (60-79%)</option>
                  <option value="low">Niedrig (0-59%)</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
      
      {displayedMatches.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">Keine Matches gefunden.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('client')}
                >
                  <div className="flex items-center">
                    Kunde
                    {sortField === 'client' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('property')}
                >
                  <div className="flex items-center">
                    Immobilie
                    {sortField === 'property' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center">
                    Score
                    {sortField === 'score' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Datum
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedMatches.map((match) => (
                <tr 
                  key={match.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onMatchSelect && onMatchSelect(match)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {match.client && (
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/clients/${match.client.id}`} className="hover:text-indigo-600">
                          {match.client.name}
                        </Link>
                      </div>
                    )}
                    {match.profile && (
                      <div className="text-sm text-gray-500">{match.profile.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {match.property && (
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/properties/${match.property.id}`} className="hover:text-indigo-600">
                          {match.property.title}
                        </Link>
                      </div>
                    )}
                    {match.property && match.property.address && (
                      <div className="text-sm text-gray-500">{match.property.address}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            match.score >= 80 ? 'bg-green-500' :
                            match.score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${match.score}%` }}
                        ></div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(match.score)}`}>
                        {match.score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(match.status)}`}>
                      {match.status === 'pending' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {match.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {match.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {match.status === 'contacted' && <MessageSquare className="h-3 w-3 mr-1" />}
                      {getStatusLabel(match.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(match.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/matching/${match.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
