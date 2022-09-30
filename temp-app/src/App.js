import "bootstrap/dist/css/bootstrap.min.css"
import './App.css';
import axios from 'axios';
import {useEffect,useState} from "react";

function App() {
 
  const apiKey = "30a8873d80fb0592a797c65d392777bd"
  const[inputCity, setInputCity] = useState()
  const[data,setData] = useState({})

  const getWeatherDetails=(cityName)=>{
    if(!cityName) return
    const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey
    axios.get(apiURL).then((res)=>{
      console.log("response",res.data )
      setData(res.data)
    }).catch((err)=>{
     console.log("err",err)
    }) 
  }

const handleChangeInput=(e)=>{
  console.log("value",e.target.value)
setInputCity(e.target.value)
}

 // const handleSearch=()=>{
 //   getWeatherDetails()
 // }
  
 function handleSearch(){
   getWeatherDetails(inputCity)
  }
  
  useEffect(()=>{
    getWeatherDetails("delhi");
  },[])
  
  return (
    <div className="App">
      <div className="weatherBg">
        <h1 className="heading">Weather App</h1>
        <div className="d-grid gap-3 col-4 mt-4">

        <input type="text" className="form-control"value={inputCity} onChange={(e)=>handleChangeInput(e)}></input>
        <button className="btn btn-primary" type="button" onClick={handleSearch}>Search</button>
        </div>
      </div>
      {Object.keys(data).length>0 &&
      <div className="col-md-12 text-center mt-5">
        <div className="shadow rounded weatherResultBox">
          <img className="weatherIcon"src="https://clipartix.com/wp-content/uploads/2017/06/Clip-art-sun-clipart.jpg" alt="#"></img>
          <h5 className="weatherCity">{data.name}</h5>
          <h6 className="weatherTemp">{((data.main.temp)-273.15).toFixed(2)}°C</h6>
        </div>
      </div>
}
    </div>
  );
}

export default App;
