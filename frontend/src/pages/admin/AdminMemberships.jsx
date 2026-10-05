import { useState, useEffect } from "react";
import { Plus, Edit2, CheckCircle2, CreditCard } from "lucide-react";
import { membershipApi } from "../../api/membershipApi";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const AdminMemberships = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMonths: 1,
    price: 49,
    tier: "standard",
    features: "",
    isActive: true
  });
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const res = await membershipApi.getPlans();
      setPlans(res.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, []);
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      durationMonths: 1,
      price: 999,
      tier: "standard",
      features: "Full gym floor access\nLocker room access\nFitSync mobile app\nFree fitness consultation",
      isActive: true
    });
    setIsModalOpen(true);
  };
  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      durationMonths: plan.durationMonths,
      price: plan.price,
      tier: plan.tier || "standard",
      features: plan.features?.join("\n") || "",
      isActive: plan.isActive
    });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        durationMonths: Number(formData.durationMonths),
        price: Number(formData.price),
        features: formData.features.split("\n").map((f) => f.trim()).filter(Boolean)
      };
      if (editingPlan) {
        await membershipApi.updatePlan(editingPlan._id, payload);
      } else {
        await membershipApi.createPlan(payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving plan");
    }
  };
  const handleToggleActive = async (plan) => {
    try {
      await membershipApi.updatePlan(plan._id, { isActive: !plan.isActive });
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };
  return <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Membership Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define gym tiers, pricing structures, and subscription benefits</p>
        </div>

        <button
    onClick={handleOpenCreate}
    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
  >
          <Plus className="w-4 h-4" />
          <span>New Plan Tier</span>
        </button>
      </div>

      {isLoading ? <LoadingSpinner message="Loading membership plans..." /> : plans.length === 0 ? <div className="py-16 flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-900 dark:text-white font-semibold">No membership plans found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create your first membership tier to get started.</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => <div
    key={plan._id}
    className={`bg-white dark:bg-[#0b0d15] border rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col group transition-all duration-200 ${plan.isActive ? "border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md" : "border-slate-200/60 dark:border-slate-800/60 opacity-70 bg-slate-50/50 dark:bg-slate-900/40"}`}
  >
              <div className="flex items-center justify-between mb-4">
                <Badge status={plan.tier || "standard"} variant="tier" />
                <Badge status={plan.isActive ? "active" : "inactive"} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[40px]">{plan.description}</p>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                  ₹{plan.price}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  / {plan.durationMonths === 1 ? "month" : `${plan.durationMonths} months`}
                </span>
              </div>

              <ul className="mt-6 space-y-3 flex-1 min-h-[100px]">
                {plan.features && plan.features.length > 0 ? plan.features.map((f, idx) => <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{f}</span>
                    </li>) : <li className="text-sm text-slate-400 italic">No features defined.</li>}
              </ul>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
    onClick={() => handleToggleActive(plan)}
    className="text-sm font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
  >
                  {plan.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
    onClick={() => handleOpenEdit(plan)}
    className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer"
    title="Edit Plan"
  >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>)}
        </div>}

      {
    /* Plan Create/Edit Modal */
  }
      <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={editingPlan ? "Edit Membership Plan" : "Create Membership Plan"}
    subtitle="Configure pricing and facility privileges"
  >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Plan Name</label>
            <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
    placeholder="e.g. Pro Performance"
  />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Description</label>
            <input
    type="text"
    required
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
    placeholder="Short description of this tier"
  />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Price (₹)</label>
              <input
    type="number"
    required
    min={0}
    value={formData.price}
    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
  />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Duration (Months)</label>
              <input
    type="number"
    required
    min={1}
    value={formData.durationMonths}
    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
  />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Tier Category</label>
            <select
    value={formData.tier}
    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
  >
              <option value="basic">Basic</option>
              <option value="standard">Standard (Pro)</option>
              <option value="premium">Premium (Elite)</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Features (One per line)</label>
            <textarea
    rows={4}
    value={formData.features}
    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
    placeholder="e.g. Free fitness consultation"
  />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/25 cursor-pointer transition-colors"
  >
              {editingPlan ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  AdminMemberships
};
