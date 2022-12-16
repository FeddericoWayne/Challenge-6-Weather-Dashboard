// Sound effects
var focus = new Audio();
focus.src = "Assets/Sound Effects/Click.wav";

var startSearch = new Audio();
startSearch.src = "Assets/Sound Effects/Search.wav";

var warning = new Audio();
warning.src = "Assets/Sound Effects/Warning.wav";


function type() {
    focus.play();
}

$("#search-city").on("focus",type);
$("#state").on("focus",type);


// Clock function
var alarm = new Audio();
alarm.src = "Assets/Sound Effects/Hour Countdown.wav";

setInterval(function() {  
    var date = dayjs().format('dddd, MMM DD, YYYY');
    var time = dayjs().format('h:mm:ss A');  
    $('#clock').html("Today is " + date + "<br>and it is now " + time);
    var newHour = dayjs().format('mm:ss');
    if (newHour === "59:57") {
        alarm.play();
    }


},1000);







// Retrieves search history from local storage and display previously searched cities with dataset of city info inside the html tag
var searchHistory = localStorage.getItem("searchHistory") || "";

// If search history is empty
if (searchHistory === "") {
    $("#empty-list").show();

} else {
    $("#empty-list").hide();
}

var searchHistoryArray = searchHistory.split("?");
searchHistoryArray.pop();

// Hides weather boxes
$("#current-weather-container").hide();
$("#forecast-container").hide();

// Hides warning
$("#warning").hide();

// Loops through previously searched city and displays as an unordered list
// Need to figure out how to remove duplicates!
for (var x=0; x<searchHistoryArray.length; x++) {
    var cityString = searchHistoryArray[x];
    var cityParsed = JSON.parse(searchHistoryArray[x]);
    var cityNameParsed = cityParsed.name;
    var codeParsed = cityParsed.code;
    var latParsed = cityParsed.lat;
    var lonParsed = cityParsed.lon;
    var cityListing = $("<li>").text(cityNameParsed.toUpperCase() + ", " + codeParsed.toUpperCase());
    cityListing.addClass("city btn");
    cityListing.attr("data-city", cityNameParsed);
    cityListing.attr("data-state", codeParsed);
    cityListing.attr("data-lat", latParsed);
    cityListing.attr("data-lon", lonParsed);

    $("#search-history").prepend(cityListing);

    
 
};


