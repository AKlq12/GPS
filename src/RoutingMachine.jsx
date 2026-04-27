import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RoutingMachine = ({ userLocation, destination }) => {
  const map = useMap();

  useEffect(() => {
    // Jangan jalankan jika lokasi user atau tujuan belum ada
    if (!userLocation || !destination) return;

    // Membuat kontrol routing
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]), // Titik Awal (User)
        L.latLng(destination[0], destination[1]),   // Titik Tujuan (Toko)
      ],
      routeWhileDragging: false, // Matikan hitung ulang saat drag (berat)
      addWaypoints: false,       // User tidak bisa tambah titik manual
      draggableWaypoints: false, // Titik tidak bisa digeser
      fitSelectedRoutes: true,   // Zoom otomatis ke seluruh rute
      showAlternatives: false,   // Hanya tampilkan 1 rute terbaik
      
      // --- STYLING GARIS RUTE MODERN (High Contrast) ---
      // Teknik Layering: Bayangan -> Outline -> Warna Utama
      lineOptions: {
        styles: [
          { color: 'black', opacity: 0.3, weight: 13 }, // Layer 1: Bayangan (Shadow)
          { color: 'white', opacity: 0.9, weight: 9 },  // Layer 2: Outline Putih Tebal
          { color: '#ef4444', opacity: 1, weight: 5 }   // Layer 3: Garis Utama (Merah Neon)
        ]
      },

      // Menggunakan OSRM Demo Server (Gratis)
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving', // Mode berkendara mobil/motor
      }),

      // Opsional: Kustomisasi tampilan box instruksi (Turn-by-turn)
      // createGeocoder: () => null, // Matikan geocoder bawaan agar lebih ringan
      
    }).addTo(map);

    // CLEANUP FUNCTION (Sangat Penting di React)
    // Menghapus rute lama saat komponen dicopot atau tujuan berubah
    // Mencegah garis rute menumpuk menjadi banyak
    return () => {
      try {
        map.removeControl(routingControl);
      } catch (e) {
        console.warn("Routing control cleanup error", e);
      }
    };
  }, [map, userLocation, destination]); // Jalankan ulang effect jika variabel ini berubah

  return null;
};

export default RoutingMachine;