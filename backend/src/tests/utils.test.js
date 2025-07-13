const { CodeGenerator, Encryption } = require('../utils');
const bcrypt = require('bcryptjs');

describe('Utility Functions', () => {
  describe('CodeGenerator', () => {
    it('should generate session codes', () => {
      const codes = CodeGenerator.generateSessionCodes();
      expect(codes.length).toBe(3);
      codes.forEach(code => {
        expect(code).toBeGreaterThanOrEqual(10);
        expect(code).toBeLessThanOrEqual(99);
      });
    });
  });

  describe('Encryption', () => {
    const plainText = 'Test@123';
    
    it('should hash passwords', async () => {
      const hashed = await Encryption.hashPassword(plainText);
      expect(hashed).not.toBe(plainText);
      expect(hashed.length).toBeGreaterThan(30);
    });

    it('should verify correct passwords', async () => {
      const hashed = await bcrypt.hash(plainText, 10);
      const isValid = await Encryption.comparePassword(plainText, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const hashed = await bcrypt.hash(plainText, 10);
      const isValid = await Encryption.comparePassword('Wrong@123', hashed);
      expect(isValid).toBe(false);
    });
  });
});