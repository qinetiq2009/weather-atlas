const statusMessage = document.getElementById("status-message");
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const hourlyContainer = document.getElementById("hourly-forecast");
const dailyContainer = document.getElementById("daily-forecast");
const hourTemplate = document.getElementById("hour-card-template");
const dayTemplate = document.getElementById("day-card-template");
const hourlyPrevButton = document.getElementById("hourly-prev");
const hourlyNextButton = document.getElementById("hourly-next");
const clockDate = document.getElementById("clock-date");
const clockTime = document.getElementById("clock-time");

const weatherCodeMap = {
  0: { label: "Clear sky", icon: "☀" },
  1: { label: "Mostly clear", icon: "🌤" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Cloudy", icon: "☁" },
  45: { label: "Fog", icon: "🌫" },
  48: { label: "Rime fog", icon: "🌫" },
  51: { label: "Light drizzle", icon: "🌦" },
  53: { label: "Drizzle", icon: "🌦" },
  55: { label: "Heavy drizzle", icon: "🌧" },
  61: { label: "Light rain", icon: "🌦" },
  63: { label: "Rain", icon: "🌧" },
  65: { label: "Heavy rain", icon: "🌧" },
  71: { label: "Light snow", icon: "🌨" },
  73: { label: "Snow", icon: "🌨" },
  75: { label: "Heavy snow", icon: "❄" },
  80: { label: "Rain showers", icon: "🌦" },
  81: { label: "Heavy showers", icon: "🌧" },
  82: { label: "Violent showers", icon: "⛈" },
  95: { label: "Thunderstorm", icon: "⛈" },
  96: { label: "Storm and hail", icon: "⛈" },
  99: { label: "Heavy storm", icon: "⛈" }
};

function updateStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#8f2d18" : "";
}

function formatTemp(value) {
  return `${Math.round(value)}°`;
}

function formatWind(value) {
  return `${Math.round(value)} km/h`;
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function getWeatherMeta(code) {
  return weatherCodeMap[code] || { label: "Unknown", icon: "•" };
}

function formatHour(timeString) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric"
  }).format(new Date(timeString));
}

function formatDay(timeString, offset = 0) {
  if (offset === 0) {
    return "Today";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long"
  }).format(new Date(timeString));
}

function updateClock() {
  const now = new Date();

  clockDate.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);

  clockTime.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(now);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchWeatherForCity(city) {
  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.searchParams.set("name", city);
  geocodeUrl.searchParams.set("count", "1");
  geocodeUrl.searchParams.set("language", "en");
  geocodeUrl.searchParams.set("format", "json");

  const geocodeData = await fetchJson(geocodeUrl.toString());
  const location = geocodeData.results?.[0];

  if (!location) {
    throw new Error("No matching city was found.");
  }

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", location.latitude);
  forecastUrl.searchParams.set("longitude", location.longitude);
  forecastUrl.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code");
  forecastUrl.searchParams.set("hourly", "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code");
  forecastUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean");
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("temperature_unit", "celsius");
  forecastUrl.searchParams.set("wind_speed_unit", "kmh");

  const forecastData = await fetchJson(forecastUrl.toString());
  return { location, forecastData };
}

function renderCurrent(location, forecastData) {
  const current = forecastData.current;
  const hourlyTimes = forecastData.hourly.time;
  const currentHourIndex = hourlyTimes.indexOf(current.time);
  const rainChance = currentHourIndex >= 0
    ? forecastData.hourly.precipitation_probability[currentHourIndex]
    : forecastData.daily.precipitation_probability_max[0];
  const weather = getWeatherMeta(current.weather_code);

  document.getElementById("location-name").textContent = location.name;
  document.getElementById("location-meta").textContent =
    `${location.country}${location.admin1 ? `, ${location.admin1}` : ""}`;
  document.getElementById("current-temp").textContent = Math.round(current.temperature_2m);
  document.getElementById("current-summary").textContent = weather.label;
  document.getElementById("feels-like").textContent = formatTemp(current.apparent_temperature);
  document.getElementById("wind-speed").textContent = formatWind(current.wind_speed_10m);
  document.getElementById("humidity").textContent = formatPercent(current.relative_humidity_2m);
  document.getElementById("rain-chance").textContent = formatPercent(rainChance);
}

