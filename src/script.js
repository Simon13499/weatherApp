const city = document.querySelector("#city");
const button = document.querySelector("#searchBtn");
const card = document.querySelector(".weather-card");
const status = document.querySelector(".weather-status");

const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  61: "🌧️"
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

    const location = geoData.results[0];

    if (!location) {
      status.textContent = "Město nenalezeno";
      return;
    }

    
    const { latitude, longitude, name, country } = location;

    localStorage.setItem("city", cityText);


    // Načteme počasí
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code`
    );
    const weatherData = await weatherRes.json();

    const weather = weatherData.current;
    
    const icon = weatherIcons[weather.weather_code];

    // Render do DOM
    card.innerHTML = `
      <div class="weather-box">
       <div class="weather-icon">${icon}</div>
        <h2>${name}, ${country}</h2>
        <p> Teplota: ${weather.temperature_2m} °C</p>
        <p> Vítr: ${weather.wind_speed_10m} km/h</p>
        <p> Vlhkost: ${weather.relative_humidity_2m} %</p>
      </div>
    `;

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