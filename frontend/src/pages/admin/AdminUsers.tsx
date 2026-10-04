import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Eye, UserX, UserCheck, Shield, Dumbbell, UserCheck2, CheckCircle2, UserPlus } from 'lucide-react';
import { userApi } from '../../api/userApi';
import { trainerApi } from '../../api/trainerApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminUsers: React.FC<{ defaultRole?: 'member' | 'trainer' }> = ({ defaultRole }) => {
  const [users, setUsers] = useState<any[]>([
    {
      _id: 'seed-alex',
      name: 'Alex Chen',
      email: 'alex@fitsync.com',
      phone: '+1 (555) 048-9102',
      role: 'member',
      status: 'active',
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      _id: 'seed-marcus',
      name: 'Marcus Vance',
      email: 'marcus@fitsync.com',
      phone: '+1 (555) 024-8891',
      role: 'trainer',
      status: 'active',
      createdAt: '2026-08-15T00:00:00.000Z',
    },
    {
      _id: 'seed-elena',
      name: 'Elena Rostova',
      email: 'elena@fitsync.com',
      phone: '+1 (555) 039-4412',
      role: 'trainer',
      status: 'active',
      createdAt: '2026-08-15T00:00:00.000Z',
    },
  ]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>(defaultRole || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [coachFilter, setCoachFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Selected User Details Modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Assign Trainer Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [memberToAssign, setMemberToAssign] = useState<any>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Add User Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: defaultRole || 'member',
    specialization: '',
    assignedTrainerId: '',
  });

  const fetchTrainers = async () => {
    try {
      const res = await trainerApi.getTrainers();
      setTrainers(res.trainers || []);
    } catch (err) {
      console.error('Error fetching trainers:', err);
    }
  };

  const fetchUsers = async (retries = 2) => {
    try {
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await userApi.getUsers(params);
      if (res && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err: any) {
      if (retries > 0) {
        setTimeout(() => fetchUsers(retries - 1), 1000);
        return;
      }
      console.warn('Notice: Background user sync paused:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTrainers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    try {
      setIsDetailsLoading(true);
      const res = await userApi.getUserById(user._id);
      setUserDetails(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleOpenAssignModal = (member: any) => {
    setMemberToAssign(member);
    const currentTrainerId = member.fitnessProfile?.assignedTrainerId?._id || member.fitnessProfile?.assignedTrainerId || '';
    setSelectedTrainerId(currentTrainerId);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToAssign) return;

    try {
      setIsAssigning(true);
      const res = await userApi.assignTrainer(memberToAssign._id, selectedTrainerId || null);
      
      setFeedback(res.message || 'Trainer assignment updated successfully.');
      setTimeout(() => setFeedback(null), 4000);
      
      setIsAssignModalOpen(false);
      
      // Update local user state immediately
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === memberToAssign._id) {
            const assignedTrainerObj = trainers.find((t) => t._id === selectedTrainerId);
            return {
              ...u,
              fitnessProfile: {
                ...(u.fitnessProfile || {}),
                assignedTrainerId: assignedTrainerObj ? { _id: assignedTrainerObj._id, name: assignedTrainerObj.name, email: assignedTrainerObj.email } : null,
              },
            };
          }
          return u;
        })
      );

      // Also update userDetails if modal is open
      if (userDetails && userDetails.user?._id === memberToAssign._id) {
        const assignedTrainerObj = trainers.find((t) => t._id === selectedTrainerId);
        setUserDetails((prev: any) => ({
          ...prev,
          fitnessProfile: {
            ...(prev.fitnessProfile || {}),
            assignedTrainerId: assignedTrainerObj ? { _id: assignedTrainerObj._id, name: assignedTrainerObj.name, email: assignedTrainerObj.email } : null,
          },
        }));
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error assigning trainer');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    if (!confirm(`Are you sure you want to change ${user.name}'s status to ${newStatus}?`)) return;

    try {
      await userApi.updateUser(user._id, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.createUser({
        ...formData,
        specialization: formData.specialization ? [formData.specialization] : undefined,
        assignedTrainerId: formData.assignedTrainerId || undefined,
      });
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: defaultRole || 'member',
        specialization: '',
        assignedTrainerId: '',
      });
      setFeedback(`New ${formData.role} created successfully!`);
      setTimeout(() => setFeedback(null), 4000);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  // Filter members by coach status
  const memberUsers = users.filter((u: any) => u.role === 'member');
  const assignedMembersCount = memberUsers.filter((u: any) => Boolean(u.fitnessProfile?.assignedTrainerId)).length;
  const unassignedMembersCount = memberUsers.filter((u: any) => !Boolean(u.fitnessProfile?.assignedTrainerId)).length;

  const displayUsers = users.filter((u: any) => {
    if (coachFilter === 'all') return true;
    if (u.role !== 'member') return true;
    const isAssigned = Boolean(u.fitnessProfile?.assignedTrainerId);
    if (coachFilter === 'assigned') return isAssigned;
    if (coachFilter === 'unassigned') return !isAssigned;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
            {defaultRole === 'trainer' ? 'Trainer Roster' : defaultRole === 'member' ? 'Member Directory' : 'User Management'}
          </h1>
          <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
            Administer gym accounts, assigned personal trainers, and athlete profiles
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add {defaultRole === 'trainer' ? 'Trainer' : defaultRole === 'member' ? 'Member' : 'Account'}</span>
        </button>
      </div>

      {/* Top Banner Alert on Action */}
      {feedback && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 rounded-2xl text-xs font-semibold flex items-center justify-between theme-transition">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-purple-700 dark:text-purple-400 hover:opacity-75 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Quick Segmented Filter Pills for Member Trainer Status */}
      {(defaultRole === 'member' || roleFilter === 'member' || roleFilter === 'all') && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCoachFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              coachFilter === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'bg-white dark:bg-[#0b0d14] text-[#686476] dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:border-purple-300'
            }`}
          >
            All Members ({memberUsers.length})
          </button>
          <button
            onClick={() => setCoachFilter('assigned')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              coachFilter === 'assigned'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white dark:bg-[#0b0d14] text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${coachFilter === 'assigned' ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>Assigned ({assignedMembersCount})</span>
          </button>
          <button
            onClick={() => setCoachFilter('unassigned')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              coachFilter === 'unassigned'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                : 'bg-white dark:bg-[#0b0d14] text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${coachFilter === 'unassigned' ? 'bg-white' : 'bg-amber-500 animate-pulse'}`} />
            <span>Needs Trainer ({unassignedMembersCount})</span>
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between theme-transition">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8E8A9C] dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {!defaultRole && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#8E8A9C] dark:text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0b0d14] text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
              >
                <option value="all" className="dark:bg-[#0b0d14]">All Roles</option>
                <option value="member" className="dark:bg-[#0b0d14]">Members</option>
                <option value="trainer" className="dark:bg-[#0b0d14]">Trainers</option>
                <option value="admin" className="dark:bg-[#0b0d14]">Admins</option>
              </select>
            </div>
          )}

          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0b0d14] text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
          >
            <option value="all" className="dark:bg-[#0b0d14]">Coach: All</option>
            <option value="assigned" className="dark:bg-[#0b0d14]">Coach: Assigned</option>
            <option value="unassigned" className="dark:bg-[#0b0d14]">Coach: Unassigned</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0b0d14] text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
          >
            <option value="all" className="dark:bg-[#0b0d14]">All Statuses</option>
            <option value="active" className="dark:bg-[#0b0d14]">Active</option>
            <option value="inactive" className="dark:bg-[#0b0d14]">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs theme-transition">
        {isLoading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : displayUsers.length === 0 ? (
          <EmptyState
            title="No users match criteria"
            description="Try adjusting your search terms or filter selection."
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setRoleFilter('all');
              setStatusFilter('all');
              setCoachFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[#686476] dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider theme-transition">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Assigned Coach</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayUsers.map((u) => {
                  const assignedCoach = u.fitnessProfile?.assignedTrainerId;
                  const isMember = u.role === 'member';

                  return (
                    <tr key={u._id} className="hover:bg-purple-50/20 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#15131D] dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#15131D] dark:text-white">{u.name}</p>
                            <p className="text-[11px] text-[#686476] dark:text-slate-400 font-normal">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize font-bold text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isMember ? (
                          assignedCoach ? (
                            <div className="flex flex-col gap-1 items-start">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span>Assigned</span>
                                </span>
                                <button
                                  onClick={() => handleOpenAssignModal(u)}
                                  className="p-1 rounded-lg text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                                  title="Change Trainer"
                                >
                                  ✎
                                </button>
                              </div>
                              <span className="text-xs font-bold text-[#15131D] dark:text-white flex items-center gap-1">
                                <Dumbbell className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span className="truncate max-w-[150px]">Coach {assignedCoach.name}</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenAssignModal(u)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 transition-colors cursor-pointer shadow-2xs"
                                title="Click to assign a coach"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span>Unassigned</span>
                              </button>
                              <button
                                onClick={() => handleOpenAssignModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-dashed border-purple-300 dark:border-purple-800 rounded-xl transition-colors cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Assign</span>
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-[#8E8A9C] dark:text-slate-500 font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.activeSubscription ? (
                          <div className="text-[#15131D] dark:text-white font-medium">
                            <span className="text-purple-600 dark:text-purple-400 font-bold">{u.activeSubscription.planId?.name}</span>
                          </div>
                        ) : (
                          <span className="text-[#8E8A9C] dark:text-slate-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={u.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        {isMember && (
                          <button
                            onClick={() => handleOpenAssignModal(u)}
                            className="p-2 rounded-xl text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                            title="Assign / Reassign Personal Trainer"
                          >
                            <Dumbbell className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewUser(u)}
                          className="p-2 rounded-xl text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'text-[#8E8A9C] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60'
                              : 'text-[#8E8A9C] hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                          }`}
                          title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Trainer Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={memberToAssign ? `Assign Coach to ${memberToAssign.name}` : 'Assign Coach'}
        subtitle="Pair this member with a certified fitness trainer for workout routines and progress tracking"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-5 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-2">
              Select Personal Trainer / Coach
            </label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              className="w-full px-3.5 py-3 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-[#0b0d14] text-[#15131D] dark:text-white transition-colors"
            >
              <option value="" className="dark:bg-[#0b0d14]">
                -- No Trainer Assigned (Open Member Pool) --
              </option>
              {trainers.map((t) => (
                <option key={t._id} value={t._id} className="dark:bg-[#0b0d14]">
                  Coach {t.name} {t.trainerProfile?.specialization ? `(${t.trainerProfile.specialization.join(', ')})` : ''} - {t.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-1.5 leading-relaxed">
              When assigned, both the athlete and trainer receive automated in-app alerts, and the member appears in the coach&apos;s active roster.
            </p>
          </div>

          {/* Quick Trainer Info Preview if selected */}
          {selectedTrainerId && (
            (() => {
              const selected = trainers.find((t) => t._id === selectedTrainerId);
              if (!selected) return null;
              return (
                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl space-y-2 theme-transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/25">
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#15131D] dark:text-white text-sm">Coach {selected.name}</p>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400">{selected.email}</p>
                    </div>
                  </div>
                  {selected.trainerProfile && (
                    <div className="text-[11px] pt-1 border-t border-purple-200/50 dark:border-purple-800/40 text-[#686476] dark:text-slate-300">
                      <p>
                        <strong>Specialization:</strong> {selected.trainerProfile.specialization?.join(', ') || 'General Conditioning'}
                      </p>
                      <p className="mt-0.5">
                        <strong>Experience:</strong> {selected.trainerProfile.experienceYears || 3} Years
                      </p>
                    </div>
                  )}
                </div>
              );
            })()
          )}

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAssigning ? 'Saving Assignment...' : selectedTrainerId ? 'Confirm Assignment' : 'Unassign Coach'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Selected User Details Modal */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => {
          setSelectedUser(null);
          setUserDetails(null);
        }}
        title={selectedUser?.name || 'Account Details'}
        subtitle={`Role: ${selectedUser?.role?.toUpperCase()} · Managed Account Profile`}
        maxWidth="xl"
      >
        {isDetailsLoading || !userDetails ? (
          <LoadingSpinner message="Fetching user history..." />
        ) : (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 theme-transition">
              <div>
                <p className="text-[#686476] dark:text-slate-400 text-[11px] font-bold">Email</p>
                <p className="font-bold text-[#15131D] dark:text-white mt-0.5">{userDetails.user.email}</p>
              </div>
              <div>
                <p className="text-[#686476] dark:text-slate-400 text-[11px] font-bold">Phone</p>
                <p className="font-bold text-[#15131D] dark:text-white mt-0.5">{userDetails.user.phone || 'Not provided'}</p>
              </div>
              <div className="mt-2">
                <p className="text-[#686476] dark:text-slate-400 text-[11px] font-bold mb-1">Status</p>
                <Badge status={userDetails.user.status} />
              </div>
              <div className="mt-2">
                <p className="text-[#686476] dark:text-slate-400 text-[11px] font-bold">Joined Date</p>
                <p className="font-bold text-[#15131D] dark:text-white tabular-nums mt-0.5">
                  {new Date(userDetails.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Assigned Coach for Member */}
            {userDetails.user.role === 'member' && (
              <div className="p-4 bg-white dark:bg-[#0b0d14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs theme-transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Assigned Personal Trainer</span>
                  </h4>
                  <button
                    onClick={() => {
                      handleOpenAssignModal(userDetails.user);
                    }}
                    className="px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/80 rounded-xl transition-colors cursor-pointer"
                  >
                    {userDetails.fitnessProfile?.assignedTrainerId ? 'Change Coach' : '+ Assign Coach'}
                  </button>
                </div>
                {userDetails.fitnessProfile?.assignedTrainerId ? (
                  <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {userDetails.fitnessProfile.assignedTrainerId.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="font-bold text-[#15131D] dark:text-white">Coach {userDetails.fitnessProfile.assignedTrainerId.name}</p>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400">{userDetails.fitnessProfile.assignedTrainerId.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#686476] dark:text-slate-400 italic">
                    No trainer assigned yet. Click &quot;+ Assign Coach&quot; to connect an instructor.
                  </p>
                )}
              </div>
            )}

            {/* Subscriptions */}
            <div>
              <h4 className="font-bold text-[#15131D] dark:text-white mb-2">Subscription History</h4>
              {userDetails.subscriptions.length === 0 ? (
                <p className="text-[#8E8A9C] dark:text-slate-400 italic">No subscriptions registered.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                  {userDetails.subscriptions.map((s: any) => (
                    <div key={s._id} className="p-3 flex items-center justify-between bg-white dark:bg-[#0b0d14]">
                      <div>
                        <p className="font-bold text-[#15131D] dark:text-white">{s.planId?.name || 'Plan'}</p>
                        <p className="text-[11px] text-[#686476] dark:text-slate-400 tabular-nums">
                          Valid: {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge status={s.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fitness Profile if member */}
            {userDetails.fitnessProfile && (
              <div>
                <h4 className="font-bold text-[#15131D] dark:text-white mb-2">Fitness Profile</h4>
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 theme-transition">
                  <div>
                    <span className="text-[#686476] dark:text-slate-400 text-[11px] font-bold">Current Weight</span>
                    <p className="font-bold text-[#15131D] dark:text-white tabular-nums mt-0.5">{userDetails.fitnessProfile.currentWeightKg} kg</p>
                  </div>
                  <div>
                    <span className="text-[#686476] dark:text-slate-400 text-[11px] font-bold">Target Weight</span>
                    <p className="font-bold text-purple-600 dark:text-purple-400 tabular-nums mt-0.5">{userDetails.fitnessProfile.targetWeightKg} kg</p>
                  </div>
                  <div>
                    <span className="text-[#686476] dark:text-slate-400 text-[11px] font-bold">Goal</span>
                    <p className="font-bold text-[#15131D] dark:text-white mt-0.5">{userDetails.fitnessProfile.fitnessGoal}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trainer Profile if trainer */}
            {userDetails.trainerProfile && (
              <div>
                <h4 className="font-bold text-[#15131D] dark:text-white mb-2">Trainer Credentials</h4>
                <div className="p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1.5 theme-transition">
                  <p>
                    <span className="text-[#686476] dark:text-slate-400 font-bold">Specializations: </span>
                    <span className="font-bold text-[#15131D] dark:text-white">{userDetails.trainerProfile.specialization?.join(', ')}</span>
                  </p>
                  <p>
                    <span className="text-[#686476] dark:text-slate-400 font-bold">Experience: </span>
                    <span className="font-bold text-[#15131D] dark:text-white tabular-nums">{userDetails.trainerProfile.experienceYears} Years</span>
                  </p>
                  {userDetails.trainerProfile.bio && (
                    <p className="text-[#686476] dark:text-slate-300 italic mt-1">&quot;{userDetails.trainerProfile.bio}&quot;</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add ${defaultRole === 'trainer' ? 'Trainer' : defaultRole === 'member' ? 'Member' : 'User'}`}
        subtitle="Provision an account directly from gym administration"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-white/5 text-[#15131D] dark:text-white transition-colors"
              placeholder="e.g. Jordan Miller"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-white/5 text-[#15131D] dark:text-white transition-colors"
              placeholder="jordan@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Temporary Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-white/5 text-[#15131D] dark:text-white transition-colors"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-white/5 text-[#15131D] dark:text-white transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {!defaultRole && (
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-[#0b0d14] text-[#15131D] dark:text-white transition-colors"
              >
                <option value="member" className="dark:bg-[#0b0d14]">Member</option>
                <option value="trainer" className="dark:bg-[#0b0d14]">Trainer</option>
                <option value="admin" className="dark:bg-[#0b0d14]">Administrator</option>
              </select>
            </div>
          )}

          {(formData.role === 'member' || defaultRole === 'member') && (
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                Assign Personal Trainer (Optional)
              </label>
              <select
                value={formData.assignedTrainerId}
                onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-[#0b0d14] text-[#15131D] dark:text-white transition-colors"
              >
                <option value="" className="dark:bg-[#0b0d14]">-- No Trainer Assigned (Open Pool) --</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id} className="dark:bg-[#0b0d14]">
                    Coach {t.name} {t.trainerProfile?.specialization ? `(${t.trainerProfile.specialization.join(', ')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(formData.role === 'trainer' || defaultRole === 'trainer') && (
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Trainer Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 bg-slate-50/70 dark:bg-white/5 text-[#15131D] dark:text-white transition-colors"
                placeholder="e.g. Strength & Conditioning, HIIT"
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              Confirm & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