function renderHourly(forecastData) {
  hourlyContainer.innerHTML = "";
  const {
    time,
    temperature_2m: temperatures,
    relative_humidity_2m: humidity,
    precipitation_probability: rain,
    weather_code: codes
  } = forecastData.hourly;
  const current = forecastData.current;
  const currentTime = new Date(current.time);
  const startIndex = time.findIndex((hourTime) => new Date(hourTime) > currentTime);
  const nextHourStartIndex = startIndex >= 0 ? startIndex : 1;

  const nowCard = hourTemplate.content.firstElementChild.cloneNode(true);
  nowCard.querySelector(".hour-time").textContent = "Now";
  nowCard.querySelector(".hour-icon").textContent = getWeatherMeta(current.weather_code).icon;
  nowCard.querySelector(".hour-temp").textContent = formatTemp(current.temperature_2m);
  nowCard.querySelector(".hour-rain").textContent =
    `${formatPercent(rain[Math.max(0, nextHourStartIndex - 1)] ?? forecastData.daily.precipitation_probability_max[0])} rain`;
  nowCard.querySelector(".hour-humidity").textContent =
    `${formatPercent(current.relative_humidity_2m)} humidity`;
  hourlyContainer.appendChild(nowCard);

  time.slice(nextHourStartIndex, nextHourStartIndex + 23).forEach((hourTime, index) => {
    const sourceIndex = nextHourStartIndex + index;
    const card = hourTemplate.content.firstElementChild.cloneNode(true);
    const meta = getWeatherMeta(codes[sourceIndex]);

    card.querySelector(".hour-time").textContent = formatHour(hourTime);
    card.querySelector(".hour-icon").textContent = meta.icon;
    card.querySelector(".hour-temp").textContent = formatTemp(temperatures[sourceIndex]);
    card.querySelector(".hour-rain").textContent = `${formatPercent(rain[sourceIndex])} rain`;
    card.querySelector(".hour-humidity").textContent = `${formatPercent(humidity[sourceIndex])} humidity`;
    hourlyContainer.appendChild(card);
  });
}

function renderDaily(forecastData) {
  dailyContainer.innerHTML = "";
  const {
    time,
    weather_code: codes,
    temperature_2m_max: maxTemps,
    temperature_2m_min: minTemps,
    relative_humidity_2m_mean: humidity
  } = forecastData.daily;

  time.forEach((dayTime, index) => {
    const card = dayTemplate.content.firstElementChild.cloneNode(true);
    const meta = getWeatherMeta(codes[index]);

    card.querySelector(".day-name").textContent = formatDay(dayTime, index);
    card.querySelector(".day-summary").textContent = meta.label;
    card.querySelector(".day-humidity").textContent = `${formatPercent(humidity[index])} avg humidity`;
    card.querySelector(".day-high").textContent = `High ${formatTemp(maxTemps[index])}`;
    card.querySelector(".day-low").textContent = `Low ${formatTemp(minTemps[index])}`;
    dailyContainer.appendChild(card);
  });
}

function updateHourlyControls() {
  const maxScrollLeft = hourlyContainer.scrollWidth - hourlyContainer.clientWidth;
  const currentScroll = Math.round(hourlyContainer.scrollLeft);

  hourlyPrevButton.disabled = currentScroll <= 0;
  hourlyNextButton.disabled = currentScroll >= Math.max(0, Math.round(maxScrollLeft) - 1);
}

function scrollHourly(direction) {
  const firstCard = hourlyContainer.querySelector(".hour-card");
  const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 14 : hourlyContainer.clientWidth * 0.8;

  hourlyContainer.scrollBy({
    left: direction * cardWidth * 3,
    behavior: "smooth"
  });
}

async function loadWeather(city) {
  updateStatus(`Loading forecast for ${city}...`);

  try {
    const { location, forecastData } = await fetchWeatherForCity(city);
    renderCurrent(location, forecastData);
    renderHourly(forecastData);
    renderDaily(forecastData);
    updateHourlyControls();
    updateStatus(`Showing weather for ${location.name}, ${location.country}.`);
  } catch (error) {
    updateStatus(error.message || "Something went wrong while loading weather.", true);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    updateStatus("Please enter a city name.", true);
    return;
  }

  loadWeather(city);
});

hourlyPrevButton.addEventListener("click", () => {
  scrollHourly(-1);
});

hourlyNextButton.addEventListener("click", () => {
  scrollHourly(1);
});

hourlyContainer.addEventListener("scroll", updateHourlyControls);
window.addEventListener("resize", updateHourlyControls);

updateClock();
window.setInterval(updateClock, 1000);

loadWeather("Sydney");
