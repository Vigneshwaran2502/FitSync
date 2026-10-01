import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Search, Users, ActivitySquare, Calendar } from 'lucide-react';

const TrainerMembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/trainers/my/members');
        setMembers(res.data.data);
      } catch (error) {
        toast.error('Failed to load your assigned members');
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Members</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border shadow-sm"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full">Loading members...</p>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center bg-white rounded-xl border border-gray-100">
            <Users className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">You don't have any members assigned yet.</p>
          </div>
        ) : filteredMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
             <div className="flex items-center mb-4">
               <div className="h-14 w-14 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl mr-4">
                 {member.name.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                 <p className="text-sm text-gray-500">{member.email}</p>
                 <p className="text-sm text-gray-500">{member.phone}</p>
               </div>
             </div>
             
             <div className="mt-4 flex gap-2 w-full">
               <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                 <ActivitySquare size={16} className="mr-1.5 text-primary-600" /> Progress
               </button>
               <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                 <Calendar size={16} className="mr-1.5 text-indigo-600" /> Book
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerMembersList;
