import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useMatches } from '../hooks/useMatches';
import { useClients } from '../hooks/useClients';
import { useProperties } from '../hooks/useProperties';
import { 
  GitCompare, 
  Building, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Zap,
  Clock,
  Tag,
  FileText,
  Download,
  Share2,
  Phone,
  Mail,
  Globe,
  MapPin,
  DollarSign,
  Maximize,
  Star
} from 'lucide-react';
import { MatchingService } from '../services/MatchingService';

const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateMatch, deleteMatch } = useMatches();
  const { clients } = useClients();
  const { properties } = useProperties();
  
  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [client, setClient] = useState<any | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [potentialClients, setPotentialClients] = useState<any[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch match data
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();
        
        if (matchError) throw matchError;
        if (!matchData) throw new Error('Match not found');
        
        setMatch(matchData);
        setNotes(matchData.notes || '');
        
        // Fetch client data
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', matchData.client_id)
          .single();
        
        if (clientData) setClient(clientData);
        
        // Fetch property data
        const { data: propertyData } = await supabase
          .from('properties')
          .select('*')
          .eq('id', matchData.property_id)
          .single();
        
        if (propertyData) {
          setProperty(propertyData);
          
          // Fetch similar properties
          const { data: similarProps } = await supabase
            .from('properties')
            .select('id, title, address, city, price, images')
            .eq('property_type', propertyData.property_type)
            .neq('id', propertyData.id)
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (similarProps) setSimilarProperties(similarProps);
        }
        
        // Fetch potential clients for this property
        if (propertyData) {
          const { data: potentialClientsData } = await supabase
            .from('clients')
            .select('id, name, company, email')
            .neq('id', matchData.client_id)
            .eq('status', 'active')
            .limit(3);
          
          if (potentialClientsData) setPotentialClients(potentialClientsData);
        }
        
        // Fetch activity log
        const { data: logData } = await supabase
          .from('notifications')
          .select('*')
          .eq('entity_id', id)
          .eq('entity_type', 'match')
          .order('created_at', { ascending: false });
        
        if (logData && logData.length > 0) {
          setActivityLog(logData);
        } else {
          // If no log entries exist, create default ones
          setActivityLog([
            {
              id: '1',
              title: 'Match created',
              message: 'Match was automatically created by the system',
              created_at: matchData.created_at,
              type: 'info'
            },
            {
              id: '2',
              title: `Match score: ${matchData.score}%`,
              message: `The match received a score of ${matchData.score}%`,
              created_at: matchData.created_at,
              type: 'info'
            }
          ]);
        }
        
      } catch (err) {
        console.error('Error fetching match details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchDetails();
  }, [id]);
  
  const handleStatusChange = async (newStatus: string) => {
    if (!match) return;
    
    try {
      const updatedMatch = await updateMatch(match.id, { status: newStatus });
      setMatch(updatedMatch);
      
      // Create notification/activity log entry
      const notification = {
        title: `Status changed to ${newStatus}`,
        message: `Match status was updated to ${newStatus}`,
        type: 'info',
        entity_id: match.id,
        entity_type: 'match',
        action_url: `/matching/${match.id}`
      };
      
      await supabase.from('notifications').insert(notification);
      
      // Add to activity log
      setActivityLog(prev => [
        {
          id: Date.now().toString(),
          title: `Status changed to ${newStatus}`,
          message: `Match status was updated to ${newStatus}`,
          created_at: new Date().toISOString(),
          type: 'info'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Error updating match status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };
  
  const handleSaveNotes = async () => {
    if (!match) return;
    
    try {
      const updatedMatch = await updateMatch(match.id, { notes });
      setMatch(updatedMatch);
      setEditingNotes(false);
      
      // Create notification/activity log entry
      const notification = {
        title: 'Notes updated',
        message: 'Match notes were updated',
        type: 'info',
        entity_id: match.id,
        entity_type: 'match',
        action_url: `/matching/${match.id}`
      };
      
      await supabase.from('notifications').insert(notification);
      
      // Add to activity log
      setActivityLog(prev => [
        {
          id: Date.now().toString(),
          title: 'Notes updated',
          message: 'Match notes were updated',
          created_at: new Date().toISOString(),
          type: 'info'
        },
        ...prev
      ]);
    } catch (err) {
      console.error('Error updating notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    }
  };
  
  const handleDeleteMatch = async () => {
    if (!match || !window.confirm('Are you sure you want to delete this match?')) return;
    
    try {
      await deleteMatch(match.id);
      
      // Create notification
      const notification = {
        title: 'Match deleted',
        message: `Match between ${client?.name} and property ${property?.title} was deleted`,
        type: 'warning',
        entity_type: 'match'
      };
      
      await supabase.from('notifications').insert(notification);
      
      navigate('/matching');
    } catch (err) {
      console.error('Error deleting match:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete match');
    }
  };
  
  const handleSendMessage = async () => {
    if (!match || !client || !contactMessage.trim()) return;
    
    try {
      // In a real app, this would send an email or message
      // For now, we'll just create a notification
      const notification = {
        title: 'Message sent to client',
        message: `Message regarding property ${property?.title} was sent to ${client?.name}`,
        type: 'info',
        entity_id: match.id,
        entity_type: 'match',
        action_url: `/matching/${match.id}`
      };
      
      await supabase.from('notifications').insert(notification);
      
      // Add to activity log
      setActivityLog(prev => [
        {
          id: Date.now().toString(),
          title: 'Message sent to client',
          message: `Message regarding property ${property?.title} was sent to ${client?.name}`,
          created_at: new Date().toISOString(),
          type: 'info'
        },
        ...prev
      ]);
      
      setContactMessage('');
      setShowContactForm(false);
      
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };
  
  const handleRecalculateScore = async () => {
    if (!match || !client || !property) return;
    
    try {
      setLoading(true);
      
      // Use the MatchingService to recalculate the score
      const matchScore = MatchingService.calculateMatchScore(client, property);
      
      // Update the match with the new score
      const updatedMatch = await updateMatch(match.id, {
        score: matchScore.score,
        match_reasons: matchScore.matchReasons,
        concerns: matchScore.concerns
      });
      
      setMatch(updatedMatch);
      
      // Create notification/activity log entry
      const notification = {
        title: 'Match score recalculated',
        message: `Match score was recalculated: ${matchScore.score}%`,
        type: 'info',
        entity_id: match.id,
        entity_type: 'match',
        action_url: `/matching/${match.id}`
      };
      
      await supabase.from('notifications').insert(notification);
      
      // Add to activity log
      setActivityLog(prev => [
        {
          id: Date.now().toString(),
          title: 'Match score recalculated',
          message: `Match score was recalculated: ${matchScore.score}%`,
          created_at: new Date().toISOString(),
          type: 'info'
        },
        ...prev
      ]);
      
      alert(`Match score recalculated: ${matchScore.score}%`);
    } catch (err) {
      console.error('Error recalculating match score:', err);
      setError(err instanceof Error ? err.message : 'Failed to recalculate match score');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateReport = () => {
    if (!match || !client || !property) return;
    
    // In a real app, this would generate a PDF report
    // For now, we'll just show an alert
    alert('Report generation would be implemented here in a production environment.');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Match not found</p>
        <Link to="/matching" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Matches
        </Link>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/matching" className="inline-flex items-center text-indigo-600 hover:text-indigo-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Matches
        </Link>
      </div>
      
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            <GitCompare className="inline-block h-8 w-8 mr-2 text-indigo-500" />
            Match Details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {client?.name} × {property?.title}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            onClick={handleRecalculateScore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Zap className="h-4 w-4 mr-2 text-gray-500" />
            Recalculate Score
          </button>
          
          <button
            type="button"
            onClick={handleGenerateReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
            Generate Report
          </button>
          
          <button
            type="button"
            onClick={() => setShowContactForm(!showContactForm)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
            Contact Client
          </button>
          
          <button
            type="button"
            onClick={handleDeleteMatch}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Trash2 className="h-4 w-4 mr-2 text-gray-500" />
            Delete Match
          </button>
          
          {match.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('active')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Match
              </button>
              
              <button
                type="button"
                onClick={() => handleStatusChange('rejected')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Reject Match
              </button>
            </>
          )}
          
          {match.status === 'active' && (
            <button
              type="button"
              onClick={() => handleStatusChange('completed')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </button>
          )}
        </div>
      </div>
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Contact {client?.name}</h3>
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder={`Hello ${client?.name},\n\nI'd like to discuss the property at ${property?.address} with you.`}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Match Overview */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg col-span-2">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Match Overview</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about this client-property match.</p>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                match.status === 'active' ? 'bg-green-100 text-green-800' :
                match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                match.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Match Score</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          match.score >= 80 ? 'bg-green-500' :
                          match.score >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${match.score}%` }}
                      ></div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      match.score >= 80 ? 'bg-green-100 text-green-800' :
                      match.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {match.score}%
                    </span>
                  </div>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {client ? (
                    <Link to={`/clients/${client.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {client.name} ({client.company})
                    </Link>
                  ) : (
                    'Loading client information...'
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Property</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {property ? (
                    <Link to={`/properties/${property.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {property.title} - {property.address}, {property.city}
                    </Link>
                  ) : (
                    'Loading property information...'
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(match.created_at).toLocaleString()}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Match Reasons</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {match.match_reasons && match.match_reasons.length > 0 ? (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {match.match_reasons.map((reason: string, index: number) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No match reasons provided</p>
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Concerns</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {match.concerns && match.concerns.length > 0 ? (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {match.concerns.map((concern: string, index: number) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No concerns identified</p>
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <div className="flex items-center">
                    Notes
                    {!editingNotes && (
                      <button
                        type="button"
                        onClick={() => setEditingNotes(true)}
                        className="ml-2 text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editingNotes ? (
                    <div>
                      <textarea
                        rows={4}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div className="mt-2 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setNotes(match.notes || '');
                            setEditingNotes(false);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={notes ? 'whitespace-pre-line' : 'text-gray-500 italic'}>
                      {notes || 'No notes added yet'}
                    </p>
                  )}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Documents</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <Link to={`/documents?entity_id=${match.id}&entity_type=match`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    View related documents
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Activity Log */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Log</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Recent activity for this match.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <ul className="space-y-4">
              {activityLog.map((activity) => (
                <li key={activity.id} className="relative pb-4">
                  {/* Timeline connector */}
                  <div className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                  
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        {activity.type === 'info' && <Clock className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                        {activity.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {activity.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{activity.message}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Client and Property Details */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client Details */}
        {client && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <User className="inline-block h-5 w-5 mr-2 text-indigo-500" />
                  Client Details
                </h3>
              </div>
              <Link
                to={`/clients/${client.id}`}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View Full Profile
              </Link>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.company}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a href={`mailto:${client.email}`} className="text-indigo-600 hover:text-indigo-900">
                      <Mail className="inline-block h-4 w-4 mr-1" />
                      {client.email}
                    </a>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.phone ? (
                      <a href={`tel:${client.phone}`} className="text-indigo-600 hover:text-indigo-900">
                        <Phone className="inline-block h-4 w-4 mr-1" />
                        {client.phone}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.website ? (
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                        <Globe className="inline-block h-4 w-4 mr-1" />
                        {client.website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' :
                      client.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
        
        {/* Property Details */}
        {property && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  <Building className="inline-block h-5 w-5 mr-2 text-indigo-500" />
                  Property Details
                </h3>
              </div>
              <Link
                to={`/properties/${property.id}`}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View Full Listing
              </Link>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{property.title}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-1 mt-0.5" />
                      <span>
                        {property.address}, {property.city}, {property.country}
                        {property.postal_code && ` ${property.postal_code}`}
                      </span>
                    </div>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{property.property_type}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-1" />
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(property.price)}
                    </div>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <Maximize className="h-5 w-5 text-gray-400 mr-1" />
                      {property.size} m²
                    </div>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Features</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {property.features && property.features.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No features listed</p>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
      
      {/* Additional Recommendations */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Similar Properties */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Similar Properties</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Other properties that might interest this client.</p>
          </div>
          <div className="border-t border-gray-200">
            {similarProperties.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {similarProperties.map((prop) => (
                  <li key={prop.id} className="px-4 py-4 flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                      {prop.images && prop.images.length > 0 ? (
                        <img src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover" />
                      ) : (
                        <Building className="h-full w-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm font-medium text-gray-900">{prop.title}</div>
                      <div className="text-sm text-gray-500">{prop.address}, {prop.city}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(prop.price)}
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/properties/${prop.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                No similar properties found
              </div>
            )}
          </div>
        </div>
        
        {/* Potential Clients */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Potential Clients</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Other clients who might be interested in this property.</p>
          </div>
          <div className="border-t border-gray-200">
            {potentialClients.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {potentialClients.map((potClient) => (
                  <li key={potClient.id} className="px-4 py-4 flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium">
                        {potClient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm font-medium text-gray-900">{potClient.name}</div>
                      <div className="text-sm text-gray-500">{potClient.company}</div>
                    </div>
                    <div>
                      <Link
                        to={`/clients/${potClient.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                No potential clients found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;
