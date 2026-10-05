import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { exerciseApi } from "../../api/exerciseApi";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Arms",
  "Core",
  "Cardio",
  "Full Body"
];
const TrainerExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    muscleGroup: "Chest",
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: ""
  });
  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedMuscle !== "All") params.muscleGroup = selectedMuscle;
      if (search) params.search = search;
      const res = await exerciseApi.getExercises(params);
      setExercises(res.exercises || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchExercises();
  }, [selectedMuscle]);
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await exerciseApi.createExercise(formData);
      setIsModalOpen(false);
      setFormData({
        name: "",
        muscleGroup: "Chest",
        equipment: "Barbell",
        difficulty: "Intermediate",
        instructions: ""
      });
      fetchExercises();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating exercise");
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Exercise Library</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Biomechanical movement directory and technique instructions</p>
        </div>

        <button
    onClick={() => setIsModalOpen(true)}
    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
  >
          <Plus className="w-4 h-4" />
          <span>Add Custom Exercise</span>
        </button>
      </div>

      {
    /* Filter and Muscle Tabs */
  }
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {MUSCLE_GROUPS.map((mg) => <button
    key={mg}
    onClick={() => setSelectedMuscle(mg)}
    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${selectedMuscle === mg ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30" : "bg-white dark:bg-[#0b0d15] text-[#686476] dark:text-slate-400 border border-[#E8E5EE] dark:border-slate-800 hover:text-[#15131D] dark:hover:text-white hover:border-purple-400"}`}
  >
              {mg}
            </button>)}
        </div>

        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
          <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && fetchExercises()}
    placeholder="Search exercises..."
    className="w-full pl-10 pr-3.5 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600 theme-transition"
  />
        </div>
      </div>

      {
    /* Exercises Grid */
  }
      {isLoading ? <LoadingSpinner message="Searching exercise index..." /> : exercises.length === 0 ? <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-8 text-center">No exercises found.</p> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exercises.map((ex) => <div
    key={ex._id}
    className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500/50 hover:-translate-y-0.5 transition-all theme-transition"
  >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-[11px] font-medium text-[#8E8A9C] dark:text-slate-400">{ex.equipment}</span>
                </div>
                <h3 className="text-base font-bold text-[#15131D] dark:text-white tracking-tight">{ex.name}</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {ex.instructions || "No detailed instructions provided."}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#E8E5EE] dark:border-slate-800 flex items-center justify-between text-xs text-[#8E8A9C] dark:text-slate-400">
                <span>Difficulty: <strong className="text-[#15131D] dark:text-white capitalize">{ex.difficulty}</strong></span>
                {ex.isCustom && <span className="text-purple-600 dark:text-purple-400 font-bold text-[11px]">Custom</span>}
              </div>
            </div>)}
        </div>}

      {
    /* Add Exercise Modal */
  }
      <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title="Add Exercise to Library"
    subtitle="Catalog a new exercise with target biomechanics and coaching cues"
  >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Exercise Name</label>
            <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g. Romanian Deadlift"
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Muscle Group</label>
              <select
    value={formData.muscleGroup}
    onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
    className="w-full px-3 py-2 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  >
                {MUSCLE_GROUPS.filter((m) => m !== "All").map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Equipment</label>
              <select
    value={formData.equipment}
    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
    className="w-full px-3 py-2 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  >
                <option value="Barbell">Barbell</option>
                <option value="Dumbbell">Dumbbell</option>
                <option value="Machine">Machine</option>
                <option value="Cable">Cable</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Kettlebell">Kettlebell</option>
                <option value="Bands">Bands</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Difficulty</label>
              <select
    value={formData.difficulty}
    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
    className="w-full px-3 py-2 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Form Cues & Instructions</label>
            <textarea
    rows={4}
    value={formData.instructions}
    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
    placeholder="Describe posture, tempo, breathing, and safety tips..."
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600 leading-relaxed"
  />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
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
              Add to Library
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  TrainerExercises
};
