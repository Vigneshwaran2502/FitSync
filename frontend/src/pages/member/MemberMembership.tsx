import React, { useState, useEffect } from 'react';
import { CreditCard, Snowflake, CheckCircle2, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { subscriptionApi } from '../../api/subscriptionApi';
import { membershipApi } from '../../api/membershipApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MemberMembership: React.FC = () => {

  const [activeSub, setActiveSub] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);




  // Freeze Modal
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeStart, setFreezeStart] = useState('');
  const [freezeEnd, setFreezeEnd] = useState('');
  const [isSubmittingFreeze, setIsSubmittingFreeze] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchMembershipData = async () => {
    try {
      setIsLoading(true);
      const [subRes, plansRes] = await Promise.all([
        subscriptionApi.getMySubscription(),
        membershipApi.getPlans(),
      ]);
      setActiveSub(subRes.subscription);
      setAvailablePlans(plansRes.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipData();
  }, []);


  const handleSubscribe = async (planId: string) => {
    if (!confirm('Subscribe to this membership plan?')) return;
    try {
      await subscriptionApi.createSubscription({ planId });
      setFeedback('Subscription activated successfully! Welcome.');
      setTimeout(() => setFeedback(null), 4000);
      fetchMembershipData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error subscribing to plan');
    }
  };

  const handleFreezeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub) return;

    try {
      setIsSubmittingFreeze(true);
      await subscriptionApi.requestFreeze(activeSub._id, {
        reason: freezeReason,
        freezeStartDate: freezeStart || undefined,
        freezeEndDate: freezeEnd || undefined,
      });
      setIsFreezeModalOpen(false);
      setFeedback('Freeze request submitted to gym administration for review.');
      setTimeout(() => setFeedback(null), 5000);
      fetchMembershipData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting freeze request');
    } finally {
      setIsSubmittingFreeze(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Checking membership status..." />;
  }

  const daysRemaining = activeSub
    ? Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Membership & Subscriptions</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Manage your active gym pass, facility privileges, and pause requests</p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Current Active Subscription Hero Card */}
      {activeSub ? (
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5EE] dark:border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge status={activeSub.planId?.tier || 'standard'} variant="tier" />
                <Badge status={activeSub.status} />
              </div>
              <h2 className="text-2xl font-black text-[#15131D] dark:text-white tracking-tight">{activeSub.planId?.name}</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">{activeSub.planId?.description}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400 tabular-nums font-mono">
                {daysRemaining}
              </span>
              <span className="text-xs text-[#8E8A9C] dark:text-slate-400 block -mt-1 font-medium">Days Remaining</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-xs">
            <div>
              <span className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Start Date</span>
              <p className="font-bold text-[#15131D] dark:text-white mt-1 tabular-nums font-mono">
                {new Date(activeSub.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Expiry Date</span>
              <p className="font-bold text-[#15131D] dark:text-white mt-1 tabular-nums font-mono">
                {new Date(activeSub.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Payment Status</span>
              <p className="font-bold text-purple-600 dark:text-purple-400 mt-1 capitalize">
                {activeSub.paymentStatus}
              </p>
            </div>
            <div>
              <span className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Freeze Status</span>
              <p className="font-bold text-[#15131D] dark:text-white mt-1">
                {activeSub.status === 'frozen'
                  ? 'Frozen (Paused)'
                  : activeSub.freezeRequested
                  ? 'Review Pending'
                  : 'Active Access'}
              </p>
            </div>
          </div>

          {/* Included Features */}
          {activeSub.planId?.features && activeSub.planId.features.length > 0 && (
            <div className="pt-5 border-t border-[#E8E5EE] dark:border-slate-800/80">
              <h4 className="text-xs font-bold text-[#15131D] dark:text-white mb-3">Included Access Privileges:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#686476] dark:text-slate-300">
                {activeSub.planId.features.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Freeze Request Button */}
          {activeSub.status === 'active' && !activeSub.freezeRequested && (
            <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800/80 flex justify-end">
              <button
                onClick={() => setIsFreezeModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#686476] dark:text-slate-300 hover:text-[#15131D] dark:hover:text-white bg-[#F8F7FA] dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <Snowflake className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Request Membership Freeze</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-[#0b0d15] border border-dashed border-[#E8E5EE] dark:border-slate-800 rounded-3xl theme-transition">
          <CreditCard className="w-12 h-12 text-purple-300 dark:text-purple-800 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#15131D] dark:text-white">No active gym subscription</h3>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1 max-w-md mx-auto">
            Choose a plan tier below to activate your facility check-in privileges and trainer consultation access.
          </p>
        </div>
      )}

      {/* Available Plans Catalog to Upgrade or Subscribe */}
      <div>
        <h3 className="text-lg font-bold text-[#15131D] dark:text-white mb-1">Available Membership Tiers</h3>
        <p className="text-xs text-[#686476] dark:text-slate-400 mb-5">Select a plan to enroll or upgrade your current access</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500/50 hover:-translate-y-0.5 transition-all theme-transition"
            >
              <div>
                <Badge status={plan.tier || 'standard'} variant="tier" />
                <h4 className="text-lg font-bold text-[#15131D] dark:text-white mt-3 tracking-tight">{plan.name}</h4>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-1 line-clamp-2">{plan.description}</p>

                <div className="mt-5 pt-3.5 border-t border-[#E8E5EE] dark:border-slate-800 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#15131D] dark:text-white tabular-nums font-mono">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs text-[#8E8A9C] dark:text-slate-400">
                    / {plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
                  </span>
                </div>

                <ul className="mt-5 space-y-2 text-xs text-[#686476] dark:text-slate-300">
                  {plan.features?.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan._id)}
                className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                {activeSub?.planId?._id === plan._id ? 'Renew Plan' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Freeze Request Modal */}
      <Modal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        title="Request Membership Freeze"
        subtitle="Pause billing and gym access during travel or medical recovery"
      >
        <form onSubmit={handleFreezeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Reason for Freeze</label>
            <input
              type="text"
              required
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
              placeholder="e.g. Work travel, medical recovery, vacation..."
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Pause Start Date</label>
              <input
                type="date"
                value={freezeStart}
                onChange={(e) => setFreezeStart(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Expected Resume Date</label>
              <input
                type="date"
                value={freezeEnd}
                onChange={(e) => setFreezeEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#686476] dark:text-slate-400 leading-relaxed">
            Your request will be forwarded to gym administration. Your expiration date will be extended by the approved frozen duration.
          </p>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsFreezeModalOpen(false)}
              className="px-4 py-2 font-bold text-xs text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingFreeze}
              className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              {isSubmittingFreeze ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>


    </div>
  );
};


