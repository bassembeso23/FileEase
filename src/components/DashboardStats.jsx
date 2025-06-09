import React from 'react';
import { HardDrive, FileText, Cloud, Clock } from 'lucide-react';
import { useCloud } from '../contexts/CloudContext';

const StatsCard = ({ icon, title, value, unit }) => {
  return (
    <div className="stats-card flex items-center">
      <div className={`rounded-full p-3 bg-white/60 mr-3`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold">{value} <span className="text-sm font-normal">{unit}</span></h3>
        <p className="text-sm text-[#006A71]/80">{title}</p>
      </div>
    </div>
  );
};

const DashboardStats = () => {
  const { stats } = useCloud();

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        icon={<HardDrive size={24} />}
        title="Storage Used"
        value={formatSize(stats.totalSize)}
        unit=""
      />
      <StatsCard
        icon={<FileText size={24} />}
        title="Total Files"
        value={stats.totalFiles}
        unit="files"
      />
      <StatsCard
        icon={<Cloud size={24} />}
        title="Folders"
        value={stats.totalFolders}
        unit=""
      />
      <StatsCard
        icon={<Clock size={24} />}
        title="Recent Files"
        value={stats.recentFiles}
        unit="today"
      />
    </div>
  );
};

export default DashboardStats;
