import React, { useState, useEffect } from 'react';
import { useTags } from '../../hooks/useTags';
import { TagInput } from '../tags/TagInput';
import { TagSelector } from '../tags/TagSelector';

interface PurchaseProfileFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  clientId: string;
  isLoading?: boolean;
}

export function PurchaseProfileForm({
  initialData,
  onSubmit,
  onCancel,
  clientId,
  isLoading = false
}: PurchaseProfileFormProps) {
  const { categories } = useTags();
  
  // Find category IDs by name
  const propertyTypeCategory = categories.find(c => c.name === 'Property Type')?.id || '';
  const locationCategory = categories.find(c => c.name === 'Location')?.id || '';
  const investmentStrategyCategory = categories.find(c => c.name === 'Investment Strategy')?.id || '';
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    status: 'active',
    min_investment_volume: '',
    max_investment_volume: '',
    min_gross_initial_yield: '',
    max_gross_initial_yield: '',
    min_target_yield: '',
    max_target_yield: '',
    min_plot_area: '',
    max_plot_area: '',
    min_gross_floor_area: '',
    max_gross_floor_area: '',
    min_construction_year: '',
    max_construction_year: '',
    heritage_protection: false,
    min_residential_units: '',
    max_residential_units: '',
    min_commercial_units: '',
    max_commercial_units: '',
    notes: '',
    property_type_tags: [] as string[],
    location_tags: [] as string[],
    investment_strategy_tags: [] as string[]
  });
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        status: initialData.status || 'active',
        min_investment_volume: initialData.min_investment_volume?.toString() || '',
        max_investment_volume: initialData.max_investment_volume?.toString() || '',
        min_gross_initial_yield: initialData.min_gross_initial_yield?.toString() || '',
        max_gross_initial_yield: initialData.max_gross_initial_yield?.toString() || '',
        min_target_yield: initialData.min_target_yield?.toString() || '',
        max_target_yield: initialData.max_target_yield?.toString() || '',
        min_plot_area: initialData.min_plot_area?.toString() || '',
        max_plot_area: initialData.max_plot_area?.toString() || '',
        min_gross_floor_area: initialData.min_gross_floor_area?.toString() || '',
        max_gross_floor_area: initialData.max_gross_floor_area?.toString() || '',
        min_construction_year: initialData.min_construction_year?.toString() || '',
        max_construction_year: initialData.max_construction_year?.toString() || '',
        heritage_protection: initialData.heritage_protection || false,
        min_residential_units: initialData.min_residential_units?.toString() || '',
        max_residential_units: initialData.max_residential_units?.toString() || '',
        min_commercial_units: initialData.min_commercial_units?.toString() || '',
        max_commercial_units: initialData.max_commercial_units?.toString() || '',
        notes: initialData.notes || '',
        property_type_tags: [],
        location_tags: [],
        investment_strategy_tags: []
      });
    }
  }, [initialData]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to appropriate types
    const processedData = {
      ...formData,
      client_id: clientId,
      min_investment_volume: formData.min_investment_volume ? parseFloat(formData.min_investment_volume) : null,
      max_investment_volume: formData.max_investment_volume ? parseFloat(formData.max_investment_volume) : null,
      min_gross_initial_yield: formData.min_gross_initial_yield ? parseFloat(formData.min_gross_initial_yield) : null,
      max_gross_initial_yield: formData.max_gross_initial_yield ? parseFloat(formData.max_gross_initial_yield) : null,
      min_target_yield: formData.min_target_yield ? parseFloat(formData.min_target_yield) : null,
      max_target_yield: formData.max_target_yield ? parseFloat(formData.max_target_yield) : null,
      min_plot_area: formData.min_plot_area ? parseFloat(formData.min_plot_area) : null,
      max_plot_area: formData.max_plot_area ? parseFloat(formData.max_plot_area) : null,
      min_gross_floor_area: formData.min_gross_floor_area ? parseFloat(formData.min_gross_floor_area) : null,
      max_gross_floor_area: formData.max_gross_floor_area ? parseFloat(formData.max_gross_floor_area) : null,
      min_construction_year: formData.min_construction_year ? parseInt(formData.min_construction_year) : null,
      max_construction_year: formData.max_construction_year ? parseInt(formData.max_construction_year) : null,
      min_residential_units: formData.min_residential_units ? parseInt(formData.min_residential_units) : null,
      max_residential_units: formData.max_residential_units ? parseInt(formData.max_residential_units) : null,
      min_commercial_units: formData.min_commercial_units ? parseInt(formData.min_commercial_units) : null,
      max_commercial_units: formData.max_commercial_units ? parseInt(formData.max_commercial_units) : null,
      
      // Include tag information
      investment_strategies: formData.investment_strategy_tags.length > 0 ? formData.investment_strategy_tags : null,
      
      // Location criteria as JSON
      location_criteria: formData.location_tags.length > 0 ? {
        tagIds: formData.location_tags
      } : null,
      
      // Property type as the first selected property type tag
      property_type_id: formData.property_type_tags.length > 0 ? formData.property_type_tags[0] : null
    };
    
    onSubmit(processedData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Profile Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Type & Location</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <TagSelector
              selectedTags={formData.property_type_tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, property_type_tags: tags }))}
              categoryId={propertyTypeCategory}
              placeholder="Select property types..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locations
            </label>
            <TagSelector
              selectedTags={formData.location_tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, location_tags: tags }))}
              categoryId={locationCategory}
              placeholder="Select locations..."
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Parameters</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="min_investment_volume" className="block text-sm font-medium text-gray-700">
              Min Investment Volume (€)
            </label>
            <input
              type="number"
              name="min_investment_volume"
              id="min_investment_volume"
              value={formData.min_investment_volume}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_investment_volume" className="block text-sm font-medium text-gray-700">
              Max Investment Volume (€)
            </label>
            <input
              type="number"
              name="max_investment_volume"
              id="max_investment_volume"
              value={formData.max_investment_volume}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="min_gross_initial_yield" className="block text-sm font-medium text-gray-700">
              Min Gross Initial Yield (%)
            </label>
            <input
              type="number"
              name="min_gross_initial_yield"
              id="min_gross_initial_yield"
              value={formData.min_gross_initial_yield}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_gross_initial_yield" className="block text-sm font-medium text-gray-700">
              Max Gross Initial Yield (%)
            </label>
            <input
              type="number"
              name="max_gross_initial_yield"
              id="max_gross_initial_yield"
              value={formData.max_gross_initial_yield}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="min_target_yield" className="block text-sm font-medium text-gray-700">
              Min Target Yield (%)
            </label>
            <input
              type="number"
              name="min_target_yield"
              id="min_target_yield"
              value={formData.min_target_yield}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_target_yield" className="block text-sm font-medium text-gray-700">
              Max Target Yield (%)
            </label>
            <input
              type="number"
              name="max_target_yield"
              id="max_target_yield"
              value={formData.max_target_yield}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Strategies
            </label>
            <TagSelector
              selectedTags={formData.investment_strategy_tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, investment_strategy_tags: tags }))}
              categoryId={investmentStrategyCategory}
              placeholder="Select investment strategies..."
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Specifications</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="min_plot_area" className="block text-sm font-medium text-gray-700">
              Min Plot Area (m²)
            </label>
            <input
              type="number"
              name="min_plot_area"
              id="min_plot_area"
              value={formData.min_plot_area}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_plot_area" className="block text-sm font-medium text-gray-700">
              Max Plot Area (m²)
            </label>
            <input
              type="number"
              name="max_plot_area"
              id="max_plot_area"
              value={formData.max_plot_area}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="min_gross_floor_area" className="block text-sm font-medium text-gray-700">
              Min Gross Floor Area (m²)
            </label>
            <input
              type="number"
              name="min_gross_floor_area"
              id="min_gross_floor_area"
              value={formData.min_gross_floor_area}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_gross_floor_area" className="block text-sm font-medium text-gray-700">
              Max Gross Floor Area (m²)
            </label>
            <input
              type="number"
              name="max_gross_floor_area"
              id="max_gross_floor_area"
              value={formData.max_gross_floor_area}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="min_construction_year" className="block text-sm font-medium text-gray-700">
              Min Construction Year
            </label>
            <input
              type="number"
              name="min_construction_year"
              id="min_construction_year"
              value={formData.min_construction_year}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_construction_year" className="block text-sm font-medium text-gray-700">
              Max Construction Year
            </label>
            <input
              type="number"
              name="max_construction_year"
              id="max_construction_year"
              value={formData.max_construction_year}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="heritage_protection"
              name="heritage_protection"
              type="checkbox"
              checked={formData.heritage_protection}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="heritage_protection" className="ml-2 block text-sm text-gray-900">
              Heritage Protection Acceptable
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Units</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="min_residential_units" className="block text-sm font-medium text-gray-700">
              Min Residential Units
            </label>
            <input
              type="number"
              name="min_residential_units"
              id="min_residential_units"
              value={formData.min_residential_units}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_residential_units" className="block text-sm font-medium text-gray-700">
              Max Residential Units
            </label>
            <input
              type="number"
              name="max_residential_units"
              id="max_residential_units"
              value={formData.max_residential_units}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="min_commercial_units" className="block text-sm font-medium text-gray-700">
              Min Commercial Units
            </label>
            <input
              type="number"
              name="min_commercial_units"
              id="min_commercial_units"
              value={formData.min_commercial_units}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="max_commercial_units" className="block text-sm font-medium text-gray-700">
              Max Commercial Units
            </label>
            <input
              type="number"
              name="max_commercial_units"
              id="max_commercial_units"
              value={formData.max_commercial_units}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
