const statusMessage = document.getElementById("status-message");
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const locationButton = document.getElementById("location-button");
const hourlyContainer = document.getElementById("hourly-forecast");
const dailyContainer = document.getElementById("daily-forecast");
const hourTemplate = document.getElementById("hour-card-template");
const dayTemplate = document.getElementById("day-card-template");
const hourlyPrevButton = document.getElementById("hourly-prev");
const hourlyNextButton = document.getElementById("hourly-next");
const clockDate = document.getElementById("clock-date");
const clockTime = document.getElementById("clock-time");
const currentIcon = document.getElementById("current-icon");
const heroQuote = document.getElementById("hero-quote");
const heroAttribution = document.getElementById("hero-attribution");

let activeTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const dailyQuotes = [
  {
    quote: "Wherever you go, no matter what the weather, always bring your own sunshine.",
    author: "Susan Gale"
  },
  {
    quote: "To appreciate the sun, you have to know what rain is.",
    author: "Anonymous"
  },
  {
    quote: "The sound of rain needs no translation.",
    author: "Alan Watts"
  },
  {
    quote: "Even the darkest night will end and the sun will rise.",
    author: "Victor Hugo"
  },
  {
    quote: "Clouds come floating into my life, no longer to carry rain, but to add color to my sunset sky.",
    author: "Rabindranath Tagore"
  },
  {
    quote: "There is no such thing as bad weather, only different kinds of good weather.",
    author: "John Ruskin"
  },
  {
    quote: "A change in the weather is sufficient to recreate the world and ourselves.",
    author: "Marcel Proust"
  }
];

const weatherCodeMap = {
  0: { label: "Clear sky", kind: "clear" },
  1: { label: "Mostly clear", kind: "partly-cloudy" },
  2: { label: "Partly cloudy", kind: "partly-cloudy" },
  3: { label: "Cloudy", kind: "cloudy" },
  45: { label: "Fog", kind: "fog" },
  48: { label: "Rime fog", kind: "fog" },
  51: { label: "Light drizzle", kind: "drizzle" },
  53: { label: "Drizzle", kind: "drizzle" },
  55: { label: "Heavy drizzle", kind: "rain" },
  61: { label: "Light rain", kind: "rain" },
  63: { label: "Rain", kind: "rain" },
  65: { label: "Heavy rain", kind: "rain" },
  71: { label: "Light snow", kind: "snow" },
  73: { label: "Snow", kind: "snow" },
  75: { label: "Heavy snow", kind: "snow" },
  80: { label: "Rain showers", kind: "rain" },
  81: { label: "Heavy showers", kind: "rain" },
  82: { label: "Violent showers", kind: "storm" },
  95: { label: "Thunderstorm", kind: "storm" },
  96: { label: "Storm and hail", kind: "storm" },
  99: { label: "Heavy storm", kind: "storm" }
};

function updateStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#8f2d18" : "";
}

function formatTemp(value) {
  return `${Math.round(value)}${String.fromCharCode(176)}`;
}

function formatWind(value) {
  return `${Math.round(value)} km/h`;
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function formatCoordinate(value, positiveLabel, negativeLabel) {
  const absoluteValue = Math.abs(value).toFixed(2);
  const label = value >= 0 ? positiveLabel : negativeLabel;
  return `${absoluteValue}${String.fromCharCode(176)} ${label}`;
}

function getWeatherMeta(code) {
  return weatherCodeMap[code] || { label: "Unknown", kind: "cloudy" };
}

function formatHour(timeString) {
  const [, time = "00:00"] = timeString.split("T");
  const [hourText] = time.split(":");
  const hour = Number(hourText);
  const normalizedHour = hour % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const hour12 = normalizedHour % 12 || 12;
  return `${hour12}${suffix}`;
}

function formatDay(dateString, offset = 0) {
  if (offset === 0) {
    return "Today";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long"
  }).format(new Date(`${dateString}T12:00:00`));
}

function setDailyQuote() {
  if (!heroQuote || !heroAttribution) {
    return;
  }

  const now = new Date();
  const daySeed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const selectedQuote = dailyQuotes[Math.abs(daySeed) % dailyQuotes.length];

  heroQuote.textContent = `"${selectedQuote.quote}"`;
  heroAttribution.textContent = selectedQuote.author;
}

function formatClockTime(timeString) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: activeTimeZone
  }).format(new Date(timeString));
}

function setClockTimeZone(timeZone) {
  activeTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  updateClock();
}

function updateClock() {
  const now = new Date();

  clockDate.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: activeTimeZone
  }).format(now);

  clockTime.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: activeTimeZone
  }).format(now);
}

