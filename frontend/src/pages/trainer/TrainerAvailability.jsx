import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { trainerApi } from "../../api/trainerApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TrainerAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await trainerApi.getAvailability();
      const existing = res.availability || [];
      const fullWeek = DAYS.map((day) => {
        const found = existing.find((s) => s.dayOfWeek === day);
        return found || {
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: !["Saturday", "Sunday"].includes(day)
        };
      });
      setSlots(fullWeek);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAvailability();
  }, []);
  const handleToggleDay = (day) => {
    setSlots(
      (prev) => prev.map((s) => s.dayOfWeek === day ? { ...s, isAvailable: !s.isAvailable } : s)
    );
  };
  const handleTimeChange = (day, field, val) => {
    setSlots(
      (prev) => prev.map((s) => s.dayOfWeek === day ? { ...s, [field]: val } : s)
    );
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setFeedback(null);
      await trainerApi.setAvailability(slots);
      setFeedback("Availability schedule saved successfully.");
      setTimeout(() => setFeedback(null), 4e3);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving availability");
    } finally {
      setIsSaving(false);
    }
  };
  return <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Weekly Availability Schedule</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Define your working hours for 1-on-1 member appointment bookings</p>
        </div>

        <button
    onClick={handleSave}
    disabled={isSaving}
    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer self-start sm:self-auto"
  >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : "Save Schedule"}</span>
        </button>
      </div>

      {feedback && <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{feedback}</span>
        </div>}

      {isLoading ? <LoadingSpinner message="Loading weekly calendar schedule..." /> : <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none divide-y divide-[#E8E5EE] dark:divide-slate-800/80 theme-transition">
          {slots.map((slot) => <div
    key={slot.dayOfWeek}
    className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${!slot.isAvailable ? "bg-slate-50/50 dark:bg-slate-900/30 opacity-60" : "bg-white dark:bg-[#0b0d15]"}`}
  >
              {
    /* Day & Toggle */
  }
              <div className="flex items-center gap-4">
                <input
    type="checkbox"
    id={`toggle-${slot.dayOfWeek}`}
    checked={slot.isAvailable}
    onChange={() => handleToggleDay(slot.dayOfWeek)}
    className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
  />
                <label
    htmlFor={`toggle-${slot.dayOfWeek}`}
    className="w-28 text-sm font-bold text-[#15131D] dark:text-white cursor-pointer"
  >
                  {slot.dayOfWeek}
                </label>
                <span
    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${slot.isAvailable ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60" : "bg-slate-100 dark:bg-slate-800 text-[#8E8A9C] dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}
  >
                  {slot.isAvailable ? "Available" : "Day Off"}
                </span>
              </div>

              {
    /* Time Inputs */
  }
              {slot.isAvailable ? <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8E8A9C] dark:text-slate-400 font-medium">From:</span>
                    <input
    type="time"
    value={slot.startTime}
    onChange={(e) => handleTimeChange(slot.dayOfWeek, "startTime", e.target.value)}
    className="px-3 py-1.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white"
  />
                  </div>
                  <span className="text-[#8E8A9C] dark:text-slate-500 font-bold">—</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8E8A9C] dark:text-slate-400 font-medium">To:</span>
                    <input
    type="time"
    value={slot.endTime}
    onChange={(e) => handleTimeChange(slot.dayOfWeek, "endTime", e.target.value)}
    className="px-3 py-1.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white"
  />
                  </div>
                </div> : <p className="text-xs text-[#8E8A9C] dark:text-slate-500 italic">No bookings accepted on this day</p>}
            </div>)}
        </div>}
    </div>;
};
export {
  TrainerAvailability
};
