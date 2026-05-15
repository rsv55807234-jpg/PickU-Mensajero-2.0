'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, ChevronRight, UserPlus, LogIn, ShieldCheck, MapPin, Bike, User, Phone, Mail, Lock, ChevronLeft, Zap, Truck } from 'lucide-react';
import Link from 'next/link';

type ViewState = 'login' | 'register_client' | 'register_mensajero';

export default function PickUMensajeroApp() {
  const [view, setView] = useState<ViewState>('login');
  const [vehicle, setVehicle] = useState<string | null>(null);

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