function setTheme(isDay) {
  document.body.dataset.theme = isDay ? "day" : "night";
}

function createWeatherIcon(kind, isDay) {
  const stroke = "currentColor";
  const icons = {
    clear: isDay
      ? `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="10"></circle><path d="M32 8v8"></path><path d="M32 48v8"></path><path d="M8 32h8"></path><path d="M48 32h8"></path><path d="M15 15l6 6"></path><path d="M43 43l6 6"></path><path d="M15 49l6-6"></path><path d="M43 21l6-6"></path></svg>`
      : `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M39 10a18 18 0 1 0 15 28" fill="none"></path><path d="M40 10a18 18 0 0 0 14 28" fill="currentColor" stroke="none"></path></svg>`,
    "partly-cloudy": isDay
      ? `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="8"></circle><path d="M24 8v6"></path><path d="M24 34v6"></path><path d="M8 24h6"></path><path d="M34 24h6"></path><path d="M14 14l4 4"></path><path d="M30 30l4 4"></path><path d="M14 34l4-4"></path><path d="M30 18l4-4"></path><path d="M22 46h24a8 8 0 0 0 0-16 12 12 0 0 0-23-2 7 7 0 0 0-1 18z"></path></svg>`
      : `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 24a10 10 0 0 1 16-8"></path><path d="M22 46h24a8 8 0 0 0 0-16 12 12 0 0 0-23-2 7 7 0 0 0-1 18z"></path></svg>`,
    cloudy: `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 46h30a9 9 0 0 0 0-18 13 13 0 0 0-25-3A8 8 0 0 0 18 46z"></path></svg>`,
    fog: `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 30h28a8 8 0 0 0 0-16 11 11 0 0 0-21-2 7 7 0 0 0-7 8"></path><path d="M14 42h36"></path><path d="M18 50h28"></path></svg>`,
    drizzle: `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 30h28a8 8 0 0 0 0-16 11 11 0 0 0-21-2 7 7 0 0 0-7 8"></path><path d="M24 42l-2 6"></path><path d="M34 42l-2 6"></path><path d="M44 42l-2 6"></path></svg>`,
    rain: `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 30h28a8 8 0 0 0 0-16 11 11 0 0 0-21-2 7 7 0 0 0-7 8"></path><path d="M24 40l-3 10"></path><path d="M34 40l-3 10"></path><path d="M44 40l-3 10"></path></svg>`,
    snow: `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 30h28a8 8 0 0 0 0-16 11 11 0 0 0-21-2 7 7 0 0 0-7 8"></path><path d="M24 40v8"></path><path d="M20 44h8"></path><path d="M34 40v8"></path><path d="M30 44h8"></path><path d="M44 40v8"></path><path d="M40 44h8"></path></svg>`,
    storm: `<svg viewBox="0 0 64 64" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 30h28a8 8 0 0 0 0-16 11 11 0 0 0-21-2 7 7 0 0 0-7 8"></path><path d="M34 36l-6 10h7l-5 10"></path></svg>`
  };

  return icons[kind] || icons.cloudy;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchWeatherForCoordinates(coords, locationOverrides = {}) {
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", coords.latitude);
  forecastUrl.searchParams.set("longitude", coords.longitude);
  forecastUrl.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
  forecastUrl.searchParams.set("hourly", "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,is_day");
  forecastUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean,sunrise,sunset");
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("temperature_unit", "celsius");
  forecastUrl.searchParams.set("wind_speed_unit", "kmh");

  const forecastData = await fetchJson(forecastUrl.toString());
  const defaultLocation = {
    name: "Current location",
    country: forecastData.timezone,
    admin1: `${formatCoordinate(coords.latitude, "N", "S")} / ${formatCoordinate(coords.longitude, "E", "W")}`
  };

  return {
    location: { ...defaultLocation, ...locationOverrides },
    forecastData
  };
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

  return fetchWeatherForCoordinates(
    { latitude: location.latitude, longitude: location.longitude },
    { name: location.name, country: location.country, admin1: location.admin1 }
  );
}

function setLocationDisplay(location) {
  document.getElementById("location-name").textContent = location.name;
  document.getElementById("location-meta").textContent =
    `${location.country}${location.admin1 ? `, ${location.admin1}` : ""}`;
}

function renderCurrent(location, forecastData) {
  const current = forecastData.current;
  const hourlyTimes = forecastData.hourly.time;
  const currentHourIndex = hourlyTimes.indexOf(current.time);
  const rainChance = currentHourIndex >= 0
    ? forecastData.hourly.precipitation_probability[currentHourIndex]
    : forecastData.daily.precipitation_probability_max[0];
  const sunrise = forecastData.daily.sunrise?.[0];
  const sunset = forecastData.daily.sunset?.[0];
  const weather = getWeatherMeta(current.weather_code);

  setLocationDisplay(location);
  setClockTimeZone(forecastData.timezone);
  document.getElementById("current-temp").textContent = Math.round(current.temperature_2m);
  document.getElementById("current-summary").textContent = weather.label;
  document.getElementById("feels-like").textContent = formatTemp(current.apparent_temperature);
  document.getElementById("wind-speed").textContent = formatWind(current.wind_speed_10m);
  document.getElementById("humidity").textContent = formatPercent(current.relative_humidity_2m);
  document.getElementById("rain-chance").textContent = formatPercent(rainChance);
  document.getElementById("sunrise-time").textContent = sunrise ? formatClockTime(sunrise) : "--";
  document.getElementById("sunset-time").textContent = sunset ? formatClockTime(sunset) : "--";
  currentIcon.innerHTML = createWeatherIcon(weather.kind, Boolean(current.is_day));
  setTheme(Boolean(current.is_day));
}

function renderHourly(forecastData) {
  hourlyContainer.innerHTML = "";

  const {
    time,
    temperature_2m: temperatures,
    relative_humidity_2m: humidity,
    precipitation_probability: rain,
    weather_code: codes,
    is_day: dayFlags
  } = forecastData.hourly;

  const current = forecastData.current;
  const currentTime = new Date(current.time);
  const startIndex = time.findIndex((hourTime) => new Date(hourTime) > currentTime);
  const nextHourStartIndex = startIndex >= 0 ? startIndex : 1;

  const nowCard = hourTemplate.content.firstElementChild.cloneNode(true);
  nowCard.querySelector(".hour-time").textContent = "Now";
  nowCard.querySelector(".hour-icon").innerHTML = createWeatherIcon(
    getWeatherMeta(current.weather_code).kind,
    Boolean(current.is_day)
  );
  nowCard.querySelector(".hour-temp").textContent = formatTemp(current.temperature_2m);
  nowCard.querySelector(".hour-rain").textContent =
    `${formatPercent(rain[Math.max(0, nextHourStartIndex - 1)] ?? forecastData.daily.precipitation_probability_max[0])} rain`;
  nowCard.querySelector(".hour-humidity").textContent = `${formatPercent(current.relative_humidity_2m)} humidity`;
  hourlyContainer.appendChild(nowCard);

  time.slice(nextHourStartIndex, nextHourStartIndex + 23).forEach((hourTime, index) => {
    const sourceIndex = nextHourStartIndex + index;
    const card = hourTemplate.content.firstElementChild.cloneNode(true);
    const meta = getWeatherMeta(codes[sourceIndex]);

    card.querySelector(".hour-time").textContent = formatHour(hourTime);
    card.querySelector(".hour-icon").innerHTML = createWeatherIcon(meta.kind, Boolean(dayFlags[sourceIndex]));
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

async function renderWeatherResult(result, successMessage) {
  renderCurrent(result.location, result.forecastData);
  renderHourly(result.forecastData);
  renderDaily(result.forecastData);
  updateHourlyControls();
  updateStatus(successMessage);
}

async function loadWeather(city) {
  updateStatus(`Loading forecast for ${city}...`);

  try {
    const result = await fetchWeatherForCity(city);
    await renderWeatherResult(result, `Showing weather for ${result.location.name}, ${result.location.country}.`);
  } catch (error) {
    updateStatus(error.message || "Something went wrong while loading weather.", true);
  }
}

function loadCurrentLocation() {
  if (!navigator.geolocation) {
    updateStatus("Geolocation is not supported in this browser.", true);
    return;
  }

  updateStatus("Fetching weather for your current location...");

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const { latitude, longitude } = position.coords;
      const result = await fetchWeatherForCoordinates(
        { latitude, longitude },
        { name: "Current location" }
      );
      await renderWeatherResult(result, "Showing weather for your current location.");
    } catch (error) {
      updateStatus(error.message || "Unable to load weather for your location.", true);
    }
  }, () => {
    updateStatus("Location access was denied. Please allow location access and try again.", true);
  }, {
    enableHighAccuracy: true,
    timeout: 10000
  });
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

locationButton.addEventListener("click", () => {
  loadCurrentLocation();
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
setDailyQuote();
window.setInterval(updateClock, 1000);

loadWeather("Sydney");
