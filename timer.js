// ===== INTERNATIONALIZATION =====

const translations = {
  fr: {
    title: "☕ Suivi de Torréfaction",
    start: "Démarrer",
    pause: "Pause",
    reset: "Reset",
    targetLabel: "Temps Total Cible (minutes)",
    markCrack: "Marquer Premier Crack",
    crackMarked: "✓ Premier Crack Marqué",
    firstCrack: "Premier Crack",
    developmentTime: "Temps de Développement",
    developmentPercent: "% Développement",
    targetTotal: "Temps Total Cible",
  },
  en: {
    title: "☕ Coffee Roast Tracker",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    targetLabel: "Target Total Time (minutes)",
    markCrack: "Mark First Crack",
    crackMarked: "✓ First Crack Marked",
    firstCrack: "First Crack",
    developmentTime: "Development Time",
    developmentPercent: "% Development",
    targetTotal: "Target Total Time",
  },
};

// Detect browser language or default to French
function getPreferredLanguage() {
  if (typeof navigator === "undefined") return "fr";
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith("en") ? "en" : "fr";
}

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

// ===== WAKE LOCK (Prevent screen sleep) =====

let wakeLock = null;

async function requestWakeLock() {
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake Lock activated");

      // Handle wake lock release (e.g., when tab becomes hidden)
      wakeLock.addEventListener("release", () => {
        console.log("Wake Lock released");
      });

      return true;
    } catch (err) {
      console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      return false;
    }
  } else {
    console.warn("Wake Lock API not supported");
    return false;
  }
}

async function releaseWakeLock() {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log("Wake Lock manually released");
    } catch (err) {
      console.error(`Wake Lock release error: ${err.message}`);
    }
  }
}

// Re-request wake lock when page becomes visible again
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", async () => {
    if (wakeLock !== null && document.visibilityState === "visible") {
      await requestWakeLock();
    }
  });
}

// ===== UI LOGIC (Browser only) =====

function initializeTimer() {
  // Get language preference
  const lang = getPreferredLanguage();
  const t = translations[lang];

  // Timer state
  let elapsedSeconds = 0;
  let isRunning = false;
  let intervalId = null;
  let firstCrackTime = null;

  // DOM elements
  const titleElement = document.querySelector("h1");
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
  const targetLabel = document.querySelector(".target-label");
  const langToggle = document.getElementById("langToggle");

  // Apply initial translations
  function applyTranslations() {
    titleElement.textContent = t.title;
    startBtn.textContent = t.start;
    pauseBtn.textContent = t.pause;
    resetBtn.textContent = t.reset;
    targetLabel.textContent = t.targetLabel;
    crackBtn.textContent = t.markCrack;

    document.querySelectorAll(".info-label")[0].textContent = t.firstCrack;
    document.querySelectorAll(".info-label")[1].textContent = t.developmentTime;
    document.querySelectorAll(".info-label")[2].textContent =
      t.developmentPercent;
    document.querySelectorAll(".info-label")[3].textContent = t.targetTotal;

    langToggle.textContent = lang === "fr" ? "EN" : "FR";
  }

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

      // Request wake lock when timer starts
      requestWakeLock();

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

      // Release wake lock when timer pauses
      releaseWakeLock();
    }
  }

  function resetTimer() {
    pauseTimer();
    elapsedSeconds = 0;
    firstCrackTime = null;
    crackBtn.disabled = true;
    crackBtn.textContent = t.markCrack;
    crackBtn.style.background =
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";
    timerDisplay.textContent = "00:00";
    crackTimeDisplay.textContent = "--:--";
    devTimeDisplay.textContent = "--:--";
    devPercentDisplay.textContent = "--%";

    // Ensure wake lock is released on reset
    releaseWakeLock();
  }

  function markFirstCrack() {
    if (isRunning && firstCrackTime === null) {
      firstCrackTime = elapsedSeconds;
      crackTimeDisplay.textContent = formatTime(firstCrackTime);
      crackBtn.textContent = t.crackMarked;
      crackBtn.disabled = true;
      crackBtn.style.background =
        "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
    }
  }

  function toggleLanguage() {
    const newLang = lang === "fr" ? "en" : "fr";
    // Reload page with new language preference
    localStorage.setItem("preferredLanguage", newLang);
    location.reload();
  }

  // Event listeners
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  crackBtn.addEventListener("click", markFirstCrack);
  targetTimeInput.addEventListener("input", updateTargetDisplay);
  langToggle.addEventListener("click", toggleLanguage);

  // Initialization
  applyTranslations();
  updateTargetDisplay();
}

// Initialize when DOM is ready (browser only)
if (typeof document !== "undefined") {
  // Check for stored language preference
  const storedLang = localStorage.getItem("preferredLanguage");
  if (storedLang) {
    // Override browser language with stored preference
    const originalGetPreferredLanguage = getPreferredLanguage;
    getPreferredLanguage = function () {
      return storedLang;
    };
  }

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
