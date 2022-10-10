const weatherApiKey = 'a963f967c24b43764454543bed4f55bc';
let long = '79.066895';
let lat= '30.734627';
const timezoneApi = 'C7F6W2XJPD31';

const _container = document.querySelector('.container');
const _currentLocation = document.querySelector('.current-location');
const _temp = document.querySelector('.temp');
const _description = document.querySelector('.description');
const _pressure = document.querySelector('.pressure');
const _humidity = document.querySelector('.humidity');
const _windspeed = document.querySelector('.windspeed');
const _visibility = document.querySelector('.visibility');
const _sunrise = document.querySelector('.sunrise');
const _sunset = document.querySelector('.sunset');

const _weatherIcon = document.querySelector('.weather-icon');
const _switch = document.querySelector('#checkbox');
const _iconImg = document.querySelector('.weather-icon')
const _card = document.querySelector('.card');
const _underline = document.querySelector('.title-underline');

_switch.addEventListener('change',function(){
    _card.classList.toggle('night-card');
    _iconImg.classList.toggle('night-img');
    _underline.classList.toggle('night-title-underline');
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





const successCallback = (position) => {
    long = position.coords.longitude;
    lat = position.coords.latitude;
    fettch();
}; 
const errorCallback = (error) => {
    fettch();
    console.log(error);
};
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

const updateHTML= function (place,temperature,description,pressure,humidity,windspeed,visibility,sunrise,sunset,id,icon){
    _currentLocation.textContent = place;
    _temp.textContent = `${temperature}°C`;
    _description.textContent = description;
    _pressure.textContent =`pressure: ${pressure} hPa`;
    _humidity.textContent =`humidity: ${humidity} %`;
    _windspeed.textContent = `windspeed: ${windspeed} kmph`;
    _visibility.textContent = `visibility: ${visibility} km`;
    _sunrise.textContent = `sunrise: ${sunrise}`;
    _sunset.textContent = `sunset: ${sunset}`;
    _weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">`;
    _container.style.background = `url('./images/${backgroundList(id,icon)}.jpg') center/cover no-repeat fixed`
}

const fettch = function(){
    let place,temperature,description,pressure,humidity,windspeed,visibility,sunrise,sunset,offset;
    data = fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${weatherApiKey}`).then(res=> res.json()).then(data=> {
        place = data.name;
        temperature = Math.trunc(data.main.temp - 273.15);
        description = data.weather[0].description;
        pressure = data.main.pressure;
        humidity = data.main.humidity;
        windspeed = Math.trunc(data.wind.speed * 3.6);
        visibility = (data.visibility/1000).toFixed(1);
        id = data.weather[0].id;
        icon = data.weather[0].icon;
        fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApi}&format=json&by=position&lat=${lat}&lng=${long}`).then(res=> res.json()).then(data2 => {
            sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US',{timeZone:data2.zoneName, hour: 'numeric', minute: 'numeric', hour12: true});
            sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US',{timeZone:data2.zoneName, hour: 'numeric', minute: 'numeric', hour12: true});
            updateHTML(place,temperature,description,pressure,humidity,windspeed,visibility,sunrise,sunset,id,icon)
        })
    });
}

