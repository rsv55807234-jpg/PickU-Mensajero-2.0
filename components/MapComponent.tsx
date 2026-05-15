'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Corregir el problema de los iconos de Leaflet en Next.js
const pickupIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  pickup?: [number, number] | null;
  destination?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectingMode?: 'pickup' | 'destination' | null;
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapComponent({ 
  center = [10.4806, -66.9036], 
  zoom = 13, 
  pickup, 
  destination,
  onLocationSelect,
  selectingMode
}: MapComponentProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {selectingMode && <MapEvents onLocationSelect={onLocationSelect} />}

      {pickup && (
        <Marker position={pickup} icon={pickupIcon}>
          <Popup>Punto de Recogida</Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={destination} icon={destinationIcon}>
          <Popup>Punto de Destino</Popup>
        </Marker>
      )}

      {!pickup && !destination && (
        <Marker position={center} icon={pickupIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
