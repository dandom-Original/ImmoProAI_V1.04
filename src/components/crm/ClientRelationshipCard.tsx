import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Mail, Phone, Users, FileText, MapPin, FileCheck, AlertTriangle } from 'lucide-react';
import RelationshipStageSelector from './RelationshipStageSelector';
import type { Database } from '../../lib/database.types';

type ClientRelationship = Database['public']['Tables']['client_relationships']['Row'];

interface ClientRelationshipCardProps {
  relationship: ClientRelationship | null;
  onUpdateStage: (stage: string) => Promise<void>;
  isLoading: boolean;
}

const ClientRelationshipCard: React.FC<ClientRelationshipCardProps> = ({
  relationship,
  onUpdateStage,
  isLoading
}) => {
  const [updating, setUpdating] = useState(false);

  const handleStageChange = async (stage: string) => {
    try {
      setUpdating(true);
      await onUpdateStage(stage);
    } finally {
      setUpdating(false);
    }
  };

  const getLastContactIcon = (contactType: string | null) => {
    if (!contactType) return null;
    
    switch (contactType) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'call':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'meeting':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'site_visit':
        return <MapPin className="h-5 w-5 text-red-500" />;
      case 'proposal':
        return <FileCheck className="h-5 w-5 text-orange-500" />;
      case 'contract':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Client Relationship</h3>
        <p className="mt-2 text-sm text-gray-500">
          No relationship data available for this client yet. Record your first interaction to start tracking the relationship.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">Client Relationship</h3>
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${getScoreColor(relationship.relationship_score || 0)}`}>
            {relationship.relationship_score || 0}
          </span>
          <span className="text-sm text-gray-500 ml-1">/100</span>
        </div>
      </div>
      
      <div className="mt-4">
        <RelationshipStageSelector
          currentStage={relationship.relationship_stage || 'new'}
          onChange={handleStageChange}
          isLoading={updating}
        />
      </div>
      
      {relationship.last_contact_date && (
        <div className="mt-4 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            {getLastContactIcon(relationship.last_contact_type)}
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">Last Contact</h4>
            <div className="mt-1 text-sm text-gray-600">
              <p>
                {relationship.last_contact_type && (
                  <span className="capitalize">{relationship.last_contact_type}</span>
                )} on {format(new Date(relationship.last_contact_date), 'PPP', { locale: de })}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {relationship.next_follow_up && (
        <div className="mt-4 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">Next Follow-up</h4>
            <div className="mt-1 text-sm text-gray-600">
              <p>
                Scheduled for {format(new Date(relationship.next_follow_up), 'PPP', { locale: de })}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {relationship.notes && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900">Relationship Notes</h4>
          <div className="mt-1 text-sm text-gray-600">
            <p>{relationship.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRelationshipCard;
