const city = document.querySelector("#city");
const button = document.querySelector("#searchBtn");
const card = document.querySelector(".weather-card");
const status = document.querySelector(".weather-status");
const forecast = document.querySelector(".forecast");

const weatherIcons = {
  0: "☀️", // jasno
  1: "🌤️",
  2: "⛅",
  3: "☁️",

  45: "☁️",
  48: "☁️",

  51: "🌦️",
  53: "🌦️",
  55: "🌦️",

  61: "🌧️",
  63: "🌧️",
  65: "🌧️",

  71: "❄️",
  73: "❄️",
  75: "❄️",

  95: "⛈️"
};

city.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});

button.addEventListener("click", getWeather);

async function getWeather() {
  const cityText = city.value;

  if (!cityText) {
    status.textContent = "Zadej město";
    return;
  }

  try {
    status.textContent = "Načítám...";
    button.disabled = true;

    // Najdeme město (geocoding)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityText}`
    );
    const geoData = await geoRes.json();

    const location = geoData.results?.[0];

    if (!location) {
      status.textContent = "Město nenalezeno";
      button.disabled = false;
      return;
    }

    
    const { latitude, longitude, name, country } = location;

    localStorage.setItem("city", cityText);


    // Načteme počasí
   const weatherRes = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum`
);
    const weatherData = await weatherRes.json();

    const weather = weatherData.current;
    
    const icon = weatherIcons[weather.weather_code] || "🌡️";

    const daily = weatherData.daily;

    const forecastHTML = daily.time
      .slice(0, 3)
      .map((day, index) => {
        const dayIcon = weatherIcons[daily.weather_code[index]] || "🌡️";
        return `
          <div class="forecast-day rounded-[2rem] bg-[#0d1b35]/90 border border-white/10 shadow-2xl p-6 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition">
          <div class="forecast-icon text-3xl">${dayIcon}</div>
            <p class="text-xl font-semibold">${new Date(day).toLocaleDateString()}</p>
            <p class="mt-1 text-[14px] font-[500]">Maximální teplota:</p>
            <p class="bg-yellow-400 p-2 font-semibold text-black mt-1 rounded-xl"> ${daily.temperature_2m_max[index]} °C</p>
            <p class="mt-1 text-[14px] font-[500]">Minimální teplota:</p>
            <p class="bg-[#0d1b35]/90 border border-white/10 shadow-2xl p-2 mt-1 font-semibold rounded-xl">  ${daily.temperature_2m_min[index]} °C</p>
            <p class="mt-2 text-2xl">💧</p>
            <p class="text-white p-2">${daily.precipitation_sum[index]} mm</p>
          </div>
        `;
      })
      .join("");

    // Render do DOM
    card.innerHTML = `
      <div class="weather-box">
       <div class="weather-icon text-3xl">${icon}</div>
        <h2 class="text-2xl font-semibold">${name}, ${country}</h2>
        <p> Teplota: ${weather.temperature_2m} °C</p>
        <p> Vítr: ${weather.wind_speed_10m} km/h</p>
        <p> Vlhkost: ${weather.relative_humidity_2m} %</p>
        <p> Déšť: ${weather.precipitation} mm</p>
      </div>
    `;


    forecast.innerHTML = `${forecastHTML}`;

    status.textContent = "";
    button.disabled = false;

  } catch (error) {
    console.log(error);
    status.textContent = "Něco se pokazilo";
    button.disabled = false;
  }
}

const savedCity = localStorage.getItem("city");

if (savedCity) {
  city.value = savedCity;
  getWeather();
}