'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Target,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  Briefcase,
  Rocket,
  Sun,
  Printer,
  Edit3,
  RotateCcw,
  Sparkles,
  Award,
  Check
} from 'lucide-react';

export default function MapaCapital() {
  // Identification State
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [perfil, setPerfil] = useState('Trader');
  const [currency, setCurrency] = useState('USD');

  // Paso 1: Brecha
  const [necesidadHogar, setNecesidadHogar] = useState('');
  const [ingresoNoDep, setIngresoNoDep] = useState('');

  // Paso 2: Las 4 Zonas de Capital
  const [zonaSeguridad, setZonaSeguridad] = useState('');
  const [zonaObjetivos, setZonaObjetivos] = useState('');
  const [zonaAprendizaje, setZonaAprendizaje] = useState('');
  const [zonaOperacion, setZonaOperacion] = useState('');

  // Paso 3: Validación (Licencia de Protección)
  const [checkNoDeuda, setCheckNoDeuda] = useState(false);
  const [checkNoFamilia, setCheckNoFamilia] = useState(false);
  const [checkSimulacion, setCheckSimulacion] = useState(false);

  // Paso 4: Fuga y Regla
  const [fugaPersonal, setFugaPersonal] = useState('');
  const [reglaPersonal, setReglaPersonal] = useState('');

  // View State: 'form' | 'summary'
  const [viewMode, setViewMode] = useState('form');

  // Helpers
  const formatNumberWithCommas = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  const cleanNumericInput = (val) => {
    if (!val) return '';
    return val.replace(/[^0-9]/g, '');
  };

  const formatCurrency = (val, curr = 'USD') => {
    const num = parseFloat(val) || 0;
    return `$${num.toLocaleString('en-US')} ${curr}`;
  };

  // Calculations
  const numNecesidad = parseFloat(necesidadHogar) || 0;
  const numIngresoNoDep = parseFloat(ingresoNoDep) || 0;

  const brechaMensual = useMemo(() => {
    return Math.max(0, numNecesidad - numIngresoNoDep);
  }, [numNecesidad, numIngresoNoDep]);

  const ratioCobertura = useMemo(() => {
    if (numNecesidad <= 0) return numIngresoNoDep > 0 ? 100 : 0;
    return (numIngresoNoDep / numNecesidad) * 100;
  }, [numNecesidad, numIngresoNoDep]);

  const diagnostico = useMemo(() => {
    if (numNecesidad <= 0 && numIngresoNoDep <= 0) {
      return {
        tipo: 'PENDIENTE',
        label: 'PENDIENTE DE DATOS',
        colorBadge: 'bg-slate-800 text-slate-400 border-slate-700',
        colorCard: 'border-slate-800 bg-slate-900/40',
        titulo: 'Ingresa tus números para diagnosticar',
        mensaje: 'Completa los montos de necesidad mensual y fuentes de ingreso no dependiente para calcular tu brecha de tranquilidad.'
      };
    }

    if (brechaMensual <= 0 && numNecesidad > 0) {
      return {
        tipo: 'CUBIERTA',
        label: 'CUBIERTA (100%+)',
        colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        colorCard: 'border-emerald-500/30 bg-emerald-950/20',
        titulo: 'Tranquilidad Total — Emancipación Operativa',
        mensaje: 'Tus ingresos no dependientes cubren por completo los gastos fundamentales de tu hogar. Cuentas con la máxima solidez psicológica para tomar decisiones en el mercado sin prisa ni necesidad.'
      };
    }

    if (ratioCobertura >= 60) {
      return {
        tipo: 'BAJA',
        label: 'BRECHA BAJA',
        colorBadge: 'bg-lime-500/20 text-lime-300 border-lime-500/50',
        colorCard: 'border-lime-500/30 bg-lime-950/20',
        titulo: 'Margen Favorable — Cobertura Superior al 60%',
        mensaje: 'Cuentas con un colchón de protección muy respetable. Más del 60% de tu costo de vida digno está asegurado sin depender de tus horas diarias de trabajo activo.'
      };
    }

    if (ratioCobertura >= 20 && ratioCobertura < 60) {
      return {
        tipo: 'MEDIA',
        label: 'BRECHA MEDIA',
        colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        colorCard: 'border-amber-500/30 bg-amber-950/20',
        titulo: 'Transición Activa — Cobertura entre 20% y 60%',
        mensaje: 'Cubres una porción de tus costos vitales, pero una interrupción en tus ingresos laborales comprometería la estabilidad del hogar. Requiere máxima disciplina para no arriesgar este patrimonio.'
      };
    }

    return {
      tipo: 'ALTA',
      label: 'BRECHA ALTA',
      colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      colorCard: 'border-rose-500/30 bg-rose-950/20',
      titulo: 'Alerta de Vulnerabilidad — Menos del 20% Cubierto',
      mensaje: 'Dependencia crítica del 80%+ de tu tiempo y trabajo presente. La urgencia económica en el trading es letal: el mercado huele la necesidad de pagar cuentas y castiga la desesperación.'
    };
  }, [brechaMensual, ratioCobertura, numNecesidad, numIngresoNoDep]);

  // Paso 2: Zonas
  const numZona1 = parseFloat(zonaSeguridad) || 0;
  const numZona2 = parseFloat(zonaObjetivos) || 0;
  const numZona3 = parseFloat(zonaAprendizaje) || 0;
  const numZona4 = parseFloat(zonaOperacion) || 0;

  const capitalTotal = useMemo(() => {
    return numZona1 + numZona2 + numZona3 + numZona4;
  }, [numZona1, numZona2, numZona3, numZona4]);

  const pctZona1 = capitalTotal > 0 ? (numZona1 / capitalTotal) * 100 : 0;
  const pctZona2 = capitalTotal > 0 ? (numZona2 / capitalTotal) * 100 : 0;
  const pctZona3 = capitalTotal > 0 ? (numZona3 / capitalTotal) * 100 : 0;
  const pctZona4 = capitalTotal > 0 ? (numZona4 / capitalTotal) * 100 : 0;

  const showWarningZonaSeguridad = numZona4 > 0 && numZona1 <= 0;
  const allCheckboxesChecked = checkNoDeuda && checkNoFamilia && checkSimulacion;

  const handleGenerateMap = (e) => {
    e.preventDefault();
    if (!allCheckboxesChecked) {
      alert('Debes validar y marcar las 3 casillas de la Licencia de Protección antes de continuar.');
      return;
    }
    if (!nombre.trim()) {
      alert('Por favor ingresa tu nombre para personalizar tu Mapa de Capital.');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewMode('summary');
  };

  const handleResetForm = () => {
    if (window.confirm('¿Deseas reiniciar la calculadora y limpiar los datos ingresados?')) {
      setNombre('');
      setFecha(new Date().toISOString().split('T')[0]);
      setPerfil('Trader');
      setNecesidadHogar('');
      setIngresoNoDep('');
      setZonaSeguridad('');
      setZonaObjetivos('');
      setZonaAprendizaje('');
      setZonaOperacion('');
      setCheckNoDeuda(false);
      setCheckNoFamilia(false);
      setCheckSimulacion(false);
      setFugaPersonal('');
      setReglaPersonal('');
      setViewMode('form');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#070a0f]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black tracking-widest text-emerald-400 uppercase">
              EL OTRO 10%
            </span>
            <span className="text-xs text-slate-400 border-l border-slate-700 pl-3 hidden sm:inline">
              Mapa de Capital
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Privado (Client-Side)</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              {['USD', 'MXN', 'COP'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    currency === curr ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {viewMode === 'summary' && (
              <button
                onClick={() => setViewMode('form')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {viewMode === 'form' ? (
          <form onSubmit={handleGenerateMap} className="space-y-10">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnóstico Financiero Personal
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                EL OTRO 10% — <span className="text-emerald-400">Mapa de Capital</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                La mayoría de personas pierde dinero en el trading no por falta de técnica, sino por operar con dinero que su mente no puede permitirse perder. Estructura tus zonas y valida tu licencia.
              </p>
            </div>

            {/* Identificación */}
            <section className="bg-[#111823] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Identificación del Inversor</h2>
                  <p className="text-xs text-slate-400">Define los datos de referencia para tu sesión.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full px-4 py-3 bg-[#162232] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Fecha del Diagnóstico
                  </label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-4 py-3 bg-[#162232] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Perfil Radio Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Perfil Profesional / Financiero
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'Empleado', label: 'Empleado', desc: 'Ingresos estables por salario o nómina.', icon: Briefcase },
                    { id: 'Emprendedor', label: 'Emprendedor', desc: 'Flujos variables de negocio propio.', icon: Rocket },
                    { id: 'Trader', label: 'Trader', desc: 'Operación activa en mercados financieros.', icon: TrendingUp },
                    { id: 'Jubilación', label: 'Jubilación', desc: 'Preservación de patrimonio y rentas.', icon: Sun }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = perfil === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setPerfil(item.id)}
                        className={`cursor-pointer rounded-xl p-4 border transition-all ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                            : 'bg-[#162232]/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                          </div>
                        </div>
                        <h4 className="font-bold text-sm text-white">{item.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Paso 1: Brecha */}
            <section className="bg-[#111823] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-lg">
                  01
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Paso 1: Brecha Mensual de Tranquilidad</h2>
                  <p className="text-xs text-slate-400">Compara los gastos indispensables con ingresos que no exigen tu tiempo directo.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#162232]/60 p-5 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">
                    A. Necesidad mensual del hogar
                  </label>
                  <p className="text-xs text-slate-400 mb-3">Gastos fundamentales para vivir con dignidad (techo, comida, salud, compromisos básicos).</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithCommas(necesidadHogar)}
                      onChange={(e) => setNecesidadHogar(cleanNumericInput(e.target.value))}
                      placeholder="Ej. 2,500"
                      className="w-full pl-9 pr-14 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:border-cyan-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{currency}</span>
                  </div>
                </div>

                <div className="bg-[#162232]/60 p-5 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">
                    B. Ingreso no dependiente del trabajo
                  </label>
                  <p className="text-xs text-slate-400 mb-3">Recursos recurrentes que no exigen tu tiempo directo (rentas, dividendos, negocios delegados).</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithCommas(ingresoNoDep)}
                      onChange={(e) => setIngresoNoDep(cleanNumericInput(e.target.value))}
                      placeholder="Ej. 800"
                      className="w-full pl-9 pr-14 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:border-emerald-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{currency}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Diagnostic Card */}
              <div className={`p-5 rounded-xl border transition-all ${diagnostico.colorCard}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Brecha Mensual Calculada (A - B)</span>
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">{formatCurrency(brechaMensual, currency)}</span>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[11px] text-slate-400 mb-1">Diagnóstico Dinámico</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${diagnostico.colorBadge}`}>
                      {diagnostico.label}
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">{diagnostico.titulo}</strong>
                  {diagnostico.mensaje}
                </div>
              </div>
            </section>

            {/* Paso 2: 4 Zonas */}
            <section className="bg-[#111823] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-lg">
                  02
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Paso 2: El Mapa de Capital (Las 4 Zonas)</h2>
                  <p className="text-xs text-slate-400">Distribución patrimonial para que ninguna pérdida afecte tu bienestar familiar.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Zona 1 */}
                <div className="bg-[#162232]/70 p-5 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold text-sm block mb-1">Zona 1: Seguridad (Protección)</span>
                  <p className="text-xs text-slate-400 mb-3">Emergencias y estabilidad (3 a 6 meses de gastos del hogar).</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithCommas(zonaSeguridad)}
                      onChange={(e) => setZonaSeguridad(cleanNumericInput(e.target.value))}
                      placeholder="Ej. 10,000"
                      className="w-full pl-9 pr-14 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:border-emerald-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{currency}</span>
                  </div>
                </div>

                {/* Zona 2 */}
                <div className="bg-[#162232]/70 p-5 rounded-xl border border-sky-500/30">
                  <span className="text-sky-400 font-bold text-sm block mb-1">Zona 2: Objetivos</span>
                  <p className="text-xs text-slate-400 mb-3">Vivienda, educación, proyectos familiares.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithCommas(zonaObjetivos)}
                      onChange={(e) => setZonaObjetivos(cleanNumericInput(e.target.value))}
                      placeholder="Ej. 15,000"
                      className="w-full pl-9 pr-14 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:border-sky-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{currency}</span>
                  </div>
                </div>

                {/* Zona 3 */}
                <div className="bg-[#162232]/70 p-5 rounded-xl border border-purple-500/30">
                  <span className="text-purple-400 font-bold text-sm block mb-1">Zona 3: Aprendizaje</span>
                  <p className="text-xs text-slate-400 mb-3">Desarrollo de capacidades, cursos, mentoría, software.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithCommas(zonaAprendizaje)}
                      onChange={(e) => setZonaAprendizaje(cleanNumericInput(e.target.value))}
                      placeholder="Ej. 2,000"
                      className="w-full pl-9 pr-14 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:border-purple-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{currency}</span>
                  </div>
                </div>

                {/* Zona 4 */}
                <div className="bg-[#162232]/70 p-5 rounded-xl border border-amber-500/30">
                  <span className="text-amber-400 font-bold text-sm block mb-1">Zona 4: Operación (Capital Entrenable)</span>
                  <p className="text-xs text-slate-400 mb-3">Riesgo controlado en broker para ejecutar el método con disciplina.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithCommas(zonaOperacion)}
                      onChange={(e) => setZonaOperacion(cleanNumericInput(e.target.value))}
                      placeholder="Ej. 3,000"
                      className="w-full pl-9 pr-14 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base font-semibold focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{currency}</span>
                  </div>
                </div>
              </div>

              {/* Validation Warning */}
              {showWarningZonaSeguridad && (
                <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong>⚠️ Alerta de Prioridad:</strong> Es altamente recomendable tener fondos en tu Zona de Seguridad antes de asignar capital operable.
                  </div>
                </div>
              )}

              {/* Progress Flexbox Bar */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase">Distribución Porcentual</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">Total: {formatCurrency(capitalTotal, currency)}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-xl h-4 p-0.5 flex overflow-hidden border border-slate-800 gap-1 mb-4">
                  {capitalTotal > 0 ? (
                    <>
                      {numZona1 > 0 && <div style={{ width: `${pctZona1}%` }} className="h-full bg-emerald-500 rounded-sm"></div>}
                      {numZona2 > 0 && <div style={{ width: `${pctZona2}%` }} className="h-full bg-sky-500 rounded-sm"></div>}
                      {numZona3 > 0 && <div style={{ width: `${pctZona3}%` }} className="h-full bg-purple-500 rounded-sm"></div>}
                      {numZona4 > 0 && <div style={{ width: `${pctZona4}%` }} className="h-full bg-amber-500 rounded-sm"></div>}
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-800 rounded"></div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-slate-400 block text-[10px]">Zona 1</span><span className="font-bold text-emerald-400">{pctZona1.toFixed(1)}%</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Zona 2</span><span className="font-bold text-sky-400">{pctZona2.toFixed(1)}%</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Zona 3</span><span className="font-bold text-purple-400">{pctZona3.toFixed(1)}%</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Zona 4</span><span className="font-bold text-amber-400">{pctZona4.toFixed(1)}%</span></div>
                </div>
              </div>
            </section>

            {/* Paso 3: Licencia */}
            <section className="bg-[#111823] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                  03
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Paso 3: Validación del Capital Operable (Licencia de Protección)</h2>
                  <p className="text-xs text-slate-400">Tres afirmaciones innegociables para activar tu autorización financiera.</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { state: checkNoDeuda, setter: setCheckNoDeuda, text: '1. Este capital NO proviene de deuda.' },
                  { state: checkNoFamilia, setter: setCheckNoFamilia, text: '2. Perder una parte de este capital NO altera la estabilidad de mi familia.' },
                  { state: checkSimulacion, setter: setCheckSimulacion, text: '3. Antes de utilizarlo, debo demostrar que puedo seguir un plan en simulación o con tamaño reducido.' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item.setter(!item.state)}
                    className={`cursor-pointer p-4 rounded-xl border transition flex items-center gap-3 ${
                      item.state ? 'bg-emerald-950/30 border-emerald-500' : 'bg-[#162232]/60 border-slate-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.state ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-600 bg-slate-900'}`}>
                      {item.state && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-semibold text-white">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className={`p-4 rounded-xl border text-xs sm:text-sm ${allCheckboxesChecked ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'}`}>
                {allCheckboxesChecked ? (
                  <span>✅ <strong>Licencia de Protección Habilitada:</strong> Cumples con los requisitos patrimoniales para operar.</span>
                ) : (
                  <span>⚠️ Si no puedes marcar las tres casillas, no tienes permiso financiero para operar este capital todavía.</span>
                )}
              </div>
            </section>

            {/* Paso 4: Fuga y Regla */}
            <section className="bg-[#111823] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-lg">
                  04
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Paso 4: Fuga Personal y Regla Personal de Protección</h2>
                  <p className="text-xs text-slate-400">Reconoce el saboteador y establece tu compromiso observable.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Mi principal fuga financiera u operativa es:</label>
                  <textarea
                    rows={3}
                    value={fugaPersonal}
                    onChange={(e) => setFugaPersonal(e.target.value)}
                    placeholder="Ej. Operar por ansiedad, mover el stop loss, arriesgar más del porcentaje acordado..."
                    className="w-full px-4 py-3 bg-[#162232] border border-slate-800 rounded-xl text-white focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Desde hoy no tomaré una decisión de inversión sin (conducta observable):</label>
                  <textarea
                    rows={3}
                    value={reglaPersonal}
                    onChange={(e) => setReglaPersonal(e.target.value)}
                    placeholder="Ej. Validar checklist en físico, colocar el stop loss antes de entrar, consultar la bitácora..."
                    className="w-full px-4 py-3 bg-[#162232] border border-slate-800 rounded-xl text-white focus:border-emerald-400"
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={!allCheckboxesChecked}
                className={`px-10 py-4 rounded-xl font-bold uppercase tracking-wider transition ${
                  allCheckboxesChecked
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                Generar y Guardar mi Mapa
              </button>

              {!allCheckboxesChecked && (
                <p className="text-xs text-amber-400">
                  🔒 El botón se habilitará cuando marques las 3 casillas del Paso 3.
                </p>
              )}

              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar y limpiar campos</span>
              </button>
            </div>
          </form>
        ) : (
          /* ================= SUMMARY VIEW ================= */
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 print:hidden">
              <div className="flex items-center gap-2 text-emerald-400">
                <Award className="w-5 h-5" />
                <span className="font-bold text-sm text-white">¡Mapa de Capital Certificado!</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-bold text-xs uppercase"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Descargar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('form')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Editar
                </button>
              </div>
            </div>

            {/* Document */}
            <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl print:bg-white print:text-black print:border-slate-300">
              <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center print:border-slate-300">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Documento Oficial</span>
                  <h1 className="text-2xl font-black text-white print:text-black">EL OTRO 10% — Mapa de Capital</h1>
                </div>
                <div className="text-xs text-slate-400 font-mono text-right print:text-slate-600">
                  <div>FECHA: {fecha}</div>
                  <div className="text-emerald-400 font-bold">CERTIFICADO</div>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#162232]/60 border border-slate-800 mb-8 print:bg-slate-100 print:border-slate-200">
                <div><span className="text-[10px] text-slate-400 uppercase block">Inversor</span><p className="font-bold text-white print:text-black">{nombre || 'Anónimo'}</p></div>
                <div><span className="text-[10px] text-slate-400 uppercase block">Fecha</span><p className="font-semibold text-slate-200 font-mono print:text-black">{fecha}</p></div>
                <div><span className="text-[10px] text-slate-400 uppercase block">Perfil</span><p className="font-bold text-emerald-400">{perfil}</p></div>
              </div>

              {/* Brecha */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Brecha Mensual de Tranquilidad</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg print:bg-slate-50 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Necesidad Hogar (A)</span>
                    <span className="font-bold text-white font-mono print:text-black">{formatCurrency(numNecesidad, currency)}</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg print:bg-slate-50 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Ingreso No Dependiente (B)</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatCurrency(numIngresoNoDep, currency)}</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg print:bg-slate-50 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Brecha Restante (A - B)</span>
                    <span className="font-bold text-cyan-300 font-mono">{formatCurrency(brechaMensual, currency)}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border text-xs ${diagnostico.colorCard}`}>
                  <strong>{diagnostico.titulo}:</strong> {diagnostico.mensaje}
                </div>
              </div>

              {/* 4 Zonas */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">2. Estructura Patrimonial (4 Zonas)</h3>
                  <span className="text-xs font-bold text-emerald-400 font-mono">Total: {formatCurrency(capitalTotal, currency)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-900/60 border border-emerald-500/30 rounded-lg print:bg-slate-50">
                    <span className="text-[10px] text-emerald-400 block font-bold">Zona 1: Seguridad</span>
                    <span className="text-base font-bold font-mono text-white print:text-black">{formatCurrency(numZona1, currency)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({pctZona1.toFixed(1)}%)</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-sky-500/30 rounded-lg print:bg-slate-50">
                    <span className="text-[10px] text-sky-400 block font-bold">Zona 2: Objetivos</span>
                    <span className="text-base font-bold font-mono text-white print:text-black">{formatCurrency(numZona2, currency)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({pctZona2.toFixed(1)}%)</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-purple-500/30 rounded-lg print:bg-slate-50">
                    <span className="text-[10px] text-purple-400 block font-bold">Zona 3: Aprendizaje</span>
                    <span className="text-base font-bold font-mono text-white print:text-black">{formatCurrency(numZona3, currency)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({pctZona3.toFixed(1)}%)</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-amber-500/30 rounded-lg print:bg-slate-50">
                    <span className="text-[10px] text-amber-400 block font-bold">Zona 4: Operación</span>
                    <span className="text-base font-bold font-mono text-white print:text-black">{formatCurrency(numZona4, currency)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({pctZona4.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Declaraciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-900/70 border border-rose-500/30 rounded-xl print:bg-slate-50">
                  <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Fuga Personal Identificada</span>
                  <p className="text-xs text-slate-200 italic print:text-black">"{fugaPersonal.trim() || 'No declarada.'}"</p>
                </div>
                <div className="p-4 bg-slate-900/70 border border-emerald-500/30 rounded-xl print:bg-slate-50">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Regla de Oro Observable</span>
                  <p className="text-xs text-slate-200 italic print:text-black">"{reglaPersonal.trim() || 'No declarada.'}"</p>
                </div>
              </div>

              {/* Firma */}
              <div className="border-t border-slate-800 pt-6 flex justify-between items-center text-xs text-slate-400 print:border-slate-300">
                <span className="font-bold text-white print:text-black">Método Ingresarios — El Otro 10%</span>
                <span className="font-mono">Firma: {nombre || 'Inversor'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
