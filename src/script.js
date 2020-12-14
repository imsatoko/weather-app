/** global variables */
const apiKey = "8dc58ec2fc7baf8f9b84e4019f768ba7";
const apiEndpoint = "https://api.openweathermap.org/data/2.5";
let units = "metric";

/** functions */
// init
function init() {
  let currentDate = document.querySelector("#current_date");
  currentDate.innerHTML = getCurrentDate();
  showCurrentWeather("tokyo");
  showHourlyForecast("tokyo");
}

// get current date
function getCurrentDate() {
  let current = new Date();

  let day = formatDay(current.getDay());
  let month = formatMonth(current.getMonth());
  let hhmm = formatHHmm(current.getHours(), current.getMinutes());

  let currentDate = `${day} ${month} ${current.getDate()}, ${hhmm}`;

  return currentDate;
}

function formatMonth(month) {
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[month];
}

function formatDay(day) {
  let days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return days[day];
}

function formatHHmm(hour, minute) {
  if (hour < 10) {
    hour = `0${hour}`;
  }

  if (minute < 10) {
    minute = `0${minute}`;
  }

  return `${hour}:${minute}`;
}

// get current location weather
function searchCurrentLocation(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(showCurrentLocationWeather);

  resetUnit();
}

function showCurrentLocationWeather(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  axios
    .get(
      `${apiEndpoint}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`
    )
    .then(displayCurrentLocationWeather)
    .catch(errorMessage);
}

// get current weather in a specific city
function search(event) {
  event.preventDefault();

  let cityName = document.querySelector("#city-input").value;

  if (!cityName) {
    alert("Please enter a city name.");
  } else {
    showCurrentWeather(cityName);
    showHourlyForecast(cityName);
  }

  resetUnit();
}

function showCurrentWeather(cityName) {
  axios
    .get(`${apiEndpoint}/weather?appid=${apiKey}&q=${cityName}&units=${units}`)
    .then(displayCurrentWeather)
    .catch(errorMessage);
}

function displayCurrentLocationWeather(response) {
  setCurrentWeather(response);

  let cityName = response.data.name;
  showCurrentWeather(cityName);
  showHourlyForecast(cityName);

  document.querySelector("#city-input").value = cityName;
}

function displayCurrentWeather(response) {
  setCurrentWeather(response);
}

function setCurrentWeather(response) {
  let result = response.data;

  // city name
  document.querySelector("#current_city").innerHTML = result.name;
  document.querySelector("#city-input").value = result.name;

  // current temperature
  let temp = appendDegreeSign(Math.round(result.main.temp), true);
  let maxTemp = appendDegreeSign(Math.round(result.main.temp_max), true);
  let minTemp = appendDegreeSign(Math.round(result.main.temp_min), true);

  document.querySelector(".current-temperature").innerHTML = temp;
  document.querySelector(".current-temperature-max span").innerHTML = maxTemp;
  document.querySelector(".current-temperature-min span").innerHTML = minTemp;

  // current weather and wind speed(m/s)
  let currentWeatherElement = document.querySelector(".current-weather-text");
  currentWeatherElement.innerHTML = result.weather[0].main;

  let windSpeedElement = document.querySelector("#wind-speed");
  windSpeedElement.innerHTML = `${result.wind.speed}m/s`;
}

// forecast
function showHourlyForecast(cityName) {
  axios
    .get(
      `${apiEndpoint}/forecast?appid=${apiKey}&q=${cityName}&units=${units}&cnt=5`
    )
    .then(displayHourlyForecast)
    .catch(errorMessage);
}

function showDailyForecast(latitude, longitude) {
  axios
    .get(
      `${apiEndpoint}/onecall?appid=${apiKey}&lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly&units=${units}`
    )
    .then(displayDailyForecast)
    .catch(errorMessage);
}

function displayHourlyForecast(response) {
  let result = response.data.list;
  let city = response.data.city;

  let current = new Date();
  let hour = getNextSlot(current.getHours());
  let hourElement = document.querySelectorAll(".hour");
  let forecastMaxTempElement = document.querySelectorAll(".tmp-high");
  let forecastMinTempElement = document.querySelectorAll(".tmp-low");

  // display precipitation (precipitation[=pop] can get via "5 hours/3 days forecast" API)
  displayPrecipitation(result[0].pop);

  // display hourly forecast (every 3 hour)
  for (let i = 0; i < result.length; i++) {
    if (i > 0) {
      hour = hour + 3;
      if (hour === 24) {
        hour = 0;
      }
    }

    hourElement[i].innerHTML = formatHHmm(hour, 0);
    forecastMaxTempElement[i].innerHTML = appendDegreeSign(
      Math.round(result[i].main.temp_max),
      true
    );
    forecastMinTempElement[i].innerHTML = appendDegreeSign(
      Math.round(result[i].main.temp_min),
      true
    );
  }

  showDailyForecast(city.coord.lat, city.coord.lon);
}

function displayPrecipitation(precipitation) {
  let precipitationElement = document.querySelector("#precipitation");
  precipitationElement.innerHTML = `${Math.round(precipitation * 10) * 10}%`;
}

