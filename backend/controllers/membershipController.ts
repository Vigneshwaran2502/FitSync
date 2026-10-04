import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { MembershipPlan } from '../models/MembershipPlan.js';

export async function getPlans(req: AuthRequest, res: Response) {
  try {
    const isAdmin = req.user?.role === 'admin';
    const query = isAdmin ? {} : { isActive: true };
    const plans = await MembershipPlan.find(query).sort({ price: 1 });
    res.json({ plans });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching membership plans.' });
  }
}

export async function getPlanById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json({ plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching plan.' });
  }
}

export async function createPlan(req: AuthRequest, res: Response) {
  try {
    const { name, description, durationMonths, price, features, tier, isActive = true } = req.body;

    if (!name || !description || !durationMonths || price === undefined) {
      return res.status(400).json({ message: 'Name, description, duration, and price are required.' });
    }

    const plan = await MembershipPlan.create({
      name: name.trim(),
      description: description.trim(),
      durationMonths: Number(durationMonths),
      price: Number(price),
      features: Array.isArray(features) ? features : [],
      tier: tier || 'standard',
      isActive,
    });

    res.status(201).json({ message: 'Membership plan created.', plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating plan.' });
  }
}

export async function updatePlan(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, durationMonths, price, features, tier, isActive } = req.body;

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    if (name) plan.name = name.trim();
    if (description) plan.description = description.trim();
    if (durationMonths !== undefined) plan.durationMonths = Number(durationMonths);
    if (price !== undefined) plan.price = Number(price);
    if (features !== undefined) plan.features = features;
    if (tier) plan.tier = tier;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();
    res.json({ message: 'Plan updated successfully.', plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating plan.' });
  }
}

export async function deletePlan(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    plan.isActive = false;
    await plan.save();
    res.json({ message: `Plan '${plan.name}' deactivated successfully.` });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deactivating plan.' });
  }
}
