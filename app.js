const weatherApiKey = 'a963f967c24b43764454543bed4f55bc';
let long = '79.066895';
let lat= '30.734627';
let usertimezone = 0;

const mediaQuery = window.matchMedia('(max-width: 600px)');
const grid4 = document.querySelector('.grid-4');
const _container = document.querySelector('.container');
const _currentLocation = document.querySelector('.current-location');
const _temp = document.querySelector('.temp');
const _description = document.querySelector('.description');
const _pressure = document.querySelector('.pressure');
const _humidity = document.querySelector('.humidity');
const _windspeed = document.querySelector('.windspeed');
const _visibility = document.querySelector('.visibility');

const _searchBar = document.querySelector('.searchBar');
const _suggestions = document.querySelector('.suggestions');
const _options = document.querySelectorAll('option');
const _weatherIcon = document.querySelector('.weather-icon');
const _switch = document.querySelector('#checkbox');
const _card = document.querySelector('.card');
const _underline = document.querySelector('.title-underline');

const _hourlyCards = document.querySelector('.hourly-cards');
const _dailyCards = document.querySelector('.daily-cards');

_searchBar.addEventListener('input', function(e) {
    const target = e.target.value
    if(target.length > 1){
        fetch( `https://api.openweathermap.org/geo/1.0/direct?q=${target}&limit=4&appid=${weatherApiKey}`).then(res =>res.json()).then(data => suggest(data))
    }
    else{
        _suggestions.innerHTML = '';
    }
})

const suggest = (data) => {
    _suggestions.innerHTML = "";
    for(let x of data){
        _suggestions.innerHTML += `<option data-lat=${x.lat} data-lon=${x.lon} data-name=${x.name}>${x.name}, ${x.state}</option>`;
    }
}

_suggestions.addEventListener('click',function(e){
    let curTarget= e.target.attributes;
    // console.log(curTarget['data-lat'].value)
    lat = curTarget['data-lat'].value;
    long = curTarget['data-lon'].value;
    _suggestions.innerHTML = "";
    fettch().then(() => {_searchBar.value = "";})
})

_switch.addEventListener('change',function(){
    _card.classList.toggle('night-card');
    _searchBar.classList.toggle('night-bar');
});

const backgroundList = function(id,icon){
    if(id<300)
    return 'storm';
    else if(id<400)
    return 'day-cloud';
    else if(id<500 || id===800)
    return 'day-clear';
    else if(id<600){
        if(id === 500 || id === 501 || id === 520)
        return 'day-rain';
        return 'night-rain';
    }  
    else if(id<700)
    return 'snow';
    else if(id<800)
    return 'foggy';
    else{
        if(icon[-1]=== 'n')
        return 'night-cloud';
        else
        return 'day-cloud';
    }
}



let place,temperature,description,pressure,humidity,windspeed,visibility,sunrise,sunset;

const successCallback = (position) => {
    long = position.coords.longitude;
    lat = position.coords.latitude;
    usertimezone = 0;
    fettch();
}; 
const errorCallback = (error) => {
    fettch();
    console.log(error);
};
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

const updateHTML= function (){
    smallScreen()
    _currentLocation.textContent = place;
    _temp.textContent = `${temperature}°C`;
    _description.textContent = description;
    _pressure.textContent =`pressure: ${pressure} hPa`;
    _humidity.textContent =`humidity: ${humidity} %`;
    _windspeed.textContent = `windspeed: ${windspeed} kmph`;
    _visibility.textContent = `visibility: ${visibility} km`;
    _weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">`;
    _container.style.background = `url('./images/${backgroundList(id,icon)}.jpg') center/cover no-repeat fixed`
}

