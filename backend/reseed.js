const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/fitsync');
  
  // Get models dynamically
  const planSchema = new mongoose.Schema({
    name: String,
    description: String,
    durationMonths: Number,
    price: Number,
    features: [String],
    tier: String,
    isActive: Boolean
  }, { collection: 'membershipplans' });
  const MembershipPlan = mongoose.model('MembershipPlan', planSchema);

  // Clear existing plans
  await MembershipPlan.deleteMany({});
  
  // Insert new plans
  const plans = [
    {
      name: 'Basic Access',
      description: 'Full gym floor and locker room access during standard open hours.',
      durationMonths: 1,
      price: 999,
      features: ['Standard gym floor access', 'Locker & shower facilities', 'Free Wi-Fi', 'FitSync Mobile App'],
      tier: 'basic',
      isActive: true,
    },
    {
      name: 'Pro Performance',
      description: 'Unlimited 24/7 access, group classes, sauna, and monthly trainer check-in.',
      durationMonths: 3,
      price: 1999,
      features: [
        '24/7 Unlimited access',
        'All group fitness & HIIT classes',
        'Infrared sauna & recovery zone',
        '1 Monthly trainer consultation',
        'Custom workout plan generation',
      ],
      tier: 'standard',
      isActive: true,
    },
    {
      name: 'Elite All-Access',
      description: 'Comprehensive fitness mastery: unlimited personal training sessions, recovery lounge, and nutrition tracking.',
      durationMonths: 6,
      price: 2999,
      features: [
        '24/7 Premium all-facility access',
        '4 Monthly 1-on-1 personal training sessions',
        'Full body composition & DEXA reviews',
        'Custom nutritional meal plans',
        'Priority appointment booking',
      ],
      tier: 'premium',
      isActive: true,
    },
    {
      name: 'Annual VIP Athlete',
      description: 'Year-long VIP membership with dedicated private locker and monthly guest passes.',
      durationMonths: 12,
      price: 9999,
      features: [
        '365 Days uninterrupted VIP access',
        'Dedicated personal trainer pairing',
        'Free FitSync apparel pack',
        '5 Guest passes per month',
        'Unlimited recovery lounge access',
      ],
      tier: 'vip',
      isActive: true,
    }
  ];

  await MembershipPlan.insertMany(plans);
  console.log('Database seeded with exact requested plans.');
  process.exit(0);
}

run().catch(console.error);
