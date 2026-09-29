/* =====================================================
   DOM ELEMENTS
===================================================== */

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("search");

const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("error");

const loading = document.getElementById("loading");

const city = document.getElementById("city");
const updated = document.getElementById("updated");

const temp = document.getElementById("temp");
const feelsLike = document.getElementById("feelsLike");

const condition = document.getElementById("condition");
const description = document.getElementById("description");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const uv = document.getElementById("uv");
const uvLabel = document.getElementById("uvLabel");
const dew = document.getElementById("dew");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const weatherIcon = document.getElementById("weatherIcon");

const hourlyForecast = document.getElementById("hourlyForecast");

const hourlyDate = document.getElementById("hourlyDate");

const forecastList = document.getElementById("forecastList");

const alertsSection = document.getElementById("alertsSection");

const alerts = document.getElementById("alerts");

/* =====================================================
   API
===================================================== */

/*
  IMPORTANT:

  Don't expose this API key in production.

  Move this request to your backend/serverless
  function before deploying publicly.
*/

const API_KEY = "TGYGBB2N87TERE9R6LVV9DXYV";

const API_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";

/* =====================================================
   GLOBAL STATE
===================================================== */

let weatherData = null;

let selectedDayIndex = 0;

let weatherChart = null;

let selectedChart = "temperature";

/* =====================================================
   WEATHER ICONS
===================================================== */

function getWeatherIcon(icon) {
  const icons = {
    "clear-day": "☀️",

    "clear-night": "🌙",

    "partly-cloudy-day": "⛅",

    "partly-cloudy-night": "☁️",

    cloudy: "☁️",

    rain: "🌧️",

    "showers-day": "🌦️",

    "showers-night": "🌧️",

    "thunder-rain": "⛈️",

    "thunder-showers-day": "⛈️",

    "thunder-showers-night": "⛈️",

    snow: "❄️",

    "snow-showers-day": "🌨️",

    "snow-showers-night": "🌨️",

    fog: "🌫️",

    wind: "💨",
  };

  return icons[icon] || "🌤️";
}

/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatFullDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(time) {
  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =====================================================
   UV LABEL
===================================================== */

function getUVLabel(value) {
  if (value <= 2) {
    return "Low";
  }

  if (value <= 5) {
    return "Moderate";
  }

  if (value <= 7) {
    return "High";
  }

  if (value <= 10) {
    return "Very High";
  }

  return "Extreme";
}

/* =====================================================
   WIND DIRECTION
===================================================== */

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  const index = Math.round(degrees / 45) % 8;

  return directions[index];
}

/* =====================================================
   ERROR HANDLING
===================================================== */

function showError(message) {
  errorText.textContent = message;

  errorBox.classList.add("show");
}

function clearError() {
  errorText.textContent = "";

  errorBox.classList.remove("show");
}

/* =====================================================
   LOADING
===================================================== */

function setLoading(isLoading) {
  loading.classList.toggle("show", isLoading);

  searchBtn.disabled = isLoading;

  searchBtn.textContent = isLoading ? "Loading..." : "Search";
}

/* =====================================================
   FETCH WEATHER
===================================================== */

