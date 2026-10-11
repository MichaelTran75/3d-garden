    // Open-Meteo: current conditions are model estimates, refreshed every 15 minutes.
    // No account, API key or geolocation permission is required.
    window.__cancelGardenBoot?.();
    window.__disposeGarden?.();
    window.gardenWeather?.destroy();
    window.gardenWeather = (() => {
      const CITIES = [
        { id: 'gialai', name: 'Gia Lai (Pleiku)', lat: 13.98333, lon: 108.0, zone: 'Asia/Ho_Chi_Minh' },
        { id: 'sydney', name: 'Sydney', lat: -33.8688, lon: 151.2093, zone: 'Australia/Sydney' },
        { id: 'melbourne', name: 'Melbourne', lat: -37.8136, lon: 144.9631, zone: 'Australia/Melbourne' },
        { id: 'brisbane', name: 'Brisbane', lat: -27.4698, lon: 153.0251, zone: 'Australia/Brisbane' },
        { id: 'perth', name: 'Perth', lat: -31.9523, lon: 115.8613, zone: 'Australia/Perth' },
        { id: 'adelaide', name: 'Adelaide', lat: -34.9285, lon: 138.6007, zone: 'Australia/Adelaide' },
        { id: 'hcmc', name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297, zone: 'Asia/Ho_Chi_Minh' },
        { id: 'hanoi', name: 'Hà Nội', lat: 21.0285, lon: 105.8542, zone: 'Asia/Ho_Chi_Minh' },
        { id: 'danang', name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022, zone: 'Asia/Ho_Chi_Minh' },
        { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, zone: 'Asia/Tokyo' },
        { id: 'singapore', name: 'Singapore', lat: 1.3521, lon: 103.8198, zone: 'Asia/Singapore' }
      ];
      // The scene always follows Pleiku's clock; city selection only changes the weather location.
      const SCENE_CLOCK = { name: 'Gia Lai (Pleiku)', zone: 'Asia/Ho_Chi_Minh' };
      const REFRESH_MS = 15 * 60 * 1000, MAX_CURRENT_AGE = 60 * 60 * 1000;
      const CACHE_PREFIX = 'garden.weather.v1.', CITY_KEY = CACHE_PREFIX + 'city.pleiku-time-v3';
      const $ = id => document.getElementById(id), finite = v => typeof v === 'number' && Number.isFinite(v);
      const num = (v, digits = 1) => finite(v) ? v.toLocaleString('vi-VN', { maximumFractionDigits: digits }) : '—';
      const saved = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } };
      const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Private/file storage can be unavailable. */ } };
      const rainyCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 97, 99]);
      const thunderCodes = new Set([95, 96, 97, 99]);
      function describe(code, isDay = true) {
        if (code === 0) return [isDay ? '☀️' : '🌙', isDay ? 'Trời quang' : 'Đêm quang'];
        if (code === 1) return [isDay ? '🌤️' : '🌙', 'Ít mây'];
        if (code === 2) return ['⛅', 'Mây rải rác'];
        if (code === 3) return ['☁️', 'Nhiều mây'];
        if ([45, 48].includes(code)) return ['🌫️', 'Sương mù'];
        if ([51, 53, 55, 56, 57].includes(code)) return ['🌦️', 'Mưa phùn'];
        if ([61, 63, 65, 66, 67].includes(code)) return ['🌧️', 'Mưa'];
        if ([80, 81, 82].includes(code)) return ['🌦️', 'Mưa rào'];
        if ([71, 73, 75, 77, 85, 86].includes(code)) return ['🌨️', 'Tuyết'];
        if (thunderCodes.has(code)) return ['⛈️', 'Mưa dông'];
        return ['—', 'Chưa có dữ liệu'];
      }
      const current_unitsOk = (data, key) => !data?.current_units?.[key] || data.current_units[key] === 'km/h';
      function validPayload(data) {
        if (!data || data.error || !data.current || !finite(data.utc_offset_seconds)) return false;
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(data.current.time || '')) return false;
        if (![data.current.temperature_2m, data.current.wind_speed_10m, data.current.weather_code].some(finite)) return false;
        if (finite(data.current.temperature_2m) && data.current_units?.temperature_2m !== '°C') return false;
        if (finite(data.current.wind_speed_10m) && data.current_units?.wind_speed_10m !== 'km/h') return false;
        return Number.isFinite(Date.parse(data.current.time + 'Z'));
      }
      const state = { city: CITIES.find(c => c.id === saved(CITY_KEY)) || CITIES[0], data: null, fetchedAt: 0, phase: 'loading', temperature: null, windSpeed: null, windDirection: null, windGusts: null, raining: false, thunder: false, fresh: false };
      let localHour = 12, timeFormatter, dateFormatter, dayFormatter, requestId = 0, controller = null, lastMinute = -1;
      let destroyed = false, clockTimer = null, refreshTimer = null, requestTimeout = null;
      let forecastData = null, forecastDay = '', forecastCity = '';
      const weatherEvents = new AbortController(), weatherListeners = new Set();
      const shortDay = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'UTC' });
      function setFormatters() {
        timeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: SCENE_CLOCK.zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
        dateFormatter = new Intl.DateTimeFormat('vi-VN', { timeZone: SCENE_CLOCK.zone, day: '2-digit', month: '2-digit' });
        dayFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: state.city.zone, year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      function updateClock() {
        const now = new Date(), time = timeFormatter.format(now), parts = time.split(':').map(Number);
        localHour = parts[0] + parts[1] / 60 + parts[2] / 3600;
        $('clock').textContent = time;
        $('clock').dateTime = now.toISOString();
        $('clock').setAttribute('aria-label', 'Giờ ' + SCENE_CLOCK.name + ': ' + time);
        $('weather-date').textContent = dateFormatter.format(now) + ' · ' + SCENE_CLOCK.name;
      }
      function renderForecast() {
        const daily = state.data?.daily, today = dayFormatter.format(new Date());
        if (forecastData === daily && forecastDay === today && forecastCity === state.city.id) return;
        forecastData = daily; forecastDay = today; forecastCity = state.city.id;
        const upcoming = (Array.isArray(daily?.time) ? daily.time : []).map((day, i) => ({ day, i })).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d.day) && Number.isFinite(Date.parse(d.day + 'T12:00:00Z')) && d.day > today).slice(0, 5);
        const rows = [];
        for (let n = 0; n < 5; n++) {
          const entry = upcoming[n], i = entry?.i, date = entry ? new Date(entry.day + 'T12:00:00Z') : null;
          const [emoji, text] = describe(daily?.weather_code?.[i]);
          const lo = daily?.temperature_2m_min?.[i], hi = daily?.temperature_2m_max?.[i], pop = daily?.precipitation_probability_max?.[i];
          const label = date ? shortDay.format(date).replace('Th ', 'T') + ' ' + entry.day.slice(8) + '/' + entry.day.slice(5, 7) : 'Ngày +' + (n + 1);
          const li = document.createElement('li'); li.className = 'weather-day';
          const description = label + ': ' + text + ', ' + num(lo, 0) + ' đến ' + num(hi, 0) + ' °C' + (finite(pop) ? ', khả năng mưa ' + num(pop, 0) + '%' : '');
          li.title = description; li.setAttribute('aria-label', description);
          const caption = document.createElement('span'); caption.className = 'weather-day-label'; caption.textContent = label;
          const icon = document.createElement('span'); icon.className = 'weather-day-icon'; icon.textContent = emoji; icon.setAttribute('aria-hidden', 'true');
          const range = document.createElement('span'); range.className = 'weather-day-range';
          const max = document.createElement('b'); max.textContent = num(hi, 0) + '°';
          const min = document.createElement('span'); min.textContent = ' / ' + num(lo, 0) + '°';
          range.append(max, min); li.append(caption, icon, range); rows.push(li);
        }
        $('weather-forecast').replaceChildren(...rows);
        $('weather-forecast').setAttribute('aria-label', 'Dự báo 5 ngày tiếp theo tại ' + state.city.name);
      }
      function renderWeather() {
        const current = state.data?.current, now = Date.now();
        const observedAt = current ? Date.parse(current.time + 'Z') - state.data.utc_offset_seconds * 1000 : NaN;
        state.fresh = !!current && now - observedAt <= MAX_CURRENT_AGE && now >= observedAt - 15 * 60 * 1000 && now - state.fetchedAt <= MAX_CURRENT_AGE;
        state.temperature = finite(current?.temperature_2m) ? current.temperature_2m : null;
        state.windSpeed = finite(current?.wind_speed_10m) ? Math.max(0, current.wind_speed_10m) : null;
        state.windDirection = finite(current?.wind_direction_10m) ? current.wind_direction_10m : null;
        state.windGusts = finite(current?.wind_gusts_10m) && current_unitsOk(state.data, 'wind_gusts_10m') ? Math.max(0, current.wind_gusts_10m) : null;   // gió giật 10 m → cường độ nhiễu loạn của cảnh
        state.raining = state.fresh && (rainyCodes.has(current.weather_code) || current.rain > 0 || current.showers > 0);
        state.thunder = state.fresh && thunderCodes.has(current.weather_code);
        const [emoji, text] = describe(current?.weather_code, current?.is_day !== 0);
        $('weather-current-icon').textContent = current ? emoji : '—';
        $('weather-current-icon').setAttribute('aria-label', text);
        $('weather-current-icon').title = text;
        $('weather-temperature').textContent = num(state.temperature) + ' °C';
        $('weather-wind').textContent = num(state.windSpeed) + ' km/h';
        $('weather-mast-city').textContent = state.city.name + ' · khí tượng';
        const stamp = current ? current.time.slice(11, 16) + ' ' + current.time.slice(8, 10) + '/' + current.time.slice(5, 7) : '';
        const stored = !!current && (state.phase !== 'ready' || !state.fresh);
        let status;
        if (state.phase === 'loading') status = current ? 'Đang cập nhật · bản lưu ' + stamp : 'Đang tải thời tiết…';
        else if (state.phase === 'error') status = current ? 'Chưa cập nhật được · bản lưu ' + stamp : 'Chưa có kết nối · bấm ↻ để thử lại';
        else if (stored) status = 'Bản lưu ' + stamp;
        else status = 'Dữ liệu ' + stamp + ' · mỗi 15 phút';
        $('weather-status').textContent = status;
        $('weather-dock').dataset.stale = String(stored || state.phase === 'error');
        $('weather-mast-status').textContent = current ? (stored ? 'Bản lưu · ' : '') + text + ' · ' + current.time.slice(11, 16) : (state.phase === 'error' ? 'Chưa có dữ liệu' : 'Đang tải…');
        $('weather-mast').title = status + ' · Dữ liệu mô hình Open-Meteo';
        $('weather-refresh').disabled = state.phase === 'loading';
        renderForecast();
        for (const listener of weatherListeners) listener(state);
      }
      function loadCache() {
        const cached = saved(CACHE_PREFIX + state.city.id), age = Date.now() - cached?.fetchedAt;
        if (cached && finite(cached.fetchedAt) && age >= 0 && age < 24 * 60 * 60 * 1000 && validPayload(cached.data)) {
          state.data = cached.data; state.fetchedAt = cached.fetchedAt; state.phase = 'cached';
        } else { state.data = null; state.fetchedAt = 0; state.phase = 'loading'; }
      }
      async function refreshWeather() {
        if (destroyed) return;
        const id = ++requestId, city = state.city;
        if (controller) controller.abort();
        const request = new AbortController(); controller = request;
        state.phase = 'loading'; renderWeather();
        if (requestTimeout !== null) clearTimeout(requestTimeout);
        const timeout = requestTimeout = setTimeout(() => request.abort(), 12000);
        const params = new URLSearchParams({ latitude: city.lat, longitude: city.lon, current: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,rain,showers,weather_code,is_day,precipitation,relative_humidity_2m,cloud_cover,surface_pressure', hourly: 'uv_index,shortwave_radiation', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max', timezone: city.zone, temperature_unit: 'celsius', wind_speed_unit: 'kmh', precipitation_unit: 'mm', forecast_days: '6' });
        try {
          const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params, { signal: request.signal, credentials: 'omit' });
          if (!response.ok) throw new Error('Weather HTTP ' + response.status);
          const data = await response.json();
          if (id !== requestId) return;
          if (!validPayload(data)) throw new Error('Weather data unavailable');
          state.data = data; state.fetchedAt = Date.now(); state.phase = 'ready';
          save(CACHE_PREFIX + city.id, { data, fetchedAt: state.fetchedAt });
        } catch (_) { if (id === requestId) state.phase = 'error'; }
        finally { clearTimeout(timeout); if (requestTimeout === timeout) requestTimeout = null; if (!destroyed && id === requestId) { controller = null; renderWeather(); } }
      }
      const citySelect = $('weather-city'); citySelect.replaceChildren();
      for (const city of CITIES) { const option = document.createElement('option'); option.value = city.id; option.textContent = city.name; citySelect.append(option); }
      citySelect.value = state.city.id;
      citySelect.addEventListener('change', () => {
        state.city = CITIES.find(c => c.id === citySelect.value) || CITIES[0];
        save(CITY_KEY, state.city.id); setFormatters(); loadCache(); updateClock(); refreshWeather();
      }, { signal: weatherEvents.signal });
      $('weather-refresh').addEventListener('click', refreshWeather, { signal: weatherEvents.signal });
      function pauseWeather() {
        if (clockTimer !== null) clearInterval(clockTimer);
        if (refreshTimer !== null) clearInterval(refreshTimer);
        clockTimer = refreshTimer = null;
        if (controller) { requestId++; controller.abort(); controller = null; state.phase = state.data ? 'cached' : 'loading'; }
        if (requestTimeout !== null) clearTimeout(requestTimeout);
        requestTimeout = null;
      }
      function resumeWeather() {
        if (destroyed || document.hidden || clockTimer !== null) return;
        updateClock(); renderWeather();
        if (!controller && (!state.data || state.phase === 'cached' || Date.now() - state.fetchedAt >= REFRESH_MS)) refreshWeather();
        clockTimer = setInterval(() => {
          updateClock();
          const minute = Math.floor(Date.now() / 60000);
          if (minute !== lastMinute) { lastMinute = minute; renderWeather(); }
        }, 1000);
        refreshTimer = setInterval(() => { if (!document.hidden && !controller) refreshWeather(); }, REFRESH_MS);
      }
      function destroy() {
        if (destroyed) return;
        destroyed = true; pauseWeather(); weatherEvents.abort();
        state.data = null; forecastData = null; weatherListeners.clear();
      }
      document.addEventListener('visibilitychange', () => document.hidden ? pauseWeather() : resumeWeather(), { signal: weatherEvents.signal });
      window.addEventListener('pagehide', e => e.persisted ? pauseWeather() : destroy(), { signal: weatherEvents.signal });
      window.addEventListener('pageshow', resumeWeather, { signal: weatherEvents.signal });
      setFormatters(); loadCache(); resumeWeather();
      return { state, destroy, subscribe(listener) { weatherListeners.add(listener); listener(state); return () => weatherListeners.delete(listener); }, get localHour() { return localHour; }, get wildlifeAwake() { return localHour >= 6 && localHour < 18.5; } };
    })();
