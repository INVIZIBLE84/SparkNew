const geolib = require('geolib');
const logger = require('./logger');

class ProximityUtils {
  static isWithinRadius(center, point, radiusMeters) {
    try {
      const distance = geolib.getDistance(center, point);
      return distance <= radiusMeters;
    } catch (error) {
      logger.error('Proximity check error:', error);
      return false;
    }
  }

  static verifyWifiConnection(allowedSSIDs) {
    // This would be implemented differently in a real app
    // For demo purposes, we'll simulate checking against allowed SSIDs
    const currentSSID = 'CAMPUS_WIFI'; // This would come from device API
    return allowedSSIDs.includes(currentSSID.toUpperCase());
  }

  static verifyBluetoothProximity(deviceId, allowedDevices) {
    // This would be implemented differently in a real app
    // For demo purposes, we'll simulate checking against allowed devices
    return allowedDevices.includes(deviceId);
  }
}

module.exports = ProximityUtils;