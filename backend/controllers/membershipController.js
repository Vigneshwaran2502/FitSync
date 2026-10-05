import { MembershipPlan } from "../models/MembershipPlan.js";
async function getPlans(req, res) {
  try {
    const isAdmin = req.user?.role === "admin";
    const query = isAdmin ? {} : { isActive: true };
    const plans = await MembershipPlan.find(query).sort({ price: 1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching membership plans." });
  }
}
async function getPlanById(req, res) {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching plan." });
  }
}
async function createPlan(req, res) {
  try {
    const { name, description, durationMonths, price, features, tier, isActive = true } = req.body;
    if (!name || !description || !durationMonths || price === void 0) {
      return res.status(400).json({ message: "Name, description, duration, and price are required." });
    }
    const plan = await MembershipPlan.create({
      name: name.trim(),
      description: description.trim(),
      durationMonths: Number(durationMonths),
      price: Number(price),
      features: Array.isArray(features) ? features : [],
      tier: tier || "standard",
      isActive
    });
    res.status(201).json({ message: "Membership plan created.", plan });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error creating plan." });
  }
}
async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const { name, description, durationMonths, price, features, tier, isActive } = req.body;
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    if (name) plan.name = name.trim();
    if (description) plan.description = description.trim();
    if (durationMonths !== void 0) plan.durationMonths = Number(durationMonths);
    if (price !== void 0) plan.price = Number(price);
    if (features !== void 0) plan.features = features;
    if (tier) plan.tier = tier;
    if (isActive !== void 0) plan.isActive = isActive;
    await plan.save();
    res.json({ message: "Plan updated successfully.", plan });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating plan." });
  }
}
async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    plan.isActive = false;
    await plan.save();
    res.json({ message: `Plan '${plan.name}' deactivated successfully.` });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error deactivating plan." });
  }
}
export {
  createPlan,
  deletePlan,
  getPlanById,
  getPlans,
  updatePlan
};
