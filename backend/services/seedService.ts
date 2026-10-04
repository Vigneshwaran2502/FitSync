import { User } from '../models/User.js';
import { MembershipPlan } from '../models/MembershipPlan.js';
import { Subscription } from '../models/Subscription.js';
import { TrainerProfile } from '../models/TrainerProfile.js';
import { TrainerAvailability } from '../models/TrainerAvailability.js';
import { Appointment } from '../models/Appointment.js';
import { Exercise } from '../models/Exercise.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { Attendance } from '../models/Attendance.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { FitnessMeasurement } from '../models/FitnessMeasurement.js';
import { FitnessGoal } from '../models/FitnessGoal.js';
import { Notification } from '../models/Notification.js';
import { QRSession } from '../models/QRSession.js';
import { GYM_LOCATION } from '../config/constants.js';

export async function seedDatabase() {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    console.log('[Seed] Database already seeded. Skipping initial seed.');
    return;
  }

  console.log('[Seed] Seeding initial FitSync data...');

  // 1. Users
  const admin = await User.create({
    name: 'FitSync Director (Admin)',
    email: 'admin@fitsync.com',
    password: 'admin123',
    phone: '+1 (555) 019-2831',
    role: 'admin',
    status: 'active',
  });

  const trainer1 = await User.create({
    name: 'Marcus Vance',
    email: 'marcus@fitsync.com',
    password: 'trainer123',
    phone: '+1 (555) 024-8891',
    role: 'trainer',
    status: 'active',
  });

  const trainer2 = await User.create({
    name: 'Elena Rostova',
    email: 'elena@fitsync.com',
    password: 'trainer123',
    phone: '+1 (555) 039-4412',
    role: 'trainer',
    status: 'active',
  });

  const member1 = await User.create({
    name: 'Alex Chen',
    email: 'alex@fitsync.com',
    password: 'member123',
    phone: '+1 (555) 048-9102',
    role: 'member',
    status: 'active',
  });

  const member2 = await User.create({
    name: 'Sarah Miller',
    email: 'sarah@fitsync.com',
    password: 'member123',
    phone: '+1 (555) 057-2231',
    role: 'member',
    status: 'active',
  });

  const member3 = await User.create({
    name: 'Jordan Taylor',
    email: 'jordan@fitsync.com',
    password: 'member123',
    phone: '+1 (555) 066-7789',
    role: 'member',
    status: 'active',
  });

  // 2. Trainer Profiles
  await TrainerProfile.create({
    userId: trainer1._id,
    specialization: ['Strength & Conditioning', 'Powerlifting', 'Hypertrophy'],
    experienceYears: 7,
    bio: 'CSCS certified trainer specializing in progressive overload, compound movement mechanics, and injury-free strength progression.',
    certifications: ['NSCA-CSCS', 'USA Weightlifting Level 2', 'CPR/AED'],
    isAvailable: true,
    hourlyRate: 65,
    rating: 4.9,
    reviewCount: 38,
  });

  await TrainerProfile.create({
    userId: trainer2._id,
    specialization: ['Functional Mobility', 'HIIT', 'Endurance & Weight Loss'],
    experienceYears: 5,
    bio: 'Former collegiate athlete dedicated to functional athletic conditioning, postural restoration, and metabolic endurance training.',
    certifications: ['NASM-CPT', 'FMS Level 2', 'Precision Nutrition L1'],
    isAvailable: true,
    hourlyRate: 60,
    rating: 4.8,
    reviewCount: 29,
  });

  // 3. Trainer Availability (Monday through Friday slots)
  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  for (const day of days) {
    await TrainerAvailability.create({
      trainerId: trainer1._id,
      dayOfWeek: day,
      startTime: '08:00',
      endTime: '16:00',
      slotDurationMinutes: 60,
      isAvailable: true,
    });
    await TrainerAvailability.create({
      trainerId: trainer2._id,
      dayOfWeek: day,
      startTime: '10:00',
      endTime: '18:00',
      slotDurationMinutes: 60,
      isAvailable: true,
    });
  }

  // 4. Membership Plans
  const basicPlan = await MembershipPlan.create({
    name: 'Basic Access',
    description: 'Full gym floor and locker room access during standard open hours.',
    durationMonths: 1,
    price: 39,
    features: ['Standard gym floor access', 'Locker & shower facilities', 'Free Wi-Fi', 'FitSync Mobile App'],
    tier: 'basic',
    isActive: true,
  });

  const proPlan = await MembershipPlan.create({
    name: 'Pro Performance',
    description: 'Unlimited 24/7 access, group classes, sauna, and monthly trainer check-in.',
    durationMonths: 3,
    price: 89,
    features: [
      '24/7 Unlimited access',
      'All group fitness & HIIT classes',
      'Infrared sauna & recovery zone',
      '1 Monthly trainer consultation',
      'Custom workout plan generation',
    ],
    tier: 'standard',
    isActive: true,
  });

  const elitePlan = await MembershipPlan.create({
    name: 'Elite All-Access',
    description: 'Comprehensive fitness mastery: unlimited personal training sessions, recovery lounge, and nutrition tracking.',
    durationMonths: 6,
    price: 159,
    features: [
      '24/7 Premium all-facility access',
      '4 Monthly 1-on-1 personal training sessions',
      'Full body composition & DEXA reviews',
      'Custom nutritional meal plans',
      'Priority appointment booking',
    ],
    tier: 'premium',
    isActive: true,
  });

  const annualVip = await MembershipPlan.create({
    name: 'Annual VIP Athlete',
    description: 'Year-long VIP membership with dedicated private locker and monthly guest passes.',
    durationMonths: 12,
    price: 999,
    features: [
      '365 Days uninterrupted VIP access',
      'Dedicated personal trainer pairing',
      'Free FitSync apparel pack',
      '5 Guest passes per month',
      'Unlimited recovery lounge access',
    ],
    tier: 'vip',
    isActive: true,
  });

  // 5. Subscriptions
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextThreeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringSoon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  await Subscription.create({
    userId: member1._id,
    planId: proPlan._id,
    startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    endDate: nextThreeMonths,
    status: 'active',
    paymentStatus: 'paid',
    paymentAmount: 89,
  });

  await Subscription.create({
    userId: member2._id,
    planId: elitePlan._id,
    startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    endDate: expiringSoon,
    status: 'active',
    paymentStatus: 'paid',
    paymentAmount: 159,
  });

  await Subscription.create({
    userId: member3._id,
    planId: basicPlan._id,
    startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    endDate: nextMonth,
    status: 'active',
    paymentStatus: 'paid',
    paymentAmount: 39,
  });

  // 6. Exercises
  const exercisesData = [
    {
      name: 'Barbell Back Squat',
      muscleGroup: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      instructions: 'Keep chest upright, brace core, break at hips and knees simultaneously, descend until hip crease is below knee, drive up through midfoot.',
    },
    {
      name: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Plant feet firmly, arch upper back slightly, retract scapulae, lower bar to mid-sternum under control, press up lockout.',
    },
    {
      name: 'Conventional Deadlift',
      muscleGroup: 'Back',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      instructions: 'Stand hip-width apart, grip bar just outside knees, hinge at hips, pull slack out of bar, drive floor away.',
    },
    {
      name: 'Overhead Barbell Press',
      muscleGroup: 'Shoulders',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Grip shoulder width, squeeze glutes and core, press vertical trajectory clearing head back slightly, lock overhead.',
    },
    {
      name: 'Incline Dumbbell Press',
      muscleGroup: 'Chest',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Bench set to 30 degrees, press dumbbells overhead in a smooth converging arc, controlled 2-second negative.',
    },
    {
      name: 'Bulgarian Split Squat',
      muscleGroup: 'Legs',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Rear foot elevated on bench, torso tilted slightly forward, lower until back knee hovers above floor, push through front foot.',
    },
    {
      name: 'Lat Pulldown',
      muscleGroup: 'Back',
      equipment: 'Cable',
      difficulty: 'Beginner',
      instructions: 'Slight lean back, pull bar to upper chest pulling with elbows, pause 1 second at bottom, full stretch at top.',
    },
    {
      name: 'Dumbbell Romanian Deadlift',
      muscleGroup: 'Legs',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Slight knee bend, hinge at hips pushing hips backwards, keep dumbbells grazing thighs, squeeze hamstrings to return.',
    },
    {
      name: 'Cable Triceps Pushdown',
      muscleGroup: 'Arms',
      equipment: 'Cable',
      difficulty: 'Beginner',
      instructions: 'Elbows pinned to sides, push cable down to full elbow extension, control eccentric return to 90 degrees.',
    },
    {
      name: 'Dumbbell Incline Biceps Curl',
      muscleGroup: 'Arms',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      instructions: 'Sit on 45-degree incline bench, arms fully hung, curl dumbbells while supinating wrists, squeeze peak contraction.',
    },
    {
      name: 'Plank Hold',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      instructions: 'Forearms parallel, shoulder directly over elbows, maintain straight neutral spine, squeeze glutes.',
    },
    {
      name: 'Hanging Leg Raise',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Advanced',
      instructions: 'Hang from pullup bar without swinging, engage lower abs to lift legs up to 90 degrees or touch toes to bar.',
    },
    {
      name: 'Rowing Ergometer 500m Intervals',
      muscleGroup: 'Cardio',
      equipment: 'Machine',
      difficulty: 'Intermediate',
      instructions: 'Drive with legs, lean back slightly with torso, finish with arms to lower ribs, reverse order smoothly.',
    },
  ];

  const createdExercises: any[] = [];
  for (const ex of exercisesData) {
    const doc = await Exercise.create(ex);
    createdExercises.push(doc);
  }

  // 7. Workout Plan for Alex Chen (Member 1)
  const squatEx = createdExercises.find((e) => e.name === 'Barbell Back Squat');
  const benchEx = createdExercises.find((e) => e.name === 'Barbell Bench Press');
  const deadliftEx = createdExercises.find((e) => e.name === 'Conventional Deadlift');
  const overheadEx = createdExercises.find((e) => e.name === 'Overhead Barbell Press');
  const pulldownEx = createdExercises.find((e) => e.name === 'Lat Pulldown');
  const plankEx = createdExercises.find((e) => e.name === 'Plank Hold');

  const alexWorkoutPlan = await WorkoutPlan.create({
    memberId: member1._id,
    trainerId: trainer1._id,
    name: 'Strength & Hypertrophy Foundation (Phase 1)',
    goal: 'Build core compound strength and improve lean body mass',
    difficulty: 'Intermediate',
    durationWeeks: 6,
    startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    status: 'active',
    notes: 'Prioritize barbell form and keep 2 reps in reserve on all compound working sets.',
    exercises: [
      {
        exerciseId: squatEx._id,
        dayOfWeek: 'Monday',
        sets: 4,
        reps: 6,
        targetWeightKg: 100,
        restSeconds: 120,
        notes: 'Warm up thoroughly with empty bar and progressive ramp.',
        order: 1,
      },
      {
        exerciseId: benchEx._id,
        dayOfWeek: 'Monday',
        sets: 4,
        reps: 8,
        targetWeightKg: 80,
        restSeconds: 90,
        notes: 'Pause 0.5s at chest.',
        order: 2,
      },
      {
        exerciseId: pulldownEx._id,
        dayOfWeek: 'Monday',
        sets: 3,
        reps: 10,
        targetWeightKg: 65,
        restSeconds: 60,
        notes: 'Full lat stretch at peak elevation.',
        order: 3,
      },
      {
        exerciseId: deadliftEx._id,
        dayOfWeek: 'Wednesday',
        sets: 3,
        reps: 5,
        targetWeightKg: 130,
        restSeconds: 150,
        notes: 'Reset between each repetition on floor.',
        order: 1,
      },
      {
        exerciseId: overheadEx._id,
        dayOfWeek: 'Wednesday',
        sets: 4,
        reps: 6,
        targetWeightKg: 50,
        restSeconds: 90,
        notes: 'Strict standing press without leg drive.',
        order: 2,
      },
      {
        exerciseId: plankEx._id,
        dayOfWeek: 'Wednesday',
        sets: 3,
        reps: 60,
        targetWeightKg: 0,
        restSeconds: 45,
        notes: 'Hold for 60 seconds each set.',
        order: 3,
      },
      {
        exerciseId: squatEx._id,
        dayOfWeek: 'Friday',
        sets: 3,
        reps: 10,
        targetWeightKg: 85,
        restSeconds: 90,
        notes: 'Controlled tempo 3-1-1.',
        order: 1,
      },
    ],
  });

  // 8. Workout Logs for Alex Chen
  const todayStr = now.toISOString().split('T')[0];
  const dateAgo = (daysAgo: number) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  await WorkoutLog.create({
    memberId: member1._id,
    workoutPlanId: alexWorkoutPlan._id,
    exerciseId: squatEx._id,
    date: dateAgo(2),
    setsCompleted: 4,
    repsCompleted: 6,
    weightUsedKg: 100,
    difficultyRating: 4,
    notes: 'Hit all 4 sets clean. Knee stability felt great.',
    durationMinutes: 45,
  });

  await WorkoutLog.create({
    memberId: member1._id,
    workoutPlanId: alexWorkoutPlan._id,
    exerciseId: benchEx._id,
    date: dateAgo(2),
    setsCompleted: 4,
    repsCompleted: 8,
    weightUsedKg: 80,
    difficultyRating: 3,
    notes: 'Solid chest pump, ready for 82.5kg next week.',
    durationMinutes: 30,
  });

  await WorkoutLog.create({
    memberId: member1._id,
    workoutPlanId: alexWorkoutPlan._id,
    exerciseId: deadliftEx._id,
    date: dateAgo(4),
    setsCompleted: 3,
    repsCompleted: 5,
    weightUsedKg: 130,
    difficultyRating: 4,
    notes: 'Felt powerful off floor, grip was solid.',
    durationMinutes: 40,
  });

  // 9. Attendance records
  const attendanceDates = [0, 2, 4, 7, 9, 11, 14, 16, 18, 21];
  for (const d of attendanceDates) {
    await Attendance.create({
      userId: member1._id,
      date: dateAgo(d),
      checkInTime: '07:15',
      checkOutTime: '08:45',
      status: 'checked_out',
      verificationMethod: d % 2 === 0 ? 'qr' : 'gps',
      latitude: GYM_LOCATION.latitude + (Math.random() - 0.5) * 0.001,
      longitude: GYM_LOCATION.longitude + (Math.random() - 0.5) * 0.001,
      distanceMeters: Math.floor(Math.random() * 80) + 15,
      notes: 'Morning training session',
    });
  }

  // Sarah attendance
  await Attendance.create({
    userId: member2._id,
    date: dateAgo(1),
    checkInTime: '17:30',
    checkOutTime: '18:50',
    status: 'checked_out',
    verificationMethod: 'qr',
    distanceMeters: 25,
  });

  // Today active check-in for Sarah
  await Attendance.create({
    userId: member2._id,
    date: todayStr,
    checkInTime: '11:00',
    status: 'present',
    verificationMethod: 'manual',
    notes: 'Checked in by desk supervisor',
  });

  // 10. Fitness Profile & Measurements for Alex Chen
  await FitnessProfile.create({
    userId: member1._id,
    heightCm: 178,
    currentWeightKg: 78.5,
    targetWeightKg: 75.0,
    dateOfBirth: '1996-05-14',
    gender: 'male',
    fitnessGoal: 'Muscle Gain',
    fitnessLevel: 'Intermediate',
    medicalConditions: 'None',
    assignedTrainerId: trainer1._id,
    onboardingCompleted: true,
  });

  await FitnessProfile.create({
    userId: member2._id,
    heightCm: 165,
    currentWeightKg: 64.0,
    targetWeightKg: 60.0,
    dateOfBirth: '1998-11-20',
    gender: 'female',
    fitnessGoal: 'Weight Loss',
    fitnessLevel: 'Intermediate',
    medicalConditions: 'Minor left wrist stiffness',
    assignedTrainerId: trainer2._id,
    onboardingCompleted: true,
  });

  await FitnessProfile.create({
    userId: member3._id,
    heightCm: 182,
    currentWeightKg: 88.0,
    targetWeightKg: 82.0,
    dateOfBirth: '2000-02-10',
    gender: 'male',
    fitnessGoal: 'General Health',
    fitnessLevel: 'Beginner',
    medicalConditions: 'None',
    onboardingCompleted: false, // Incomplete onboarding to test flow!
  });

  // Fitness measurements for Alex Chen (weight history over last 6 weeks)
  const measurements = [
    { daysAgo: 35, weight: 82.0, chest: 104, waist: 88, arms: 36, bodyFat: 21.0 },
    { daysAgo: 28, weight: 81.2, chest: 104, waist: 87, arms: 36.2, bodyFat: 20.3 },
    { daysAgo: 21, weight: 80.5, chest: 104.5, waist: 86, arms: 36.5, bodyFat: 19.8 },
    { daysAgo: 14, weight: 79.8, chest: 105, waist: 85, arms: 36.8, bodyFat: 19.2 },
    { daysAgo: 7, weight: 79.1, chest: 105.5, waist: 84.5, arms: 37.0, bodyFat: 18.6 },
    { daysAgo: 0, weight: 78.5, chest: 106, waist: 84, arms: 37.2, bodyFat: 18.2 },
  ];

  for (const m of measurements) {
    await FitnessMeasurement.create({
      userId: member1._id,
      date: dateAgo(m.daysAgo),
      weightKg: m.weight,
      chestCm: m.chest,
      waistCm: m.waist,
      armsCm: m.arms,
      bodyFatPercent: m.bodyFat,
      notes: `Week ${6 - Math.floor(m.daysAgo / 7)} check-in progress`,
    });
  }

  // 11. Fitness Goals for Alex Chen
  await FitnessGoal.create({
    userId: member1._id,
    title: 'Achieve 75kg Target Weight with 15% Body Fat',
    category: 'Weight',
    targetValue: 75.0,
    currentValue: 78.5,
    unit: 'kg',
    targetDate: '2026-12-15',
    status: 'active',
    notes: 'Steady caloric deficit with high protein intake.',
  });

  await FitnessGoal.create({
    userId: member1._id,
    title: 'Bench Press 100kg for 3 Reps',
    category: 'Strength',
    targetValue: 100,
    currentValue: 85,
    unit: 'kg',
    targetDate: '2026-11-30',
    status: 'active',
    notes: 'Progressive weekly +2.5kg loading.',
  });

  await FitnessGoal.create({
    userId: member1._id,
    title: 'Complete 20 Gym Sessions in a Month',
    category: 'Attendance',
    targetValue: 20,
    currentValue: 20,
    unit: 'sessions',
    targetDate: '2026-09-30',
    status: 'achieved',
    notes: 'Goal accomplished! Consistent 5-day routine maintained.',
  });

  // 12. Appointments
  const tomorrowStr = dateAgo(-1);
  const nextWeekStr = dateAgo(-4);

  await Appointment.create({
    memberId: member1._id,
    trainerId: trainer1._id,
    date: tomorrowStr,
    startTime: '10:00',
    endTime: '11:00',
    topic: 'Barbell Deadlift Mechanics & Video Form Check',
    status: 'confirmed',
    notes: 'Bring lifting shoes and belt for heavy singles analysis.',
  });

  await Appointment.create({
    memberId: member2._id,
    trainerId: trainer2._id,
    date: nextWeekStr,
    startTime: '14:00',
    endTime: '15:00',
    topic: 'Metabolic Conditioning & Nutrition Review',
    status: 'pending',
    notes: 'Reviewing recent heart rate recovery data.',
  });

  // 13. Notifications
  await Notification.create({
    userId: member1._id,
    title: 'New Workout Plan Assigned',
    message: 'Coach Marcus Vance assigned "Strength & Hypertrophy Foundation (Phase 1)" to your profile.',
    type: 'workout',
    isRead: false,
    actionUrl: '/member/workouts',
  });

  await Notification.create({
    userId: member1._id,
    title: 'Goal Achieved!',
    message: 'Congratulations! You accomplished your "Complete 20 Gym Sessions in a Month" milestone.',
    type: 'goal',
    isRead: false,
    actionUrl: '/member/progress',
  });

  await Notification.create({
    userId: member1._id,
    title: 'Appointment Confirmed',
    message: 'Your training session with Marcus Vance tomorrow at 10:00 AM has been confirmed.',
    type: 'appointment',
    isRead: true,
    actionUrl: '/member/appointments',
  });

  await Notification.create({
    userId: trainer1._id,
    title: 'New Appointment Booking',
    message: 'Alex Chen booked a form check session for tomorrow at 10:00 AM.',
    type: 'appointment',
    isRead: false,
    actionUrl: '/trainer/appointments',
  });

  await Notification.create({
    userId: admin._id,
    title: 'Expiring Membership Alert',
    message: "Member Sarah Miller's Elite All-Access subscription expires in 3 days.",
    type: 'subscription',
    isRead: false,
    actionUrl: '/admin/subscriptions',
  });

  // 14. Active QR Session for Admin/Attendance
  const qrExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity
  await QRSession.create({
    code: `FITSYNC-${Date.now().toString(36).toUpperCase()}`,
    isActive: true,
    expiresAt: qrExpiry,
    gymLatitude: GYM_LOCATION.latitude,
    gymLongitude: GYM_LOCATION.longitude,
    maxRadiusMeters: GYM_LOCATION.maxAllowedDistanceMeters,
  });

  console.log('[Seed] Database successfully seeded with full production data!');
}
