import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, RefreshCw, Snowflake, Check, X, ShieldAlert } from 'lucide-react';
import { subscriptionApi } from '../../api/subscriptionApi';
import { userApi } from '../../api/userApi';
import { membershipApi } from '../../api/membershipApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Subscription Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await subscriptionApi.getSubscriptions(params);
      setSubscriptions(res.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const handleOpenCreate = async () => {
    setIsCreateOpen(true);
    try {
      const [membersRes, plansRes] = await Promise.all([
        userApi.getUsers({ role: 'member', limit: 100 }),
        membershipApi.getPlans(),
      ]);
      setMembers(membersRes.users || []);
      setPlans(plansRes.plans || []);
      if (membersRes.users?.length > 0) setSelectedMember(membersRes.users[0]._id);
      if (plansRes.plans?.length > 0) setSelectedPlan(plansRes.plans[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedPlan) return;

    try {
      await subscriptionApi.createSubscription({
        userId: selectedMember,
        planId: selectedPlan,
      });
      setIsCreateOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating subscription');
    }
  };

  const handleFreezeDecision = async (id: string, action: 'approve' | 'reject') => {
    try {
      await subscriptionApi.handleFreezeDecision(id, action);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating freeze state');
    }
  };

  const handleUnfreeze = async (id: string) => {
    try {
      await subscriptionApi.unfreezeSubscription(id);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error unfreezing subscription');
    }
  };

  const handleRenew = async (id: string) => {
    if (!confirm('Extend subscription by one billing cycle?')) return;
    try {
      await subscriptionApi.renewSubscription(id);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error renewing subscription');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Subscription Management</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Audit member passes, process freeze requests, and renew access</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Subscription</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-4 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col md:flex-row gap-3 items-center justify-between theme-transition">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSubscriptions()}
            placeholder="Search member or email..."
            className="w-full pl-10 pr-3.5 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#8E8A9C]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="frozen">Frozen</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        {isLoading ? (
          <LoadingSpinner message="Auditing subscriptions..." />
        ) : subscriptions.length === 0 ? (
          <EmptyState
            title="No subscriptions found"
            description="There are currently no subscriptions matching the chosen parameters."
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Valid Range</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#15131D] dark:text-white">
                      <div>
                        <p className="font-bold text-[#15131D] dark:text-white">{sub.userId?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-[#686476] dark:text-slate-400 font-normal">{sub.userId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#15131D] dark:text-slate-200">{sub.planId?.name || 'Custom Plan'}</span>
                    </td>
                    <td className="px-6 py-4 tabular-nums font-mono text-[#686476] dark:text-slate-400">
                      {new Date(sub.startDate).toLocaleDateString()} – {new Date(sub.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#15131D] dark:text-white tabular-nums font-mono">
                      ₹{sub.paymentAmount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge status={sub.status} />
                        {sub.freezeRequested && sub.status !== 'frozen' && (
                          <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            Freeze: {sub.freezeReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {sub.freezeRequested && sub.status !== 'frozen' && (
                        <>
                          <button
                            onClick={() => handleFreezeDecision(sub._id, 'approve')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
                            title="Approve Freeze"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleFreezeDecision(sub._id, 'reject')}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[#15131D] dark:text-slate-200 rounded-xl text-[11px] font-bold cursor-pointer"
                            title="Reject Freeze"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {sub.status === 'frozen' && (
                        <button
                          onClick={() => handleUnfreeze(sub._id)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
                          title="Unfreeze"
                        >
                          Unfreeze
                        </button>
                      )}

                      <button
                        onClick={() => handleRenew(sub._id)}
                        className="p-1.5 rounded-xl text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                        title="Renew Subscription"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Assign Subscription */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Assign Member Subscription"
        subtitle="Provision an active membership for a gym client"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Select Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Select Membership Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white"
            >
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} - ₹{p.price} ({p.durationMonths} Months)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              Activate Subscription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


