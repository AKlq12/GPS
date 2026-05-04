import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import RoutingMachine from './RoutingMachine';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- CONFIG ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- CONFIG ICON ---
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MAP_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    name: "Satelit"
  },
  street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; Carto",
    name: "Jalan Raya"
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// Helper: Komponen untuk memindahkan peta (FlyTo) saat item sidebar diklik
function MapFlyTo({ targetLocation }) {
  const map = useMap();
  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, 18, { duration: 2 }); // Zoom level 18 (sangat dekat)
    }
  }, [targetLocation, map]);
  return null;
}

function LocationMarker({ location, radius }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo(location, 14, { duration: 2 });
  }, [location, map]);
  
  return location === null ? null : (
    <>
      <Marker position={location}>
        <Popup><div className="text-center font-bold">📍 Lokasi Kamu</div></Popup>
      </Marker>
      <Circle 
        center={location} 
        radius={radius * 1000} 
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, dashArray: '5, 10' }} 
      />
    </>
  );
}

// --- KOMPONEN SIDEBAR MENU MODERN ---
const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  searchQuery, 
  setSearchQuery, 
  radius, 
  setRadius, 
  filterType, 
  setFilterType, 
  mapMode, 
  setMapMode,
  shopsList, 
  onShopClick,
  user,
  onLogout
}) => {
  return (
    // Sidebar Container dengan Glassmorphism & Animasi Halus
    <div className={`fixed top-4 left-4 bottom-4 w-80 bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl z-[2000] transition-all duration-500 ease-in-out flex flex-col transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 pointer-events-none'}`}>
      
      {/* Header Modern */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">PrintPoint</h1>
            <p className="text-slate-400 text-[10px] font-medium tracking-wide uppercase">Smart LBS Finder</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center justify-between mt-2 mb-1 bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 rounded-xl border border-blue-100/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 leading-tight">{user.name}</p>
                <p className="text-[9px] text-slate-400 leading-tight">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 custom-scrollbar">
        
        {/* 1. Search Input (Soft Style) */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-3 border-none rounded-2xl bg-slate-100/80 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all text-sm font-medium shadow-inner" 
            placeholder="Cari toko..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 2. Radius Slider (Minimalist) */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-white/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jarak Radius</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg">{radius} KM</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={radius} 
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
          />
        </div>

        {/* 3. Kategori (Pill Tabs) */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Filter Kategori</label>
          <div className="flex flex-wrap gap-2">
            {['All', 'Recommended', '24 Jam', 'Fotokopi', 'Express'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all transform active:scale-95 border ${
                  filterType === type 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                }`}
              >
                {type === 'Recommended' ? '🏆 Top' : type}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Map Style Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
          <button 
            onClick={() => setMapMode('street')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${mapMode === 'street' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🗺️ Jalan
          </button>
          <button 
            onClick={() => setMapMode('satellite')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${mapMode === 'satellite' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🛰️ Satelit
          </button>
        </div>

        {/* 5. List Result (Card Style) */}
        <div>
          <div className="flex justify-between items-end mb-3 border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil ({shopsList.length})</span>
          </div>
          
          <div className="space-y-3 pb-4">
            {shopsList.length > 0 ? (
              shopsList.map((shop) => (
                <div 
                  key={shop.id}
                  onClick={() => onShopClick([shop.lat, shop.lng])} 
                  className="group bg-white/60 hover:bg-white border border-white/60 hover:border-blue-200 p-3 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 line-clamp-1 transition-colors">{shop.name}</h4>
                    {shop.type === 'Recommended' && <span className="text-xs animate-bounce">🏆</span>}
                  </div>
                  
                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-2 font-medium">{shop.address || 'Jogja'}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      <span className="text-amber-500 text-[10px]">★</span>
                      <span className="text-[10px] font-bold text-amber-700">{shop.rating || '4.5'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Rp{shop.price}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-slate-400 text-xs font-medium">Tidak ada hasil ditemukan.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- APP UTAMA ---
function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'

  // App State
  const [shops, setShops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(5);
  const [destination, setDestination] = useState(null);
  const [mapMode, setMapMode] = useState("street"); 
  const [flyToLocation, setFlyToLocation] = useState(null);

  // Cek token di localStorage saat pertama kali load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch shops dari API setelah login
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    fetch(`${API_URL}/api/shops`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Token expired atau invalid
          handleLogout();
          return [];
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setShops(data);
        }
      })
      .catch(err => {
        console.error('Error fetching shops:', err);
        // Fallback ke file statis jika API gagal
        fetch('/shops.json?v=' + new Date().getTime())
          .then(res => res.json())
          .then(data => setShops(data))
          .catch(err2 => console.error('Fallback also failed:', err2));
      });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.error("GPS Error:", err);
          setUserLocation([-7.7829, 110.3671]); 
        }
      );
    } else {
       setUserLocation([-7.7829, 110.3671]);
    }
    
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [isAuthenticated, token]);

  // --- AUTH HANDLERS ---
  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setShops([]);
    setAuthPage('login');
  };

  const getWALink = (shopName) => {
    return `https://wa.me/628123456789?text=Halo ${shopName}, mau tanya harga print?`;
  };

  const filteredShops = shops.filter(shop => {
    const matchCategory = filterType === "All" ? true : shop.type === filterType;
    const matchSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchDistance = true;
    if (userLocation) {
      const dist = calculateDistance(userLocation[0], userLocation[1], shop.lat, shop.lng);
      matchDistance = dist <= radius;
    }
    return matchCategory && matchSearch && matchDistance;
  });

  // --- RENDER AUTH PAGES ---
  if (!isAuthenticated) {
    if (authPage === 'register') {
      return (
        <RegisterPage 
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <LoginPage 
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    );
  }

  // --- RENDER MAP (setelah login) ---
  return (
    <div className="h-screen w-full flex bg-slate-900 overflow-hidden relative font-sans">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        radius={radius}
        setRadius={setRadius}
        filterType={filterType}
        setFilterType={setFilterType}
        mapMode={mapMode}
        setMapMode={setMapMode}
        shopsList={filteredShops} 
        onShopClick={(loc) => { 
          setFlyToLocation(loc); 
          if (window.innerWidth < 768) setIsSidebarOpen(false); 
        }}
        user={user}
        onLogout={handleLogout}
      />

      {/* Floating Toggle Button (Modern Bubble) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur text-slate-700 p-3.5 rounded-2xl shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 border border-white/50 group"
        >
          <svg className="w-6 h-6 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      <div className={`flex-1 relative transition-all duration-500`}>
        {userLocation ? (
          <MapContainer center={userLocation} zoom={13} zoomControl={false} className="h-full w-full outline-none">
            <TileLayer attribution={MAP_LAYERS[mapMode].attribution} url={MAP_LAYERS[mapMode].url} />
            
            <LocationMarker location={userLocation} radius={radius} />
            <MapFlyTo targetLocation={flyToLocation} />
            {destination && <RoutingMachine userLocation={userLocation} destination={destination} />}

            {filteredShops.map((shop) => (
              <Marker key={shop.id} position={[shop.lat, shop.lng]}>
                <Popup className="custom-popup-modern" maxWidth={260} closeButton={false}>
                  <div className="p-0 overflow-hidden rounded-2xl shadow-xl border border-white/50">
                    <div className={`h-16 relative ${shop.type === 'Recommended' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                       <span className="absolute bottom-2 left-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold border border-white/20 shadow-sm">{shop.type}</span>
                       {shop.type === 'Recommended' && <span className="absolute top-2 right-3 text-xl drop-shadow-md">🏆</span>}
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{shop.name}</h3>
                      <p className="text-[11px] text-slate-500 mb-3 font-medium">📍 {shop.address || 'Alamat Tersedia'}</p>
                      
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100">
                        <span className="text-xs font-extrabold text-slate-700">Rp{shop.price}</span>
                        <div className="flex text-amber-400 text-[10px] gap-0.5">{'★'.repeat(Math.round(shop.rating || 0))}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setDestination([shop.lat, shop.lng])} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-[11px] font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">🚀 Rute</button>
                        <a href={getWALink(shop.name)} target="_blank" rel="noreferrer" className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-[11px] font-bold text-center no-underline shadow-lg shadow-emerald-500/20 transition-all active:scale-95">Chat WA</a>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
             <p className="text-sm font-light tracking-widest animate-pulse">MEMUAT PETA...</p>
          </div>
        )}

        {/* Floating Route Info (Glass Style) */}
        {destination && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 text-slate-800 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-in">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Navigasi Aktif</span>
              <span className="text-sm font-bold">Menuju Lokasi...</span>
            </div>
            <button 
              onClick={() => setDestination(null)} 
              className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;