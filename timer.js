// timer.js - Pomodoro Timer Module

const PomodoroTimer = {
  // Timer State
  focusDuration: 25, // in minutes
  shortBreakDuration: 5,
  longBreakDuration: 15,
  
  currentMode: 'focus', // 'focus' | 'short' | 'long'
  timeLeft: 0, // in seconds
  totalTime: 0, // in seconds
  timerInterval: null,
  isRunning: false,

  // Callback to invoke on tick and state changes
  onTickCallback: null,
  onCompleteCallback: null,

  init(onTick, onComplete) {
    this.onTickCallback = onTick;
    this.onCompleteCallback = onComplete;
    this.setMode('focus');
  },

  updateDurations(focus, short, long) {
    this.focusDuration = focus;
    this.shortBreakDuration = short;
    this.longBreakDuration = long;
    
    // If we're not currently running, reset the current mode's duration
    if (!this.isRunning) {
      this.setMode(this.currentMode);
    }
  },

  setMode(mode) {
    this.stop();
    this.currentMode = mode;
    
    let minutes = this.focusDuration;
    if (mode === 'short') {
      minutes = this.shortBreakDuration;
    } else if (mode === 'long') {
      minutes = this.longBreakDuration;
    }

    this.timeLeft = minutes * 60;
    this.totalTime = this.timeLeft;
    
    if (this.onTickCallback) {
      this.onTickCallback(this.timeLeft, this.totalTime, this.currentMode);
    }
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Resume AudioContext check in browser
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.stop();
        this.playAlarmSound();
        if (this.onCompleteCallback) {
          this.onCompleteCallback(this.currentMode);
        }
      } else {
        if (this.onTickCallback) {
          this.onTickCallback(this.timeLeft, this.totalTime, this.currentMode);
        }
      }
    }, 1000);
  },

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  },

  stop() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  reset() {
    this.setMode(this.currentMode);
  },

  playAlarmSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // We will make a pleasant double chime
      const playBeep = (time, freq) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        
        gainNode.gain.setValueAtTime(0.2, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.45);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + 0.5);
      };
      
      const now = audioCtx.currentTime;
      playBeep(now, 523.25); // C5
      playBeep(now + 0.2, 659.25); // E5
      playBeep(now + 0.4, 783.99); // G5
      playBeep(now + 0.6, 1046.50); // C6
    } catch (e) {
      console.warn("Audio Context beep failed, browser policies might block it until interaction.", e);
    }
  }
};

window.PomodoroTimer = PomodoroTimer;
