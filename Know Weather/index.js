//selecting tags
const searchBox = document.getElementById("search-box");
const sBtn = document.getElementById("btn");
const descripImg = document.getElementById("descripImg");
const recentlocations = document.getElementById("recent-locations");
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ulforecast = document.getElementById("ulforecast");


class App {
    #map;
    #mapZoomLevel = 13;

    constructor() {
        this._getPosition();
        this._getCurrDay();

    }
    clicked = sBtn.addEventListener("click", this._getweatherbycity.bind(this));

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMapbyposition.bind(this), function () { alert('Could not get your location. Please allow to get location'); })
        }
    };
    _loadMapbyposition(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        console.log('got your location');

        const cords = [latitude, longitude];

        this.#map = L.map('map').setView(cords, this.#mapZoomLevel);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this._getWeatherbycoords(cords);
    };

    async _getWeatherbycoords(coordinates) {
        let [lat, lon] = coordinates;
        const weather = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=e51b7793cd3992ff6259e9474d98d848`
        );
        let data = await weather.json();
        console.log(data);
        this._writeWeather(data);
        this._renderMarker(coordinates, data.name);
    }
    async _getweatherbycity() {
        let val = searchBox.value;
        const weather = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${val}&units=metric&APPID=e51b7793cd3992ff6259e9474d98d848`);
        let winfo = await weather.json();
        ulforecast.innerHTML = " ";
        this._writeWeather(winfo);

        let { lon, lat } = winfo.coord;

        this._renderMarker([lat, lon], winfo.name);


    }
    async _getforecast(coordinates) {
        let { lon, lat } = coordinates;
        const forecast = await fetch(

            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=e51b7793cd3992ff6259e9474d98d848`
        );
        let foredata = await forecast.json();
        this._writeforecast(foredata);
    }
    _writeWeather(info) {

        tempNumeric.innerHTML = Math.round(info.main.temp);
        description.innerHTML = info.weather[0].main;
        cityname.innerHTML = info.name;
        countryName.innerHTML = info.sys.country;
        humidity.innerHTML = info.main.humidity;
        pressure.innerHTML = info.main.pressure;
        windspeed.innerHTML = info.wind.speed;
        visibility.innerHTML = info.visibility;
        descripImg.setAttribute("src", `images/${info.weather[0].main}.png`);
        this._renderlocation(info);
        this._getforecast(info.coord);
    }

    _writeforecast(data) {
        const { list: forecastList } = data; // destructring array in list obj as forecastList
        for (let i = 7, len = forecastList.length; i < len; i += 8) {
            const { main, weather, dt_txt } = forecastList[i];

            const forelist = document.createElement('li');
            forelist.setAttribute('class', 'days');
            const foredate = new Date(dt_txt);

            forelist.innerHTML = ` <div class="daytitile"><span id="day1">${days[foredate.getUTCDay()]}</span></div>
            <div class="foredescripimg"><img id="foredescripimage"
                    src="images/${weather[0].main}.png" alt=""></div>
            <div class="foredescrip">
                <span id="foredescription">${weather[0].main}</span>
            </div>

            <div class="foretemp">
                <p><span id="foretemp">${Math.round(main.temp)}</span><sup>°</sup>C</p>
            </div>`
            ulforecast.appendChild(forelist);

        }
    }
    _getCurrDay() {
        const date = new Date();
        let hours = date.getHours();
        let mins = date.getMinutes();

        let time = document.getElementById("time");
        time.innerHTML = `${date.getHours()}:${date.getMinutes()}`;

        let day = document.getElementById("day");
        let month = document.getElementById("month");
        let year = document.getElementById("year");
        todaydate.innerHTML = date.getDate();
        day.innerHTML = days[date.getDay()];
        month.innerHTML = months[date.getMonth()];
        year.innerHTML = date.getFullYear();

    }
    _renderMarker(coordinates, location) {
        L.marker(coordinates).addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 200,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                }))
            .setPopupContent(`${location}`)
            .openPopup();

    }

    _renderlocation(data) {
        let list = document.createElement('li');
        list.setAttribute('class', 'location');
        list.setAttribute('id', 'recentlocation');
        list.innerHTML = ` <h2 id="location-title">${data.name}</h2>
    <div class="location-temps">
        <div class="temp-min">
            <span>Min Temp :</span>
            <span><span id="mintemp">${Math.round(data.main.temp_min)}</span><sup>°</sup>C</span>
        </div>
        <div class="temp-max">
            <span>Max Temp :</span>
            <span><span id="mintemp">${Math.round(data.main.temp_max)}</span><sup>°</sup>C</span>
        </div>
    </div>`;



        recentlocations.appendChild(list);
        list.addEventListener('click', function (e) {
            e.preventDefault();
            app._moveToPopup(data);
        })

    }
    _moveToPopup(data) {

        let { lon, lat } = data.coord;
        this.#map.setView([lat, lon], this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })


    }


}

const app = new App();

