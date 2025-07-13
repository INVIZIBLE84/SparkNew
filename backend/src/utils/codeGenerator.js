const crypto = require('crypto');

class CodeGenerator {
  static generateSessionCodes(count = 3) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.floor(Math.random() * 90) + 10); // 10-99
    }
    return codes;
  }

  static selectCorrectCode(codes) {
    if (!Array.isArray(codes)) {
      throw new Error('Codes must be an array');
    }
    return codes[Math.floor(Math.random() * codes.length)];
  }

  static generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  static generateRandomString(length = 32) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  static generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
}

module.exports = CodeGenerator;