import { useState, useEffect, useRef } from 'react'
import search_icon from '../Assets/search.png'

const Weather = () => {
  const inputRef = useRef()

  const [weatherData, setWeatherData] = useState(null)
  const [forecast, setForecast] = useState([])
  const [hourly, setHourly] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY
  const BASE_URL = 'https://api.weatherapi.com/v1'

  //  Background
  const getBackground = () => {
    if (!weatherData) return 'from-slate-900 via-slate-800 to-slate-700'

    const text = weatherData.description.toLowerCase()
    const isNight = weatherData.isDay === 0

    if (isNight) return 'from-slate-900 via-slate-800 to-slate-700'
    if (text.includes('rain')) return 'from-slate-700 to-slate-500'
    if (text.includes('cloud')) return 'from-slate-600 to-slate-400'
    if (text.includes('clear') || text.includes('sunny'))
      return 'from-sky-500 to-blue-400'

    return 'from-slate-800 to-slate-600'
  }

  //  Common data formatter
  const formatData = (data) => {
    setWeatherData({
      temperature: Math.round(data.current.temp_c),
      location: `${data.location.name}, ${data.location.country}`,
      description: data.current.condition.text,
      icon: "https:" + data.current.condition.icon,
      humidity: data.current.humidity,
      wind: Math.round(data.current.wind_kph),
      feelslike: Math.round(data.current.feelslike_c),
      isDay: data.current.is_day,
    })

    // Daily
    setForecast(
      data.forecast.forecastday.map(day => ({
        date: day.date,
        icon: "https:" + day.day.condition.icon,
        min: Math.round(day.day.mintemp_c),
        max: Math.round(day.day.maxtemp_c),
      }))
    )

    // Hourly (take today's hours)
    const hours = data.forecast.forecastday[0].hour

    setHourly(
      hours.map(hour => ({
        time: hour.time.split(' ')[1],
        temp: Math.round(hour.temp_c),
        icon: "https:" + hour.condition.icon,
      }))
    )
  }

  //  Search
  const handleSearch = async (city) => {
    if (!city) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3`
      )

      if (!res.ok) throw new Error()

      const data = await res.json()
      formatData(data)
    } catch {
      setError('City not found')
    } finally {
      setLoading(false)
    }
  }

  //  Fetch by coords
  const fetchByCoords = async (lat, lon) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3`
      )

      if (!res.ok) throw new Error()

      const data = await res.json()
      formatData(data)
    } catch {
      setError('Location fetch failed')
    } finally {
      setLoading(false)
    }
  }

  //  Detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      handleSearch('Lagos')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchByCoords(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        handleSearch('Lagos')
      }
    )
  }

  useEffect(() => {
    detectLocation()
  }, [])

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackground()}`}>
      <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white">

        {/* 🔍 Search */}
        <div className="flex items-center mb-4 bg-white/20 rounded-full px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city..."
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70"
            onKeyDown={(e) =>
              e.key === 'Enter' && handleSearch(inputRef.current.value)
            }
          />
          <img
            src={search_icon}
            alt=""
            className="w-5 cursor-pointer"
            onClick={() => handleSearch(inputRef.current.value)}
          />
        </div>

        {/*  Location Button */}
        <button
          onClick={detectLocation}
          className="w-full mb-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition"
        >
          Use My Location
        </button>

        {error && <p className="text-red-300 text-center">{error}</p>}
        {loading && <p className="text-center animate-pulse">Loading...</p>}

        {weatherData && !loading && (
          <>
            {/* Current */}
            <div className="text-center">
              <h2>{weatherData.location}</h2>
              <img src={weatherData.icon} className="w-20 mx-auto" />
              <h1 className="text-4xl font-bold">{weatherData.temperature}°C</h1>
              <p>{weatherData.description}</p>
            </div>

            {/*  Hourly */}
            <div className="mt-6">
              <h3 className="mb-2">Today</h3>
              <div className="flex overflow-x-auto gap-3 pb-2">
                {hourly.map((h, i) => (
                  <div key={i} className="min-w-[60px] bg-white/10 p-2 rounded-lg text-center">
                    <p className="text-xs">{h.time}</p>
                    <img src={h.icon} className="w-8 mx-auto" />
                    <p>{h.temp}°</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily */}
            <div className="mt-6 flex justify-between">
              {forecast.map((d) => (
                <div key={d.date} className="text-center bg-white/10 p-2 rounded-lg w-[30%]">
                  <img src={d.icon} className="w-8 mx-auto" />
                  <p>{d.max}°</p>
                  <p className="text-xs opacity-70">{d.min}°</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Weather