const fettch = async function(){
    let currHourlyForecast = '';
    await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${weatherApiKey}`).then(res=> res.json()).then(data=> {
        place = data.name;
        temperature = Math.trunc(data.main.temp - 273.15);
        description = data.weather[0].description;
        pressure = data.main.pressure;
        humidity = data.main.humidity;
        windspeed = Math.trunc(data.wind.speed * 3.6);
        visibility = (data.visibility/1000).toFixed(1);
        id = data.weather[0].id;
        icon = data.weather[0].icon;
        updateHTML();
        currHourlyForecast = `<div class="single-card">
                <p class="time">Now</p>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="card icon" class="wicon">
                <p class="card-temp">${temperature.toFixed(0)}°C</p>
            </div>`
    })
    await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${weatherApiKey}&units=metric`).then(res => res.json()).then(data => {
        const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        let fiveDays = {'0':{max: -99, min: 99, icon:'09d'},'1':{max: -99, min: 99, icon:'09d'},'2':{max: -99, min: 99, icon:'09d'},'3':{max: -99, min: 99, icon:'09d'},'4':{max: -99, min: 99, icon:'09d'},'5':{max: -99, min: 99, icon:'09d'},'6':{max: -99, min: 99, icon:'09d'}};
        const forecast = data.list.map((item) => {
            const {temp, temp_max, temp_min} = item.main;
            const {dt, dt_txt} = item;
            const [{description, icon}] = item.weather ;
            const c = new Date(dt_txt);
            // console.log(c)
            fiveDays[`${c.getDay()}`].max = (fiveDays[`${c.getDay()}`].max < temp_max) ? temp_max : fiveDays[`${c.getDay()}`].max;
            fiveDays[`${c.getDay()}`].min = (fiveDays[`${c.getDay()}`].min > temp_min) ? temp_min : fiveDays[`${c.getDay()}`].min;
            fiveDays[`${c.getDay()}`].icon = icon;
            return ( { temp, temp_max, temp_min, dt, dt_txt, description, icon });
        });
        const todayForcast = forecast.slice(0,8);

        const hourlyHtml = todayForcast.map(item => {
            let date1 = new Date((item.dt + data.city.timezone - (-(new Date()).getTimezoneOffset() * 60))*1000)
            // console.log(item.dt_txt, date1, new Date((item.dt + data.city.timezone - (-(new Date()).getTimezoneOffset() * 60))*1000))
            const temp = item.temp;
            let icon = item.icon;
            date1 = date1.getHours() ;
            const ampm = (date1 > 11) ? 'PM' : 'AM';
            if(date1 < 18 && date1 > 6){
                icon = icon.split('');
                icon[2] = 'd';
                icon = icon.join('');
            }
            return (
                `<div class="single-card">
                <p class="time">${date1 % 12 || 12} ${ampm}</p>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="card icon" class="wicon">
                <p class="card-temp">${temp.toFixed(0)}°C</p>
              </div>`
            )
        });
        _hourlyCards.innerHTML = currHourlyForecast + hourlyHtml.join('');


        let dailyHtml = 8;
        let count= new Date(todayForcast[0].dt_txt);
        count = count.getDay();
        while(fiveDays[`${count}`].max === 99){
            count++;
        }
        // console.log(fiveDays[`${count}`])
        dailyHtml = `<div class="single-card-daily">
                        <p class="day">Today</p>
                        <img src="http://openweathermap.org/img/wn/${(fiveDays[`${count}`].icon).slice(0,2)}d@2x.png" alt="card icon" class="wicon">
                        <p class="card-temp-max">${(fiveDays[`${count}`].max).toFixed(0)}°C</p>
                        <p class="card-temp-min">${(fiveDays[`${count}`].min).toFixed(0)}°C</p>
                    </div>`;
        const stop = count;
        count++;  
        // console.log(count)  
        let tomorrow = 0;        
        while(count !== stop){
            if(fiveDays[`${count}`].max !== -99)
            {
                dailyHtml += `<div class="single-card-daily">
                <p class="day">${tomorrow==0?'Tomorrow':dayName[count]}</p>
                <img src="http://openweathermap.org/img/wn/${(fiveDays[`${count}`].icon).slice(0,2)}d@2x.png" alt="card icon" class="wicon">
                <p class="card-temp-max">${(fiveDays[`${count}`].max).toFixed(0)}°C</p>
                <p class="card-temp-min">${(fiveDays[`${count}`].min).toFixed(0)}°C</p>
                </div>`;
                tomorrow = 1;
            }         
            count = (count+1)%7;
        }
        _dailyCards.innerHTML = dailyHtml;

    })
}

const smallScreen = function(){
    if(mediaQuery.matches){
        grid4.innerHTML = `<div class="details">
        <p class="pressure">pressure: ${pressure} hPa</p>
        <p class="humidity">Humidity: ${humidity}%</p>
        <p class="windspeed">windspeed: ${windspeed} kmph</p>
        <p class="visibility">visibility: ${visibility} km</p>
      </div>`;
    }
}
