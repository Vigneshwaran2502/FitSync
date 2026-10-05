import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";
import { Attendance } from "../models/Attendance.js";
import { FitnessProfile } from "../models/FitnessProfile.js";
import { WorkoutPlan } from "../models/WorkoutPlan.js";
import { TrainerProfile } from "../models/TrainerProfile.js";
import { Notification } from "../models/Notification.js";
async function getUsers(req, res) {
  try {
    const { role, status, search, page = "1", limit = "20", sortBy = "createdAt", order = "desc" } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: "i" } },
        { email: { $regex: String(search), $options: "i" } },
        { phone: { $regex: String(search), $options: "i" } }
      ];
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;
    const total = await User.countDocuments(query);
    const users = await User.find(query).select("-password").sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum);
    const userIds = users.map((u) => u._id);
    const [subscriptions, fitnessProfiles] = await Promise.all([
      Subscription.find({
        userId: { $in: userIds },
        status: "active"
      }).populate("planId", "name tier"),
      FitnessProfile.find({
        userId: { $in: userIds }
      }).populate("assignedTrainerId", "name email")
    ]);
    const subMap = /* @__PURE__ */ new Map();
    subscriptions.forEach((sub) => {
      subMap.set(sub.userId.toString(), sub);
    });
    const fpMap = /* @__PURE__ */ new Map();
    fitnessProfiles.forEach((fp) => {
      fpMap.set(fp.userId.toString(), fp);
    });
    const enrichedUsers = users.map((user) => {
      const uObj = user.toObject();
      uObj.activeSubscription = subMap.get(user._id.toString()) || null;
      uObj.fitnessProfile = fpMap.get(user._id.toString()) || null;
      return uObj;
    });
    res.json({
      users: enrichedUsers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching users." });
  }
}
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const subscriptions = await Subscription.find({ userId: user._id }).populate("planId").sort({ createdAt: -1 });
    const recentAttendance = await Attendance.find({ userId: user._id }).sort({ date: -1 }).limit(10);
    const fitnessProfile = await FitnessProfile.findOne({ userId: user._id }).populate("assignedTrainerId", "name email");
    const workoutPlans = await WorkoutPlan.find({ memberId: user._id }).populate("trainerId", "name email").sort({ createdAt: -1 });
    let trainerInfo = null;
    if (user.role === "trainer") {
      trainerInfo = await TrainerProfile.findOne({ userId: user._id });
    }
    res.json({
      user,
      subscriptions,
      recentAttendance,
      fitnessProfile,
      workoutPlans,
      trainerProfile: trainerInfo
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching user details." });
  }
}
async function createUser(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      status = "active",
      specialization,
      experienceYears,
      bio,
      assignedTrainerId
    } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "User with this email already exists." });
    }
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || "",
      role: role || "member",
      status
    });
    if (newUser.role === "trainer") {
      await TrainerProfile.create({
        userId: newUser._id,
        specialization: specialization || ["General Fitness"],
        experienceYears: experienceYears || 1,
        bio: bio || "",
        isAvailable: true
      });
    } else if (newUser.role === "member") {
      await FitnessProfile.create({
        userId: newUser._id,
        heightCm: 175,
        currentWeightKg: 70,
        targetWeightKg: 70,
        assignedTrainerId: assignedTrainerId || void 0,
        onboardingCompleted: false
      });
      if (assignedTrainerId) {
        const trainer = await User.findById(assignedTrainerId);
        if (trainer) {
          await Notification.create({
            userId: trainer._id,
            title: "New Athlete Assigned",
            message: `${newUser.name} has been enrolled and assigned to your training roster.`,
            type: "system"
          });
        }
      }
    }
    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error creating user." });
  }
}
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, password } = req.body;
    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (phone !== void 0) user.phone = phone.trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password;
    await user.save();
    res.json({
      message: "User updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating user." });
  }
}
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.status = "inactive";
    await user.save();
    res.json({ message: `User ${user.name} has been deactivated.` });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error deactivating user." });
  }
}
async function assignTrainer(req, res) {
  try {
    const { id } = req.params;
    const { trainerId } = req.body;
    const member = await User.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }
    let trainer = null;
    if (trainerId) {
      trainer = await User.findOne({ _id: trainerId, role: "trainer" });
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found." });
      }
    }
    let profile = await FitnessProfile.findOne({ userId: member._id });
    if (!profile) {
      profile = new FitnessProfile({ userId: member._id });
    }
    profile.assignedTrainerId = trainerId ? trainer._id : void 0;
    await profile.save();
    if (trainer) {
      await Notification.create({
        userId: member._id,
        title: "Coach Assigned",
        message: `Coach ${trainer.name} is now your assigned trainer. View your workout routines and reach out for personal guidance!`,
        type: "system"
      });
      await Notification.create({
        userId: trainer._id,
        title: "New Athlete Assigned",
        message: `${member.name} has been assigned to your coaching roster. Review their biometric targets and configure their routine.`,
        type: "system"
      });
    }
    const populatedProfile = await FitnessProfile.findById(profile._id).populate("assignedTrainerId", "name email");
    res.json({
      message: trainer ? `Successfully assigned Coach ${trainer.name} to ${member.name}.` : `Trainer unassigned from ${member.name}.`,
      fitnessProfile: populatedProfile
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error assigning trainer." });
  }
}
export {
  assignTrainer,
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser
};
