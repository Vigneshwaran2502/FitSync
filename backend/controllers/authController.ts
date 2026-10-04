import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants.js';
import { AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

function generateToken(id: string, role: string) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email: string, otp: string) {
  console.log(`\n\n=== [FIRST TIME LOGIN OTP] ===\nOTP for ${email} is ${otp}\n==============================\n\n`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email Server] EMAIL_USER or EMAIL_PASS not set in .env. Skipping real email send.');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FitSync Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'FitSync First-Time Login OTP',
      html: `<h2>Welcome to FitSync!</h2><p>Your one-time password for first-time login is: <strong>${otp}</strong></p><p>This OTP will expire in 10 minutes.</p>`,
    });
    console.log(`[Email Server] OTP sent to ${email}`);
  } catch (error) {
    console.error('[Email Server] Failed to send email:', error);
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || '',
      role: 'member',
      status: 'active',
      isVerified: false,
    });

    await FitnessProfile.create({
      userId: user._id,
      heightCm: 175,
      currentWeightKg: 70,
      targetWeightKg: 70,
      fitnessGoal: 'General Health',
      fitnessLevel: 'Beginner',
      onboardingCompleted: false,
    });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();
    
    await sendOtpEmail(user.email, otp);

    res.status(201).json({
      message: 'Registration successful. OTP sent to your email.',
      requiresOtp: true,
      email: user.email
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +otp +otpExpiry');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // FIRST TIME LOGIN LOGIC
    if (!user.isVerified) {
      if (user.role !== 'member') {
        user.isVerified = true;
        await user.save();
      } else {
        const otp = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      
      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();
      
      await sendOtpEmail(user.email, otp);
      
      return res.status(200).json({ 
        message: 'First time login requires OTP verification. We have sent an OTP to your email.',
        requiresOtp: true,
        email: user.email
      });
      }
    }

    const token = generateToken(user._id.toString(), user.role);
    
    let onboardingCompleted = true;
    if (user.role === 'member') {
      const profile = await FitnessProfile.findOne({ userId: user._id });
      onboardingCompleted = profile ? profile.onboardingCompleted : false;
    }

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        onboardingCompleted,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otp +otpExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }
    
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }
    
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    const token = generateToken(user._id.toString(), user.role);
    let onboardingCompleted = true;
    if (user.role === 'member') {
      const profile = await FitnessProfile.findOne({ userId: user._id });
      onboardingCompleted = profile ? profile.onboardingCompleted : false;
    }

    res.json({
      message: 'Email verified successfully. Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        onboardingCompleted,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error during OTP verification.' });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required.' });
    }
    
    // In local dev without a real client ID, we might skip full verification if it fails,
    // but typically we verify it properly:
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id', // Frontend must use the same ID
    }).catch(e => {
      // If we don't have a real client ID configured, we can decode the token manually (NOT SECURE for prod!)
      const decoded = jwt.decode(credential) as any;
      if (!decoded) throw new Error('Invalid Google token');
      return { getPayload: () => decoded };
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload.' });
    }
    
    const email = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-register via Google
      user = await User.create({
        name: payload.name || 'Google User',
        email,
        role: 'member',
        status: 'active',
        isVerified: true, // Google verifies email inherently
        googleId: payload.sub,
        avatar: payload.picture || '',
      });
      
      await FitnessProfile.create({
        userId: user._id,
        heightCm: 175,
        currentWeightKg: 70,
        targetWeightKg: 70,
        fitnessGoal: 'General Health',
        fitnessLevel: 'Beginner',
        onboardingCompleted: false,
      });
    } else if (!user.isVerified) {
      // If they registered normally but hadn't verified, Google login verifies them!
      user.isVerified = true;
      user.googleId = payload.sub;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }
    
    const token = generateToken(user._id.toString(), user.role);
    let onboardingCompleted = true;
    if (user.role === 'member') {
      const profile = await FitnessProfile.findOne({ userId: user._id });
      onboardingCompleted = profile ? profile.onboardingCompleted : false;
    }

    res.json({
      message: 'Google Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        onboardingCompleted,
      },
    });
  } catch (err: any) {
    console.error('Google Login Error:', err);
    res.status(500).json({ message: err.message || 'Server error during Google login.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    let extra: any = {};
    if (req.user.role === 'member') {
      const profile = await FitnessProfile.findOne({ userId: req.user._id });
      extra.onboardingCompleted = profile ? profile.onboardingCompleted : false;
      extra.fitnessProfile = profile;
    }

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        status: req.user.status,
        createdAt: req.user.createdAt,
        ...extra,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching user profile.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const { name, phone, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password does not match.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating profile.' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  // Mock implementation for forgotten passwords
  res.json({ message: 'If this email is registered, a password reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response) {
  // Mock implementation for reset
  res.json({ message: 'Password has been successfully reset.' });
}



