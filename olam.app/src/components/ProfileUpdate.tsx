import { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Mail, Phone, User as UserIcon, MapPin, CheckCircle2, AlertCircle, Edit2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileUpdateProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

type ActiveField = 'email' | 'phone' | 'username' | 'address' | null;

export default function ProfileUpdate({ currentUser, onUpdateUser }: ProfileUpdateProps) {
  const [activeField, setActiveField] = useState<ActiveField>(null);
  
  // Field values
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [username, setUsername] = useState(currentUser.username);
  const [address, setAddress] = useState(currentUser.address);

  // Status message
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for focusing
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  // Automatically focus on the selected editable field
  useEffect(() => {
    if (activeField === 'email') emailRef.current?.focus();
    if (activeField === 'phone') phoneRef.current?.focus();
    if (activeField === 'username') usernameRef.current?.focus();
    if (activeField === 'address') addressRef.current?.focus();
  }, [activeField]);

  const handleSaveField = (field: 'email' | 'phone' | 'username' | 'address') => {
    setErrorMsg('');
    setSuccessMsg('');

    let updatedValue = '';
    if (field === 'email') updatedValue = email;
    if (field === 'phone') updatedValue = phone;
    if (field === 'username') updatedValue = username;
    if (field === 'address') updatedValue = address;

    if (!updatedValue || updatedValue.trim() === '') {
      setErrorMsg('El campo no puede estar vacío.');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      email: field === 'email' ? email : currentUser.email,
      phone: field === 'phone' ? phone : currentUser.phone,
      username: field === 'username' ? username : currentUser.username,
      address: field === 'address' ? address : currentUser.address,
    };

    onUpdateUser(updatedUser);
    setSuccessMsg(`¡${getFieldLabel(field)} actualizado con éxito!`);
    setActiveField(null);
  };

  const getFieldLabel = (field: 'email' | 'phone' | 'username' | 'address') => {
    if (field === 'email') return 'Correo electrónico';
    if (field === 'phone') return 'Número de celular';
    if (field === 'username') return 'Nombre de usuario';
    if (field === 'address') return 'Dirección de entrega';
    return '';
  };

  return (
    <div id="profile-update-container" className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Banner with avatar detail */}
        <div className="p-6 bg-gradient-to-r from-amber-500/20 to-slate-950 border-b border-slate-800 flex items-center space-x-4">
          <div className="h-16 w-16 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
            {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 id="profile-fullname" className="text-xl font-bold text-white tracking-tight">{currentUser.fullName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-400">CC Verificada: <span className="text-slate-300 font-mono font-semibold">{currentUser.ccNumber || '101456***'}</span></span>
            </div>
          </div>
        </div>

        {/* Action Panel to quickly go to the field to update (RF 5) */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-1">RF 5: Actualizar Datos de Perfil</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Selecciona el dato específico que deseas modificar. El sistema te llevará directamente a editar el campo indicado, bloqueando los cambios no deseados para tu seguridad.
            </p>
          </div>

          {/* Toast / Message Indicators */}
          {successMsg && (
            <div id="update-success-alert" className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div id="update-error-alert" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-center gap-2.5 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Jump / Editable fields */}
          <div id="editable-fields-stack" className="space-y-3.5">
            {/* 1. Nombre de Usuario */}
            <div className={`p-4 rounded-xl border transition-all ${activeField === 'username' ? 'bg-slate-950 border-amber-500' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span className="text-[11px] font-mono font-semibold text-slate-450 uppercase uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  Nombre de Usuario
                </span>
                {activeField !== 'username' && (
                  <button
                    id="edit-btn-username"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveField('username');
                    }}
                    className="pointer-events-auto text-[11px] font-bold text-amber-500 hover:text-amber-450 flex items-center gap-1 transition-all"
                  >
                    <Edit2 className="h-3 w-3" />
                    Modificar
                  </button>
                )}
              </div>

              {activeField === 'username' ? (
                <div className="flex gap-2 mt-2">
                  <input
                    id="input-username"
                    ref={usernameRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    id="save-username-btn"
                    onClick={() => handleSaveField('username')}
                    className="px-3 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    id="cancel-username-btn"
                    onClick={() => {
                      setUsername(currentUser.username);
                      setActiveField(null);
                    }}
                    className="px-2.5 bg-slate-800 hover:bg-slate-705 text-slate-350 text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p id="display-username" className="text-sm font-semibold text-white mt-1 pl-5">{currentUser.username}</p>
              )}
            </div>

            {/* 2. Correo Electrónico */}
            <div className={`p-4 rounded-xl border transition-all ${activeField === 'email' ? 'bg-slate-950 border-amber-500' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span className="text-[11px] font-mono font-semibold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Correo Electrónico
                </span>
                {activeField !== 'email' && (
                  <button
                    id="edit-btn-email"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveField('email');
                    }}
                    className="pointer-events-auto text-[11px] font-bold text-amber-500 hover:text-amber-450 flex items-center gap-1 transition-all"
                  >
                    <Edit2 className="h-3 w-3" />
                    Modificar
                  </button>
                )}
              </div>

              {activeField === 'email' ? (
                <div className="flex gap-2 mt-2">
                  <input
                    id="input-email"
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    id="save-email-btn"
                    onClick={() => handleSaveField('email')}
                    className="px-3 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    Guardar
                  </button>
                  <button
                    id="cancel-email-btn"
                    onClick={() => {
                      setEmail(currentUser.email);
                      setActiveField(null);
                    }}
                    className="px-2.5 bg-slate-800 hover:bg-slate-705 text-slate-350 text-xs rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p id="display-email" className="text-sm font-semibold text-white mt-1 pl-5">{currentUser.email}</p>
              )}
            </div>

            {/* 3. Número de Celular */}
            <div className={`p-4 rounded-xl border transition-all ${activeField === 'phone' ? 'bg-slate-950 border-amber-500' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span className="text-[11px] font-mono font-semibold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-500" />
                  Número Celular
                </span>
                {activeField !== 'phone' && (
                  <button
                    id="edit-btn-phone"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveField('phone');
                    }}
                    className="pointer-events-auto text-[11px] font-bold text-amber-500 hover:text-amber-450 flex items-center gap-1 transition-all"
                  >
                    <Edit2 className="h-3 w-3" />
                    Modificar
                  </button>
                )}
              </div>

              {activeField === 'phone' ? (
                <div className="flex gap-2 mt-2">
                  <input
                    id="input-phone"
                    ref={phoneRef}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    id="save-phone-btn"
                    onClick={() => handleSaveField('phone')}
                    className="px-3 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    Guardar
                  </button>
                  <button
                    id="cancel-phone-btn"
                    onClick={() => {
                      setPhone(currentUser.phone);
                      setActiveField(null);
                    }}
                    className="px-2.5 bg-slate-800 hover:bg-slate-705 text-slate-350 text-xs rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p id="display-phone" className="text-sm font-semibold text-white mt-1 pl-5">{currentUser.phone}</p>
              )}
            </div>

            {/* 4. Dirección */}
            <div className={`p-4 rounded-xl border transition-all ${activeField === 'address' ? 'bg-slate-950 border-amber-500' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span className="text-[11px] font-mono font-semibold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Dirección de Entrega
                </span>
                {activeField !== 'address' && (
                  <button
                    id="edit-btn-address"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveField('address');
                    }}
                    className="pointer-events-auto text-[11px] font-bold text-amber-500 hover:text-amber-450 flex items-center gap-1 transition-all"
                  >
                    <Edit2 className="h-3 w-3" />
                    Modificar
                  </button>
                )}
              </div>

              {activeField === 'address' ? (
                <div className="flex gap-2 mt-2">
                  <input
                    id="input-address"
                    ref={addressRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    id="save-address-btn"
                    onClick={() => handleSaveField('address')}
                    className="px-3 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    Guardar
                  </button>
                  <button
                    id="cancel-address-btn"
                    onClick={() => {
                      setAddress(currentUser.address);
                      setActiveField(null);
                    }}
                    className="px-2.5 bg-slate-800 hover:bg-slate-705 text-slate-350 text-xs rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p id="display-address" className="text-sm font-semibold text-white mt-1 pl-5">{currentUser.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
