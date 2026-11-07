import React from 'react';
import { format } from 'date-fns';

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden border border-border">
      {announcement.imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={announcement.imageUrl}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text-main mb-2">
          {announcement.title}
        </h3>
        <p className="text-text-sub mb-4">{announcement.description}</p>
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Posted by {announcement.createdBy?.name || 'Admin'}</span>
          <span>{format(new Date(announcement.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard; 