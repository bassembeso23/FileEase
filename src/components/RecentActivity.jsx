
import React from 'react';
import { FileText, Image, Upload, Download, Eye, Trash2 } from 'lucide-react';

const RecentActivity = () => {
  // Sample data - in a real app this would be fetched from an API
  const activities = [
    { id: 1, fileName: 'Project Proposal.pdf', action: 'viewed', time: '2 minutes ago', cloud: 'Google Drive' },
    { id: 2, fileName: 'Team Photo.jpg', action: 'uploaded', time: '1 hour ago', cloud: 'Dropbox' },
    { id: 3, fileName: 'Financial Report.xlsx', action: 'downloaded', time: '3 hours ago', cloud: 'Google Drive' },
    { id: 4, fileName: 'Client Contract.pdf', action: 'deleted', time: 'Yesterday', cloud: 'Terabox' },
  ];

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return <FileText size={16} className="text-red-500" />;
    if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) return <Image size={16} className="text-blue-500" />;
    return <FileText size={16} className="text-gray-500" />;
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'uploaded': return <Upload size={16} className="text-green-500" />;
      case 'downloaded': return <Download size={16} className="text-blue-500" />;
      case 'viewed': return <Eye size={16} className="text-purple-500" />;
      case 'deleted': return <Trash2 size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getCloudColor = (cloud) => {
    switch(cloud) {
      case 'Google Drive': return 'bg-blue-100 text-blue-600';
      case 'Dropbox': return 'bg-indigo-100 text-indigo-600';
      case 'Terabox': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-[#006A71] mb-4">Recent Activity</h2>
      
      <div className="divide-y">
        {activities.map(activity => (
          <div key={activity.id} className="py-3 flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-md">
              {getFileIcon(activity.fileName)}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">{activity.fileName}</div>
              <div className="text-xs text-gray-500">
                {activity.time} • 
                <span className={`ml-1 px-1.5 py-0.5 rounded-full ${getCloudColor(activity.cloud)}`}>
                  {activity.cloud}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {getActionIcon(activity.action)}
              <span className="capitalize">{activity.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
