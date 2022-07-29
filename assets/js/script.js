$(document).ready( function() {console.log('Your Document has loaded!')});

const apiKey = '5f7b77913d91556efcc7a0db5977a502'


// Submit the form to fetch weather information
const searchEl = $('#searchField');
const searchBtn = $('#searchBtn');

const handleSearch = (event) => {
        event.preventDefault();
        const locationSearch = searchEl.val()
        console.log(searchEl.val());
        buildLocationUrl(locationSearch);

}

// Handle button click to submit the form
searchBtn.on('click', handleSearch);



// Build geolocationUrl
const buildLocationUrl = (locationSearch) => {

    const locationUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${locationSearch}&appid=${apiKey}`;
    getLocation(locationUrl);
    console.log(locationUrl);

}

// Fetch geolocation information and pass to weather fetch function
const getLocation = (locationUrl) => {
    fetch(locationUrl)
        .then(function (response) {
            console.log(response);
            return response.json(); // what is this?
        })
        .then(function (response) {
            console.log(response);
            const lat = response[0].lat;
            const lon = response[0].lon;
            buildWeatherUrl(lat, lon);
        })
}

// Fetch weather information for geolocation
const buildWeatherUrl = (lat, lon) => {
    console.log(lat + ' ' + lon);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    console.log(weatherUrl);
    getweather(weatherUrl);

    const forcastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    console.log(forcastUrl);
    getforcast(forcastUrl);
}

const getweather = (weatherUrl) => {
    fetch(weatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function (response) {
            console.log('current forcast');
            console.log(response);
            const weatherObj = response;
            renderWeather(weatherObj);
        })
}
const getforcast = (forcastUrl) => {

    fetch(forcastUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function (response) {
            console.log('forcasted weather');
            console.log(response);
            const forcastObj = response;
            renderWeather(forcastObj)
        })

}

const renderWeather = (forcastObj, weatherObj) => {

    console.log('current forcast');
    console.log(weatherObj);
    console.log('forcasted weather');
    console.log(forcastObj);
}