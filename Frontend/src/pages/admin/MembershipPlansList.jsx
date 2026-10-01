import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CreditCard, Check, Edit, Trash2, Plus } from 'lucide-react';

const MembershipPlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/membership-plans');
        setPlans(res.data.data);
      } catch (error) {
        toast.error('Failed to load membership plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Membership Plans</h1>
        <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
          <Plus size={18} className="mr-2" /> Add New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center bg-white rounded-xl border border-gray-100">
            <CreditCard className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No membership plans available</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-primary-200 transition-colors">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-blue-600"><Edit size={18} /></button>
                  <button className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900">
                ${plan.price}
                <span className="ml-1 text-xl font-medium text-gray-500">/{plan.durationInMonths}mo</span>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
              
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-primary-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MembershipPlansList;
