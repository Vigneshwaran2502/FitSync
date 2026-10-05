import { FitnessProfile } from "../models/FitnessProfile.js";
import { FitnessMeasurement } from "../models/FitnessMeasurement.js";
import { FitnessGoal } from "../models/FitnessGoal.js";
import { Attendance } from "../models/Attendance.js";
import { WorkoutPlan } from "../models/WorkoutPlan.js";
import { WorkoutLog } from "../models/WorkoutLog.js";
import { Notification } from "../models/Notification.js";
async function getFitnessProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const targetUserId = (req.user.role === "admin" || req.user.role === "trainer") && req.params.userId ? req.params.userId : req.user._id;
    let profile = await FitnessProfile.findOne({ userId: targetUserId }).populate(
      "assignedTrainerId",
      "name email phone"
    );
    if (!profile) {
      profile = await FitnessProfile.create({
        userId: targetUserId,
        heightCm: 175,
        currentWeightKg: 70,
        targetWeightKg: 70,
        fitnessGoal: "General Health",
        fitnessLevel: "Beginner",
        onboardingCompleted: false
      });
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching fitness profile." });
  }
}
async function updateFitnessProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const targetUserId = (req.user.role === "admin" || req.user.role === "trainer") && req.body.userId ? req.body.userId : req.user._id;
    const {
      heightCm,
      currentWeightKg,
      targetWeightKg,
      dateOfBirth,
      gender,
      fitnessGoal,
      fitnessLevel,
      medicalConditions,
      assignedTrainerId,
      onboardingCompleted
    } = req.body;
    let profile = await FitnessProfile.findOne({ userId: targetUserId });
    if (!profile) {
      profile = new FitnessProfile({ userId: targetUserId });
    }
    if (heightCm !== void 0) profile.heightCm = Number(heightCm);
    if (currentWeightKg !== void 0) profile.currentWeightKg = Number(currentWeightKg);
    if (targetWeightKg !== void 0) profile.targetWeightKg = Number(targetWeightKg);
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (gender) profile.gender = gender;
    if (fitnessGoal) profile.fitnessGoal = fitnessGoal;
    if (fitnessLevel) profile.fitnessLevel = fitnessLevel;
    if (medicalConditions !== void 0) profile.medicalConditions = medicalConditions;
    if (assignedTrainerId) profile.assignedTrainerId = assignedTrainerId;
    if (onboardingCompleted !== void 0) profile.onboardingCompleted = Boolean(onboardingCompleted);
    await profile.save();
    if (currentWeightKg) {
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await FitnessMeasurement.findOneAndUpdate(
        { userId: targetUserId, date: todayStr },
        { weightKg: Number(currentWeightKg) },
        { upsert: true }
      );
    }
    res.json({ message: "Fitness profile updated successfully.", profile });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating fitness profile." });
  }
}
async function getMeasurements(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const targetUserId = (req.user.role === "admin" || req.user.role === "trainer") && req.query.userId ? req.query.userId : req.user._id;
    const measurements = await FitnessMeasurement.find({ userId: targetUserId }).sort({ date: 1 });
    res.json({ measurements });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching measurements." });
  }
}
async function addMeasurement(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const { date, weightKg, chestCm, waistCm, hipsCm, armsCm, thighsCm, bodyFatPercent, notes, userId } = req.body;
    const targetUserId = req.user.role === "admin" && userId ? userId : req.user._id;
    if (!weightKg) {
      return res.status(400).json({ message: "Weight is required." });
    }
    const measurement = await FitnessMeasurement.create({
      userId: targetUserId,
      date: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      weightKg: Number(weightKg),
      chestCm: chestCm ? Number(chestCm) : void 0,
      waistCm: waistCm ? Number(waistCm) : void 0,
      hipsCm: hipsCm ? Number(hipsCm) : void 0,
      armsCm: armsCm ? Number(armsCm) : void 0,
      thighsCm: thighsCm ? Number(thighsCm) : void 0,
      bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : void 0,
      notes: notes || ""
    });
    await FitnessProfile.findOneAndUpdate(
      { userId: targetUserId },
      { currentWeightKg: Number(weightKg) }
    );
    res.status(201).json({ message: "Measurement logged successfully.", measurement });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error logging measurement." });
  }
}
async function getGoals(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const targetUserId = (req.user.role === "admin" || req.user.role === "trainer") && req.query.userId ? req.query.userId : req.user._id;
    const goals = await FitnessGoal.find({ userId: targetUserId }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching goals." });
  }
}
async function createGoal(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const { title, category, targetValue, currentValue, unit, targetDate, notes } = req.body;
    if (!title || targetValue === void 0 || !targetDate) {
      return res.status(400).json({ message: "Title, target value, and target date are required." });
    }
    const goal = await FitnessGoal.create({
      userId: req.user._id,
      title: title.trim(),
      category: category || "Weight",
      targetValue: Number(targetValue),
      currentValue: currentValue !== void 0 ? Number(currentValue) : 0,
      unit: unit || "kg",
      targetDate,
      notes: notes || "",
      status: "active"
    });
    res.status(201).json({ message: "Fitness goal set successfully.", goal });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error creating fitness goal." });
  }
}
async function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const { title, targetValue, currentValue, unit, targetDate, status, notes } = req.body;
    const goal = await FitnessGoal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }
    if (title) goal.title = title.trim();
    if (targetValue !== void 0) goal.targetValue = Number(targetValue);
    if (currentValue !== void 0) goal.currentValue = Number(currentValue);
    if (unit) goal.unit = unit;
    if (targetDate) goal.targetDate = targetDate;
    if (notes !== void 0) goal.notes = notes;
    const wasActive = goal.status === "active";
    if (status) goal.status = status;
    if (status === "achieved" && wasActive) {
      await Notification.create({
        userId: goal.userId,
        title: "Goal Achieved!",
        message: `Outstanding! You achieved your milestone: '${goal.title}'. Keep up the momentum!`,
        type: "goal",
        actionUrl: "/member/progress"
      });
    }
    await goal.save();
    res.json({ message: "Goal updated.", goal });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating goal." });
  }
}
async function deleteGoal(req, res) {
  try {
    const { id } = req.params;
    await FitnessGoal.findByIdAndDelete(id);
    res.json({ message: "Goal deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error deleting goal." });
  }
}
async function getProgressDashboard(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const targetUserId = (req.user.role === "admin" || req.user.role === "trainer") && req.query.userId ? req.query.userId : req.user._id;
    const profile = await FitnessProfile.findOne({ userId: targetUserId });
    const measurements = await FitnessMeasurement.find({ userId: targetUserId }).sort({ date: 1 });
    const goals = await FitnessGoal.find({ userId: targetUserId });
    const attendanceRecords = await Attendance.find({ userId: targetUserId });
    const workoutPlans = await WorkoutPlan.find({ memberId: targetUserId });
    const workoutLogs = await WorkoutLog.find({ memberId: targetUserId });
    const startingWeight = measurements.length > 0 ? measurements[0].weightKg : profile?.currentWeightKg || 70;
    const currentWeight = profile?.currentWeightKg || (measurements.length > 0 ? measurements[measurements.length - 1].weightKg : 70);
    const targetWeight = profile?.targetWeightKg || 70;
    const weightChange = Number((currentWeight - startingWeight).toFixed(1));
    const heightInMeters = (profile?.heightCm || 175) / 100;
    const bmi = Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));
    const now = /* @__PURE__ */ new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthAttendance = attendanceRecords.filter((a) => a.date.startsWith(currentMonthStr));
    const attendancePercentage = Math.min(100, Math.round(thisMonthAttendance.length / 20 * 100));
    const activeGoals = goals.filter((g) => g.status === "active");
    const achievedGoals = goals.filter((g) => g.status === "achieved");
    const weightHistory = measurements.map((m) => ({
      date: m.date,
      weight: m.weightKg,
      target: targetWeight,
      bodyFat: m.bodyFatPercent
    }));
    res.json({
      startingWeight,
      currentWeight,
      targetWeight,
      weightChange,
      bmi,
      totalAttendanceDays: attendanceRecords.length,
      thisMonthAttendanceDays: thisMonthAttendance.length,
      attendancePercentage,
      totalWorkoutLogs: workoutLogs.length,
      totalWorkoutPlans: workoutPlans.length,
      activeGoalsCount: activeGoals.length,
      achievedGoalsCount: achievedGoals.length,
      activeGoals,
      achievedGoals,
      weightHistory,
      profile
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error computing progress dashboard." });
  }
}
export {
  addMeasurement,
  createGoal,
  deleteGoal,
  getFitnessProfile,
  getGoals,
  getMeasurements,
  getProgressDashboard,
  updateFitnessProfile,
  updateGoal
};
