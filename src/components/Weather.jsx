import { useState, useEffect, useRef } from 'react'
import search_icon from '../Assets/search.png'

const Weather = () => {
  const inputRef = useRef()
  const [weatherData, setWeatherData] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY
  const BASE_URL = 'https://api.weatherapi.com/v1'

  //  Dynamic background
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

  //  Fetch weather by coordinates
  const fetchByCoords = async (lat, lon) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`
      )

      if (!res.ok) throw new Error()

      const data = await res.json()

      const icon = "https:" + data.current.condition.icon

      setWeatherData({
        temperature: Math.round(data.current.temp_c),
        location: `${data.location.name}, ${data.location.country}`,
        description: data.current.condition.text,
        icon,
        humidity: data.current.humidity,
        wind: Math.round(data.current.wind_kph),
        feelslike: Math.round(data.current.feelslike_c),
        time: data.location.localtime,
        isDay: data.current.is_day,
      })

      setForecast(
        data.forecast.forecastday.map((day) => ({
          date: day.date,
          icon: "https:" + day.day.condition.icon,
          condition: day.day.condition.text,
          min: Math.round(day.day.mintemp_c),
          max: Math.round(day.day.maxtemp_c),
        }))
      )
    } catch (err) {
      setError('Unable to fetch location weather')
    } finally {
      setLoading(false)
    }
  }

  //  Search by city
  const handleSearch = async (city) => {
    if (!city) {
      setError('Enter a city name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`
      )

      if (!res.ok) throw new Error()

      const data = await res.json()

      const icon = "https:" + data.current.condition.icon

      setWeatherData({
        temperature: Math.round(data.current.temp_c),
        location: `${data.location.name}, ${data.location.country}`,
        description: data.current.condition.text,
        icon,
        humidity: data.current.humidity,
        wind: Math.round(data.current.wind_kph),
        feelslike: Math.round(data.current.feelslike_c),
        time: data.location.localtime,
        isDay: data.current.is_day,
      })

      setForecast(
        data.forecast.forecastday.map((day) => ({
          date: day.date,
          icon: "https:" + day.day.condition.icon,
          condition: day.day.condition.text,
          min: Math.round(day.day.mintemp_c),
          max: Math.round(day.day.maxtemp_c),
        }))
      )
    } catch (err) {
      setError('City not found')
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  //  Auto detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      handleSearch('Lagos')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchByCoords(latitude, longitude)
      },
      () => {
        // ❌ Permission denied → fallback
        handleSearch('Lagos')
      }
    )
  }

  useEffect(() => {
    detectLocation()
  }, [])

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackground()} transition-all duration-500`}
    >
      <div className="w-full max-w-sm mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white">

        {/* 🔍 Search */}
        <div className="flex items-center mb-6 bg-white/30 rounded-full px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city..."
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 px-2"
            onKeyDown={(e) =>
              e.key === 'Enter' && handleSearch(inputRef.current.value)
            }
          />
          <img
            src={search_icon}
            alt="search"
            className="w-5 cursor-pointer"
            onClick={() => handleSearch(inputRef.current.value)}
          />
        </div>

        {/* ❌ Error */}
        {error && (
          <p className="text-red-300 text-center mb-4">{error}</p>
        )}

        {/*  Loading */}
        {loading && (
          <p className="text-center animate-pulse">Getting your weather...</p>
        )}

        {/*  Weather */}
        {weatherData && !loading && (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {weatherData.location}
              </h2>

              <img
                src={weatherData.icon}
                alt=""
                className="w-24 mx-auto"
              />

              <h1 className="text-5xl font-bold">
                {weatherData.temperature}°C
              </h1>

              <p className="capitalize text-lg">
                {weatherData.description}
              </p>

              <p className="text-sm text-white/70">
                Feels like {weatherData.feelslike}°C
              </p>
            </div>

            {/* Details */}
            <div className="flex justify-between mt-6 text-sm">
              <div>
                <p className="opacity-70">Humidity</p>
                <p className="font-semibold">{weatherData.humidity}%</p>
              </div>
              <div>
                <p className="opacity-70">Wind</p>
                <p className="font-semibold">{weatherData.wind} km/h</p>
              </div>
            </div>

            {/*  Forecast */}
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">3-Day Forecast</h3>
              <div className="flex justify-between">
                {forecast.map((day) => (
                  <div
                    key={day.date}
                    className="text-center bg-white/10 border border-white/10 rounded-xl p-3 w-[30%]"
                  >
                    <p className="text-xs">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                      })}
                    </p>

                    <img
                      src={day.icon}
                      alt=""
                      className="w-10 mx-auto"
                    />

                    <p className="text-sm">{day.max}°</p>
                    <p className="text-xs opacity-70">{day.min}°</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Weather