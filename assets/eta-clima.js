/* eta-clima.js — calcula tiempo de llegada del técnico según el clima en Valencia.
   Fuente: Open-Meteo (gratis, sin API key, CORS abierto).
   Lógica: base 25 min. Cuanto más adverso el clima, más minutos.
   Cachea en sessionStorage 15 min para no repetir la llamada en cada navegación. */
(function () {
  var LAT = 39.4699, LON = -0.3763;          // Valencia centro
  var CACHE_KEY = 'lajenuco_eta_v1';
  var TTL = 15 * 60 * 1000;                    // 15 min

  // WMO weather_code -> { eta(min), label, icon(emoji) }
  function mapClima(code, wind) {
    var m;
    if (code === 0)                 m = { eta: 25, label: 'Despejado', icon: '☀️' };
    else if (code === 1)            m = { eta: 25, label: 'Poco nuboso', icon: '🌤️' };
    else if (code === 2)            m = { eta: 27, label: 'Parcialmente nuboso', icon: '⛅' };
    else if (code === 3)            m = { eta: 28, label: 'Nublado', icon: '☁️' };
    else if (code === 45 || code === 48) m = { eta: 30, label: 'Niebla', icon: '🌫️' };
    else if (code >= 51 && code <= 57)   m = { eta: 30, label: 'Llovizna', icon: '🌦️' };
    else if (code === 61 || code === 80) m = { eta: 33, label: 'Lluvia ligera', icon: '🌧️' };
    else if (code === 63 || code === 81) m = { eta: 37, label: 'Lluvia', icon: '🌧️' };
    else if (code === 65 || code === 82) m = { eta: 42, label: 'Lluvia fuerte', icon: '⛈️' };
    else if (code === 66 || code === 67) m = { eta: 40, label: 'Lluvia helada', icon: '🌨️' };
    else if (code >= 71 && code <= 77)   m = { eta: 42, label: 'Nieve', icon: '❄️' };
    else if (code === 85 || code === 86) m = { eta: 42, label: 'Nieve', icon: '❄️' };
    else if (code === 95)           m = { eta: 45, label: 'Tormenta', icon: '⛈️' };
    else if (code === 96 || code === 99) m = { eta: 50, label: 'Tormenta con granizo', icon: '⛈️' };
    else                            m = { eta: 28, label: 'Valencia', icon: '📍' };

    // Viento fuerte añade unos minutos
    if (wind != null && wind > 45) m.eta += 4;
    else if (wind != null && wind > 30) m.eta += 2;

    return m;
  }

  function render(data) {
    var el = document.getElementById('eta-clima');
    if (!el) return;
    var etaTxt = '~' + data.eta + ' min';
    el.innerHTML =
      '<span class="topbar-item"><span class="topbar-dot"></span> Técnicos disponibles ahora</span>' +
      '<span class="topbar-sep topbar-hide-mobile">·</span>' +
      '<span class="topbar-item topbar-eta"><i class="fas fa-stopwatch"></i> Llegada estimada <strong>' + etaTxt + '</strong></span>' +
      '<span class="topbar-sep topbar-hide-mobile">·</span>' +
      '<span class="topbar-item topbar-hide-mobile">' + data.icon + ' ' + data.temp + '°C · ' + data.label + ' en Valencia</span>';
  }

  function fallback() {
    render({ eta: '25-30', icon: '📍', temp: '', label: 'Valencia' });
    // ajustar texto si eta es rango
    var s = document.querySelector('#eta-clima .topbar-eta strong');
    if (s) s.textContent = '25-30 min';
  }

  // 1) Cache
  try {
    var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.t) < TTL) { render(cached.d); return; }
  } catch (e) {}

  // 2) Fetch
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
            '&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FMadrid';

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (j) {
      var cur = j.current || {};
      var m = mapClima(cur.weather_code, cur.wind_speed_10m);
      var d = { eta: m.eta, label: m.label, icon: m.icon, temp: Math.round(cur.temperature_2m) };
      render(d);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
    })
    .catch(fallback);

  // Mostrar algo inmediato mientras llega la respuesta
  fallback();
})();
