// countdown.js - Exam Countdown Module

const ExamCountdown = {
  /**
   * Calculates time components until target date
   * @param {string|Date} targetDateStr 
   * @returns {Object} countdown state
   */
  getTimeRemaining(targetDateStr) {
    const targetDate = new Date(targetDateStr);
    const now = new Date();
    const totalMs = targetDate.getTime() - now.getTime();
    
    if (totalMs <= 0) {
      return {
        totalMs: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPassed: true,
        isCritical: false
      };
    }
    
    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / 1000 / 60) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    
    // Critical if less than 48 hours remaining
    const isCritical = totalMs <= (48 * 60 * 60 * 1000);
    
    return {
      totalMs,
      days,
      hours,
      minutes,
      seconds,
      isPassed: false,
      isCritical
    };
  },

  /**
   * Helper to format double digits (e.g. 9 -> "09")
   */
  formatDigit(num) {
    return num.toString().padStart(2, '0');
  }
};

window.ExamCountdown = ExamCountdown;
