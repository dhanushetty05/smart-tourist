const Location = require('../models/Location');
const GeoZone = require('../models/GeoZone');

// Rule-based safety score calculation
async function calculateSafetyScore(touristId) {
  try {
    // Get recent locations (last 50)
    const locations = await Location.find({ touristId })
      .sort({ timestamp: -1 })
      .limit(50);

    if (locations.length < 5) {
      return 85.0; // Default score for new tourists
    }

    let score = 100.0;

    // Rule 1: Check movement patterns
    const movementScore = analyzeMovementPattern(locations);
    score -= (100 - movementScore) * 0.3;

    // Rule 2: Check time-based risk (late night movements)
    const timeScore = analyzeTimeBasedRisk(locations);
    score -= (100 - timeScore) * 0.2;

    // Rule 3: Check high-risk zone proximity
    const latestLocation = locations[0];
    const geoZones = await GeoZone.find({ riskLevel: 'high' });
    
    for (const zone of geoZones) {
      const distance = calculateDistance(
        latestLocation.latitude,
        latestLocation.longitude,
        zone.centerLat,
        zone.centerLng
      );
      
      if (distance < zone.radius) {
        score -= 20;
        break;
      }
    }

    // Rule 4: Check for erratic movement (rapid location changes)
    const erraticScore = detectErraticMovement(locations);
    score -= (100 - erraticScore) * 0.2;

    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error calculating safety score:', error);
    return 85.0;
  }
}

// Analyze movement patterns
function analyzeMovementPattern(locations) {
  if (locations.length < 10) return 100;

  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    const dist = calculateDistance(
      locations[i].latitude,
      locations[i].longitude,
      locations[i + 1].latitude,
      locations[i + 1].longitude
    );
    totalDistance += dist;
  }

  const avgDistance = totalDistance / (locations.length - 1);
  
  // Normal movement: 0-5 km average
  if (avgDistance < 5) return 100;
  if (avgDistance < 10) return 80;
  if (avgDistance < 20) return 60;
  return 40;
}

// Analyze time-based risk
function analyzeTimeBasedRisk(locations) {
  let nightMovements = 0;
  
  locations.forEach(loc => {
    const hour = new Date(loc.timestamp).getHours();
    // Consider 11 PM to 5 AM as high-risk hours
    if (hour >= 23 || hour <= 5) {
      nightMovements++;
    }
  });

  const nightRatio = nightMovements / locations.length;
  
  if (nightRatio < 0.1) return 100;
  if (nightRatio < 0.3) return 80;
  if (nightRatio < 0.5) return 60;
  return 40;
}

// Detect erratic movement
function detectErraticMovement(locations) {
  if (locations.length < 5) return 100;

  let rapidChanges = 0;
  
  for (let i = 0; i < locations.length - 1; i++) {
    const timeDiff = (new Date(locations[i].timestamp) - new Date(locations[i + 1].timestamp)) / 1000 / 60; // minutes
    const distance = calculateDistance(
      locations[i].latitude,
      locations[i].longitude,
      locations[i + 1].latitude,
      locations[i + 1].longitude
    );
    
    // If moved more than 5km in less than 10 minutes (unrealistic walking)
    if (distance > 5 && timeDiff < 10) {
      rapidChanges++;
    }
  }

  const erraticRatio = rapidChanges / (locations.length - 1);
  
  if (erraticRatio < 0.1) return 100;
  if (erraticRatio < 0.3) return 70;
  return 40;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = { calculateSafetyScore, calculateDistance };
