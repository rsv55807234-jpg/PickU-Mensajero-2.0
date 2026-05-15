'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';

// Carga dinámica del mapa para evitar errores de SSR
const MapComponent = dynamic(() => import('../components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-200 animate-pulse flex items-center justify-center text-neutral-400 font-black italic">Cargando Mapa...</div>
});
import { Car, ChevronRight, UserPlus, LogIn, LogOut, ShieldCheck, MapPin, Bike, User, Phone, Mail, Lock, ChevronLeft, Zap, Truck, LayoutDashboard, Map, Wallet, Users, Settings, Activity, FileText, LayoutGrid, Trash2, PlusSquare, Eye, CreditCard, Percent } from 'lucide-react';
import Link from 'next/link';

type ViewState = 'login' | 'register_client' | 'register_mensajero' | 'client_dashboard' | 'mensajero_dashboard' | 'profile' | 'admin_dashboard';

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
  const [isOnline, setIsOnline] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [mensajeroTab, setMensajeroTab] = useState<'dashboard' | 'mapa' | 'billetera' | 'perfil'>('dashboard');
  const [userRole, setUserRole] = useState<'client' | 'mensajero' | 'admin'>('client');
  const [adminTab, setAdminTab] = useState<'resumen' | 'clientes' | 'mensajeros' | 'recargas' | 'config'>('resumen');
  const [systemConfig, setSystemConfig] = useState({
    accountNumber: '1234-5678-9012-3456',
    phoneNumber: '0414-1234567',
    rates: {
      bicycle: 0.50,
      motorbike: 0.80,
      tricycle: 1.20
    },
    commission: 15
  });

  const availableOrders = [
    { id: 1, pickup: 'Calle 72 con Av. 15', destination: 'C.C. Sambil', distance: '3.2 km', price: '$4.50', time: '5 min ago' },
    { id: 2, pickup: 'Indio Mara', destination: 'Plaza de la República', distance: '1.8 km', price: '$2.80', time: '2 min ago' },
    { id: 3, pickup: 'Sector La Lago', destination: 'Hospital Universitario', distance: '5.4 km', price: '$7.20', time: '8 min ago' },
  ];

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

  const renderAdminDashboard = () => (
    <motion.div 
      key="admin_dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-neutral-50 overflow-hidden"
    >
      {/* Header Admin */}
      <div className="bg-white border-b border-neutral-100 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <LayoutGrid size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight italic">Panel Admin</h2>
            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">PickU Mensajero</p>
          </div>
        </div>
        <button 
          onClick={() => setView('profile')}
          className="w-10 h-10 rounded-full border-2 border-neutral-100 overflow-hidden"
        >
          <img src={userProfile.photo} alt="Admin" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* Tabs Admin */}
      <div className="flex px-4 py-2 gap-1 overflow-x-auto no-scrollbar bg-white border-b border-neutral-100">
        {[
          { id: 'resumen', label: 'Resumen', icon: Activity },
          { id: 'clientes', label: 'Clientes', icon: Users },
          { id: 'mensajeros', label: 'Mensajeros', icon: Bike },
          { id: 'recargas', label: 'Recargas', icon: Wallet },
          { id: 'config', label: 'Sistema', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              adminTab === tab.id 
                ? 'bg-black text-white shadow-lg' 
                : 'text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <tab.icon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Admin */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {adminTab === 'resumen' && (
          <>
            <div className="grid grid-cols-3 gap-2 px-1">
              <div className="bg-white p-4 rounded-[1.8rem] border border-neutral-100 shadow-sm flex flex-col gap-1">
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Mensajeros</p>
                <p className="text-xl font-black italic tracking-tighter">142</p>
                <div className="flex items-center gap-1 text-green-500">
                  <Activity size={8} />
                  <span className="text-[8px] font-bold">+12</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[1.8rem] border border-neutral-100 shadow-sm flex flex-col gap-1">
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Clientes</p>
                <p className="text-xl font-black italic tracking-tighter">846</p>
                <div className="flex items-center gap-1 text-neutral-300">
                  <Activity size={8} />
                  <span className="text-[8px] font-bold">+48</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[1.8rem] border border-neutral-100 shadow-sm flex flex-col gap-1">
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Ingresos</p>
                <p className="text-xl font-black italic tracking-tighter">$1.4k</p>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Activity size={8} />
                  <span className="text-[8px] font-bold">Hoy</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                <FileText size={12} /> Recargas Pendientes
              </h3>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-50 rounded-2xl flex items-center justify-center">
                      <User size={18} className="text-neutral-300" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-900">Usuario #{1024 + i}</p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">CUP 5,000 • 12:4{i} PM</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAdminTab('recargas')}
                    className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center hover:bg-neutral-800 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {adminTab === 'clientes' && (
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest">Base de Clientes</h3>
              <Activity size={16} className="text-neutral-200" />
            </div>
            <div className="divide-y divide-neutral-50">
              {['Carlos Ruiz', 'Elena Sofia', 'Marcos V.'].map((user, i) => (
                <div key={user} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black">{user[0]}</div>
                    <div>
                      <p className="text-xs font-black text-neutral-900">{user}</p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">ID: #CL-{5000 + i}</p>
                    </div>
                  </div>
                  <button className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'mensajeros' && (
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest">Base de Mensajeros</h3>
              <Bike size={16} className="text-yellow-400" />
            </div>
            <div className="divide-y divide-neutral-50">
              {['Rafael Sanchez', 'Maria Luiza', 'Pedro Perez'].map((user, i) => (
                <div key={user} className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black">{user[0]}</div>
                      <div>
                        <p className="text-xs font-black text-neutral-900">{user}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">ID: #MS-{2000 + i}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-neutral-300 uppercase tracking-widest mb-0.5">Cartera</p>
                      <p className="text-sm font-black italic text-green-600 tracking-tight">${(i * 15.5 + 4.2).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-neutral-50 border border-neutral-100 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-400 hover:border-yellow-400 transition-all group">
                      <PlusSquare size={14} className="text-neutral-400 group-hover:text-black" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black">Recargar Fondo</span>
                    </button>
                    <button className="px-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'recargas' && (
          <div className="space-y-4">
             <div className="bg-black p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-[70px] opacity-20"></div>
                <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1 relative z-10">Billetera Sistema</p>
                <p className="text-3xl font-black italic tracking-tighter relative z-10">$12,482.00</p>
             </div>

             <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-yellow-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Cola de Validación</h3>
                </div>
                
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-neutral-50 p-5 rounded-[2rem] space-y-4 border border-neutral-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black">Transferencia #{4589 + i}</p>
                          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">CUP 1,200.00</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Pendiente</span>
                      </div>
                      
                      <button className="w-full bg-white border border-neutral-100 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all group">
                        <Eye size={14} className="text-neutral-400 group-hover:text-black" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black">Ver Comprobante</span>
                      </button>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-white border border-neutral-200 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">Rechazar</button>
                        <button className="flex-2 bg-yellow-400 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-black shadow-sm hover:bg-yellow-500 transition-colors">Aprobar Recarga</button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {adminTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-blue-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Información de Pago</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-neutral-400 tracking-widest ml-2 mb-1 block">Número de Cuenta</label>
                  <input 
                    type="text" 
                    value={systemConfig.accountNumber}
                    onChange={(e) => setSystemConfig({...systemConfig, accountNumber: e.target.value})}
                    className="w-full bg-neutral-50 px-5 py-4 rounded-2xl text-xs font-bold border border-neutral-100 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-neutral-400 tracking-widest ml-2 mb-1 block">Teléfono Móvil (Pago Móvil)</label>
                  <input 
                    type="text" 
                    value={systemConfig.phoneNumber}
                    onChange={(e) => setSystemConfig({...systemConfig, phoneNumber: e.target.value})}
                    className="w-full bg-neutral-50 px-5 py-4 rounded-2xl text-xs font-bold border border-neutral-100 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-yellow-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Tarifas por KM</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'bicycle', label: 'Bicicleta', icon: Bike },
                  { id: 'motorbike', label: 'Motocicleta', icon: Zap },
                  { id: 'tricycle', label: 'Triciclo', icon: Truck },
                ].map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-neutral-100">
                      <vehicle.icon size={18} className="text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest mb-1">{vehicle.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black italic">$</span>
                        <input 
                          type="number" 
                          value={systemConfig.rates[vehicle.id as keyof typeof systemConfig.rates]}
                          onChange={(e) => setSystemConfig({
                            ...systemConfig, 
                            rates: { ...systemConfig.rates, [vehicle.id]: parseFloat(e.target.value) }
                          })}
                          className="bg-transparent text-xs font-black border-none focus:outline-none w-16"
                          step="0.01"
                        />
                        <span className="text-[9px] font-bold text-neutral-400">/ KM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Percent size={80} className="text-white" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <Percent size={18} className="text-yellow-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Comisión Plataforma</h3>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <input 
                  type="number" 
                  value={systemConfig.commission}
                  onChange={(e) => setSystemConfig({...systemConfig, commission: parseInt(e.target.value)})}
                  className="bg-transparent text-5xl font-black italic text-white w-24 border-none focus:outline-none"
                />
                <span className="text-2xl font-black italic text-yellow-400 mb-2">%</span>
              </div>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest relative z-10">Descontado automáticamente por cada servicio</p>
            </div>

            <button className="w-full bg-yellow-400 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform">
              Guardar Cambios del Sistema
            </button>
          </div>
        )}
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
        onClick={() => setView(userRole === 'client' ? 'client_dashboard' : 'mensajero_dashboard')}
        className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors font-black text-[10px] uppercase tracking-widest self-start"
      >
        <ChevronLeft size={16} /> Volver al Dashboard
      </button>

      <div className="flex flex-col items-center gap-4 mt-4">
        {/* Profile Picture Section */}
        <div className="relative group">
          <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-yellow-400 shadow-xl relative">
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
            className="absolute bottom-1 right-1 bg-black text-yellow-400 p-2 rounded-full shadow-lg border-2 border-white"
          >
            <Zap size={14} className="fill-yellow-400" />
          </motion.button>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">{userProfile.name}</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] italic">
            {userRole === 'client' ? 'Cliente Premium' : 'Mensajero Verificado'}
          </p>
        </div>
      </div>

      {userRole === 'mensajero' && (
        <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic ml-1">Mi Vehículo</h4>
           <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-600">
                  <Bike size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-neutral-900 italic">Moto Bera BR-150</p>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">Estado: Verificado</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button className="py-3 rounded-2xl border-2 border-neutral-50 font-black text-[8px] text-neutral-400 hover:border-yellow-400 hover:text-black transition-all uppercase italic flex flex-col items-center gap-1">
                  <Bike size={14} /> Bicicleta
                </button>
                <button className="py-3 rounded-2xl border-2 border-neutral-50 font-black text-[8px] text-neutral-400 hover:border-yellow-400 hover:text-black transition-all uppercase italic flex flex-col items-center gap-1 border-yellow-400 text-black">
                  <Zap size={14} /> Moto
                </button>
                <button className="py-3 rounded-2xl border-2 border-neutral-50 font-black text-[8px] text-neutral-400 hover:border-yellow-400 hover:text-black transition-all uppercase italic flex flex-col items-center gap-1">
                  <Truck size={14} /> Triciclo
                </button>
              </div>
           </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-neutral-100 space-y-5">
        <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic ml-1">Configuración de Cuenta</h4>
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

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-neutral-100 space-y-5">
        <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic ml-1">Seguridad</h4>
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
                placeholder="Nueva contraseña"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-neutral-100 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors"
          >
            Actualizar Contraseña
          </motion.button>
        </div>
      </div>
      
      <button 
        onClick={() => setView('login')}
        className="w-full py-8 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 border-t border-neutral-100 flex items-center justify-center gap-2"
      >
        <LogOut size={16} /> Cerrar Sesión
      </button>
    </motion.div>
  );

  const renderMensajeroDashboard = () => (
    <motion.div 
      key="mensajero_dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col relative overflow-hidden"
    >
      {/* Mensajero Header */}
      <div className={`px-6 py-2 flex flex-col gap-2 z-20 ${mensajeroTab === 'mapa' ? 'absolute top-0 left-0 right-0 bg-transparent shadow-none' : 'bg-white shadow-sm'}`}>
        <div className={`flex items-center ${mensajeroTab === 'mapa' ? 'justify-end pt-2' : 'justify-between'}`}>
          {mensajeroTab !== 'mapa' && (
            <div className="flex items-center gap-2">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('profile')}
                className="w-8 h-8 rounded-lg overflow-hidden border-2 border-yellow-400 p-0.5"
              >
                <img src={userProfile.photo} alt="Avatar" className="w-full h-full object-cover rounded-md" />
              </motion.button>
              <div>
                <p className="text-[7px] font-black uppercase text-neutral-400 tracking-widest italic leading-none">Hola, {userProfile.name.split(' ')[0]}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-neutral-300'}`}></div>
                  <span className="text-[8px] font-black uppercase tracking-tight">{isOnline ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest transition-all shadow-md ${
              isOnline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            {isOnline ? 'Desconectar' : 'Conectar'}
          </button>
        </div>

        {/* Stats Row - Only visible in Dashboard tab */}
        {mensajeroTab === 'dashboard' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-2 gap-3 overflow-hidden pb-1"
          >
            <div className="bg-neutral-900 p-4 rounded-2xl text-white flex flex-col justify-between shadow-lg">
              <p className="text-[7px] font-black uppercase text-white/40 tracking-[0.2em] mb-2 leading-none text-center">Ganancias Hoy</p>
              <p className="text-2xl font-black italic tracking-tighter leading-none text-center">$24.50</p>
            </div>
            <div className="bg-yellow-400 p-4 rounded-2xl text-black flex flex-col justify-between shadow-lg">
              <p className="text-[7px] font-black uppercase text-black/40 tracking-[0.2em] mb-2 leading-none text-center">Servicios Hoy</p>
              <p className="text-2xl font-black italic tracking-tighter leading-none text-center">08</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${mensajeroTab === 'mapa' ? 'p-0 pb-0' : 'bg-neutral-50 px-6 pt-2 pb-24'}`}>
        {mensajeroTab === 'dashboard' && (
          <div className="space-y-6 pt-2">
            {/* Wallet Panel in Dashboard */}
            <div className="bg-neutral-900 p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-4 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400 rounded-full blur-[60px] opacity-10"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                   <p className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] mb-1 leading-none">Saldo en Billetera</p>
                   <p className="text-2xl font-black italic tracking-tighter leading-none">$148.20</p>
                </div>
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                   <Wallet size={20} className="text-black" />
                </div>
              </div>
              <button 
                onClick={() => setMensajeroTab('billetera')}
                className="w-full bg-white/10 text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm relative z-10"
              >
                Gestionar Fondos
              </button>
            </div>

            {/* Service History in Dashboard */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">Historial de Servicios</h4>
                  <div className="h-[1px] flex-1 bg-neutral-200 ml-4"></div>
               </div>

               {[
                 { id: 1, type: 'Entrega Flash', amount: '+$4.50', status: 'Completado', time: 'Hace 20 min' },
                 { id: 2, type: 'Envío Express', amount: '+$3.20', status: 'Completado', time: 'Hace 1 hora' },
                 { id: 3, type: 'Mudanza Ligera', amount: '+$12.00', status: 'Completado', time: 'Hoy 10:30 AM' },
                 { id: 4, type: 'Entrega Médica', amount: '+$5.50', status: 'Completado', time: 'Ayer' },
               ].map((item) => (
                 <motion.div 
                   key={item.id}
                   whileHover={{ x: 5 }}
                   className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-neutral-50 rounded-xl flex items-center justify-center text-yellow-500">
                        <Truck size={14} />
                     </div>
                     <div>
                       <p className="text-[11px] font-black text-neutral-900">{item.type}</p>
                       <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-tighter">{item.time}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-black text-green-500 italic tracking-tight">{item.amount}</p>
                     <p className="text-[7px] text-neutral-300 font-black uppercase">{item.status}</p>
                   </div>
                 </motion.div>
               ))}
            </div>

            <button 
              onClick={() => setIsOnline(!isOnline)}
              className="w-full border-2 border-dashed border-neutral-200 py-8 rounded-[2.5rem] flex flex-col items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <Zap size={24} className="text-yellow-400" />
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">Ver nuevas solicitudes</p>
            </button>
          </div>
        )}

        {mensajeroTab === 'mapa' && (

          <div className="h-full w-full relative">
             <MapComponent 
              pickup={pickup}
              destination={destination}
              route={route}
             />
          </div>
        )}

        {mensajeroTab === 'billetera' && (
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic mb-2">Mi Billetera</h4>
            <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white flex flex-col gap-2 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 rounded-full blur-[80px] opacity-20"></div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none mb-2">Saldo Disponible</p>
                  <p className="text-4xl font-black italic tracking-tighter leading-none">$148.20</p>
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">Instrucciones de Recarga</p>
               <div className="bg-yellow-400 p-6 rounded-[2rem] text-black shadow-md flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Datos de Transferencia</p>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center border-b border-black/10 pb-2">
                      <span className="text-[9px] font-bold uppercase opacity-60">Cuenta CUP</span>
                      <span className="text-xs font-black tracking-tight">9204 1234 5678 9012</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase opacity-60">Teléfono Confirmación</span>
                      <span className="text-xs font-black tracking-tight">+53 5123 4567</span>
                    </div>
                  </div>
               </div>
               <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-3 px-2 italic leading-tight">
                 * Realiza la recarga vía Transfermóvil y luego completa el formulario.
               </p>

               <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic mt-6">Formulario de Solicitud</p>
               <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-widest ml-1">Monto Transferido (CUP)</label>
                    <input 
                      type="number" 
                      placeholder="Ej: 500" 
                      className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-widest ml-1">Número de Teléfono Emisor</label>
                    <input 
                      type="tel" 
                      placeholder="+53 5..." 
                      className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-widest ml-1">Captura de Transfermóvil</label>
                    <div className="border-2 border-dashed border-neutral-100 rounded-3xl p-8 flex flex-col items-center gap-3 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <MapPin size={18} className="text-neutral-300" />
                      </div>
                      <p className="text-[8px] font-black uppercase text-neutral-400 tracking-widest text-center">Adjuntar comprobante o arrastrar archivo</p>
                    </div>
                  </div>

                  <button className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-neutral-900 transition-all transform active:scale-95">
                    Solicitar Recarga
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav for Mensajero */}
      <div className="absolute bottom-3 left-4 right-4 z-30">
        <div className="bg-black/95 backdrop-blur-2xl p-1 rounded-[1.8rem] shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10">
          <button 
            onClick={() => setMensajeroTab('dashboard')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all ${
              mensajeroTab === 'dashboard' ? 'bg-yellow-400 text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'
            }`}
          >
             <LayoutDashboard size={14} fill={mensajeroTab === 'dashboard' ? "currentColor" : "none"} />
             <span className="text-[6px] font-black uppercase tracking-widest">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setMensajeroTab('mapa')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all ${
              mensajeroTab === 'mapa' ? 'bg-yellow-400 text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'
            }`}
          >
             <Map size={14} fill={mensajeroTab === 'mapa' ? "currentColor" : "none"} />
             <span className="text-[6px] font-black uppercase tracking-widest">Mapa</span>
          </button>

          <button 
            onClick={() => setMensajeroTab('billetera')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all ${
              mensajeroTab === 'billetera' ? 'bg-yellow-400 text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'
            }`}
          >
             <Wallet size={14} fill={mensajeroTab === 'billetera' ? "currentColor" : "none"} />
             <span className="text-[6px] font-black uppercase tracking-widest">Billetera</span>
          </button>

          <button 
            onClick={() => setView('profile')}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-white/40 hover:text-white transition-all"
          >
             <User size={14} />
             <span className="text-[6px] font-black uppercase tracking-widest">Perfil</span>
          </button>
        </div>
      </div>
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
            onClick={() => {
              setUserRole('client');
              setView('client_dashboard');
            }}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 mt-2 hover:bg-neutral-800 transition-colors"
          >
            <LogIn size={18} /> Entrar
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setUserRole('mensajero');
              setView('mensajero_dashboard');
            }}
            className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 mt-2 hover:bg-yellow-500 transition-colors"
          >
            <Car size={18} /> Entrar como Mensajero
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setUserRole('admin');
              setView('admin_dashboard');
            }}
            className="w-full bg-neutral-100 text-black py-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-2 hover:bg-neutral-200 transition-colors"
          >
            <LayoutGrid size={18} /> Módulo Administración
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
        
        {/* Brand Header - Minimal for App Feel - Hidden in Dashboards */}
        {(view !== 'client_dashboard' && view !== 'mensajero_dashboard' && view !== 'admin_dashboard') && (
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
        )}

        {/* Dynamic Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {view === 'login' && renderLoginForm()}
          {view === 'register_client' && renderRegisterClient()}
          {view === 'register_mensajero' && renderRegisterMensajero()}
          {view === 'client_dashboard' && renderClientDashboard()}
          {view === 'mensajero_dashboard' && renderMensajeroDashboard()}
          {view === 'profile' && renderProfile()}
          {view === 'admin_dashboard' && renderAdminDashboard()}
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
