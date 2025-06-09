import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle, XCircle } from 'lucide-react';

const CloudAccounts = () => {
  const [selectedCloud, setSelectedCloud] = useState(null);

  useEffect(() => {
    const cloud = localStorage.getItem('selectedCloud');
    setSelectedCloud(cloud);
  }, []);

  const accounts = [
    {
      id: 'Google Drive',
      name: 'Google Drive',
      storageUsed: '0 GB',
      totalStorage: '15 GB'
    },
    {
      id: 'Dropbox',
      name: 'Dropbox',
      storageUsed: '0 GB',
      totalStorage: '5 GB'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-[#006A71] mb-4">Connected Cloud Accounts</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map(account => (
          <div key={account.id} className="border rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Cloud size={24} className="text-[#48A6A7]" />
                <span className="font-medium">{account.name}</span>
              </div>

              {selectedCloud === account.id ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
            </div>

            {selectedCloud === account.id ? (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  {account.storageUsed} used of {account.totalStorage}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-[#48A6A7] h-2 rounded-full"
                    style={{ width: `${(parseFloat(account.storageUsed) / parseFloat(account.totalStorage.split(' ')[0]) * 100)}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Connect your {account.name} account to access your files.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudAccounts;
