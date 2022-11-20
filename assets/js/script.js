const weatherApiRootUrl = 'https://api.openweathermap.org';
const apiKey = 'd91f911bcf2c0f925fb6535547a5ddc9'


// Submit the form to fetch weather information
const searchEl = $('#searchField');
const searchBtn = $('#searchBtn');
const clearBtn = $('#clearBtn');
const searchHistoryContainer = $('#searchHistoryContainer');
const todayContainer = $('#todayContainer');
const forecastContainer = $('#forecastContainer');
const forecastHeader = $('#forecastHeader');


// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

let searchHistory = [];
// get search history
const getSearchHistory = () => {
    searchHistory = [];
    searchHistory = JSON.parse(localStorage.getItem('search-history'));
    console.log("searchHistory from localstorage: ", searchHistory)
    
    if (!searchHistory) {
        searchHistory = [];
        console.log("searchHistory converted to empty array from null: ", searchHistory)
    }

    renderSearchHistory(searchHistory);
}

// render searchHistory from localstorage
const renderSearchHistory = (searchHistory) => {
    console.log("trying to render search history");

    // render searchHistoryContainer empty
    $(searchHistoryContainer).empty();

    // render placeholder if empty
    if (searchHistory.length === 0) {
        console.log("empty array");
        $(searchHistoryContainer).append(`
      <li class="list-group-item">No previous search</li>
    `);
    } else {
        $(searchHistoryContainer).append(searchHistory.map((term) => (`
        <li class="list-group-item"><button class="btn btn-outline-success">${term}</button></li>
      `)));
    }

}

function winLoad(callback) {
    if (document.readyState === 'complete') {
        console.log("doc already ready");
        getSearchHistory();
    } else {
      window.addEventListener("load", getSearchHistory());
    }
  }
  
winLoad();
  

const handleSearch = (event) => {
        event.preventDefault();

        // get locationSearch from html El
        let locationSearch = searchEl.val()
        console.log("locationSearch: ", locationSearch);

        // call renderSearchHistory and pass searchHistory
        //renderSearchHistory(searchHistory);
        //getSearchHistory();

        // call buildLocationUrl and pass locationSearch
        fetchLocation(locationSearch);
}

const handleReSearch = (event) => {
    event.preventDefault();
    const clickedEl = event.target;
    console.log("clickedEl: ", clickedEl);
    let locationSearch = jQuery(clickedEl).text();
    console.log("locationSearch: ", locationSearch);

    fetchLocation(locationSearch);
}

const handleClear = (event) => {
    event.preventDefault();

    searchHistory = [];

    localStorage.setItem('search-history', JSON.stringify(searchHistory));

    getSearchHistory();

}


// Handle button click to submit the form
searchBtn.on('click', handleSearch);
searchHistoryContainer.on('click', handleReSearch);
clearBtn.on('click', handleClear);

// Fetch geolocation information and pass to weather fetch function
const fetchLocation = (locationSearch) => {

    const locationUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${locationSearch}&appid=${apiKey}`;
    // side note: is fetch a vanilla js method??
    fetch(locationUrl)
        .then(function (response) {
            console.log("response: ", response);
            return response.json(); 
        })
        .then(function (response) {
            console.log("JSONed response: ", response);
            const location = response[0]
            fetchWeather(location);
        })
}

// Fetch weather information for geolocation
const fetchWeather = (location) => {
    const { lat } = location;
    const {lon} = location;
    const city = location.name;

    // add new search to searchhistory array
    searchHistory.push(city);
    console.log("updated searchHistory array: ", searchHistory);

    // set new array in localStorage
    localStorage.setItem('search-history', JSON.stringify(searchHistory));

    getSearchHistory();


    const weatherUrl = `${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;
    
    fetch(weatherUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function (response) {
        const weatherObj = response;
        console.log(weatherObj);
            renderItems(weatherObj, city);
        })
        .catch( function (err) {
            console.error(err);
        })
}

const renderItems = (weatherObj, city) => {
    const forecast = weatherObj.daily;
    const current = weatherObj.current;
    const timezone = weatherObj.timezone
    const alerts = weatherObj.alerts;

    renderForecast(forecast, city, timezone);
    renderWeather(current, city, timezone);
}

const renderWeather = (current, city, timezone) => {

    const date = dayjs().tz(timezone).format('M/D/YYYY');

    console.log("city: ", city, "current:", current);
    const iconUrl = `https://openweathermap.org/img/w/${current.weather[0].icon}.png`;

    let uvi = '';
    // uv index scale
    if (current.uvi < 3) {
        uvi = "#0EAD69"; 
    } else if (current.uvi < 7) {
        uvi = "#FFD23F"; 
    } else {
        uvi = "#E94F37"; 
    }
    console.log(uvi);

    $(todayContainer).empty();
    $(todayContainer).append(`
    <h4>Today's Forcast</h4>
        <div class="card" style="width: 100%;">
            <img src="${iconUrl}" class="card-img-top" style="max-width: 4rem;" alt="${current.weather[0].description}">
            <div class="card-body">
              <h5 class="card-title">${city} ${date}</h5>
              <h3 class="block">${current.weather[0].description}</h3>
              <ul class="list-group">
                <li class="list-group-item">${current.temp} degrees F</li>
                <li class="list-group-item">Wind: ${current.wind_speed} MPH</li>
                <li class="list-group-item">Humidity: ${current.humidity}%</li>
                <li class="list-group-item">UV Index:  <span><div style="background-color: ${uvi}; width: 10px; height: 10px;">  </div></span></li>
              </ul>
            </div>
        </div>
    `);
}

const renderForecast = (forecast, city, timezone) => {

    // Create unix timestamps for start and end of 5 day forecast
    let startDate = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
    let endDate = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();

    //
    // STOPPING POINT BEFORE WORK 11/19
    // NEED TO ADD FILTER DOWN TO 5 DAYS
    //

    console.log("city: ", city, "forecast:", forecast);

    $(forecastContainer).empty();
    $(forecastHeader).append(`<h4>Five Day Forcast</h4>
    `);

    for (let i = 0; i < forecast.length; i++) {
       
        console.log(forecast[i].dt)
        const date = dayjs.unix(forecast[i].dt).tz(timezone).format('M/D/YYYY');

        if ( forecast[i].dt > startDate && forecast[i].dt < endDate) {
            
        const iconUrl = `https://openweathermap.org/img/w/${forecast[i].weather[0].icon}.png`;
            
        let uvi = '';
        // uv index scale
        if (forecast[i].uvi < 3) {
            uvi = "#0EAD69"; 
        } else if (forecast[i].uvi < 7) {
            uvi = "#FFD23F"; 
        } else {
            uvi = "#E94F37"; 
        }
        console.log(uvi);

        $(forecastContainer).append(`
            <div class="card g-3" style="width: 20%;">
                <img src="${iconUrl}" class="card-img-top" style="max-width: 4rem;" alt="${forecast[i].weather[0].description}">
                <div class="card-body">
                <h5 class="card-title">${city} ${date}</h5>
                <h3 class="block">${forecast[i].weather[0].description}</h3>
                <ul class="list-group">
                <li class="list-group-item">${forecast[i].temp.day} degrees F</li>
                <li class="list-group-item">Wind: ${forecast[i].wind_speed} MPH</li>
                    <li class="list-group-item">Humidity: ${forecast[i].humidity}%</li>
                    <li class="list-group-item">UV Index:  <span><div style="background-color: ${uvi}; width: 10px; height: 10px;">  </div></span></li>
                </ul>
                </div>
            </div>
        `);
        }
    }
}