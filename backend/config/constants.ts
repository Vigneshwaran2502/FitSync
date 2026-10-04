export const JWT_SECRET = process.env.JWT_SECRET || 'fitsync-secret-jwt-key-2026-production';
export const JWT_EXPIRES_IN = '7d';

// Gym default location for GPS attendance verification (San Francisco Fitness Flagship)
export const GYM_LOCATION = {
  name: 'FitSync Flagship Center',
  street: '1000 Market Street',
  neighborhood: 'Civic Center / Mid-Market',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'United States',
  formattedAddress: '1000 Market Street, San Francisco, CA 94102, USA',
  latitude: 37.7749,
  longitude: -122.4194,
  maxAllowedDistanceMeters: 1000, // 1 km radius for GPS check-in verification
};

