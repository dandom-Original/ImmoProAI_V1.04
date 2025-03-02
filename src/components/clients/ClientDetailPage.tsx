import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Layout from '../Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Building, Mail, Phone, User, MapPin, Briefcase, Calendar, Edit, Trash2, ArrowLeft, Search } from 'lucide-react';
import PurchaseProfileList from './PurchaseProfileList';
import TagManager, { Tag } from '../tags/TagManager';
import { useMatching } from '../../hooks/useMatching';
import { Match } from '../../hooks/useMatching';

interface Client {
  id: string;
  name: string;
  type: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  notes: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMatchesForClient } = useMatching();
  
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [clientTags, setClientTags] = useState<Tag[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchClient(id);
      fetchMatches(id);
    }
  }, [id]);
  
  const fetchClient = async (clientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      
      setClient(data);
      setFormData(data);
      
      // Fetch tags
      const { data: tagRelations, error: tagError } = await supabase
        .from('tag_relations')
        .select('*, tag:tags(*)')
        .eq('entity_id', clientId)
        .eq('entity_type', 'client');
      
      if (tagError) throw tagError;
      
      const tags = tagRelations?.map(relation => relation.tag) || [];
      setClientTags(tags);
    } catch (error) {
      console.error('Error fetching client:', error);
      navigate('/clients');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMatches = async (clientId: string) => {
    setIsLoadingMatches(true);
    try {
      const clientMatches = await getMatchesForClient(clientId);
      setMatches(clientMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoadingMatches(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleTagsChange = (tags: Tag[]) => {
    setClientTags(tags);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      // Update client
      const { error } = await supabase
        .from('clients')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update tags
      // First, remove all existing tag relations
      await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', id)
        .eq('entity_type', 'client');
      
      // Then add new tag relations
      if (clientTags.length > 0) {
        const tagRelations = clientTags.map(tag => ({
          entity_id: id,
          entity_type: 'client',
          tag_id: tag.id
        }));
        
        await supabase
          .from('tag_relations')
          .insert(tagRelations);
      }
      
      // Refresh client data
      fetchClient(id);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!id || !window.confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    try {
      // Delete tag relations first
      await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', id)
        .eq('entity_type', 'client');
      
      // Delete purchase profiles
      const { data: profiles } = await supabase
        .from('purchase_profiles')
        .select('id')
        .eq('client_id', id);
      
      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map(p => p.id);
        
        // Delete tag relations for profiles
        await supabase
          .from('tag_relations')
          .delete()
          .eq('entity_type', 'purchase_profile')
          .in('entity_id', profileIds);
        
        // Delete profiles
        await supabase
          .from('purchase_profiles')
          .delete()
          .in('id', profileIds);
      }
      
      // Delete matches
      await supabase
        .from('matches')
        .delete()
        .eq('client_id', id);
      
      // Finally delete the client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Kunde nicht gefunden</h2>
          <p className="mt-2 text-gray-600">Der gesuchte Kunde existiert nicht oder wurde gelöscht.</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Kundenliste
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/clients')}
              className="mr-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          </div>
          
          <div className="flex space-x-3">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </button>
              </>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="details">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="profiles">Kaufprofile</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="history">Verlauf</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Kundeninformationen</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Bearbeiten Sie die Informationen des Kunden.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Typ *
                          </label>
                          <select
                            id="type"
                            name="type"
                            value={formData.type || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="company">Unternehmen</option>
                            <option value="individual">Privatperson</option>
                            <option value="institution">Institution</option>
                            <option value="fund">Fonds</option>
                            <option value="other">Sonstiges</option>
                          </select>
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3<div className="col-span-6 sm:col-span-3">
                          <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                            Ansprechpartner
                          </label>
                          <input
                            type="text"
                            name="contact_person"
                            id="contact_person"
                            value={formData.contact_person || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-Mail
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Telefon
                          </label>
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Adresse
                          </label>
                          <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-2">
                          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                            PLZ
                          </label>
                          <input
                            type="text"
                            name="postal_code"
                            id="postal_code"
                            value={formData.postal_code || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-2">
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            Stadt
                          </label>
                          <input
                            type="text"
                            name="city"
                            id="city"
                            value={formData.city || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-2">
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Land
                          </label>
                          <input
                            type="text"
                            name="country"
                            id="country"
                            value={formData.country || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notizen
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={formData.notes || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                          </label>
                          <TagManager
                            selectedTags={clientTags}
                            onTagsChange={handleTagsChange}
                            entityType="client"
                            maxTags={10}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Kundeninformationen</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Details zum Kunden und Kontaktinformationen.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                        Typ
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {client.type === 'company' && 'Unternehmen'}
                        {client.type === 'individual' && 'Privatperson'}
                        {client.type === 'institution' && 'Institution'}
                        {client.type === 'fund' && 'Fonds'}
                        {client.type === 'other' && 'Sonstiges'}
                      </dd>
                    </div>
                    
                    {client.contact_person && (
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          Ansprechpartner
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {client.contact_person}
                        </dd>
                      </div>
                    )}
                    
                    {client.email && (
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-2" />
                          E-Mail
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <a href={`mailto:${client.email}`} className="text-indigo-600 hover:text-indigo-900">
                            {client.email}
                          </a>
                        </dd>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-2" />
                          Telefon
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <a href={`tel:${client.phone}`} className="text-indigo-600 hover:text-indigo-900">
                            {client.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    
                    {(client.address || client.postal_code || client.city || client.country) && (
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                          Adresse
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {client.address && <div>{client.address}</div>}
                          {(client.postal_code || client.city) && (
                            <div>{client.postal_code} {client.city}</div>
                          )}
                          {client.country && <div>{client.country}</div>}
                        </dd>
                      </div>
                    )}
                    
                    {client.notes && (
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notizen</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                          {client.notes}
                        </dd>
                      </div>
                    )}
                    
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        Erstellt am
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(client.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                    
                    {clientTags.length > 0 && (
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Tags</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="flex flex-wrap gap-2">
                            {clientTags.map(tag => (
                              <span
                                key={tag.id}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${tag.color || 'indigo'}-100 text-${tag.color || 'indigo'}-800`}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="profiles">
            {id && <PurchaseProfileList clientId={id} />}
          </TabsContent>
          
          <TabsContent value="matches">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Immobilien-Matches</h3>
                <Link
                  to={`/matching?client=${id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Neue Matches finden
                </Link>
              </div>
              
              {isLoadingMatches ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : matches.length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <p className="text-gray-500">Keine Matches gefunden. Nutzen Sie die Matching-Funktion, um passende Immobilien zu finden.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {matches.map(match => (
                      <li key={match.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            {match.property && (
                              <>
                                <h4 className="text-lg font-medium text-indigo-600">
                                  <Link to={`/properties/${match.property.id}`}>
                                    {match.property.title}
                                  </Link>
                                </h4>
                                <p className="text-sm text-gray-500">{match.property.address}</p>
                                <div className="mt-1 flex items-center">
                                  <span className="text-sm font-medium text-gray-900">
                                    {match.property.price ? `€${match.property.price.toLocaleString('de-DE')}` : 'Preis auf Anfrage'}
                                  </span>
                                  <span className="mx-2 text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">
                                    {match.property.size} m² • {match.property.rooms} {match.property.rooms === 1 ? 'Zimmer' : 'Zimmer'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="text-2xl font-bold text-indigo-600">{match.score}%</div>
                            <div className="mt-1 w-24 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${match.score}%` }}
                              ></div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {match.profile && (
                                <span>Profil: {match.profile.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">Dokumente werden hier angezeigt.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">Verlauf wird hier angezeigt.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
