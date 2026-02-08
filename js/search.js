let apiKey = "6db4ec63167a6bea404999a443412f8d";
let searchinput = document.querySelector(`.searchinput`);
let currentCityData = null; // Store current city data for favorites

// Loading functions
function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// Favorites management functions
function getFavorites() {
    const favorites = localStorage.getItem('weatherFavorites');
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
}

function addToFavorites(cityData) {
    const favorites = getFavorites();
    const cityName = cityData.name;
    
    // Check if city already exists in favorites
    if (!favorites.find(fav => fav.name === cityName)) {
        const favoriteCity = {
            name: cityData.name,
            country: cityData.sys.country,
            temp: Math.floor(cityData.main.temp),
            weather: cityData.weather[0].main,
            description: cityData.weather[0].description,
            addedAt: new Date().toISOString()
        };
        favorites.push(favoriteCity);
        saveFavorites(favorites);
        displayFavorites();
        updateFavoriteButton(true);
    }
}

function removeFromFavorites(cityName) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.name !== cityName);
    saveFavorites(favorites);
    displayFavorites();
    updateFavoriteButton(false);
}

function isCityFavorited(cityName) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.name === cityName);
}

function updateFavoriteButton(isFavorited) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const heartIcon = document.getElementById('heart-icon');
    
    if (isFavorited) {
        favoriteBtn.classList.add('favorited');
        heartIcon.className = 'fa-solid fa-heart';
    } else {
        favoriteBtn.classList.remove('favorited');
        heartIcon.className = 'fa-regular fa-heart';
    }
}

function displayFavorites() {
    const favorites = getFavorites();
    const favoritesSection = document.getElementById('favorites-section');
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        favoritesSection.classList.add('hidden');
        return;
    }
    
    favoritesSection.classList.remove('hidden');
    
    favoritesList.innerHTML = favorites.map(favorite => `
        <div class="favorite-item" onclick="loadFavoriteCity('${favorite.name}')">
            <div class="favorite-city-info">
                <div class="favorite-city-name">${favorite.name}</div>
                <div class="favorite-city-temp">${favorite.temp}°</div>
            </div>
            <div class="favorite-remove" onclick="event.stopPropagation(); removeFromFavorites('${favorite.name}')">
                <i class="fa-solid fa-trash-can"></i>
            </div>
        </div>
    `).join('');
}

async function loadFavoriteCity(cityName) {
    searchinput.value = cityName;
    await search(cityName);
}

async function search(city, state, country){
    showLoading();
    
    let url = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city},${state},${country}&appid=${apiKey}`);

    if(url.ok){
    let data = await url.json();
    console.log(data);
    
    // Store current city data for favorites
    currentCityData = data;
    
    let box = document.querySelector(".return");
    box.style.display = "block";

    let message = document.querySelector(".message");
    message.style.display = "none";

    let errormessage = document.querySelector( ".error-message");
        errormessage.style.display = "none";

    let weatherImg = document.querySelector(".weather-img");
    document.querySelector(".city-name").innerHTML = data.name;
    document.querySelector(".weather-temp").innerHTML = Math.floor(data.main.temp) + '°';
    document.querySelector(".wind").innerHTML = Math.floor(data.wind.speed) + " m/s";
    document.querySelector(".pressure").innerHTML = Math.floor(data.main.pressure) + " hPa";
    document.querySelector('.humidity').innerHTML = Math.floor(data.main.humidity)+ "%";
    document.querySelector(".sunrise").innerHTML =  new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    document.querySelector(".sunset").innerHTML =  new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});

    // Update favorite button status
    updateFavoriteButton(isCityFavorited(data.name));

    if (data.weather[0].main === "Rain") {
        weatherImg.src = "img/rain.png";
      } else if (data.weather[0].main === "Clear") {
        weatherImg.src = "img/sun.png";
      } else if (data.weather[0].main === "Snow") {
        weatherImg.src = "img/snow.png";
      } else if (
        data.weather[0].main === "Clouds" ||
        data.weather[0].main === "Smoke"
      ) {
        weatherImg.src = "img/cloud.png";
      } else if (
        data.weather[0].main === "Mist" ||
        data.weather[0].main === "Fog"
      ) {
        weatherImg.src = "img/mist.png";
      } else if (data.weather[0].main === "Haze") {
        weatherImg.src = "img/haze.png";
      } else if (data.weather[0].main === "Thunderstorm") {
        weatherImg.src = "img/thunderstorm.png";
      }
    } else {
      let box = document.querySelector(".return");
      box.style.display = "none";

      let message = document.querySelector(".message");
      message.style.display = "none";

      let errormessage = document.querySelector(".error-message");
      errormessage.style.display = "block";
    }
    
    hideLoading();
}


searchinput.addEventListener('keydown', function(event) {
    if (event.keyCode === 13 || event.which === 13) {
        search(searchinput.value);
        console.log("worked")
      }
  });

// Add event listener for favorite button
document.addEventListener('DOMContentLoaded', function() {
    displayFavorites(); // Load favorites on page load
    
    // Check if there's a city to search from main page
    const cityToSearch = localStorage.getItem('searchCity');
    if (cityToSearch) {
        searchinput.value = cityToSearch;
        search(cityToSearch);
        localStorage.removeItem('searchCity'); // Clear after use
    }
    
    // Handle favorite button click
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentCityData) {
                const cityName = currentCityData.name;
                if (isCityFavorited(cityName)) {
                    removeFromFavorites(cityName);
                } else {
                    addToFavorites(currentCityData);
                }
            }
        });
    }
});