import React from 'react';
import { X } from 'lucide-react';

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
  standard?: boolean;
  created_at?: string;
}

interface TagBadgeProps {
  tag: Tag;
  removable?: boolean;
  onRemove?: () => void;
}

export default function TagBadge({ tag, removable = false, onRemove }: TagBadgeProps) {
  const getColorClasses = (color?: string) => {
    const colorMap: Record<string, { bg: string, text: string, hover: string }> = {
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-200' },
      red: { bg: 'bg-red-100', text: 'text-red-800', hover: 'hover:bg-red-200' },
      green: { bg: 'bg-green-100', text: 'text-green-800', hover: 'hover:bg-green-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', hover: 'hover:bg-yellow-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', hover: 'hover:bg-purple-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-800', hover: 'hover:bg-pink-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-800', hover: 'hover:bg-gray-200' }
    };
    
    return colorMap[color || 'indigo'] || colorMap.indigo;
  };
  
  const { bg, text, hover } = getColorClasses(tag.color);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {tag.category && (
        <span className="text-gray-500 mr-1">{tag.category}:</span>
      )}
      {tag.name}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={`flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center ${text} ${hover} focus:outline-none`}
        >
          <span className="sr-only">Remove {tag.name}</span>
          <X className="h-2 w-2" />
        </button>
      )}
    </span>
  );
}