function getApi(event) {

    event.preventDefault(); 

    event.stopPropagation();


    // Takes input from user
    var cityName = $("#search-city").val().toLowerCase();
    var stateCode = $("#state").val().toUpperCase();
    var latitude = "";
    var longitude = "";
    var date = dayjs().format('dddd, MMM DD');

    // Alerts when user enters nothin or missing state code
    if (cityName === "" || stateCode ==="") {
        warning.play();
        $("#city-label").attr("class","empty");
        $("#state-label").attr("class","empty");
        return;
    } else {
        startSearch.play();
        $("#city-label").attr("class","");
        $("#state-label").attr("class","");

    }



    // API request url for geolocation of city entered
    var geoRequestUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "," + stateCode + ",US&limit=1&appid=7df7243f5169b46433ea853892fbb930";

    
    // GET request for geolocation
    fetch(geoRequestUrl)
    .then(function(response) {

        return response.json()

    })
    .then(function(data) {

        // If location can't be found
        if (data.length === 0) {
            warning.play();
            $("#warning").show();
            $('#search-city').val("");
            $('#state').val("");
        } else {
            $("#warning").hide();
        }

        latitude = data[0].lat;
        longitude = data[0].lon;

        // add current search to search history
        var cityObj = {
            name: cityName,
            code: stateCode,
            lat: data[0].lat,
            lon: data[0].lon,
        }
    
        var cityString = JSON.stringify(cityObj);

        // If city searched is already in the search history list
        if (searchHistory.includes(cityString)) {

            for (var y=0; y<$("#search-history").children().length; y++) {

                if ($("#search-history").children().eq(y).text() === cityObj.name.toUpperCase() + ", " + cityObj.code.toUpperCase()) {
                
                    continue;

                }
                
            }

        } else {

            $("#empty-list").hide();

            searchHistory += cityString + "?"; 

            localStorage.setItem("searchHistory",searchHistory);


            // Retrieves updated search history from local storage and display previously searched cities with dataset of city info inside the html tag
            searchHistory = localStorage.getItem("searchHistory") || "";

            searchHistoryArray = searchHistory.split("?");
            searchHistoryArray.pop();
            $("#search-history").children().remove();

            // Loops through previously searched city and displays as an unordered list 
            for (var y=0; y<searchHistoryArray.length; y++) {
                cityString = searchHistoryArray[y];
                cityParsed = JSON.parse(searchHistoryArray[y]);
                cityNameParsed = cityParsed.name;
                codeParsed = cityParsed.code;
                latParsed = cityParsed.lat;
                lonParsed = cityParsed.lon;
                cityListing = $("<li>").text(cityNameParsed.toUpperCase() + ", " + codeParsed.toUpperCase());
                cityListing.addClass("city btn");
                cityListing.attr("data-city", cityNameParsed);
                cityListing.attr("data-state", codeParsed);
                cityListing.attr("data-lat", latParsed);
                cityListing.attr("data-lon", lonParsed);

                $("#search-history").prepend(cityListing);

 
            };

        };


        
        // API request for current weather
        var getCurrentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=imperial&appid=7df7243f5169b46433ea853892fbb930";

        // Displays weather boxes
        $("#current-weather-container").show();
        $("#forecast-container").show(); 

        // GET request for current weather
        fetch(getCurrentUrl)
        .then(function(response) {
            if (!response.ok) {
                return
            } else {
                return response.json()
            }
        })
        // Displays current weather
        .then(function(data) {
                
            $("#location").text(cityName.toUpperCase() + ", " + stateCode);
            $("#today").text(date);
            $("#weather-icon").attr("src","https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
            $("#condition").text(data.weather[0].description.toUpperCase());
            $("#temp").text("Temperature: " + data.main.temp + "°F");
            $("#feel").text("Feels Like: " + data.main.feels_like + "°F");
            $("#temp-max").text("High: " + data.main.temp_max + "°F");
            $("#temp-min").text("Low: " + data.main.temp_min + "°F");
            $("#wind").text("Wind Speed: " + data.wind.speed + "mph");
            $("#humidity").text("Humidity: " + data.main.humidity + "%")
        })

        // API request url for 5-day forecast
        var getForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" +latitude + "&lon=" + longitude + "&units=imperial&appid=7df7243f5169b46433ea853892fbb930";

        // GET request for 5-day forecast
        fetch(getForecastUrl)
        .then(function(response) {
            if(!response.ok) {
                return
            } else {
                return response.json()
            }
        })
        // Displays weather forecast day by day
        .then(function(data) {

            $("#forecast-title").text("5-Day Forecast");
            $("#date-1").text((data.list[4].dt_txt).split(" ")[0]);
            $("#weather-icon-1").attr("src","https://openweathermap.org/img/w/" + data.list[4].weather[0].icon + ".png");
            $("#condition-1").text(data.list[4].weather[0].description.toUpperCase());
            $("#temp-1").text("Temperature: " + data.list[4].main.temp + "°F");
            $("#humidity-1").text("Humidity: " + data.list[4].main.humidity + "%");
            $("#wind-1").text("Wind Speed: " + data.list[4].wind.speed + "mph");

            
            $("#date-2").text((data.list[12].dt_txt).split(" ")[0]);
            $("#weather-icon-2").attr("src","https://openweathermap.org/img/w/" + data.list[12].weather[0].icon + ".png");
            $("#condition-2").text(data.list[12].weather[0].description.toUpperCase());
            $("#temp-2").text("Temperature: " + data.list[12].main.temp + "°F");
            $("#humidity-2").text("Humidity: " + data.list[12].main.humidity + "%");
            $("#wind-2").text("Wind Speed: " + data.list[12].wind.speed + "mph");


            $("#date-3").text((data.list[20].dt_txt).split(" ")[0]);
            $("#weather-icon-3").attr("src","https://openweathermap.org/img/w/" + data.list[20].weather[0].icon + ".png");
            $("#condition-3").text(data.list[20].weather[0].description.toUpperCase());
            $("#temp-3").text("Temperature: " + data.list[20].main.temp + "°F");
            $("#humidity-3").text("Humidity: " + data.list[20].main.humidity + "%");
            $("#wind-3").text("Wind Speed: " + data.list[20].wind.speed + "mph");


            $("#date-4").text((data.list[28].dt_txt).split(" ")[0]);
            $("#weather-icon-4").attr("src","https://openweathermap.org/img/w/" + data.list[28].weather[0].icon + ".png");
            $("#condition-4").text(data.list[28].weather[0].description.toUpperCase());
            $("#temp-4").text("Temperature: " + data.list[28].main.temp + "°F");
            $("#humidity-4").text("Humidity: " + data.list[28].main.humidity + "%");
            $("#wind-4").text("Wind Speed: " + data.list[28].wind.speed + "mph");


            $("#date-5").text((data.list[36].dt_txt).split(" ")[0]);
            $("#weather-icon-5").attr("src","https://openweathermap.org/img/w/" + data.list[36].weather[0].icon + ".png");
            $("#condition-5").text(data.list[36].weather[0].description.toUpperCase());
            $("#temp-5").text("Temperature: " + data.list[36].main.temp + "°F");
            $("#humidity-5").text("Humidity: " + data.list[36].main.humidity + "%");
            $("#wind-5").text("Wind Speed: " + data.list[36].wind.speed + "mph"); 


        })


        

        $('#search-city').val("");
        $('#state').val("");

        // If users click on search history for updated weather
        $('.city').on("click", refreshWeather);
    
    })
    
}

// To retrieve updated weather data from search history
function refreshWeather(event) {

    startSearch.play();
    $("#warning").hide();
    $("#empty-list").hide();

    var cityName = $(event.target).attr("data-city");
    var stateCode = $(event.target).attr("data-state");
    var latitude = $(event.target).attr("data-lat");
    var longitude = $(event.target).attr("data-lon");
    var date = dayjs().format('dddd, MMM DD');




    var getCurrentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=imperial&appid=7df7243f5169b46433ea853892fbb930";

        // Displays weather boxes
        $("#current-weather-container").show();
        $("#forecast-container").show();    

        // GET request for current weather
        fetch(getCurrentUrl)
        .then(function(response) {
            
            return response.json()
    
        })
        // Displays current weather
        .then(function(data) {
            $("#location").text(cityName.toUpperCase() + ", " + stateCode);
            $("#today").text(date);
            $("#weather-icon").attr("src","https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
            $("#condition").text(data.weather[0].description.toUpperCase());
            $("#temp").text("Temperature: " + data.main.temp + "°F");
            $("#feel").text("Feels Like: " + data.main.feels_like + "°F");
            $("#temp-max").text("High: " + data.main.temp_max + "°F");
            $("#temp-min").text("Low: " + data.main.temp_min + "°F");
            $("#wind").text("Wind Speed: " + data.wind.speed + "mph");
            $("#humidity").text("Humidity: " + data.main.humidity + "%")
        })

        // API request url for 5-day forecast
        var getForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" +latitude + "&lon=" + longitude + "&units=imperial&appid=7df7243f5169b46433ea853892fbb930";

        // GET request for 5-day forecast
        fetch(getForecastUrl)
        .then(function(response) {
            if(!response.ok) {
                return
            } else {
                return response.json()
            }
        })
        // Displays weather forecast day by day
        .then(function(data) {

            $("#forecast-title").text("5-Day Forecast");
            $("#date-1").text((data.list[4].dt_txt).split(" ")[0]);
            $("#weather-icon-1").attr("src","https://openweathermap.org/img/w/" + data.list[4].weather[0].icon + ".png");
            $("#condition-1").text(data.list[4].weather[0].description.toUpperCase());
            $("#temp-1").text("Temperature: " + data.list[4].main.temp + "°F");
            $("#humidity-1").text("Humidity: " + data.list[4].main.humidity + "%");
            $("#wind-1").text("Wind Speed: " + data.list[4].wind.speed + "mph");

            
            $("#date-2").text((data.list[12].dt_txt).split(" ")[0]);
            $("#weather-icon-2").attr("src","https://openweathermap.org/img/w/" + data.list[12].weather[0].icon + ".png");
            $("#condition-2").text(data.list[12].weather[0].description.toUpperCase());
            $("#temp-2").text("Temperature: " + data.list[12].main.temp + "°F");
            $("#humidity-2").text("Humidity: " + data.list[12].main.humidity + "%");
            $("#wind-2").text("Wind Speed: " + data.list[12].wind.speed + "mph");


            $("#date-3").text((data.list[20].dt_txt).split(" ")[0]);
            $("#weather-icon-3").attr("src","https://openweathermap.org/img/w/" + data.list[20].weather[0].icon + ".png");
            $("#condition-3").text(data.list[20].weather[0].description.toUpperCase());
            $("#temp-3").text("Temperature: " + data.list[20].main.temp + "°F");
            $("#humidity-3").text("Humidity: " + data.list[20].main.humidity + "%");
            $("#wind-3").text("Wind Speed: " + data.list[20].wind.speed + "mph");


            $("#date-4").text((data.list[28].dt_txt).split(" ")[0]);
            $("#weather-icon-4").attr("src","https://openweathermap.org/img/w/" + data.list[28].weather[0].icon + ".png");
            $("#condition-4").text(data.list[28].weather[0].description.toUpperCase());
            $("#temp-4").text("Temperature: " + data.list[28].main.temp + "°F");
            $("#humidity-4").text("Humidity: " + data.list[28].main.humidity + "%");
            $("#wind-4").text("Wind Speed: " + data.list[28].wind.speed + "mph");


            $("#date-5").text((data.list[36].dt_txt).split(" ")[0]);
            $("#weather-icon-5").attr("src","https://openweathermap.org/img/w/" + data.list[36].weather[0].icon + ".png");
            $("#condition-5").text(data.list[36].weather[0].description.toUpperCase());
            $("#temp-5").text("Temperature: " + data.list[36].main.temp + "°F");
            $("#humidity-5").text("Humidity: " + data.list[36].main.humidity + "%");
            $("#wind-5").text("Wind Speed: " + data.list[36].wind.speed + "mph");


        })


}

function clearList() {

    localStorage.clear();
    location.reload();

}



// Event Listeners
$('#search').on("click", getApi);
$('.city').on("click", refreshWeather);
$('#clear-history').on("click",clearList);





