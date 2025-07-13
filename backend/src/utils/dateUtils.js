const moment = require('moment-timezone');

class DateUtils {
  static getCurrentDateTime() {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  }

  static formatDateForDisplay(date, format = 'DD MMM YYYY') {
    return moment(date).tz('Asia/Kolkata').format(format);
  }

  static addMinutesToDate(date, minutes) {
    return moment(date).tz('Asia/Kolkata').add(minutes, 'minutes').toDate();
  }

  static isDateExpired(date) {
    return moment(date).tz('Asia/Kolkata').isBefore(moment());
  }

  static getDateRange(startDate, endDate) {
    const start = moment(startDate).tz('Asia/Kolkata');
    const end = moment(endDate).tz('Asia/Kolkata');
    const days = end.diff(start, 'days');
    
    return {
      start: start.format('DD MMM YYYY'),
      end: end.format('DD MMM YYYY'),
      days
    };
  }

  static getAcademicYear() {
    const now = moment().tz('Asia/Kolkata');
    const year = now.month() >= 6 ? now.year() : now.year() - 1;
    return `${year}-${year + 1}`;
  }
}

module.exports = DateUtils;