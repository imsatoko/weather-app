/** global variables */
const apiKey = "8dc58ec2fc7baf8f9b84e4019f768ba7";
const apiEndpoint = "https://api.openweathermap.org/data/2.5";
let units = "metric";

/** functions */
// init
function init() {
  let currentDate = document.querySelector("#current_date");
  currentDate.innerHTML = getCurrentDate();
  showWeather("tokyo");
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

function formatDayWeatherIcon(main, description) {
  let icons = {
    "clear sky": "fas fa-sun",
    "few clouds": "fas fa-cloud-sun",
    "scattered clouds": "fas fa-cloud-sun",
    "broken clouds": "fas fa-cloud",
    "overcast clouds": "fas fa-cloud",
    "freezing rain": "fas fa-snowflake",
  };

  icon = icons[description];

  if (!icon) {
    icon = formatDayWeatherIconMain(main);
  }

  return icon;
}

function formatNightWeatherIcon(main, description) {
  let icons = {
    "clear sky": "fas fa-moon",
    "few clouds": "fas fa-cloud-moon",
    "scattered clouds": "fas fa-cloud-moon",
    "broken clouds": "fas fa-cloud",
    "overcast clouds": "fas fa-cloud",
    "freezing rain": "fas fa-snowflake",
  };

  icon = icons[description];

  if (!icon) {
    icon = formatNightWeatherIconMain(main);
  }

  return icon;
}

function formatDayWeatherIconMain(main) {
  let icons = {
    Rain: "fas fa-cloud-sun-rain",
    Snow: "fas fa-snowflake",
    Drizzle: "fas fa-cloud-sun-rain",
    Thunderstorm: "fas fa-bolt",
    Mist: "fas fa-cloud",
    Smoke: "fas fa-cloud",
    Haze: "fas fa-cloud",
    Dust: "fas fa-cloud",
    Fog: "fas fa-cloud",
    Sand: "fas fa-cloud",
    Ash: "fas fa-cloud",
    Squall: "fas fa-cloud",
    Tornado: "fas fa-cloud",
  };

  return icons[main];
}

function formatNightWeatherIconMain(main) {
  let icons = {
    Rain: "fas fa-cloud-moon-rain",
    Snow: "fas fa-snowflake",
    Drizzle: "fas fa-cloud-moon-rain",
    Thunderstorm: "fas fa-bolt",
    Mist: "fas fa-cloud",
    Smoke: "fas fa-cloud",
    Haze: "fas fa-cloud",
    Dust: "fas fa-cloud",
    Fog: "fas fa-cloud",
    Sand: "fas fa-cloud",
    Ash: "fas fa-cloud",
    Squall: "fas fa-cloud",
    Tornado: "fas fa-cloud",
  };

  return icons[main];
}

// get current location weather
function searchCurrentLocation(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(showCurrentLocationWeather);

  clearErrorMessage();
  resetUnit();
}

function showCurrentLocationWeather(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  axios
    .get(
      `${apiEndpoint}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`
    )
    .then((response) => {
      let cityName = response.data.name;
      showWeather(cityName);
      document.querySelector("#city-input").value = cityName;
    })
    .catch(errorHandler);
}

// get current weather in a specific city
function search(event) {
  event.preventDefault();

  let cityName = document.querySelector("#city-input").value;

  try {
    if (cityName) {
      showWeather(cityName);
    } else {
      throw new Error("Please input city name.");
    }
  } catch (error) {
    showErrorMessage(error.message);
    enableUnitButton(false);
  }
}

function showWeather(cityName) {
  axios
    .get(`${apiEndpoint}/weather?appid=${apiKey}&q=${cityName}&units=${units}`)
    .then(showCurrentWeather)
    .catch(errorHandler);

  enableUnitButton(true);
  clearErrorMessage();
  resetUnit();
}

function showCurrentWeather(response) {
  displayCurrentWeather(response);
  showForecast(response.data.name);
}

function displayCurrentWeather(response) {
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

  // current weather icon
  let current = new Date();
  let hour = getNextSlot(current.getHours());

  let currentWeatherIconElement = document.querySelector(
    ".weather-icon-current"
  );

  if (hour >= 6 && hour < 18) {
    currentWeatherIconElement.className = `${formatDayWeatherIcon(
      result.weather[0].main,
      result.weather[0].description
    )} weather-icon-current`;
  } else {
    currentWeatherIconElement.className = `${formatNightWeatherIcon(
      result.weather[0].main,
      result.weather[0].description
    )} weather-icon-current`;
  }

  let windSpeedElement = document.querySelector("#wind-speed");
  windSpeedElement.innerHTML = `${result.wind.speed}m/s`;
}

// forecast
function showForecast(cityName) {
  axios
    .get(
      `${apiEndpoint}/forecast?appid=${apiKey}&q=${cityName}&units=${units}&cnt=5`
    )
    .then(displayHourlyForecast)
    .catch(errorHandler);
}

function showDailyForecast(latitude, longitude) {
  axios
    .get(
      `${apiEndpoint}/onecall?appid=${apiKey}&lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly&units=${units}`
    )
    .then(displayDailyForecast)
    .catch(errorHandler);
}

function displayHourlyForecast(response) {
  let result = response.data.list;
  let city = response.data.city;

  let current = new Date();
  let hour = getNextSlot(current.getHours());
  let hourElement = document.querySelectorAll(".hour");
  let forecastMaxTempElement = document.querySelectorAll(".tmp-high");
  let forecastMinTempElement = document.querySelectorAll(".tmp-low");
  let weatherIconHourElement = document.querySelectorAll(".weather-icon-hour");

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

    if (hour >= 6 && hour < 18) {
      weatherIconHourElement[i].className = `${formatDayWeatherIcon(
        result[i].weather[0].main,
        result[i].weather[0].description
      )} weather-icon-hour`;
    } else {
      weatherIconHourElement[i].className = `${formatNightWeatherIcon(
        result[i].weather[0].main,
        result[i].weather[0].description
      )} weather-icon-hour`;
    }
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
  let weatherIconDayElement = document.querySelectorAll(".weather-icon-day");

  for (let i = 0; i < daily.length; i++) {
    // the first data is about today, so need to skip
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

    forecastMaxTempElement[tempIndex].innerHTML = appendDegreeSign(
      Math.round(daily[i].temp.max),
      true
    );
    forecastMinTempElement[tempIndex].innerHTML = appendDegreeSign(
      Math.round(daily[i].temp.min),
      true
    );

    weatherIconDayElement[dayElementIndex].className = `${formatDayWeatherIcon(
      daily[i].weather[0].main,
      daily[i].weather[0].description
    )} weather-icon-day`;

    dayElementIndex++;
    dayIncremental++;
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

  clearErrorMessage();
}

// reset unit to C°
function resetUnit() {
  let unitButton = document.querySelector("#unit-button");
  unitButton.checked = false;
}

function enableUnitButton(isActive) {
  let unitButton = document.querySelector("#unit-button");

  if (isActive) {
    unitButton.disabled = false;
  } else {
    unitButton.disabled = true;
  }
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

// error handler
function errorHandler(error) {
  let status = error.response.status;

  if (status == 404) {
    try {
      throw new Error("City is not found.");
    } catch (error) {
      showErrorMessage(error.message);
    }
  }

  enableUnitButton(false);
}

function showErrorMessage(error) {
  let errorElement = document.querySelector("#error-msg");
  errorElement.innerHTML = error;
}

function clearErrorMessage() {
  let errorElement = document.querySelector("#error-msg");
  errorElement.innerHTML = "";
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
