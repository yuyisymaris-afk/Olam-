import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Camera, Upload, AlertCircle, CheckCircle2, Lock, Mail, Phone, User as UserIcon, MapPin, Eye, EyeOff, Loader2, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  registeredUsers: User[];
  onRegisterUser: (user: User) => void;
}

type AuthTab = 'login' | 'register' | 'forgot-password';

export default function Auth({ onAuthSuccess, registeredUsers, onRegisterUser }: AuthProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regStep, setRegStep] = useState<1 | 2>(1); // 1 = Info, 2 = CC Photo Verification
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Age Verification State (Step 2)
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [ccNumber, setCcNumber] = useState('');
  const [photoMode, setPhotoMode] = useState<'camera' | 'upload' | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ verified: boolean; age: number; reason?: string } | null>(null);
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Forgot Password State
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotValue, setForgotValue] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1 = input, 2 = verification code, 3 = reset password
  const [sentCode, setSentCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveredUser, setRecoveredUser] = useState<User | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setPhotoMode('camera');
      setCapturedImage(null);
      setScanResult(null);
      setRegError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCapturing(true);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      // Fallback
      setPhotoMode('upload');
      setRegError('No pudimos acceder a tu cámara. Por favor sube una foto de tu cédula.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Draw document guideline overlay on thumbnail too
        context.strokeStyle = '#f59e0b';
        context.lineWidth = 4;
        context.strokeRect(video.videoWidth * 0.1, video.videoHeight * 0.2, video.videoWidth * 0.8, video.videoHeight * 0.6);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        analyzeDocument(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        analyzeDocument(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeDocument = (imageData: string) => {
    setScanning(true);
    setScanResult(null);
    setRegError('');

    // Simulate AI / OCR Document scanning
    setTimeout(() => {
      setScanning(false);
      
      // Calculate age from birthDate input
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      const isOfAge = age >= 18;
      
      if (!isOfAge) {
        setScanResult({
          verified: false,
          age,
          reason: `Edad insuficiente: El sistema detecta que tienes ${age} años. Debes ser mayor de 18 años para registrarte.`
        });
      } else if (!ccNumber || ccNumber.trim().length < 6) {
        setScanResult({
          verified: false,
          age,
          reason: 'El número de cédula ingresado no es válido.'
        });
      } else {
        setScanResult({
          verified: true,
          age
        });
      }
    }, 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername || !loginPassword) {
      setLoginError('Por favor diligencie todos los campos.');
      return;
    }

    const user = registeredUsers.find(
      (u) => u.username.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword
    );

    if (user) {
      onAuthSuccess(user);
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUsername || !regFullName || !regEmail || !regPhone || !regAddress || !regPassword) {
      setRegError('Por favor diligencie todos los campos requeridos.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }

    // Check if user already exists
    const exists = registeredUsers.some(
      (u) => u.username.toLowerCase() === regUsername.toLowerCase() || u.email.toLowerCase() === regEmail.toLowerCase()
    );

    if (exists) {
      setRegError('El nombre de usuario o correo ya se encuentra registrado.');
      return;
    }

    // If passed validation, move to verification step 2
    setRegStep(2);
  };

  const handleFinalRegister = () => {
    if (!scanResult || !scanResult.verified) {
      setRegError('Debes completar una verificación de mayoría de edad válida.');
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: regUsername,
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      address: regAddress,
      password: regPassword,
      isAgeVerified: true,
      ccNumber: ccNumber,
      birthDate: birthDate,
      ccPhotoUrl: capturedImage || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200'
    };

    onRegisterUser(newUser);
    onAuthSuccess(newUser);
  };

  // Password Recovery Flow
  const handleRequestRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!forgotValue) {
      setRecoveryError('Ingrese su identificador (correo o número).');
      return;
    }

    // Attempt to locate user
    const user = registeredUsers.find((u) => {
      if (forgotMethod === 'email') {
        return u.email.toLowerCase() === forgotValue.toLowerCase();
      } else {
        return u.phone === forgotValue;
      }
    });

    if (!user) {
      setRecoveryError('No encontramos ninguna cuenta asociada a estos datos.');
      return;
    }

    // Found user
    setRecoveredUser(user);
    // Simulate generation of code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    alert(`[Simulación de envío] Se ha enviado el código de verificación de 6 dígitos: ${code}`);
    setForgotStep(2);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (enteredCode === sentCode) {
      setForgotStep(3);
    } else {
      setRecoveryError('Código incorrecto. Intente de nuevo.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!newPassword || newPassword.length < 4) {
      setRecoveryError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('Las contraseñas no coinciden.');
      return;
    }

    if (recoveredUser) {
      // Update user password in local registry
      const updatedUser = { ...recoveredUser, password: newPassword };
      onRegisterUser(updatedUser); // This updates or overwrites users
      
      alert('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
      setActiveTab('login');
      // Reset state
      setForgotStep(1);
      setForgotValue('');
      setEnteredCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setRecoveredUser(null);
    }
  };

  return (
    <div id="auth-container" className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Tab Selector */}
        {forgotStep === 1 && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              id="tab-login"
              onClick={() => {
                setActiveTab('login');
                setRegStep(1);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              id="tab-register"
              onClick={() => {
                setActiveTab('register');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Nuevo Cliente
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'login' && forgotStep === 1 && (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">¡Bienvenido de nuevo!</h2>
                <p className="text-xs text-slate-400">Ingresa tus credenciales para acceder a tu menú preferido.</p>
              </div>

              {loginError && (
                <div id="login-error" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Nombre de Usuario
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      id="login-username-input"
                      type="text"
                      placeholder="ej. carlos_chef"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <button
                      id="forgot-password-link"
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot-password');
                        setForgotStep(1);
                        setRecoveryError('');
                      }}
                      className="text-[10px] text-amber-500 hover:text-amber-450 font-bold transition-colors"
                    >
                      ¿La olvidaste?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-10 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                    />
                    <button
                      id="toggle-login-password"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-350"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="w-full mt-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-450 active:bg-amber-600 shadow-lg shadow-amber-500/10 transition-all"
              >
                Ingresar al Sistema
              </button>
            </motion.form>
          )}

          {activeTab === 'register' && regStep === 1 && (
            <motion.form
              key="register-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleRegisterStep1}
              className="space-y-3.5"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Registro de Cuenta</h2>
                <p className="text-xs text-slate-400">Paso 1 de 2: Información personal básica.</p>
              </div>

              {regError && (
                <div id="reg-error-1" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      id="reg-fullname"
                      type="text"
                      placeholder="Juan Pérez Gómez"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Usuario
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    placeholder="juanperez"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Celular
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="3101234567"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="juan@correo.com"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Dirección de Entrega
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    id="reg-address"
                    type="text"
                    placeholder="Calle 100 #24-12, Bogotá"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Contraseña
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Confirmar
                  </label>
                  <input
                    id="reg-password-confirm"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                id="reg-submit-1"
                type="submit"
                className="w-full mt-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-450 active:bg-amber-600 shadow-md flex items-center justify-center space-x-1"
              >
                <span>Siguiente Paso: Verificar Edad</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </motion.form>
          )}

          {activeTab === 'register' && regStep === 2 && (
            <motion.div
              key="register-verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 id="verificacion-titulo" className="text-xl font-bold text-white mb-1 tracking-tight">Verificación de CC</h2>
                <p className="text-xs text-slate-400">
                  RF 2: Validar de mayoría de edad obligatoria mediante captura fotográfica de tu documento de identidad colombiano (Cédula de Ciudadanía).
                </p>
              </div>

              {regError && (
                <div id="reg-error-2" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Identity Form fields to support scanner evaluation */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[9px] font-mono font-medium text-slate-450 uppercase tracking-wider mb-1">
                    Número de Cédula (CC)
                  </label>
                  <input
                    id="cc-number-input"
                    type="text"
                    required
                    placeholder="1014561234"
                    value={ccNumber}
                    onChange={(e) => setCcNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-medium text-slate-450 uppercase tracking-wider mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    id="birthdate-input"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-2 py-1.5 text-xs rounded-lg focus:outline-none focus:border-amber-500 focus:text-white"
                  />
                </div>
              </div>

              {/* Selection to start capturing */}
              {!isCapturing && !capturedImage && (
                <div className="flex flex-col gap-2.5">
                  <button
                    id="btn-use-camera"
                    onClick={startCamera}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between text-left group transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Tomar foto con cámara</p>
                        <p className="text-[10px] text-slate-400">Requerido para validación instantánea</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                  </button>

                  <div className="relative flex items-center justify-center my-1">
                    <span className="absolute bg-slate-900 px-3 text-[10px] font-mono font-medium text-slate-550 uppercase tracking-widest">O sube un archivo</span>
                    <div className="w-full border-t border-slate-800/80" />
                  </div>

                  <div className="relative">
                    <input
                      id="cc-upload-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="p-4 border border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl text-center flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5 text-slate-400 mb-1" />
                      <p className="text-xs font-semibold text-slate-300">Seleccionar imagen desde tu dispositivo</p>
                      <p className="text-[10px] text-slate-500">Soporta PNG, JPG o PDF de tu Cédula</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Live Stream */}
              {isCapturing && (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-black aspect-video flex flex-col justify-end">
                  <video
                    id="video-stream"
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Guideline rectangle for document */}
                  <div className="absolute inset-10 border-2 border-dashed border-amber-500/50 rounded-lg pointer-events-none flex items-center justify-center bg-amber-500/[0.02]">
                    <span className="text-[9px] font-mono text-amber-500 bg-slate-950/80 px-2 py-0.5 rounded uppercase tracking-wider">
                      Ubica el documento aquí
                    </span>
                  </div>

                  <div className="relative z-10 flex p-3 bg-slate-950/90 gap-2 font-sans">
                    <button
                      id="btn-capture-snapshot"
                      onClick={capturePhoto}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow"
                    >
                      Capturar Foto
                    </button>
                    <button
                      id="btn-cancel-capture"
                      onClick={stopCamera}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Document Scanning effect */}
              {scanning && (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-4 relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                    {capturedImage && (
                      <img
                        src={capturedImage}
                        alt="CC Document Analysis"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-30 blur-[1px]"
                      />
                    )}
                  </div>
                  {/* Laser bar animation */}
                  <div className="absolute left-0 right-0 h-1 bg-amber-500 shadow-md shadow-amber-500/50 animate-[bounce_2s_infinite]" />
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white tracking-wide">Analizando Cédula de Ciudadanía...</p>
                    <p className="text-[10px] text-slate-400 font-mono">OCR Engine: Extrayendo marcas de agua y fecha de nacimiento</p>
                  </div>
                </div>
              )}

              {/* Capture Result & Validation Evaluation */}
              {capturedImage && !scanning && (
                <div className="space-y-3.5">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src={capturedImage}
                      alt="Cédula Capturada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                      <span className="text-[9.5px] font-mono text-slate-300 font-semibold">Foto cargada</span>
                      <button
                        id="btn-retry-photo"
                        onClick={() => {
                          setCapturedImage(null);
                          setScanResult(null);
                          setRegError('');
                        }}
                        className="text-amber-500 hover:text-amber-400"
                        title="Tomar otra foto"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {scanResult && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-4 rounded-xl border ${
                        scanResult.verified
                          ? 'bg-emerald-500/10 border-emerald-550 text-slate-300'
                          : 'bg-rose-500/10 border-rose-550 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 font-sans">
                        {scanResult.verified ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-extrabold text-white">
                            {scanResult.verified ? 'Veridad de Mayoría Confirmada' : 'No se pudo verificar la mayoría de edad'}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                            CC: <span className="text-white font-sans font-bold">{ccNumber}</span> | Edad calculada:{' '}
                            <span className="text-white font-sans font-bold">{scanResult.age} años</span>
                          </p>
                          {!scanResult.verified && (
                            <p className="text-[11px] text-rose-400 mt-1.5 leading-relaxed font-sans font-medium">
                              {scanResult.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      id="btn-verification-back"
                      onClick={() => setRegStep(1)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-750 font-sans transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      id="btn-finish-registration"
                      onClick={handleFinalRegister}
                      disabled={!scanResult || !scanResult.verified}
                      className="flex-1 py-2 bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold rounded-xl hover:bg-amber-450 tracking-wide font-sans shadow-md"
                    >
                      Completar Registro
                    </button>
                  </div>
                </div>
              )}

              {/* Utility to easily generate positive outcome for developer test */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
                <span className="text-[9px] font-mono text-slate-450 uppercase tracking-widest block mb-1">
                  💡 Simulador de Validación de CC (Mayor de Edad)
                </span>
                <p className="text-[10px] text-slate-400 mb-2">
                  Coloca tu cédula de prueba. Ajusta la fecha de nacimiento para verificar el comportamiento de mayoría de edad.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    id="simulate-verified-btn"
                    onClick={() => {
                      setCcNumber('1014908123');
                      setBirthDate('1998-05-15');
                      setCapturedImage('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300');
                      // Wait a brief animation to represent scanning
                      setScanning(true);
                      setTimeout(() => {
                        setScanning(false);
                        setScanResult({ verified: true, age: 28 });
                      }, 1000);
                    }}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold"
                  >
                    Simular CC Mayor de Edad (OK)
                  </button>
                  <button
                    id="simulate-rejected-btn"
                    onClick={() => {
                      setCcNumber('1023456789');
                      setBirthDate('2012-08-20');
                      setCapturedImage('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300');
                      setScanning(true);
                      setTimeout(() => {
                        setScanning(false);
                        setScanResult({ verified: false, age: 13, reason: 'Edad insuficiente: Tienes 13 años. El sistema prohíbe el registro de menores de edad.' });
                      }, 1000);
                    }}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 rounded text-[9px] font-bold"
                  >
                    Simular CC Menor de Edad
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'forgot-password' && (
            <motion.div
              key="forgot-password-flow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4 font-sans"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Recuperar Contraseña</h2>
                <p className="text-xs text-slate-400">
                  RF 4: Opción de restablecer tu acceso mediante tu Correo o Número Celular.
                </p>
              </div>

              {recoveryError && (
                <div id="recovery-error" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-mono font-medium text-slate-450 uppercase tracking-wider mb-2">
                      Método de envío
                    </span>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        id="recover-select-email"
                        type="button"
                        onClick={() => {
                          setForgotMethod('email');
                          setForgotValue('');
                        }}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          forgotMethod === 'email' ? 'bg-slate-800 text-amber-500 shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        Correo Electrónico
                      </button>
                      <button
                        id="recover-select-phone"
                        type="button"
                        onClick={() => {
                          setForgotMethod('phone');
                          setForgotValue('');
                        }}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          forgotMethod === 'phone' ? 'bg-slate-800 text-amber-500 shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        Celular Registrado
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                      {forgotMethod === 'email' ? 'Tu Correo de Cuenta' : 'Número Celular de Cuenta'}
                    </label>
                    <div className="relative">
                      {forgotMethod === 'email' ? (
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      ) : (
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      )}
                      <input
                        id="recovery-identifier-input"
                        type={forgotMethod === 'email' ? 'email' : 'tel'}
                        placeholder={forgotMethod === 'email' ? 'ej. carlos@correo.com' : 'ej. 3123456789'}
                        required
                        value={forgotValue}
                        onChange={(e) => setForgotValue(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      id="btn-recover-back-login"
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setForgotStep(1);
                        setRecoveryError('');
                      }}
                      className="flex-1 py-2 bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Volver
                    </button>
                    <button
                      id="btn-recover-send"
                      type="submit"
                      className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl hover:bg-amber-450 active:bg-amber-650 transition-all shadow-md"
                    >
                      Enviar Código
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs flex gap-2">
                    <KeyRound className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
                    <div>
                      <p className="font-bold">Código Enviado</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hemos despachado un código de 6 dígitos a tu {forgotMethod === 'email' ? 'correo' : 'móvil'}{' '}
                        <span className="text-white font-mono">{forgotValue}</span>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                      Ingresa Código de Verificación
                    </label>
                    <input
                      id="recovery-code-input"
                      type="text"
                      placeholder="XXXXXX"
                      maxLength={6}
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white py-2 text-center text-lg font-bold font-mono tracking-widest rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      id="btn-code-back"
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Reenviar
                    </button>
                    <button
                      id="btn-code-submit"
                      type="submit"
                      className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl hover:bg-amber-450"
                    >
                      Validar Código
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <p>Identidad Verificada. Ingresa tu nueva contraseña para continuar.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Nueva Contraseña
                      </label>
                      <input
                        id="new-password-input"
                        type="password"
                        placeholder="Mínimo 4 caracteres"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        id="confirm-new-password-input"
                        type="password"
                        placeholder="Repite la contraseña"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-reset-password-submit"
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl hover:bg-amber-450"
                  >
                    Restablecer e Ingresar
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Developer Help Tip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono">
          <span>Usuarios demos en sistema: cocinero_delicia / admin123 </span>
        </div>
      </div>
    </div>
  );
}