async function getWeatherData() {
  const searchCity = cityInput.value.trim();

  if (!searchCity) {
    showError("Please enter a city name.");

    cityInput.focus();

    return;
  }

  clearError();

  setLoading(true);

  try {
    const encodedCity = encodeURIComponent(searchCity);

    const url =
      `${API_URL}${encodedCity}` +
      `?unitGroup=metric` +
      `&include=days,alerts,current,hours,events` +
      `&key=${API_KEY}` +
      `&contentType=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to find weather for this location.");
    }

    const data = await response.json();

    if (!data.currentConditions) {
      throw new Error("Weather information is unavailable.");
    }

    weatherData = data;

    selectedDayIndex = 0;

    renderWeather(data);

    cityInput.value = "";
  } catch (error) {
    console.error(error);

    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

/* =====================================================
   RENDER EVERYTHING
===================================================== */

function renderWeather(data) {
  renderCurrentWeather(data);

  renderSun(data);

  renderHourly(data, 0);

  renderForecast(data);

  renderAlerts(data);

  updateChart(0, selectedChart);
}

/* =====================================================
   CURRENT WEATHER
===================================================== */

function renderCurrentWeather(data) {
  const current = data.currentConditions;

  city.textContent = data.resolvedAddress;

  updated.textContent = `Updated ${formatTime(current.datetime)} • ${data.timezone}`;

  condition.textContent = current.conditions;

  temp.textContent = Math.round(current.temp);

  feelsLike.textContent = Math.round(current.feelslike);

  description.textContent =
    data.days?.[0]?.description || "Current weather conditions";

  weatherIcon.textContent = getWeatherIcon(current.icon);

  humidity.textContent = Math.round(current.humidity);

  windSpeed.textContent = Math.round(current.windspeed);

  pressure.textContent = Math.round(current.pressure);

  visibility.textContent = current.visibility ?? "—";

  uv.textContent = current.uvindex ?? "—";

  uvLabel.textContent =
    current.uvindex !== undefined ? getUVLabel(current.uvindex) : "";

  dew.textContent = current.dew !== undefined ? Math.round(current.dew) : "—";
}

/* =====================================================
   SUNRISE / SUNSET
===================================================== */

function renderSun(data) {
  const today = data.days[0];

  sunrise.textContent = formatTime(today.sunrise);

  sunset.textContent = formatTime(today.sunset);

  const sunriseDate = new Date(`${today.datetime}T${today.sunrise}`);

  const sunsetDate = new Date(`${today.datetime}T${today.sunset}`);

  const minutes = Math.round((sunsetDate - sunriseDate) / 60000);

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  document.getElementById("daylightText").textContent =
    `${hours}h ${mins}m daylight`;
}

/* =====================================================
   HOURLY FORECAST
===================================================== */

function renderHourly(data, dayIndex) {
  const day = data.days[dayIndex];

  if (!day || !day.hours) {
    hourlyForecast.innerHTML = "<p>No hourly data available.</p>";

    return;
  }

  hourlyDate.textContent = formatFullDate(day.datetime);

  hourlyForecast.innerHTML = day.hours
    .map((hour) => {
      const rain = hour.precipprob ?? 0;

      return `
        <div class="hour-card">

          <div class="hour-time">
            ${formatTime(hour.datetime)}
          </div>

          <div class="hour-icon">
            ${getWeatherIcon(hour.icon)}
          </div>

          <div class="hour-temp">
            ${Math.round(hour.temp)}°
          </div>

          <div class="hour-rain">
            ${Math.round(rain)}% rain
          </div>

        </div>
      `;
    })
    .join("");
}

/* =====================================================
   15 DAY FORECAST
===================================================== */

function renderForecast(data) {
  forecastList.innerHTML = data.days
    .map((day, index) => {
      const selected = index === selectedDayIndex ? "selected" : "";

      const windDirection = getWindDirection(day.winddir);

      return `
        <div
          class="forecast-row ${selected}"
          data-index="${index}"
        >

          <div>

            <div class="forecast-day">
              ${index === 0 ? "Today" : formatDate(day.datetime)}
            </div>

            <div class="forecast-date">
              ${day.datetime}
            </div>

          </div>


          <div class="forecast-icon">
            ${getWeatherIcon(day.icon)}
          </div>


          <div class="forecast-condition">
            ${day.conditions}
          </div>


          <div class="temp-range">

            <span class="forecast-temp">
              ${Math.round(day.tempmax)}°
            </span>

            <span class="min-temp">
              ${Math.round(day.tempmin)}°
            </span>

          </div>


          <div class="rain-prob">
            💧 ${Math.round(day.precipprob ?? 0)}%
          </div>


          <div class="wind">
            ${Math.round(day.windspeed ?? 0)}
            km/h
            ${windDirection}
          </div>

        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".forecast-row").forEach((row) => {
    row.addEventListener("click", () => {
      const index = Number(row.dataset.index);

      selectedDayIndex = index;

      renderHourly(weatherData, index);

      renderForecast(weatherData);

      updateChart(index, selectedChart);
    });
  });
}

/* =====================================================
   CHART
===================================================== */

function updateChart(dayIndex, chartType) {
  if (!weatherData) {
    return;
  }

  const day = weatherData.days[dayIndex];

  if (!day || !day.hours) {
    return;
  }

  const hours = day.hours;

  const labels = hours.map((hour) => formatTime(hour.datetime));

  let values;

  let label;

  let unit;

  if (chartType === "temperature") {
    values = hours.map((hour) => hour.temp);

    label = "Temperature";

    unit = "°C";
  } else if (chartType === "humidity") {
    values = hours.map((hour) => hour.humidity);

    label = "Humidity";

    unit = "%";
  } else {
    values = hours.map((hour) => hour.precipprob ?? 0);

    label = "Rain probability";

    unit = "%";
  }

  const canvas = document.getElementById("weatherChart");

  const ctx = canvas.getContext("2d");

  if (weatherChart) {
    weatherChart.destroy();
  }

  weatherChart = new Chart(ctx, {
    type: "line",

    data: {
      labels,

      datasets: [
        {
          label,

          data: values,

          borderColor: "#2563eb",

          backgroundColor: "rgba(37, 99, 235, 0.08)",

          borderWidth: 2,

          fill: true,

          tension: 0.35,

          pointRadius: 2,

          pointHoverRadius: 5,

          pointBackgroundColor: "#2563eb",
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        intersect: false,

        mode: "index",
      },

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.parsed.y}${unit}`;
            },
          },
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },

          ticks: {
            maxTicksLimit: 8,

            color: "#9298a1",

            font: {
              size: 10,
            },
          },
        },

        y: {
          grid: {
            color: "#edf0f3",
          },

          ticks: {
            color: "#9298a1",

            font: {
              size: 10,
            },
          },
        },
      },
    },
  });
}

/* =====================================================
   CHART BUTTONS
===================================================== */

document.querySelectorAll(".chart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".chart-btn")
      .forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");

    selectedChart = button.dataset.chart;

    updateChart(selectedDayIndex, selectedChart);
  });
});

/* =====================================================
   ALERTS
===================================================== */

function renderAlerts(data) {
  if (!data.alerts || data.alerts.length === 0) {
    alertsSection.classList.add("hidden");

    return;
  }

  alertsSection.classList.remove("hidden");

  alerts.innerHTML = data.alerts
    .map((alert) => {
      return `
        <div class="alert">

          <strong>
            ${alert.event || "Weather Alert"}
          </strong>

          <p>
            ${alert.description || "Please check local weather guidance."}
          </p>

        </div>
      `;
    })
    .join("");
}

/* =====================================================
   EVENTS
===================================================== */

searchBtn.addEventListener("click", getWeatherData);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getWeatherData();
  }
});

/* =====================================================
   INITIAL LOAD
===================================================== */

/*
  You can remove this if you don't want
  weather to load automatically.
*/

cityInput.value = "Buxar";

getWeatherData();
