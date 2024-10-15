const searchCityElement = document.querySelector('#city-search')

// get coordinates of device for use in API
const checkLocationPermission = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getCurrentWeather(position.coords.latitude, position.coords.longitude)
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert(
                            'Please enable location in device and browser settings to get local weather.'
                        )
                        break
                    case error.POSITION_UNAVAILABLE:
                        alert(
                            'Please enable location in device and browser settings to get local weather.'
                        )
                        break
                    case error.TIMEOUT:
                        alert(
                            'Please enable location in device and browser settings to get local weather.'
                        )
                        break
                    case error.UNKNOWN_ERROR:
                        alert(
                            'Please enable location in device and browser settings to get local weather.'
                        )
                        break
                }
            }
        )
    } else {
        alert('Please enable location services to get local weather.')
        console.log('Please enable location services in the browser to use this app.')
    }
}

// Searching a custom city based on user input
searchCityElement.addEventListener('search', (e) => {
    e.preventDefault()

    const cityName = `${searchCityElement.value.toLowerCase()}`
    searchCity(cityName)
})

const searchCity = async (cityName) => {
    const searchCityResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=a97e258bb78f28ec96c19ba4c94f087b&units=imperial`
    )

    // render response to screen if status is "OK"
    if (searchCityResponse.status === 200) {
        const cityData = await searchCityResponse.json()
        console.log('City data:', cityData.name)
        renderDOM(cityData)
    } else {
        searchCityElement.value = ''
        searchCityElement.placeholder = 'Try a different city.'
        throw new Error('Try again later or try a new city.')
    }
}

// Fetch is promised based. Can use async/await instead of .then
const getCurrentWeather = async (latitude, longitude) => {
    const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=a97e258bb78f28ec96c19ba4c94f087b&units=imperial`
    )

    // render response to screen if status is "OK"
    if (currentWeatherResponse.status === 200) {
        const currentWeatherData = await currentWeatherResponse.json()
        renderDOM(currentWeatherData)
    } else {
        throw new Error(
            'Sorry, OpenWeather seems to be having issues with their API. Try again later.'
        )
    }
}

const renderDOM = (currentWeatherData) => {
    const tempElement = document.querySelector('#temp')
    const cityElement = document.querySelector('#city')
    const descriptionElement = document.querySelector('#description')
    const filteredTemp = currentWeatherData.main.temp.toFixed()
    const conditions = currentWeatherData.weather[0].main

    const cityName = determineCity(filteredTemp, conditions)
    cityElement.textContent = cityName
    tempElement.textContent = determineTempMessage(cityName, filteredTemp, conditions)
    descriptionElement.textContent = determineDescription(cityName)

    // debug
    console.log('Weather Data:', currentWeatherData)
}

// city Algorithm
const determineCity = (filteredTemp, conditions) => {
    let city

    //Test Data
    //filteredTemp = 100
    //conditions = 'Rain'

    // Determine conditions, if none, run temp algo
    if (conditions === 'Rain' || conditions === 'Thunderstorm') {
        city = "storm's end"
        updateImage('stormsend-bg')
    } else if (conditions === 'Mist' || conditions === 'Fog') {
        city = 'north of the wall'
        updateImage('north-bg')
    } else {
        if (filteredTemp <= 35) {
            city = 'winterfell'
            updateImage('winterfell-bg')
        } else if (filteredTemp <= 55) {
            city = 'riverrun'
            updateImage('riverrun-bg')
        } else if (filteredTemp <= 65) {
            city = 'highgarden'
            updateImage('highgarden-bg')
        } else if (filteredTemp <= 72) {
            city = 'kings landing'
            updateImage('kingslanding-bg')
        } else if (filteredTemp <= 78) {
            city = "slaver's bay"
            updateImage('slaversbay-bg')
        } else if (filteredTemp <= 90) {
            city = 'Dorne'
            updateImage('dorne-bg')
        } else {
            city = 'castle black'
            updateImage('castleblack-bg')
        }
    }
    return city
}

// Dynamically decide which DOM messages to apply
const determineTempMessage = (city, filteredTemp, conditions) => {
    const currCity = city.toLowerCase()
    const currWeather = ` ${filteredTemp}°F, ${conditions}?`
    let message = ''

    if (currCity === "storm's end") {
        message = `Wow. ${currWeather}`
    } else if (currCity === 'north of the wall') {
        message = `Hmm. ${currWeather}`
    } else if (currCity === 'winterfell') {
        message = `Oh my. ${currWeather}`
    } else if (currCity === 'riverrun') {
        message = `Oh. ${currWeather}`
    } else if (currCity === "slaver's bay") {
        message = `Whew. ${currWeather}`
    } else if (currCity === 'dorne') {
        message = `Yikes. ${currWeather}`
    } else {
        message = `Ahh. ${currWeather}`
    }

    return message
}

const determineDescription = (city) => {
    const currCity = city.toLowerCase()
    let description = ''

    if (currCity === "storm's end") {
        description = "Storm's end known for impenetrable walls and stormy weather."
    } else if (currCity === 'north of the wall') {
        description = "Foggy out there. Watch out for White Walkers."
    } else if (currCity === 'winterfell') {
        description = 'Cold, Icy, Freezing. Home of the Starks.'
    } else if (currCity === 'riverrun') {
        description = 'River-crossed fortress with lush, fertile lands.'
    } else if (currCity === 'highgarden') {
        description = 'Verdant, prosperous castle amid fertile, blooming lands.'
    } else if (currCity === 'kings landing') {
        description = 'Sprawling coastal city and seat of royal power.'
    } else if (currCity === "slaver's bay") {
        description = 'Harsh, arid coastal region with waves of heat.'
    } else if (currCity === 'dorne') {
        description = 'Sun-soaked desert land with fierce, proud people.'
    } else {
        description = 'Last bastion  of civilization before the wilds'
    }

    return description
}

// Dynamically apply CSS background to according city
const updateImage = (nameOfClass) => {
    const imageElement = document.querySelector('#image-container')

    imageElement.className = ''
    imageElement.classList.add(nameOfClass)
}

checkLocationPermission()
