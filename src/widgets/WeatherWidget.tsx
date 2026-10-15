import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, RefreshCw, Search, Check } from 'lucide-react';

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
  weatherCode: number;
}

interface CachedWeatherData {
  locationName: string;
  temp: number;
  condition: string;
  weatherCode: number;
  forecast: ForecastDay[];
  timestamp: number;
  lat: number;
  lon: number;
}

const mapWeatherCode = (code: number): { condition: string; icon: string } => {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
  if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 45 || code === 48) return { condition: 'Foggy', icon: 'cloud' };
  if (code >= 51 && code <= 55) return { condition: 'Drizzle', icon: 'cloud-rain' };
  if (code >= 61 && code <= 65) return { condition: 'Rainy', icon: 'cloud-rain' };
  if (code >= 71 && code <= 75) return { condition: 'Snowy', icon: 'cloud-snow' };
  if (code >= 80 && code <= 82) return { condition: 'Showers', icon: 'cloud-rain' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', icon: 'cloud-lightning' };
  return { condition: 'Cloudy', icon: 'cloud' };
};

const getWeatherIcon = (iconName: string, size = 26, className = "text-neutral-300") => {
  switch (iconName) {
    case 'sun':
      return <Sun size={size} className="text-amber-400 animate-spin-slow" />;
    case 'cloud-sun':
      return <CloudSun size={size} className="text-neutral-300" />;
    case 'cloud-rain':
      return <CloudRain size={size} className="text-blue-400" />;
    case 'cloud-snow':
      return <CloudSnow size={size} className="text-sky-300" />;
    case 'cloud-lightning':
      return <CloudLightning size={size} className="text-yellow-400" />;
    case 'cloud':
    default:
      return <Cloud size={size} className={className} />;
  }
};

export const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<CachedWeatherData | null>(() => {
    try {
      const saved = localStorage.getItem('pisland-weather-cache');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Default coordinate (London, UK) if no cache
  const [coords, setCoords] = useState(() => {
    if (weatherData) {
      return { lat: weatherData.lat, lon: weatherData.lon, name: weatherData.locationName };
    }
    return { lat: 51.5074, lon: -0.1278, name: 'London, UK' };
  });

  const fetchWeather = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto`
      );
      if (!response.ok) throw new Error('API Request Failed');
      const data = await response.json();

      const { condition } = mapWeatherCode(data.current.weather_code);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      const forecastList: ForecastDay[] = [];
      const todayIndex = new Date().getDay();

      // Retrieve next 3 days
      for (let i = 1; i <= 3; i++) {
        const tempMax = Math.round(data.daily.temperature_2m_max[i]);
        const wCode = data.daily.weather_code[i];
        const dayLabel = days[(todayIndex + i) % 7];
        const dayInfo = mapWeatherCode(wCode);

        forecastList.push({
          day: dayLabel,
          temp: tempMax,
          condition: dayInfo.condition,
          weatherCode: wCode,
        });
      }

      const freshData: CachedWeatherData = {
        locationName,
        temp: Math.round(data.current.temperature_2m),
        condition,
        weatherCode: data.current.weather_code,
        forecast: forecastList,
        timestamp: Date.now(),
        lat,
        lon
      };

      setWeatherData(freshData);
      localStorage.setItem('pisland-weather-cache', JSON.stringify(freshData));
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to update weather details. Displaying offline cache.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchVal)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error('Geocoding Failed');
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setErrorMsg('City not found. Please try a different location.');
        setLoading(false);
        return;
      }

      const resolved = geoData.results[0];
      const displayName = `${resolved.name}, ${resolved.country_code?.toUpperCase() || ''}`;
      setCoords({ lat: resolved.latitude, lon: resolved.longitude, name: displayName });
      setIsSearching(false);
      setSearchVal('');
      await fetchWeather(resolved.latitude, resolved.longitude, displayName);
    } catch (err) {
      console.error(err);
      setErrorMsg('Location lookup failed. Check your network.');
      setLoading(false);
    }
  };

  // Initial and Interval Trigger
  useEffect(() => {
    fetchWeather(coords.lat, coords.lon, coords.name);

    // Refresh every 15 mins (900000 ms)
    const interval = setInterval(() => {
      fetchWeather(coords.lat, coords.lon, coords.name);
    }, 900000);

    return () => clearInterval(interval);
  }, [coords.lat, coords.lon]);

  const icon = weatherData 
    ? mapWeatherCode(weatherData.weatherCode).icon 
    : 'cloud';

  return (
    <div className="flex flex-col gap-3.5 p-1 select-none font-sans justify-between h-full relative">
      <div className="flex items-center justify-between w-full">
        <h3 className="font-semibold text-[10px] tracking-wider uppercase text-neutral-500">Weather Forecast</h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSearching(!isSearching)}
            className="p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Search Location"
          >
            <Search size={10} />
          </button>
          <button 
            onClick={() => fetchWeather(coords.lat, coords.lon, coords.name)}
            disabled={loading}
            className={`p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center justify-center ${loading ? 'animate-spin' : ''}`}
            title="Refresh Weather"
          >
            <RefreshCw size={10} />
          </button>
        </div>
      </div>

      {isSearching && (
        <form onSubmit={handleSearch} className="flex gap-1.5 w-full bg-black/40 border border-white/10 rounded-xl p-1.5 absolute top-7 left-0 right-0 z-50 shadow-xl">
          <input
            type="text"
            placeholder="Type city name..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/5 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-white/20"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer flex items-center justify-center"
          >
            <Check size={11} />
          </button>
        </form>
      )}

      {/* Main weather body */}
      {weatherData ? (
        <div className="flex items-center justify-center py-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/[0.04] shadow-md flex items-center justify-center">
              {getWeatherIcon(icon, 26)}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold font-mono text-white leading-none">{weatherData.temp}</span>
                <span className="text-base text-accent font-semibold ml-0.5">°C</span>
              </div>
              <span className="text-xs text-neutral-300 font-semibold leading-none mt-2">{weatherData.condition}</span>
              <span className="text-[10px] text-neutral-500 mt-1 font-semibold">{weatherData.locationName}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Cloud size={28} className="text-neutral-600 animate-pulse mb-2" />
          <span className="text-xs text-neutral-400 font-medium">No weather cache available.</span>
          <span className="text-[10px] text-neutral-500 mt-1">Please connect to the internet to load current forecasts.</span>
        </div>
      )}

      {/* Error alert toast */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] rounded-xl px-2.5 py-1.5 text-center leading-normal">
          {errorMsg}
        </div>
      )}

      {/* 3 Day Forecast Grid */}
      {weatherData && weatherData.forecast && weatherData.forecast.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {weatherData.forecast.map((f, i) => {
            const fIcon = mapWeatherCode(f.weatherCode).icon;
            return (
              <div key={i} className="flex flex-col items-center p-2.5 rounded-2xl bg-black/15 border border-white/[0.03] transition-all hover:bg-black/25">
                <span className="text-[9px] text-neutral-500 font-semibold">{f.day}</span>
                <div className="my-2">{getWeatherIcon(fIcon, 14)}</div>
                <span className="text-xs font-bold font-mono text-white">{f.temp}°</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
