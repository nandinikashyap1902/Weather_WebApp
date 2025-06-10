import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import axios from 'axios';
import { useEffect, useState } from "react";
import { FaSearch,FaTemperatureHigh, FaWind, FaCloudRain } from 'react-icons/fa';

function App() {
 
  const apiKey = "30a8873d80fb0592a797c65d392777bd"
  const[inputCity, setInputCity] = useState("")
  const[data, setData] = useState({})
  const[loading, setLoading] = useState(false)
  const[error, setError] = useState(null)

  const getWeatherDetails = (cityName) => {
    if(!cityName) return
    setLoading(true)
    setError(null)
    const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey
    axios.get(apiURL).then((res) => {
      console.log("response", res.data)
      setData(res.data)
      setLoading(false)
    }).catch((err) => {
     console.log("err", err)
     setError("City not found. Please check the spelling and try again.")
     setLoading(false)
    }) 
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
  
  useEffect(() => {
    getWeatherDetails("delhi");
  }, [])

  const getWeatherIcon = (weatherId) => {
    if (!weatherId) return "https://openweathermap.org/img/wn/02d@2x.png";
    
    return `https://openweathermap.org/img/wn/${weatherId}@2x.png`;
  }

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return (
    <div className="app-container">
      <div className="weather-container">
        <div className="search-container">
          <h1 className="app-title">Weather Dashboard</h1>
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

        {Object.keys(data).length > 0 && (
          <div className="weather-card">
            <div className="weather-header">
              <div className="location-info">
                <h2 className="city-name">{data.name}, {data.sys?.country}</h2>
                <p className="date">{formatDate()}</p>
              </div>
              <div className="temp-container">
                <img 
                  className="weather-icon" 
                  src={getWeatherIcon(data.weather?.[0]?.icon)} 
                  alt={data.weather?.[0]?.description || "Weather"} 
                />
                <h1 className="temperature">
                  {((data.main.temp) - 273.15).toFixed(1)}°C
                </h1>
                <p className="weather-desc">{data.weather?.[0]?.description}</p>
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <FaTemperatureHigh className="detail-icon" />
                <div>
                  <p className="detail-label">Feels Like</p>
                  <p className="detail-value">{((data.main?.feels_like) - 273.15).toFixed(1)}°C</p>
                </div>
              </div>
              <div className="detail-item">
                <FaWind className="detail-icon" />
                <div>
                  <p className="detail-label">Wind</p>
                  <p className="detail-value">{data.wind?.speed} m/s</p>
                </div>
              </div>
              <div className="detail-item">
                <FaCloudRain className="detail-icon" />
                <div>
                  <p className="detail-label">Humidity</p>
                  <p className="detail-value">{data.main?.humidity}%</p>
                </div>
              </div>
              <div className="detail-item">
                <div className="pressure-icon detail-icon"></div>
                <div>
                  <p className="detail-label">Pressure</p>
                  <p className="detail-value">{data.main?.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!Object.keys(data).length > 0 && !loading && !error && (
          <div className="placeholder-message">
            <p>Search for a city to see the weather information</p>
          </div>
        )}
      </div>
      <footer className="app-footer">
        <p>Weather data provided by OpenWeatherMap</p>
      </footer>
    </div>
  );
}

export default App;
