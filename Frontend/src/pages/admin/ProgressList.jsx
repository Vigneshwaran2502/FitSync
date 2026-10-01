import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Search, UserSquare2, Target } from 'lucide-react';

const ProgressList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/admin/members');
        setMembers(res.data.data);
      } catch (error) {
        toast.error('Failed to load members for progress tracking');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Member Progress Tracker</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border shadow-sm"
            placeholder="Search members to view..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full">Loading members...</p>
        ) : filteredMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
             <div className="h-16 w-16 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl mb-4">
               {member.name.charAt(0).toUpperCase()}
             </div>
             <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
             <p className="text-sm text-gray-500 mb-6">{member.email}</p>
             <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary-600 rounded-lg shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 transition-colors">
               <Target size={18} className="mr-2" /> View Progress
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressList;
