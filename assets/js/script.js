const APIKEY = "35f782eb6d2cb01c91528dad689042da";
//added api key
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
// added global variables

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp).toFixed(2)}°F</h6>
                    <h6>Wind: ${weatherItem.wind.speed} Mph</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { 
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp).toFixed(2)}°F</h6>
                    <h6>Wind: ${weatherItem.wind.speed} Mph</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}
// main weather card, shows temperature, windspeed and humidity, also has icon for overall weather condition
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKEY}&units=imperial`;
    //gets weather data from latitude and longitude, set units to imperial
    fetch(WEATHER_API_URL).then(response => response.json())
    .then(data => {
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}
// sets weather data to cascade to either main card (first) or to future cards (after)
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKEY}`;
    
    fetch(API_URL).then(response => response.json())
    .then(data => {
        console.log(data);
        localStorage.setItem("searches", JSON.stringify(data));
        console.log(data);
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}
//connects city names to coordinates
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; 
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${APIKEY}`;
            fetch(API_URL).then(response => response.json())
            .then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        // geolocates user's current location for current location click
        error => { 
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

var recentSearches = JSON.parse(localStorage.getItem("searches")) || [];
console.log(recentSearches);
var searchHistory = document.getElementById("recently-viewed");
getCityCoordinates("");


//error if geolocation fails on use current location
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
//event listeners for user click on city name entry or use current location, keyup to press enter instead of clicking search

function addRecentSearch(city) {
    cityInput.addEventListener("click", function(event) {
        var searchCity = city.value.trim();
        executeSearch(searchCity);
        addRecentSearch(searchCity);
});
}

function addRecentSearch(city) {
    var recentButton = document.createElement("button");
    recentButton.textContent = city;
    recentButton.addEventListener("click", function () {
      executeSearch(city);
    });
    searchHistory.appendChild(recentButton);
  }
  
function executeSearch(searchCity) {
    recentSearches.push(searchCity);
    localStorage.setItem("searches", JSON.stringify(recentSearches));
    getWeather(searchCity);
  }

  //couldnt get event listener to work to pull from local for recently viewed