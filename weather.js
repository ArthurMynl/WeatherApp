let apikey = "d81ca58ad7df8663f1a8cc8f3b1efbc5";

let icon_list = { clear: "fa-solid fa-cloud-sun", clouds: "fa-solid fa-cloud", rain: "fa-solid fa-tint", snow: "fa-solid fa-snowflake-o", thunderstorm: "fa-solid fa-bolt", foggy: "fa-solid fa-cloud", windy: "fa-solid fa-cloud", default: "fa-solid fa-cloud" };
let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

document.querySelector("#weather-form").addEventListener("submit", (event) => {
    event.preventDefault();
    getWeather();
})

window.onload = parisWeather();

function getWeather() {
    let city = document.forms["weather-form"]["city"].value
    if (city == "") {
        document.getElementById("error").innerHTML = "Name must be filled out";
        return false;
    }
    else {
        city = city.toLowerCase()
        const words = city.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
        city = words.join(" ");
        document.getElementById("error").innerHTML = "";
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                else {
                    document.getElementById("error").innerHTML = "This city is not available";
                }
            })
            .then(data => {
                let temp = (data.main.temp - 273.15).toFixed(1);
                let feels_like = (data.main.feels_like - 273.15).toFixed(1);
                let humidity = data.main.humidity;
                let wind_speed = Math.round(data.wind.speed);
                let weather_description = data.weather[0].description;
                document.getElementById("city").innerHTML = `Current weather in ${city}`;
                document.getElementById("temperature").innerHTML = `${temp}°C`;
                document.getElementById("feels_like").innerHTML = `Feeling like : ${feels_like}°C`;
                document.getElementById("humidity").innerHTML = `Humidity : ${humidity}%`;
                document.getElementById("wind").innerHTML = `Wind : ${wind_speed} km/h`;
                document.getElementById("description").innerHTML = weather_description[0].toUpperCase() + weather_description.substring(1);
                document.getElementById("icon").className = icon_list[data.weather[0].main.toLowerCase()];
                fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}`)
                    .then(response => response.json())
                    .then(data => {
                        let date = [];
                        let temp = [];
                        let weather = [];
                        for (let i = 0; i < data.list.length; i++) {
                            date.push(data.list[i].dt_txt);
                            temp.push(data.list[i].main.temp - 273.15);
                            weather.push(data.list[i].weather[0].main);
                        }
                        let forecast = processForecast(date, temp, weather);
                        for (let i = 0; i < 4; i++) {
                            document.getElementById(`day${i}`).children[0].innerHTML = forecast.def_date[i];
                            document.getElementById(`day${i}`).children[1].className = icon_list[forecast.def_weather[i].toLowerCase()];
                            document.getElementById(`day${i}`).children[2].innerHTML = `${forecast.def_min[i]}°C/${forecast.def_max[i]}°C`;
                            document.getElementById(`day${i}`).children[3].innerHTML = forecast.def_weather[i];
                        }
                    })
            })
        return true;
    }
}

function parisWeather() {
    let city = "Paris";
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                document.getElementById("error").innerHTML = "This city is not available";
            }
        })
        .then(data => {
            let temp = (data.main.temp - 273.15).toFixed(1);
            let feels_like = (data.main.feels_like - 273.15).toFixed(1);
            let humidity = data.main.humidity;
            let wind_speed = Math.round(data.wind.speed);
            let weather_description = data.weather[0].description;
            document.getElementById("city").innerHTML = `Current weather in ${city[0].toUpperCase() + city.substring(1)}`;
            document.getElementById("temperature").innerHTML = `${temp}°C`;
            document.getElementById("feels_like").innerHTML = `Feeling like : ${feels_like}°C`;
            document.getElementById("humidity").innerHTML = `Humidity : ${humidity}%`;
            document.getElementById("wind").innerHTML = `Wind : ${wind_speed} km/h`;
            document.getElementById("description").innerHTML = weather_description[0].toUpperCase() + weather_description.substring(1);
            document.getElementById("icon").className = icon_list[data.weather[0].main.toLowerCase()];
            fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}`)
                .then(response => response.json())
                .then(data => {
                    let date = [];
                    let temp = [];
                    let weather = [];
                    for (let i = 0; i < data.list.length; i++) {
                        date.push(data.list[i].dt_txt);
                        temp.push(data.list[i].main.temp - 273.15);
                        weather.push(data.list[i].weather[0].main);
                    }
                    let forecast = processForecast(date, temp, weather);
                    for (let i = 0; i < 4; i++) {
                        document.getElementById(`day${i}`).children[0].innerHTML = forecast.def_date[i];
                        document.getElementById(`day${i}`).children[1].className = icon_list[forecast.def_weather[i].toLowerCase()];
                        document.getElementById(`day${i}`).children[2].innerHTML = `${forecast.def_min[i]}°C/${forecast.def_max[i]}°C`;
                        document.getElementById(`day${i}`).children[3].innerHTML = forecast.def_weather[i];
                    }
                })
        })
    return true;
}


function processForecast(date, temp, weather) {
    let today = new Date();
    temperature = [];
    def_min = [];
    def_max = [];
    def_weather = [];
    def_date = [];
    let current_date = today.getDate();
    for (let i = 0; i < date.length; i++) {
        let day = new Date(transformDate(date[i])) // YYYY-MM-DDTHH:MM:SS
        if (day.getDate() != current_date) {
            temperature.push(Math.round(temp[i]))
            if (day.getHours() == 15) {
                def_weather.push(weather[i])
                def_date.push(days[day.getDay()]);
            }
            if (day.getHours() == 21) {
                def_min.push(Math.min.apply(null, temperature));
                def_max.push(Math.max.apply(null, temperature));
                temperature = [];
            }
        }
    }
    return { def_min, def_max, def_weather, def_date };
}


function transformDate(date) {
    let newDate = date.replace(" ", "T");
    return newDate;
}