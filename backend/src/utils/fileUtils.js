const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class FileUtils {
  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dirPath}`);
    }
  }

  static deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error deleting file ${filePath}:`, error);
      throw new Error('File deletion failed');
    }
  }

  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  static isValidFileType(filename, allowedExtensions) {
    const ext = this.getFileExtension(filename);
    return allowedExtensions.includes(ext);
  }

  static readJsonFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error reading JSON file ${filePath}:`, error);
      throw new Error('Failed to read JSON file');
    }
  }
}

module.exports = FileUtils;