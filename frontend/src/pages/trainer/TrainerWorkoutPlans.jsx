import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { workoutApi } from "../../api/workoutApi";
import { exerciseApi } from "../../api/exerciseApi";
import { userApi } from "../../api/userApi";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TrainerWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [exercisesList, setExercisesList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formName, setFormName] = useState("");
  const [formMember, setFormMember] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("Intermediate");
  const [formDuration, setFormDuration] = useState(4);
  const [formNotes, setFormNotes] = useState("");
  const [formExercises, setFormExercises] = useState([]);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [plansRes, exercisesRes, membersRes] = await Promise.all([
        workoutApi.getWorkoutPlans(),
        exerciseApi.getExercises(),
        userApi.getUsers({ role: "member", limit: 100 })
      ]);
      setPlans(plansRes.plans || []);
      setExercisesList(exercisesRes.exercises || []);
      setMembersList(membersRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormName("");
    setFormMember(membersList[0]?._id || "");
    setFormGoal("");
    setFormDifficulty("Intermediate");
    setFormDuration(4);
    setFormNotes("");
    setFormExercises([
      {
        exerciseId: exercisesList[0]?._id || "",
        dayOfWeek: "Monday",
        sets: 3,
        reps: 10,
        targetWeightKg: 50,
        restSeconds: 60,
        notes: "",
        order: 1
      }
    ]);
    setIsModalOpen(true);
  };
  const handleAddExerciseRow = () => {
    setFormExercises((prev) => [
      ...prev,
      {
        exerciseId: exercisesList[0]?._id || "",
        dayOfWeek: "Monday",
        sets: 3,
        reps: 10,
        targetWeightKg: 0,
        restSeconds: 60,
        notes: "",
        order: prev.length + 1
      }
    ]);
  };
  const handleRemoveExerciseRow = (index) => {
    setFormExercises((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleExerciseChange = (index, field, val) => {
    setFormExercises(
      (prev) => prev.map((ex, idx) => idx === index ? { ...ex, [field]: val } : ex)
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formMember || !formGoal) {
      alert("Please fill out plan name, member, and primary goal.");
      return;
    }
    try {
      const payload = {
        name: formName,
        memberId: formMember,
        goal: formGoal,
        difficulty: formDifficulty,
        durationWeeks: Number(formDuration),
        notes: formNotes,
        exercises: formExercises.map((e2, idx) => ({
          ...e2,
          sets: Number(e2.sets),
          reps: Number(e2.reps),
          targetWeightKg: Number(e2.targetWeightKg) || 0,
          restSeconds: Number(e2.restSeconds) || 60,
          order: idx + 1
        }))
      };
      if (editingPlan) {
        await workoutApi.updateWorkoutPlan(editingPlan._id, payload);
      } else {
        await workoutApi.createWorkoutPlan(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving workout plan");
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to archive this workout plan?")) return;
    try {
      await workoutApi.deleteWorkoutPlan(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting plan");
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Workout Plan Builder</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Design multi-day progressive training programs for your clients</p>
        </div>

        <button
    onClick={handleOpenCreate}
    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
  >
          <Plus className="w-4 h-4" />
          <span>Create Workout Plan</span>
        </button>
      </div>

      {isLoading ? <LoadingSpinner message="Loading training routines..." /> : plans.length === 0 ? <EmptyState
    title="No workout plans created"
    description="Create your first targeted routine for an assigned client."
    actionText="Create Program"
    onAction={handleOpenCreate}
  /> : <div className="space-y-5">
          {plans.map((p) => <div key={p._id} className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#E8E5EE] dark:border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-[#15131D] dark:text-white tracking-tight">{p.name}</h3>
                    <Badge status={p.status} />
                  </div>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Client: <span className="font-bold text-[#15131D] dark:text-white">{p.memberId?.name}</span> · Goal: {p.goal} · Duration: <span className="font-mono">{p.durationWeeks} Weeks</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
    onClick={() => handleDelete(p._id)}
    className="p-2 rounded-xl text-[#8E8A9C] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
    title="Archive Plan"
  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {
    /* Exercises Grid */
  }
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {p.exercises?.map((ex, idx) => <div key={idx} className="p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl text-xs theme-transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#15131D] dark:text-white">{ex.exerciseId?.name || "Movement"}</span>
                      <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                        {ex.dayOfWeek}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between font-mono text-[#686476] dark:text-slate-300 tabular-nums">
                      <span>{ex.sets} sets × {ex.reps} reps</span>
                      {ex.targetWeightKg > 0 && <span className="font-bold text-purple-600 dark:text-purple-400">{ex.targetWeightKg} kg</span>}
                    </div>
                    {ex.notes && <p className="text-[10px] text-[#8E8A9C] dark:text-slate-500 italic mt-1.5">{ex.notes}</p>}
                  </div>)}
              </div>
            </div>)}
        </div>}

      {
    /* Program Builder Modal */
  }
      <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title="Workout Program Designer"
    subtitle="Configure target sets, repetitions, and scheduled days"
    maxWidth="2xl"
  >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Plan Name</label>
              <input
    type="text"
    required
    value={formName}
    onChange={(e) => setFormName(e.target.value)}
    placeholder="e.g. Upper Body Hypertrophy Phase 1"
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Assign to Member</label>
              <select
    value={formMember}
    onChange={(e) => setFormMember(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  >
                {membersList.map((m) => <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Target Goal</label>
              <input
    type="text"
    required
    value={formGoal}
    onChange={(e) => setFormGoal(e.target.value)}
    placeholder="e.g. Strength & Muscle Hypertrophy"
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Difficulty</label>
              <select
    value={formDifficulty}
    onChange={(e) => setFormDifficulty(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Duration (Weeks)</label>
              <input
    type="number"
    min={1}
    max={52}
    value={formDuration}
    onChange={(e) => setFormDuration(Number(e.target.value))}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  />
            </div>
          </div>

          {
    /* Exercise Rows Builder */
  }
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-[#15131D] dark:text-white">Assigned Exercises & Target Loads</h4>
              <button
    type="button"
    onClick={handleAddExerciseRow}
    className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
  >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Movement</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {formExercises.map((ex, idx) => <div key={idx} className="p-3 bg-[#F8F7FA] dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <select
    value={ex.exerciseId}
    onChange={(e) => handleExerciseChange(idx, "exerciseId", e.target.value)}
    className="flex-1 px-3 py-1.5 border border-[#E8E5EE] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[#15131D] dark:text-white font-medium"
  >
                      {exercisesList.map((el) => <option key={el._id} value={el._id}>
                          {el.name} ({el.muscleGroup})
                        </option>)}
                    </select>
                    <select
    value={ex.dayOfWeek}
    onChange={(e) => handleExerciseChange(idx, "dayOfWeek", e.target.value)}
    className="w-32 px-3 py-1.5 border border-[#E8E5EE] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[#15131D] dark:text-white font-medium"
  >
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button
    type="button"
    onClick={() => handleRemoveExerciseRow(idx)}
    className="p-1 text-[#8E8A9C] hover:text-rose-600 cursor-pointer"
  >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 font-medium">Sets</span>
                      <input
    type="number"
    min={1}
    value={ex.sets}
    onChange={(e) => handleExerciseChange(idx, "sets", e.target.value)}
    className="w-full px-2 py-1 border border-[#E8E5EE] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[#15131D] dark:text-white tabular-nums font-mono"
  />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 font-medium">Reps</span>
                      <input
    type="number"
    min={1}
    value={ex.reps}
    onChange={(e) => handleExerciseChange(idx, "reps", e.target.value)}
    className="w-full px-2 py-1 border border-[#E8E5EE] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[#15131D] dark:text-white tabular-nums font-mono"
  />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 font-medium">Target (kg)</span>
                      <input
    type="number"
    min={0}
    value={ex.targetWeightKg}
    onChange={(e) => handleExerciseChange(idx, "targetWeightKg", e.target.value)}
    className="w-full px-2 py-1 border border-[#E8E5EE] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[#15131D] dark:text-white tabular-nums font-mono"
  />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 font-medium">Rest (sec)</span>
                      <input
    type="number"
    min={0}
    value={ex.restSeconds}
    onChange={(e) => handleExerciseChange(idx, "restSeconds", e.target.value)}
    className="w-full px-2 py-1 border border-[#E8E5EE] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-[#15131D] dark:text-white tabular-nums font-mono"
  />
                    </div>
                  </div>
                </div>)}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E8E5EE] dark:border-slate-800">
            <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 font-bold text-xs text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
              Save & Assign Routine
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  TrainerWorkoutPlans
};
