const JWT_SECRET = process.env.JWT_SECRET || "fitsync-secret-jwt-key-2026-production";
const JWT_EXPIRES_IN = "7d";
const GYM_LOCATION = {
  name: "Easwari Engineering College",
  street: "Bharathi Salai",
  neighborhood: "Ramapuram",
  city: "Chennai",
  state: "Tamil Nadu",
  postalCode: "600089",
  country: "India",
  formattedAddress: "Easwari Engineering College, Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089, India",
  latitude: 13.0335,
  longitude: 80.1855,
  maxAllowedDistanceMeters: 100
  // 100 meters radius for strict GPS check-in verification
};
export {
  GYM_LOCATION,
  JWT_EXPIRES_IN,
  JWT_SECRET
};
