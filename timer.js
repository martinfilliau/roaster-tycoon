// ===== CORE LOGIC (Pure functions - testable) =====

/**
 * Format seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Calculate development time percentage
 * @param {number} developmentSeconds - Development time in seconds
 * @param {number} targetMinutes - Target total time in minutes
 * @returns {number} Development percentage
 */
function calculateDevelopmentPercentage(developmentSeconds, targetMinutes) {
  if (targetMinutes <= 0) return 0;
  const targetSeconds = targetMinutes * 60;
  return (developmentSeconds / targetSeconds) * 100;
}

/**
 * Calculate development time
 * @param {number} totalSeconds - Total elapsed time
 * @param {number} crackSeconds - Time when first crack occurred
 * @returns {number} Development time in seconds
 */
function calculateDevelopmentTime(totalSeconds, crackSeconds) {
  if (crackSeconds === null || crackSeconds === undefined) return 0;
  return totalSeconds - crackSeconds;
}

// ===== UI LOGIC (Browser only) =====

function initializeTimer() {
  // Timer state
  let elapsedSeconds = 0;
  let isRunning = false;
  let intervalId = null;
  let firstCrackTime = null;

  // DOM elements
  const timerDisplay = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const crackBtn = document.getElementById("crackBtn");
  const crackTimeDisplay = document.getElementById("crackTime");
  const devTimeDisplay = document.getElementById("devTime");
  const devPercentDisplay = document.getElementById("devPercent");
  const targetTimeInput = document.getElementById("targetTime");
  const targetDisplay = document.getElementById("targetDisplay");

  function updateDisplay() {
    timerDisplay.textContent = formatTime(elapsedSeconds);

    if (firstCrackTime !== null) {
      const developmentTime = calculateDevelopmentTime(
        elapsedSeconds,
        firstCrackTime,
      );
      devTimeDisplay.textContent = formatTime(developmentTime);

      const targetMinutes = parseFloat(targetTimeInput.value);
      const devPercent = calculateDevelopmentPercentage(
        developmentTime,
        targetMinutes,
      );
      devPercentDisplay.textContent = `${Math.round(devPercent)}%`;
    }
  }

  function updateTargetDisplay() {
    const targetMinutes = parseFloat(targetTimeInput.value);
    const targetSeconds = Math.round(targetMinutes * 60);
    targetDisplay.textContent = formatTime(targetSeconds);
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      startBtn.style.display = "none";
      pauseBtn.style.display = "block";
      crackBtn.disabled = false;

      intervalId = setInterval(() => {
        elapsedSeconds++;
        updateDisplay();
      }, 1000);
    }
  }

  function pauseTimer() {
    if (isRunning) {
      isRunning = false;
      startBtn.style.display = "block";
      pauseBtn.style.display = "none";
      clearInterval(intervalId);
    }
  }

  function resetTimer() {
    pauseTimer();
    elapsedSeconds = 0;
    firstCrackTime = null;
    crackBtn.disabled = true;
    crackBtn.textContent = "Marquer Premier Crack";
    crackBtn.style.background =
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";
    timerDisplay.textContent = "00:00";
    crackTimeDisplay.textContent = "--:--";
    devTimeDisplay.textContent = "--:--";
    devPercentDisplay.textContent = "--%";
  }

  function markFirstCrack() {
    if (isRunning && firstCrackTime === null) {
      firstCrackTime = elapsedSeconds;
      crackTimeDisplay.textContent = formatTime(firstCrackTime);
      crackBtn.textContent = "✓ Premier Crack Marqué";
      crackBtn.disabled = true;
      crackBtn.style.background =
        "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
    }
  }

  // Event listeners
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  crackBtn.addEventListener("click", markFirstCrack);
  targetTimeInput.addEventListener("input", updateTargetDisplay);

  // Initialization
  updateTargetDisplay();
}

// Initialize when DOM is ready (browser only)
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTimer);
  } else {
    initializeTimer();
  }
}

// Export functions for testing (Node.js)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatTime,
    calculateDevelopmentPercentage,
    calculateDevelopmentTime,
  };
}
