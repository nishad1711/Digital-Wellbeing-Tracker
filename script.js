document.addEventListener("DOMContentLoaded", () => {
  let totalTime = 0;
  let isBlocked = false;
  let startTime = Date.now();
  let timeLimit = null;
  let currentSite = "FocusZone";

  const screenTimeDisplay = document.getElementById("screen-time");
  const blockStatus = document.getElementById("block-status");
  const toggleBtn = document.getElementById("toggle-block");
  const warningBanner = document.getElementById("warning");
  const timeLimitInput = document.getElementById("time-limit");
  const siteSelect = document.getElementById("site-select");

  const siteTime = {
    FocusZone: 0,
    ChillTube: 0,
    SocialNet: 0,
  };

  const hourlyTime = Array(24).fill(0); // future graph if needed
  let usageChart;

  function updateDisplay() {
    const minutes = Math.floor(totalTime / 60000);
    screenTimeDisplay.textContent = `${minutes} minute${
      minutes !== 1 ? "s" : ""
    } today`;

    if (timeLimit && minutes >= timeLimit) {
      warningBanner.classList.remove("hidden");
    }
    updateChart();
  }

  function updateTimeSpent() {
    const now = Date.now();
    const delta = now - startTime;
    totalTime += delta;
    siteTime[currentSite] += delta;

    const currentHour = new Date().getHours();
    hourlyTime[currentHour] += delta;

    startTime = now;
    updateDisplay();
  }

  setInterval(updateTimeSpent, 10000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      updateTimeSpent();
    } else {
      startTime = Date.now();
    }
  });

  toggleBtn.addEventListener("click", () => {
    isBlocked = !isBlocked;
    blockStatus.textContent = isBlocked ? "Blocked" : "Allowed";
    blockStatus.className = isBlocked ? "blocked" : "allowed";
    toggleBtn.textContent = isBlocked ? "Unblock Apps" : "Block Apps";
  });

  timeLimitInput.addEventListener("change", () => {
    const minutes = parseInt(timeLimitInput.value);
    if (!isNaN(minutes) && minutes > 0) {
      timeLimit = minutes;
      warningBanner.classList.add("hidden");
      alert(`Time limit set to ${minutes} minutes.`);
    }
  });

  siteSelect.addEventListener("change", () => {
    updateTimeSpent(); // log current site time before switching
    currentSite = siteSelect.value;
  });

  function updateChart() {
    const siteLabels = Object.keys(siteTime);
    const siteData = siteLabels.map((site) =>
      Math.round(siteTime[site] / 60000)
    ); // convert ms to minutes

    if (!usageChart) {
      const ctx = document.getElementById("usageChart").getContext("2d");
      usageChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: siteLabels,
          datasets: [
            {
              label: "Time Spent (mins)",
              data: siteData,
              backgroundColor: ["#60a5fa", "#facc15", "#fb7185"],
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Websites",
              },
            },
            y: {
              beginAtZero: true,
              min: 0,
              max: 30,
              ticks: {
                stepSize: 5,
              },
              title: {
                display: true,
                text: "Minutes Spent",
              },
            },
          },
        },
      });
    } else {
      usageChart.data.labels = siteLabels;
      usageChart.data.datasets[0].data = siteData;
      usageChart.update();
    }
  }
});
