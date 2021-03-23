// API KEY : 7c06c0508466362a3270e4d7df99642f
var userInput
var uvIndex
var RecentCSearch = JSON.parse(localStorage.getItem('cities')) || []
var showCity = document.getElementById('cityInfo')
var Select5 = document.getElementById('fiveDay')
var CityPick = document.getElementById('pastCities')
var searchBtn = document.querySelector("#SEARCH");

//API call by city name: api.openweathermap.org/data/2.5/weather?q=<cityName>
function Weather101(event) {
    var target = event.target
    if (target.classList.contains('btn')) {
        userInput = document.getElementById('citySearch').value;
        displayWeather(userInput)
        document.getElementById('citySearch').value = ''; //empty out userInput
    }
}
const PrevCity = _ => {
    CityPick.innerHTML = '' //set to empty before every render
    for (var i = 0; i < RecentCSearch.length; i++) {
        var cityNode = document.createElement('div');
        cityNode.innerHTML = `${RecentCSearch[i]} <hr>`;
        CityPick.append(cityNode);
    }
}
const toFarenheit = value => {
    value = (value * (9 / 5) - 459.67).toFixed(2)
    return value
}

const casing = str => { //Capitalize first letter of every word in the string
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}
const displayWeather = userInput => { //stores recent searches in local storage and displayed under search
    userInput = casing(userInput)
    RecentCSearch.push(userInput)

    localStorage.setItem('cities', JSON.stringify(RecentCSearch))
    PrevCity()
    getCityWeather(userInput)
}

const getCityWeather = userInput => {
    showCity.innerHTML = ''
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=7c06c0508466362a3270e4d7df99642f`)
        .then(response => response.json())
        .then(({ main: { temp, humidity }, wind: { speed }, coord: { lon, lat } }) => {
            var info = document.createElement('div')
            temp = toFarenheit(temp)

            info.innerHTML = `<h2>${userInput} 
            ${moment().format('MM/DD/YYYY')}</h2>
            <p> Temperature: ${temp} ºF </p> 
            <p> Humidity: ${humidity} % </p> 
            <p> Wind Speed: ${speed} MPH </p>`
            showCity.append(info)
            UVIndex(lon, lat)
            get5day(lon, lat)
        })
        .catch(error => console.error(error))
}
const UVIndex = (lon, lat) => { //displays the UV Index
    fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=7c06c0508466362a3270e4d7df99642f&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(({ value }) => {
            var uvNode = document.createElement('p')
            uvNode.textContent = 'UV Index: '
            var uvSpan = document.createElement('span')
            uvSpan.textContent = `${value}`
            value = Math.floor(value)
            if (value < 3) {
                uvSpan.setAttribute('class', 'uvSafe')
            } else if (value > 2 && value < 6) {
                uvSpan.setAttribute('class', 'uvMed')
            } else if (value > 5 && value < 8) {
                uvSpan.setAttribute('class', 'uvMod')
            } else {
                uvSpan.setAttribute('class', 'uvHigh')
            }
            uvNode.append(uvSpan)
            showCity.append(uvNode)
        })
        .catch(error => console.error(error))
}

const get5day = (lon, lat) => { //gets weather forecast for the next 5 days
    Select5.innerHTML = ''
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=7c06c0508466362a3270e4d7df99642f`)
        .then(response => response.json())
        .then(data => {
            var list = data.list
            for (var i = 7; i < list.length; i += 7) { //date and time converted from unix
                var fiveNode = document.createElement('div')
                fiveNode.setAttribute('class', 'col-sm-2.4 fiveDay')
                fiveNode.innerHTML = `
                <h6>${moment.unix(list[i].dt).format("MM/DD/YYYY")}</h6>
                <img src ="https://openweathermap.org/img/wn/${list[i].weather[0].icon}.png" alt = "${list[i].weather[0].icon}">
                <p>Temp: ${toFarenheit(list[i].main.temp)} ºF </p> <p>Humidity: ${list[i].main.humidity} % </p> `
                Select5.append(fiveNode)
            }
        })
        .catch(error => console.error(error))
}
PrevCity();
searchBtn.addEventListener('click', Weather101);