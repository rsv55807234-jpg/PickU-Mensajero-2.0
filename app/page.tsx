'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

          {bookingStep !== 'home' && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setBookingStep('home')}
              className="bg-black text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold"
            >
              <ChevronLeft size={16} /> Cancelar
            </motion.button>
          )}
        </div>
      </div>

      {/* Simulated Interactive Map */}
      <div className="absolute inset-0 bg-neutral-200">
        <img 
          src="https://picsum.photos/seed/map/800/1200" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
          alt="Map Simulation"
        />
        {/* Map Markers */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-12 h-12 bg-black/20 rounded-full animate-ping absolute -inset-0"></div>
            <div className="bg-black p-3 rounded-2xl shadow-2xl relative">
              <MapPin size={24} className="text-yellow-400" />
            </div>
          </div>
        </div>
        
        {/* Simulated Nearby Vehicles */}
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-[40%] right-[30%] bg-white p-1.5 rounded-lg shadow-md border border-neutral-100"
        >
          <Car size={16} className="text-yellow-500" />
        </motion.div>
        <motion.div 
          animate={{ x: [0, -15, 0], y: [0, 25, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-[30%] left-[25%] bg-white p-1.5 rounded-lg shadow-md border border-neutral-100"
        >
          <Bike size={16} className="text-black" />
        </motion.div>
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
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl p-8 flex flex-col gap-6 z-30 min-h-[65%]"
          >
            {/* Native Handle Indicator */}
            <div className="w-12 h-1.5 bg-neutral-100 rounded-full mx-auto mb-2"></div>
            
            {/* Sheet Header with Back Button */}
            <div className="flex items-center justify-between -mt-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setBookingStep('home')}
                className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 rounded-2xl text-black hover:bg-neutral-100 transition-colors font-black text-[10px] uppercase tracking-[0.1em] border border-neutral-100 shadow-sm"
              >
                <ChevronLeft size={16} /> Regresar al Mapa
              </motion.button>
              <div className="bg-yellow-400/10 px-3 py-1 rounded-full">
                <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest italic">Paso 2 de 3</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <div className="relative pb-4 border-b border-neutral-100 mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 border-2 border-neutral-300 rounded-full"></div>
                  <input type="text" value="Ubicación Actual (GPS)" readOnly className="text-sm font-bold text-neutral-400 outline-none w-full bg-transparent" />
                </div>
                <div className="absolute left-[5px] top-6 bottom-4 w-0.5 bg-neutral-100"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                <input autoFocus type="text" placeholder="¿A dónde vas?" className="text-sm font-black text-neutral-900 outline-none w-full bg-transparent placeholder:text-neutral-300" />
              </div>
            </div>

            <div className="flex-1 space-y-2 mt-4 text-left">
              <h4 className="text-[10px] font-black uppercase text-neutral-300 tracking-[0.2em] mb-4">Selecciona Servicio</h4>
              
              {[
                { id: 'bici', name: 'Bicicleta', price: '$1.50', eta: '4 min', icon: <Bike size={18} />, color: 'text-green-500' },
                { id: 'moto', name: 'Moto', price: '$3.20', eta: '2 min', icon: <Zap size={18} />, color: 'text-yellow-500' },
                { id: 'triciclo', name: 'Triciclo', price: '$5.50', eta: '6 min', icon: <Truck size={18} />, color: 'text-blue-500' }
              ].map((service, i) => (
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
                    <p className="text-sm font-black text-neutral-900">{service.price}</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase underline">Detalles</p>
                  </div>
                </div>
              ))}
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
        
        {/* Brand Header - Compact for App Feel */}
        <div className="bg-yellow-400 px-8 pb-10 pt-16 rounded-b-[2.5rem] shadow-md relative overflow-hidden shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h1 className="text-4xl font-black italic tracking-tighter text-black flex items-center gap-1 leading-none">
              PickU<span className="w-2.5 h-2.5 bg-black rounded-full mt-2"></span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-black/10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-black">
                Mensajero & Fleet
              </div>
            </div>
          </motion.div>
          <Car size={140} className="absolute -right-8 -bottom-8 text-black/5 rotate-12" />
        </div>

        {/* Dynamic Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {view === 'login' && renderLoginForm()}
          {view === 'register_client' && renderRegisterClient()}
          {view === 'register_mensajero' && renderRegisterMensajero()}
          {view === 'client_dashboard' && renderClientDashboard()}
          {view === 'profile' && renderProfile()}
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
