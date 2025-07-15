import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import axios from 'axios';
import { useEffect, useState } from "react";
import { 
  FaSearch, FaTemperatureHigh, FaWind, FaCloudRain, FaLocationArrow, 
  FaHeart, FaRegHeart, FaSun, FaMoon, FaEye, FaLeaf, FaChartLine,
  FaExclamationTriangle, FaMapMarkerAlt, FaCalendarAlt, FaClock,
  FaCompass, FaThermometerHalf, FaTint, FaSnowflake, FaCloud
} from 'react-icons/fa';

// Register Chart.js components
function App() {
  const apiKey = "30a8873d80fb0592a797c65d392777bd"
  const [inputCity, setInputCity] = useState("")
  const [data, setData] = useState({})
  const [forecast, setForecast] = useState([])
  const [hourlyForecast, setHourlyForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites') || '[]'))
  const [activeTab, setActiveTab] = useState('current')
  const [uvIndex, setUvIndex] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [weatherAlerts, setWeatherAlerts] = useState([])
  const [units, setUnits] = useState('metric') // metric, imperial
  const [theme, setTheme] = useState('light')

  // Enhanced weather data fetching with multiple APIs
  const getWeatherDetails = async (cityName) => {
    if(!cityName) return
    setLoading(true)
    setError(null)
    
    try {
      // Current weather
      const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`
      const currentResponse = await axios.get(currentWeatherURL)
      setData(currentResponse.data)
      
      // 5-day forecast
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${units}`
      const forecastResponse = await axios.get(forecastURL)
      
      // Process forecast data - get daily forecasts
      const dailyForecasts = []
      const hourlyForecasts = []
      
      forecastResponse.data.list.forEach((item, index) => {
        if (index < 40) { // Next 5 days (8 forecasts per day)
          hourlyForecasts.push(item)
        }
        if (index % 8 === 0 && index < 40) { // Daily forecast (every 8th item)
          dailyForecasts.push(item)
        }
      })
      
      setForecast(dailyForecasts)
      setHourlyForecast(hourlyForecasts.slice(0, 24)) // Next 24 hours
      
      // UV Index and Air Quality
      const lat = currentResponse.data.coord.lat
      const lon = currentResponse.data.coord.lon
      
      // UV Index
      const uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
      try {
        const uvResponse = await axios.get(uvURL)
        setUvIndex(uvResponse.data.value)
      } catch (err) {
        console.log('UV data not available')
      }
      
      // Air Quality
      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      try {
        const airResponse = await axios.get(airQualityURL)
        setAirQuality(airResponse.data.list[0])
      } catch (err) {
        console.log('Air quality data not available')
      }
      
      setLoading(false)
    } catch (err) {
      console.log("err", err)
      setError("City not found. Please check the spelling and try again.")
      setLoading(false)
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        try {
          const reverseGeoURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
          const response = await axios.get(reverseGeoURL)
          setInputCity(response.data.name)
          getWeatherDetails(response.data.name)
        } catch (err) {
          setError("Unable to get weather for your location")
        }
      }, (error) => {
        setError("Location access denied")
      })
    } else {
      setError("Geolocation is not supported by this browser")
    }
  }

  // Favorites functionality
  const toggleFavorite = (cityName) => {
    const newFavorites = favorites.includes(cityName)
      ? favorites.filter(city => city !== cityName)
      : [...favorites, cityName]
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const handleChangeInput = (e) => {
    setInputCity(e.target.value)
  }
  
  const handleSearch = () => {
    getWeatherDetails(inputCity)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleUnits = () => {
    setUnits(units === 'metric' ? 'imperial' : 'metric')
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  
  useEffect(() => {
    getWeatherDetails("delhi")
  }, [])

  useEffect(() => {
    if (data.name) {
      getWeatherDetails(data.name)
    }
  }, [units])

  const getWeatherIcon = (weatherId) => {
    if (!weatherId) return "https://openweathermap.org/img/wn/02d@2x.png"
    return `https://openweathermap.org/img/wn/${weatherId}@2x.png`
  }

  const formatDate = () => {
    const date = new Date()
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUVIndexLevel = (uv) => {
    if (uv <= 2) return { level: 'Low', color: '#00ff00' }
    if (uv <= 5) return { level: 'Moderate', color: '#ffff00' }
    if (uv <= 7) return { level: 'High', color: '#ff8000' }
    if (uv <= 10) return { level: 'Very High', color: '#ff0000' }
    return { level: 'Extreme', color: '#8000ff' }
  }

  const getAirQualityLevel = (aqi) => {
    const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
    const colors = ['#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff0000']
    return { level: levels[aqi - 1] || 'Unknown', color: colors[aqi - 1] || '#gray' }
  }

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  const getTemperatureUnit = () => {
    return units === 'metric' ? '°C' : '°F'
  }

  const getSpeedUnit = () => {
    return units === 'metric' ? 'm/s' : 'mph'
  }
  
  return (
    <div className={`app-container ${theme}`}>
      <div className="weather-container">
        {/* Enhanced Header with Controls */}
        <div className="search-container">
          <h1 className="app-title">🌤️ Weather Dashboard</h1>
          
          {/* Control Panel */}
          <div className="controls-panel">
            <button className="control-btn" onClick={getCurrentLocation} title="Get Current Location">
              <FaLocationArrow />
            </button>
            <button className="control-btn" onClick={toggleUnits} title="Toggle Units">
              {units === 'metric' ? '°C' : '°F'}
            </button>
            <button className="control-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>
          
          <div className="search-box">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for a city..."
              value={inputCity} 
              onChange={handleChangeInput}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-button" 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : <FaSearch />}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="favorites-section">
            <h3><FaHeart /> Favorite Cities</h3>
            <div className="favorites-list">
              {favorites.map((city, index) => (
                <button 
                  key={index} 
                  className="favorite-city"
                  onClick={() => {
                    setInputCity(city)
                    getWeatherDetails(city)
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {Object.keys(data).length > 0 && (
          <div className="nav-tabs">
            <button 
              className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              <FaCloud /> Current
            </button>
            <button 
              className={`tab-button ${activeTab === 'hourly' ? 'active' : ''}`}
              onClick={() => setActiveTab('hourly')}
            >
              <FaClock /> Hourly
            </button>
            <button 
              className={`tab-button ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveTab('forecast')}
            >
              <FaCalendarAlt /> 5-Day
            </button>
            <button 
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FaChartLine /> Details
            </button>
          </div>
        )}

        {/* Current Weather Tab */}
        {Object.keys(data).length > 0 && activeTab === 'current' && (
          <div className="weather-card animate-slide-in">
            <div className="weather-header">
              <div className="location-info">
                <h2 className="city-name">
                  <FaMapMarkerAlt /> {data.name}, {data.sys?.country}
                  <button 
                    className="favorite-btn"
                    onClick={() => toggleFavorite(data.name)}
                    title={favorites.includes(data.name) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.includes(data.name) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </h2>
                <p className="date">{formatDate()}</p>
                <div className="sun-times">
                  <span><FaSun /> {formatTime(data.sys?.sunrise)}</span>
                  <span><FaMoon /> {formatTime(data.sys?.sunset)}</span>
                </div>
              </div>
              <div className="temp-container">
                <img 
                  className="weather-icon" 
                  src={getWeatherIcon(data.weather?.[0]?.icon)} 
                  alt={data.weather?.[0]?.description || "Weather"} 
                />
                <h1 className="temperature">
                  {units === 'metric' ? data.main?.temp?.toFixed(1) : (data.main?.temp * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}
                </h1>
                <p className="weather-desc">{data.weather?.[0]?.description}</p>
                <div className="temp-range">
                  <span className="high">↑{units === 'metric' ? data.main?.temp_max?.toFixed(1) : (data.main?.temp_max * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</span>
                  <span className="low">↓{units === 'metric' ? data.main?.temp_min?.toFixed(1) : (data.main?.temp_min * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</span>
                </div>
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <FaTemperatureHigh className="detail-icon" />
                <div>
                  <p className="detail-label">Feels Like</p>
                  <p className="detail-value">{units === 'metric' ? data.main?.feels_like?.toFixed(1) : (data.main?.feels_like * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</p>
                </div>
              </div>
              <div className="detail-item">
                <FaWind className="detail-icon" />
                <div>
                  <p className="detail-label">Wind</p>
                  <p className="detail-value">{data.wind?.speed} {getSpeedUnit()} {getWindDirection(data.wind?.deg)}</p>
                </div>
              </div>
              <div className="detail-item">
                <FaTint className="detail-icon" />
                <div>
                  <p className="detail-label">Humidity</p>
                  <p className="detail-value">{data.main?.humidity}%</p>
                </div>
              </div>
              <div className="detail-item">
                <FaCompass className="detail-icon" />
                <div>
                  <p className="detail-label">Pressure</p>
                  <p className="detail-value">{data.main?.pressure} hPa</p>
                </div>
              </div>
              <div className="detail-item">
                <FaEye className="detail-icon" />
                <div>
                  <p className="detail-label">Visibility</p>
                  <p className="detail-value">{data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A'} km</p>
                </div>
              </div>
              {uvIndex !== null && (
                <div className="detail-item">
                  <FaSun className="detail-icon" style={{color: getUVIndexLevel(uvIndex).color}} />
                  <div>
                    <p className="detail-label">UV Index</p>
                    <p className="detail-value">{uvIndex} ({getUVIndexLevel(uvIndex).level})</p>
                  </div>
                </div>
              )}
              {airQuality && (
                <div className="detail-item">
                  <FaLeaf className="detail-icon" style={{color: getAirQualityLevel(airQuality.main.aqi).color}} />
                  <div>
                    <p className="detail-label">Air Quality</p>
                    <p className="detail-value">{getAirQualityLevel(airQuality.main.aqi).level}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hourly Forecast Tab */}
        {activeTab === 'hourly' && hourlyForecast.length > 0 && (
          <div className="forecast-section animate-slide-in">
            <h3><FaClock /> 24-Hour Forecast</h3>
            <div className="hourly-forecast">
              {hourlyForecast.slice(0, 12).map((hour, index) => (
                <div key={index} className="hourly-item">
                  <div className="hour-time">{new Date(hour.dt * 1000).toLocaleTimeString('en-US', {hour: 'numeric'})}</div>
                  <img 
                    className="hourly-icon" 
                    src={getWeatherIcon(hour.weather[0].icon)} 
                    alt={hour.weather[0].description} 
                  />
                  <div className="hourly-temp">{hour.main.temp.toFixed(1)}{getTemperatureUnit()}</div>
                  <div className="hourly-desc">{hour.weather[0].main}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5-Day Forecast Tab */}
        {activeTab === 'forecast' && forecast.length > 0 && (
          <div className="forecast-section animate-slide-in">
            <h3><FaCalendarAlt /> 5-Day Forecast</h3>
            <div className="daily-forecast">
              {forecast.map((day, index) => (
                <div key={index} className="daily-item">
                  <div className="day-name">
                    {new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}
                  </div>
                  <img 
                    className="daily-icon" 
                    src={getWeatherIcon(day.weather[0].icon)} 
                    alt={day.weather[0].description} 
                  />
                  <div className="daily-temps">
                    <span className="high">{day.main.temp_max.toFixed(1)}{getTemperatureUnit()}</span>
                    <span className="low">{day.main.temp_min.toFixed(1)}{getTemperatureUnit()}</span>
                  </div>
                  <div className="daily-desc">{day.weather[0].description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && Object.keys(data).length > 0 && (
          <div className="details-section animate-slide-in">
            <h3><FaChartLine /> Weather Details</h3>
            <div className="details-grid">
              <div className="detail-card">
                <h4><FaThermometerHalf /> Temperature</h4>
                <div className="detail-content">
                  <p>Current: {units === 'metric' ? data.main?.temp?.toFixed(1) : (data.main?.temp * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</p>
                  <p>Feels like: {units === 'metric' ? data.main?.feels_like?.toFixed(1) : (data.main?.feels_like * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</p>
                  <p>Max: {units === 'metric' ? data.main?.temp_max?.toFixed(1) : (data.main?.temp_max * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</p>
                  <p>Min: {units === 'metric' ? data.main?.temp_min?.toFixed(1) : (data.main?.temp_min * 9/5 + 32).toFixed(1)}{getTemperatureUnit()}</p>
                </div>
              </div>
              
              <div className="detail-card">
                <h4><FaWind /> Wind & Pressure</h4>
                <div className="detail-content">
                  <p>Speed: {data.wind?.speed} {getSpeedUnit()}</p>
                  <p>Direction: {getWindDirection(data.wind?.deg)} ({data.wind?.deg}°)</p>
                  <p>Pressure: {data.main?.pressure} hPa</p>
                  <p>Sea Level: {data.main?.sea_level || 'N/A'} hPa</p>
                </div>
              </div>
              
              <div className="detail-card">
                <h4><FaTint /> Humidity & Visibility</h4>
                <div className="detail-content">
                  <p>Humidity: {data.main?.humidity}%</p>
                  <p>Visibility: {data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A'} km</p>
                  <p>Clouds: {data.clouds?.all}%</p>
                  {data.rain && <p>Rain: {data.rain['1h'] || data.rain['3h'] || 'N/A'} mm</p>}
                </div>
              </div>
              
              <div className="detail-card">
                <h4><FaSun /> Sun & Moon</h4>
                <div className="detail-content">
                  <p>Sunrise: {formatTime(data.sys?.sunrise)}</p>
                  <p>Sunset: {formatTime(data.sys?.sunset)}</p>
                  <p>Day Length: {((data.sys?.sunset - data.sys?.sunrise) / 3600).toFixed(1)} hours</p>
                  {uvIndex !== null && <p>UV Index: {uvIndex} ({getUVIndexLevel(uvIndex).level})</p>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!Object.keys(data).length > 0 && !loading && !error && (
          <div className="placeholder-message">
            <div className="placeholder-content">
              <FaCloud className="placeholder-icon" />
              <p>Search for a city to see the weather information</p>
              <p className="placeholder-subtitle">Or use the location button to get your current weather</p>
            </div>
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>Weather data provided by OpenWeatherMap</p>
          <p className="footer-note">Enhanced Weather Dashboard 2024</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
