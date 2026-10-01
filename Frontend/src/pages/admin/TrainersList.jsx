import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, MoreVertical, ShieldCheck, UserSquare2 } from 'lucide-react';
import { toast } from 'react-toastify';

const TrainersList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await api.get('/trainers'); // Using existing backend endpoint
        setTrainers(res.data.data);
      } catch (error) {
        toast.error('Failed to load trainers');
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const filteredTrainers = trainers.filter(t => 
    t.userId?.name.toLowerCase().includes(search.toLowerCase()) || 
    t.userId?.email.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trainers</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border shadow-sm"
            placeholder="Search trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredTrainers.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center bg-white rounded-xl border border-gray-100">
            <UserSquare2 className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No trainers found</p>
          </div>
        ) : (
          filteredTrainers.map((trainer) => (
            <div key={trainer._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl">
                    {trainer.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">{trainer.userId?.name}</h3>
                    <p className="text-sm text-primary-600 font-medium">{trainer.specialization}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-900"><MoreVertical size={20} /></button>
              </div>
              
              <div className="mt-4 flex-grow">
                <p className="text-sm text-gray-600 line-clamp-2">{trainer.bio || 'No biography provided.'}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Experience</p>
                    <p className="font-semibold text-gray-900">{trainer.experienceYears} years</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Session Rate</p>
                    <p className="font-semibold text-gray-900">${trainer.sessionPrice}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <ShieldCheck className={`h-4 w-4 mr-1 ${trainer.isActive ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={trainer.isActive ? 'text-green-700' : 'text-red-700'}>
                    {trainer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainersList;
