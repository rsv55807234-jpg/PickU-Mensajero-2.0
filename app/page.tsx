'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';

// Carga dinámica del mapa para evitar errores de SSR
const MapComponent = dynamic(() => import('../components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-200 animate-pulse flex items-center justify-center text-neutral-400 font-black italic">Cargando Mapa...</div>
});
import { Car, ChevronRight, UserPlus, LogIn, ShieldCheck, MapPin, Bike, User, Phone, Mail, Lock, ChevronLeft, Zap, Truck } from 'lucide-react';
import Link from 'next/link';

type ViewState = 'login' | 'register_client' | 'register_mensajero' | 'client_dashboard' | 'profile';

export default function PickUMensajeroApp() {
  const [view, setView] = useState<ViewState>('login');
  const [userProfile, setUserProfile] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '0412 123 4567',
    photo: 'https://picsum.photos/seed/user/200/200'
  });
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'home' | 'search' | 'confirm' | 'tracking'>('home');
  const [pickup, setPickup] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [selectingMode, setSelectingMode] = useState<'pickup' | 'destination' | null>(null);

  // Fetch real route from OSRM
  React.useEffect(() => {
    if (pickup && destination) {
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            setRoute(coords);
            setDistance(data.routes[0].distance / 1000); // meters to km
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          // Fallback to straight line distance if API fails
          const d = calculateDistanceKm(pickup[0], pickup[1], destination[0], destination[1]);
          setDistance(d);
          setRoute([pickup, destination]);
        }
      };
      fetchRoute();
    } else {
      setRoute(null);
      setDistance(0);
    }
  }, [pickup, destination]);

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    if (selectingMode === 'pickup') {
      setPickup([lat, lng]);
    } else if (selectingMode === 'destination') {
      setDestination([lat, lng]);
    }
    setSelectingMode(null);
  };

  const renderClientDashboard = () => (
    <motion.div 
      key="client_dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col relative overflow-hidden"
    >
      {/* Search Header (App Bar) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('profile')}
            className="bg-white p-3 rounded-2xl shadow-xl border border-neutral-100"
          >
            <User size={20} className="text-black" />
          </motion.button>
          
          {bookingStep === 'home' && (
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-neutral-100 px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-black rounded-full shrink-0"></div>
              <span className="text-xs font-bold text-neutral-400">¿A dónde enviamos hoy?</span>
            </div>
          )}
        </div>
      </div>

      {/* Real Interactive Map via OpenStreetMap & Leaflet */}
      <div className={`absolute inset-0 bg-neutral-200 transition-all duration-500 ${selectingMode ? 'z-50' : 'z-0'}`}>
        <MapComponent 
          pickup={pickup}
          destination={destination}
          route={route}
          selectingMode={selectingMode}
          onLocationSelect={handleLocationSelect}
        />
        
        {/* Overlay for search header space to prevent clicks on map behind UI elements */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10" />
      </div>

      {/* Dynamic Bottom Sheet */}
      <AnimatePresence>
        {bookingStep === 'home' && (
          <motion.div 
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.1)] p-8 flex flex-col gap-6 z-30"
          >
            <div className="w-12 h-1 bg-neutral-100 rounded-full mx-auto mb-2 opacity-50"></div>
            
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setBookingStep('search')}
              className="bg-yellow-400 p-8 rounded-[2.5rem] flex items-center justify-between group relative overflow-hidden shadow-xl shadow-yellow-400/20"
            >
              <div className="flex items-center gap-6 relative z-10">
                <div className="bg-black p-4 rounded-2xl text-yellow-400 shadow-lg">
                  <Zap size={32} />
                </div>
                <div className="text-left">
                  <span className="block font-black text-sm uppercase tracking-[0.2em] text-black/40">Envío Inmediato</span>
                  <span className="block font-black text-2xl italic tracking-tighter text-black">Solicitar Mensajero</span>
                </div>
              </div>
              <div className="relative z-10 bg-black/5 p-2 rounded-full">
                <ChevronRight size={24} className="text-black" />
              </div>
              
              {/* Decorative Background Icon */}
              <Zap size={100} className="absolute -right-6 -bottom-6 text-black/5 -rotate-12" />
            </motion.button>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-neutral-300 tracking-[0.2em] px-2 italic">Destinos Frecuentes</h4>
              <div className="bg-neutral-50 px-4 py-3 rounded-2xl flex items-center justify-between group cursor-pointer active:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-100">
                    <MapPin size={16} className="text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Calle Comercio #45</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Oficina Principal</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </div>
          </motion.div>
        )}

        {bookingStep === 'search' && (
          <motion.div 
            initial={{ y: 400 }}
            animate={{ y: selectingMode ? 1000 : 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 150 }}
            exit={{ y: 400 }}
            className="absolute bottom-0 left-0 right-0 z-40 flex flex-col"
          >
            {/* PESTAÑA FÍSICA PARA REGRESAR - CLARAMENTE VISIBLE SOBRE EL FORMULARIO */}
            {!selectingMode && (
              <div className="flex justify-start px-10">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingStep('home')}
                  className="bg-black text-white px-6 py-4 rounded-t-3xl flex items-center gap-3 shadow-2xl border-t border-x border-white/20 relative z-50 mb-[-2px]"
                >
                  <div className="bg-yellow-400 p-1 rounded-lg">
                    <ChevronLeft size={18} className="text-black stroke-[3px]" />
                  </div>
                  <span className="font-black text-[12px] uppercase tracking-widest italic">Regresar al Mapa</span>
                </motion.button>
              </div>
            )}

            {/* CUERPO DEL FORMULARIO */}
            <div className={`bg-white rounded-t-[3.5rem] shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.3)] p-8 flex flex-col gap-6 min-h-[60%] overflow-y-auto max-h-[80vh] ${selectingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {/* Indicador de arrastre */}
              <div className="w-16 h-1.5 bg-neutral-100 rounded-full mx-auto mb-4"></div>
              
              <div className="flex items-center justify-between mb-4">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingStep('home')}
                  className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors"
                >
                  <div className="bg-neutral-100 p-2 rounded-xl">
                    <ChevronLeft size={20} className="text-black" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest italic">Regresar</span>
                </motion.button>
                <div className="bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/30">
                  <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Paso 2 de 3</span>
                </div>
              </div>
              
              {/* Formulario de Destino */}
              <div className="flex flex-col gap-4 bg-neutral-900 p-6 rounded-[2.5rem] shadow-xl border border-white/10">
                <div className="relative pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                      <div className="flex flex-col flex-1">
                        <span className="text-[9px] font-black uppercase text-yellow-400/60 leading-none mb-1">Recogida</span>
                        <input 
                          type="text" 
                          value={pickup ? `${pickup[0].toFixed(4)}, ${pickup[1].toFixed(4)}` : "Ubicación Actual (GPS)"} 
                          readOnly 
                          className="text-sm font-bold text-white/50 outline-none w-full bg-transparent" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setPickup(null);
                        setRoute(null);
                        setDistance(0);
                        setSelectingMode('pickup');
                      }}
                      className={`p-2 rounded-xl transition-all ${selectingMode === 'pickup' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      <MapPin size={16} />
                    </button>
                  </div>
                  <div className="absolute left-[4px] top-8 bottom-4 w-0.5 bg-white/5"></div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[9px] font-black uppercase text-white/40 leading-none mb-1">Destino</span>
                      <input 
                        type="text" 
                        placeholder="Pincha en el mapa" 
                        value={destination ? `${destination[0].toFixed(4)}, ${destination[1].toFixed(4)}` : ""}
                        readOnly
                        className="text-sm font-black text-white outline-none w-full bg-transparent placeholder:text-white/20" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setDestination(null);
                      setRoute(null);
                      setDistance(0);
                      setSelectingMode('destination');
                    }}
                    className={`p-2 rounded-xl transition-all ${selectingMode === 'destination' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    <MapPin size={16} />
                  </button>
                </div>
              </div>

            <div className="flex-1 space-y-2 mt-4 text-left">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase text-neutral-300 tracking-[0.2em] italic">Selecciona Servicio</h4>
                {distance > 0 && (
                  <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
                    <MapPin size={10} className="text-black" />
                    <span className="text-[9px] font-black text-black uppercase tracking-widest">{distance.toFixed(1)} km</span>
                  </div>
                )}
              </div>
              
              {[
                { id: 'bici', name: 'Bicicleta', basePrice: 1.00, perKm: 0.50, eta: '4 min', icon: <Bike size={18} />, color: 'text-green-500' },
                { id: 'moto', name: 'Moto', basePrice: 2.00, perKm: 0.80, eta: '2 min', icon: <Zap size={18} />, color: 'text-yellow-500' },
                { id: 'triciclo', name: 'Triciclo', basePrice: 4.00, perKm: 1.20, eta: '6 min', icon: <Truck size={18} />, color: 'text-blue-500' }
              ].map((service, i) => {
                const totalPrice = distance > 0 ? service.basePrice + (distance * service.perKm) : service.basePrice;
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedService(service.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedService === service.id 
                      ? 'border-yellow-400 bg-yellow-50/50 shadow-md' 
                      : 'border-transparent bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-white rounded-xl shadow-sm ${selectedService === service.id ? 'text-yellow-500' : service.color}`}>
                        {service.icon}
                      </div>
                      <div>
                        <p className="text-sm font-black text-neutral-900">{service.name}</p>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter italic">{service.eta} • Recogida Express</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-neutral-900">${totalPrice.toFixed(2)}</p>
                      <p className="text-[8px] text-neutral-400 font-bold uppercase underline">Detalles</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              disabled={!selectedService}
              onClick={() => setBookingStep('tracking')}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 mt-4 uppercase tracking-widest transition-all ${
                selectedService 
                ? 'bg-black text-white hover:bg-neutral-800' 
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Confirmar PickU
            </motion.button>
          </div>
        </motion.div>
      )}

        {bookingStep === 'tracking' && (
          <motion.div 
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-black rounded-t-[2.5rem] shadow-2xl p-8 flex flex-col gap-6 z-30 text-white"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-yellow-400/20 rounded-full animate-spin border-t-yellow-400"></div>
                <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black italic tracking-tighter">Buscando Mensajero...</h4>
                <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mt-1">Asignando unidad cercana</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black">?</div>
                <div>
                  <p className="text-xs font-bold text-white/50 underline">Tu destino</p>
                  <p className="text-sm font-black italic tracking-tight">Centro Comercial Cristal</p>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setBookingStep('home')}
                className="bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Security Badge */}
      <div className="absolute bottom-4 right-4 z-40 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 hidden md:block">
        <ShieldCheck size={16} className="text-white/60" />
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div 
      key="profile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col px-6 py-8 gap-6 overflow-y-auto"
    >
      <button 
        onClick={() => setView('client_dashboard')}
        className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors font-black text-[10px] uppercase tracking-widest self-start"
      >
        <ChevronLeft size={16} /> Volver al Mapa
      </button>

      <div className="flex flex-col items-center gap-4 mt-4">
        {/* Profile Picture Section */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl relative">
            <img 
              src={userProfile.photo} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-1 right-1 bg-black text-yellow-400 p-2.5 rounded-full shadow-lg border-2 border-white"
          >
            <Zap size={16} className="fill-yellow-400" /> {/* Using Zap as a generic "edit/action" icon here, or Camera if available */}
          </motion.button>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">{userProfile.name}</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] italic">Cliente Premium</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-neutral-100 space-y-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-300 ml-1 tracking-widest">Nombre Completo</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input 
                type="text" 
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-300 ml-1 tracking-widest">Correo Electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input 
                type="email" 
                value={userProfile.email}
                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-300 ml-1 tracking-widest">Número de Teléfono</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input 
                type="tel" 
                value={userProfile.phone}
                onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
          >
            Guardar Cambios
          </motion.button>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-neutral-100 space-y-5">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest ml-1">Seguridad</h4>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter ml-1">Actualiza tu contraseña de acceso</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-300 ml-1 tracking-widest">Contraseña Actual</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-300 ml-1 tracking-widest">Nueva Contraseña</label>
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input 
                type="password" 
                placeholder="Nueva Contraseña"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-neutral-100 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
          >
            Actualizar Contraseña
          </motion.button>
        </div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => setView('login')}
        className="mt-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
      >
        Cerrar Sesión
      </motion.button>
    </motion.div>
  );

  const renderLoginForm = () => (
    <motion.div 
      key="login"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col px-6 py-8 gap-6 justify-center overflow-hidden"
    >
      {/* Login Form Section */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
        <div className="space-y-1 mb-2">
          <h3 className="text-lg font-black text-neutral-900 tracking-tight">Iniciar Sesión</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Accede a tu cuenta</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="nombre@ejemplo.com"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium"
            />
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('client_dashboard')}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 mt-2 hover:bg-neutral-800 transition-colors"
          >
            <LogIn size={18} /> Entrar
          </motion.button>
          
          <div className="text-center">
            <Link href="#" className="text-[10px] font-bold text-neutral-400 hover:text-black transition-colors uppercase tracking-widest">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>

      {/* Registration Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 px-2">
          <div className="h-[1px] bg-neutral-200 flex-1"></div>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest shrink-0">O Regístrate como</span>
          <div className="h-[1px] bg-neutral-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('register_client')}
            className="bg-white border-2 border-neutral-200 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-black transition-all group"
          >
            <div className="bg-neutral-900 p-2 rounded-xl text-white group-hover:bg-yellow-400 group-hover:text-black transition-colors">
              <UserPlus size={18} />
            </div>
            <span className="font-black text-[11px] uppercase tracking-tighter text-neutral-900">Cliente</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('register_mensajero')}
            className="bg-white border-2 border-neutral-200 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-yellow-400 transition-all group"
          >
            <div className="bg-yellow-400 p-2 rounded-xl text-black group-hover:bg-black group-hover:text-white transition-colors">
              <Car size={18} />
            </div>
            <span className="font-black text-[11px] uppercase tracking-tighter text-neutral-900">Mensajero</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );


  const renderRegisterClient = () => (
    <motion.div 
      key="register_client"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col px-6 py-8 gap-4 overflow-y-auto"
    >
      <button 
        onClick={() => setView('login')}
        className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors font-bold text-[10px] uppercase tracking-widest mb-2 self-start"
      >
        <ChevronLeft size={16} /> Volver
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col gap-5">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">Registro Cliente</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Crea tu cuenta de usuario</p>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Nombre Completo', icon: <User size={16} />, placeholder: 'Juan Pérez', type: 'text' },
            { label: 'Correo Electrónico', icon: <Mail size={16} />, placeholder: 'correo@ejemplo.com', type: 'email' },
            { label: 'Teléfono', icon: <Phone size={16} />, placeholder: '0412 000 0000', type: 'tel' },
            { label: 'Contraseña', icon: <Lock size={16} />, placeholder: '••••••••', type: 'password' },
          ].map((field, i) => (
            <div key={i} className="space-y-1">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest flex items-center gap-2">
                {field.icon} {field.label}
              </label>
              <input 
                type={field.type} 
                placeholder={field.placeholder}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium"
              />
            </div>
          ))}

          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            Registrarme como Cliente
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const renderRegisterMensajero = () => (
    <motion.div 
      key="register_mensajero"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col px-6 py-8 gap-4 overflow-y-auto"
    >
      <button 
        onClick={() => setView('login')}
        className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors font-bold text-[10px] uppercase tracking-widest mb-2 self-start"
      >
        <ChevronLeft size={16} /> Volver
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex flex-col gap-5">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">Registro Mensajero</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Forma parte de nuestra flota</p>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Nombre Completo', icon: <User size={16} />, placeholder: 'Juan Pérez', type: 'text' },
            { label: 'Correo Electrónico', icon: <Mail size={16} />, placeholder: 'correo@ejemplo.com', type: 'email' },
            { label: 'Teléfono', icon: <Phone size={16} />, placeholder: '0412 000 0000', type: 'tel' },
            { label: 'Contraseña', icon: <Lock size={16} />, placeholder: '••••••••', type: 'password' },
          ].map((field, i) => (
            <div key={i} className="space-y-1">
              <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest flex items-center gap-2">
                {field.icon} {field.label}
              </label>
              <input 
                type={field.type} 
                placeholder={field.placeholder}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium"
              />
            </div>
          ))}

          {/* Vehicle Type Selector */}
          <div className="space-y-2 mt-2">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Tipo de Vehículo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bici', label: 'Bici', icon: <Bike size={14} /> },
                { id: 'moto', label: 'Moto', icon: <Zap size={14} /> },
                { id: 'triciclo', label: 'Triciclo', icon: <Truck size={14} /> }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVehicle(v.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    vehicle === v.id 
                    ? 'border-yellow-400 bg-yellow-50 text-black' 
                    : 'border-neutral-100 bg-neutral-50 text-neutral-400'
                  }`}
                >
                  {v.icon}
                  <span className="text-[9px] font-black uppercase tracking-tighter">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            Ser Mensajero PickU
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center font-sans overflow-hidden">
      {/* Mobile Frame Container - Locked Height */}
      <div className="w-full max-w-[430px] h-full md:h-[92%] md:max-h-[850px] bg-neutral-50 md:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col border-x border-neutral-200">
        
        {/* Brand Header - Minimal for App Feel */}
        <div className="bg-yellow-400 px-6 pb-6 pt-10 rounded-b-[2rem] shadow-md relative overflow-hidden shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h1 className="text-2xl font-black italic tracking-tighter text-black flex items-center gap-1 leading-none">
              PickU<span className="w-2 h-2 bg-black rounded-full mt-1"></span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-black/10 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-black">
                Mensajero & Fleet
              </div>
            </div>
          </motion.div>
          <Car size={80} className="absolute -right-4 -bottom-4 text-black/5 rotate-12" />
        </div>

        {/* Dynamic Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {view === 'login' && renderLoginForm()}
          {view === 'register_client' && renderRegisterClient()}
          {view === 'register_mensajero' && renderRegisterMensajero()}
          {view === 'client_dashboard' && renderClientDashboard()}
          {view === 'profile' && renderProfile()}
        </AnimatePresence>

        {/* TOP LEVEL OVERLAY FOR MAP SELECTION - GUARANTEES INTERACTIVITY */}
        <AnimatePresence>
          {selectingMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[5000] flex flex-col items-center pointer-events-none"
            >
              {/* Background Dimmer - Just visual shadow at top and bottom */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
              
              {/* Top Control Bar during selection - Interactive */}
              <div className="w-full px-6 pt-12 flex flex-col items-center gap-4 relative z-[5001] pointer-events-none">
                <button 
                  onClick={() => setSelectingMode(null)}
                  className="bg-black text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-yellow-400 font-black text-sm uppercase tracking-widest pointer-events-auto active:scale-95 transition-transform"
                >
                  <ChevronLeft size={24} className="text-yellow-400" /> Cancelar Selección
                </button>
                
                <div className="bg-yellow-400 text-black px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-black/10 pointer-events-auto">
                  <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse"></div>
                  <span className="font-black text-[11px] uppercase tracking-widest">
                    Paso: fijar {selectingMode === 'pickup' ? 'recogida' : 'destino'}
                  </span>
                </div>
              </div>

              {/* Central Crosshair Indicator - Just visual */}
              <div className="flex-1 flex items-center justify-center relative pointer-events-none">
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="relative"
                >
                  <MapPin size={64} className={selectingMode === 'pickup' ? 'text-yellow-500 fill-black/10' : 'text-black/90'} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Trust Tag */}
        <div className="flex flex-col items-center gap-4 pb-2 shrink-0">
           <div className="flex items-center gap-2 text-neutral-300">
             <ShieldCheck size={14} />
             <span className="text-[8px] font-bold uppercase tracking-[0.2em]">PickU Secure Network</span>
           </div>
           
           {/* Navigation Indicator - The "Pill" for Modern Mobile */}
           <button onClick={() => setView('login')} className="w-24 h-1 bg-neutral-200 rounded-full opacity-50 hover:opacity-100 transition-opacity"></button>
        </div>

        {/* Dynamic Map Glow - Simulating "Modern App" feel */}
        <div className="absolute -left-10 top-1/2 w-40 h-40 bg-yellow-400/10 blur-[90px] rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
}