function displayDailyForecast(response) {
  let daily = response.data.daily;

  let current = new Date();
  let today = current.getDay();
  let tempIndex = 5;
  let dayElement = document.querySelectorAll(".day");
  let dayElementIndex = 0;
  let dayIncremental = 1;
  let forecastMaxTempElement = document.querySelectorAll(".tmp-high");
  let forecastMinTempElement = document.querySelectorAll(".tmp-low");

  for (let i = 0; i < daily.length; i++) {
    if (i === 0) {
      continue;
    }

    if (i === 6) {
      break;
    }

    let dayIndex = today + dayIncremental;
    if (dayIndex > 6) {
      // reset
      dayIndex = 0;
      dayIncremental = 0;
      today = 0;
    }
    dayElement[dayElementIndex].innerHTML = formatDay(dayIndex);
    dayElementIndex++;
    dayIncremental++;

    forecastMaxTempElement[tempIndex].innerHTML = appendDegreeSign(
      Math.round(daily[i].temp.max),
      true
    );
    forecastMinTempElement[tempIndex].innerHTML = appendDegreeSign(
      Math.round(daily[i].temp.min),
      true
    );
    tempIndex++;
  }
}

function getNextSlot(currentHour) {
  let incremental = 3 - (currentHour % 3);

  let nextSlot = currentHour + incremental;
  if (nextSlot === 24) {
    return 0;
  }

  return nextSlot;
}

function errorMessage(error) {
  alert("City doesn't exist. Please enter the appropriate city name.");
}

// get current temperature
function getCurrentTemp() {
  let temp = document.querySelector(".current-temperature").innerHTML;
  let maxTemp = document.querySelector(".current-temperature-max span")
    .innerHTML;
  let minTemp = document.querySelector(".current-temperature-min span")
    .innerHTML;

  let currentTemp = {
    temp: appendDegreeSign(temp, false),
    maxTemp: appendDegreeSign(maxTemp, false),
    minTemp: appendDegreeSign(minTemp, false),
  };

  return currentTemp;
}

// set current temperature
function setCurrentTemp(currentTemp, isCelcius) {
  let temp = appendDegreeSign(
    convertTemperature(currentTemp.temp, isCelcius),
    true
  );
  let maxTemp = appendDegreeSign(
    convertTemperature(currentTemp.maxTemp, isCelcius),
    true
  );
  let minTemp = appendDegreeSign(
    convertTemperature(currentTemp.minTemp, isCelcius),
    true
  );

  document.querySelector(".current-temperature").innerHTML = temp;
  document.querySelector(".current-temperature-max span").innerHTML = maxTemp;
  document.querySelector(".current-temperature-min span").innerHTML = minTemp;
}

function getForecastTemp() {
  let maxTemp = document.querySelectorAll(".tmp-high");
  let minTemp = document.querySelectorAll(".tmp-low");

  let maxTempValue = new Array(maxTemp.length);
  let minTempValue = new Array(minTemp.length);
  for (let i = 0; i < maxTemp.length; i++) {
    maxTempValue[i] = appendDegreeSign(maxTemp[i].innerHTML, false);
    minTempValue[i] = appendDegreeSign(minTemp[i].innerHTML, false);
  }

  let forecastTemp = {
    maxTemp: maxTempValue,
    minTemp: minTempValue,
  };

  return forecastTemp;
}

function setForecastTemp(forecastTemp, isCelcius) {
  let forecastMaxTemp = document.querySelectorAll(".tmp-high");
  let forecastMinTemp = document.querySelectorAll(".tmp-low");
  let maxTemp = null;
  let minTemp = null;

  for (let key in forecastTemp) {
    if (key === "maxTemp") {
      maxTemp = forecastTemp[key];
    } else {
      minTemp = forecastTemp[key];
    }
  }

  for (let i = 0; i < maxTemp.length; i++) {
    forecastMaxTemp[i].innerHTML = appendDegreeSign(
      convertTemperature(maxTemp[i], isCelcius),
      true
    );
    forecastMinTemp[i].innerHTML = appendDegreeSign(
      convertTemperature(minTemp[i], isCelcius),
      true
    );
  }
}

// change unit
function changeUnit() {
  let unitButton = document.querySelector("#unit-button");
  let currentTemp = getCurrentTemp();
  let forecastTemp = getForecastTemp();

  if (unitButton.checked) {
    // convert to farenheit
    setCurrentTemp(currentTemp, false);
    setForecastTemp(forecastTemp, false);
  } else {
    // convert to celcius
    setCurrentTemp(currentTemp, true);
    setForecastTemp(forecastTemp, true);
  }
}

// reset unit to C°
function resetUnit() {
  let unitButton = document.querySelector("#unit-button");
  unitButton.checked = false;
}

// convert tempareture celcius <> farenheit
function convertTemperature(temp, isCelcius) {
  if (isCelcius) {
    return Math.round((temp - 32) / 1.8);
  }
  return Math.round(temp * 1.8 + 32);
}

// add/remove degree sign °
function appendDegreeSign(temp, isAppend) {
  if (isAppend) {
    return temp + "°";
  }
  return temp.slice(0, temp.length - 1);
}

/** main */
init();

// search weather
let searchCityForm = document.querySelector("#search-city-form");
searchCityForm.addEventListener("submit", search);

// current location weather
let currentButton = document.querySelector("#current-location");
currentButton.addEventListener("click", searchCurrentLocation);

// change unit
let unitButton = document.querySelector("#unit-button");
unitButton.addEventListener("click", changeUnit);
