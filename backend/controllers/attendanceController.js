import { Attendance } from "../models/Attendance.js";
import { QRSession } from "../models/QRSession.js";
import { Subscription } from "../models/Subscription.js";
import { GYM_LOCATION } from "../config/constants.js";
import { isWithinGymRadius } from "../services/haversineService.js";
import { Notification } from "../models/Notification.js";
async function getActiveQRSession(req, res) {
  try {
    const now = /* @__PURE__ */ new Date();
    let session = await QRSession.findOne({
      isActive: true,
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });
    if (!session && req.user?.role === "admin") {
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1e3);
      session = await QRSession.create({
        code: `FITSYNC-${Date.now().toString(36).toUpperCase()}`,
        isActive: true,
        expiresAt,
        gymLatitude: GYM_LOCATION.latitude,
        gymLongitude: GYM_LOCATION.longitude,
        maxRadiusMeters: GYM_LOCATION.maxAllowedDistanceMeters
      });
    }
    if (!session) {
      return res.status(404).json({ message: "No active QR session found. Please request Admin to regenerate." });
    }
    res.json({
      session: {
        code: session.code,
        expiresAt: session.expiresAt,
        gymLatitude: session.gymLatitude,
        gymLongitude: session.gymLongitude,
        maxRadiusMeters: session.maxRadiusMeters,
        gymName: GYM_LOCATION.name,
        gymAddress: GYM_LOCATION.formattedAddress
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching active QR session." });
  }
}
async function generateNewQRSession(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can generate attendance QR codes." });
    }
    await QRSession.updateMany({ isActive: true }, { isActive: false });
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1e3);
    const code = `FITSYNC-${Date.now().toString(36).toUpperCase()}`;
    const session = await QRSession.create({
      code,
      isActive: true,
      expiresAt,
      gymLatitude: GYM_LOCATION.latitude,
      gymLongitude: GYM_LOCATION.longitude,
      maxRadiusMeters: GYM_LOCATION.maxAllowedDistanceMeters
    });
    res.json({
      message: "New QR attendance session generated.",
      session: {
        code: session.code,
        expiresAt: session.expiresAt,
        gymLatitude: session.gymLatitude,
        gymLongitude: session.gymLongitude,
        maxRadiusMeters: session.maxRadiusMeters,
        gymName: GYM_LOCATION.name,
        gymAddress: GYM_LOCATION.formattedAddress
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error generating QR session." });
  }
}
async function checkIn(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const verificationMethod = req.body.verificationMethod || req.body.method || "qr";
    const { qrCode, latitude, longitude, memberId } = req.body;
    const targetUserId = req.user.role === "admin" && memberId ? memberId : req.user._id;
    const activeSub = await Subscription.findOne({
      userId: targetUserId,
      status: "active",
      endDate: { $gte: /* @__PURE__ */ new Date() }
    });
    if (!activeSub && req.user.role !== "admin") {
      return res.status(403).json({
        message: "No active membership subscription found. Please renew your membership to check in."
      });
    }
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existingCheckIn = await Attendance.findOne({
      userId: targetUserId,
      date: todayStr,
      status: "present"
    });
    if (existingCheckIn) {
      return res.status(409).json({
        message: `You are already checked in today at ${existingCheckIn.checkInTime}. Please check out when finished.`
      });
    }
    let calculatedDistance = 0;
    if (verificationMethod === "qr") {
      if (!qrCode) {
        return res.status(400).json({ message: "QR Code payload is required for QR check-in." });
      }
      const session = await QRSession.findOne({ code: qrCode.trim(), isActive: true });
      if (!session) {
        return res.status(400).json({ message: "Invalid or expired QR code. Please scan the current display screen." });
      }
      if (/* @__PURE__ */ new Date() > session.expiresAt) {
        session.isActive = false;
        await session.save();
        return res.status(400).json({ message: "QR code session has expired. Please ask the front desk to refresh the screen." });
      }
    } else if (verificationMethod === "gps") {
      if (latitude === void 0 || longitude === void 0) {
        return res.status(400).json({
          message: "GPS coordinates could not be retrieved. Please allow browser location permissions."
        });
      }
      const { valid, distance } = isWithinGymRadius(
        Number(latitude),
        Number(longitude),
        GYM_LOCATION.latitude,
        GYM_LOCATION.longitude,
        GYM_LOCATION.maxAllowedDistanceMeters
      );
      calculatedDistance = distance;
      if (!valid) {
        return res.status(400).json({
          message: `Location check failed: You are ${distance}m away from ${GYM_LOCATION.name}. You must be within ${GYM_LOCATION.maxAllowedDistanceMeters}m to check in.`
        });
      }
    }
    const timeNow = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const attendance = await Attendance.create({
      userId: targetUserId,
      date: todayStr,
      checkInTime: timeNow,
      status: "present",
      verificationMethod,
      latitude: latitude ? Number(latitude) : void 0,
      longitude: longitude ? Number(longitude) : void 0,
      distanceMeters: calculatedDistance
    });
    await Notification.create({
      userId: targetUserId,
      title: "Attendance Confirmed",
      message: `Checked in successfully at ${timeNow} via ${verificationMethod.toUpperCase()}. Have a great workout!`,
      type: "attendance",
      actionUrl: "/member/attendance"
    });
    res.status(201).json({
      message: `Check-in successful at ${timeNow}. Welcome!`,
      attendance
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error processing check-in." });
  }
}
async function checkOut(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const targetUserId = req.user.role === "admin" && req.body.memberId ? req.body.memberId : req.user._id;
    const record = await Attendance.findOne({
      userId: targetUserId,
      date: todayStr,
      status: "present"
    });
    if (!record) {
      return res.status(404).json({ message: "No active check-in found for today to check out from." });
    }
    const timeNow = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    record.checkOutTime = timeNow;
    record.status = "checked_out";
    await record.save();
    res.json({
      message: `Checked out successfully at ${timeNow}. Great work today!`,
      attendance: record
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error processing check-out." });
  }
}
async function getAttendanceHistory(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const { memberId, startDate, endDate, limit = 50 } = req.query;
    const query = {};
    if (req.user.role === "member") {
      query.userId = req.user._id;
    } else if (memberId) {
      query.userId = memberId;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    const records = await Attendance.find(query).populate("userId", "name email phone").sort({ date: -1, checkInTime: -1 }).limit(Number(limit));
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching attendance history." });
  }
}
async function getTodayPresent(req, res) {
  try {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const presentRecords = await Attendance.find({
      date: todayStr
    }).populate("userId", "name email phone").sort({ checkInTime: -1 });
    res.json({
      date: todayStr,
      totalToday: presentRecords.length,
      currentlyPresent: presentRecords.filter((r) => r.status === "present").length,
      records: presentRecords
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching today attendance." });
  }
}
export {
  checkIn,
  checkOut,
  generateNewQRSession,
  getActiveQRSession,
  getAttendanceHistory,
  getTodayPresent
};
