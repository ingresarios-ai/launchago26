'use client';

import React, { useState, useMemo } from 'react';
import {
  Lock,
  Shield,
  DollarSign,
  TrendingUp,
  Home,
  Zap,
  RotateCcw,
  Printer,
  ArrowRight,
  Activity,
  Layers,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const INITIAL_STATE = {
  // Sección A: Ahorros y Liquidez
  a1: 0, // Fondo de emergencia
  a2: 0, // Cuentas bancarias
  a3: 0, // Efectivo
  // Sección B: Inversiones y Activos
  b1: 0, // Bienes raíces
  b2: 0, // Participaciones empresas
  b3: 0, // Cuentas trading
  b4: 0, // Fondos retiro
  // Sección C: Gastos Recurrentes (Mensual) -> Cifra A
  c1: 0, // Vivienda y servicios
  c2: 0, // Alimentación y familia
  c3: 0, // Pagos deuda
  c4: 0, // Otros fijos esenciales
  // Sección D: Entradas Independientes (Mensual) -> Cifra B
  d1: 0, // Rentas inmuebles
  d2: 0, // Dividendos pasivos
  d3: 0  // Intereses y rendimientos
};

const CURRENCIES = {
  USD: { label: 'USD ($)', symbol: '$' },
  COP: { label: 'COP ($)', symbol: '$' },
  MXN: { label: 'MXN ($)', symbol: '$' },
  EUR: { label: 'EUR (€)', symbol: '€' }
};

export default function InventarioFinanciero() {
  const [inputs, setInputs] = useState(INITIAL_STATE);
  const [currency, setCurrency] = useState('USD');

  const symbol = CURRENCIES[currency]?.symbol || '$';

  // Formatter
  const formatMoney = (val) => {
    const num = isNaN(val) || val === null || val === undefined ? 0 : val;
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Input Change Handler
  const handleChange = (field, e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal === '' ? 0 : parseInt(rawVal, 10);
    setInputs(prev => ({ ...prev, [field]: num }));
  };

  // Subtotals Calculation
  const subA = useMemo(() => inputs.a1 + inputs.a2 + inputs.a3, [inputs]);
  const subB = useMemo(() => inputs.b1 + inputs.b2 + inputs.b3 + inputs.b4, [inputs]);
  const subC = useMemo(() => inputs.c1 + inputs.c2 + inputs.c3 + inputs.c4, [inputs]); // Cifra A
  const subD = useMemo(() => inputs.d1 + inputs.d2 + inputs.d3, [inputs]); // Cifra B

  // Cross Metrics
  const brecha = Math.max(0, subC - subD);
  const cobertura = subC > 0 ? Math.min(100, Math.round((subD / subC) * 100)) : subD > 0 ? 100 : 0;
  const runway = subC > 0 ? (subA / subC).toFixed(1) : '0.0';

  // Reset Handler
  const handleReset = () => {
    if (window.confirm('¿Estás seguro de borrar todos los datos locales? Esta acción restablecerá todas las casillas a cero.')) {
      setInputs(INITIAL_STATE);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-36 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
              10
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">EL OTRO 10%</h1>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Inventario de Preparación</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700">
              <span className="text-slate-500">Moneda:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent font-bold text-blue-700 outline-none cursor-pointer"
              >
                {Object.entries(CURRENCIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <a
              href={`/mapacapital?necesidad=${subC}&nodep=${subD}&moneda=${currency}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Mapa de Capital</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {/* Privacy Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3.5 shadow-sm">
          <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-900">
              Modo Privado Activo: Tus datos financieros no se envían a ningún servidor
            </h2>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Todo el cálculo ocurre de manera 100% local en la memoria de tu dispositivo. No usamos bases de datos externas ni almacenamiento en la nube para garantizar tu confidencialidad absoluta.
            </p>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full uppercase tracking-wider mb-2">
            Diagnóstico Patrimonial de Sesión
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventario de Preparación Financiera
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Ingresa tus números reales para consolidar tu reserva de seguridad, capital productivo, compromisos mensuales y flujo no dependiente del trabajo.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* SECCIÓN A */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <div>
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sección A: Ahorros y Liquidez</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Reserva familiar y capital de contingencia inmediata</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Fondo de emergencia / Reserva familiar</label>
                    <span className="text-[10px] text-slate-400">3 a 6 meses de gastos</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.a1 ? inputs.a1.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('a1', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Cuentas bancarias / Depósitos a la vista</label>
                    <span className="text-[10px] text-slate-400">Ahorros y cuentas corrientes</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.a2 ? inputs.a2.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('a2', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Efectivo o equivalentes de caja</label>
                    <span className="text-[10px] text-slate-400">Divisas en mano / Fondos líquidos</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.a3 ? inputs.a3.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('a3', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between -mx-6 -mb-6 p-4 px-6 bg-slate-50/80 rounded-b-2xl">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Subtotal Ahorros / Liquidez</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Monto de Seguridad</span>
              </div>
              <span className="text-lg font-black text-slate-900">{formatMoney(subA)}</span>
            </div>
          </div>

          {/* SECCIÓN B */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-400" />
            <div>
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sección B: Inversiones y Activos</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Patrimonio productivo y capital disponible</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Bienes raíces o activos de renta</label>
                    <span className="text-[10px] text-slate-400">Valor neto de propiedades</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.b1 ? inputs.b1.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('b1', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Participaciones en empresas / Negocio propio</label>
                    <span className="text-[10px] text-slate-400">Valoración patrimonial neta</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.b2 ? inputs.b2.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('b2', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Cuentas de trading / Inversiones financieras</label>
                    <span className="text-[10px] text-slate-400">Acciones, ETFs, Bonos</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.b3 ? inputs.b3.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('b3', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Fondos de retiro / Pensiones acumuladas</label>
                    <span className="text-[10px] text-slate-400">Aportes voluntarios y privados</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.b4 ? inputs.b4.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('b4', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between -mx-6 -mb-6 p-4 px-6 bg-slate-50/80 rounded-b-2xl">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Subtotal Inversiones y Capital</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Capital Potencial</span>
              </div>
              <span className="text-lg font-black text-slate-900">{formatMoney(subB)}</span>
            </div>
          </div>

          {/* SECCIÓN C */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
            <div>
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sección C: Gastos Recurrentes (Mensual)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Obligaciones vitales para mantener el estilo de vida</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Vivienda (hipoteca/alquiler) y servicios</label>
                    <span className="text-[10px] text-slate-400">Luz, agua, internet, administración</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.c1 ? inputs.c1.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('c1', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Alimentación, salud y compromisos familiares</label>
                    <span className="text-[10px] text-slate-400">Mercado, seguros, educación</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.c2 ? inputs.c2.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('c2', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Pagos de deuda o compromisos de pasivos</label>
                    <span className="text-[10px] text-slate-400">Cuotas créditos, tarjetas</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.c3 ? inputs.c3.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('c3', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Otros gastos fijos esenciales</label>
                    <span className="text-[10px] text-slate-400">Transporte, combustible</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.c4 ? inputs.c4.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('c4', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between -mx-6 -mb-6 p-4 px-6 bg-amber-50/70 rounded-b-2xl">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Necesidad Mensual</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">Cifra A</span>
              </div>
              <span className="text-xl font-black text-amber-700">{formatMoney(subC)}</span>
            </div>
          </div>

          {/* SECCIÓN D */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div>
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sección D: Ingresos Independientes (Mensual)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Flujo sin depender de tu presencia ni horas de trabajo</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Rentas de inmuebles</label>
                    <span className="text-[10px] text-slate-400">Alquileres netos</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.d1 ? inputs.d1.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('d1', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Dividendos / Distribuciones pasivas</label>
                    <span className="text-[10px] text-slate-400">Negocios no operados directamente</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.d2 ? inputs.d2.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('d2', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Intereses y rendimientos pasivos</label>
                    <span className="text-[10px] text-slate-400">Plazos fijos, bonos, rentas de capital</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">{symbol}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={inputs.d3 ? inputs.d3.toLocaleString('en-US') : ''}
                      onChange={(e) => handleChange('d3', e)}
                      className="w-full h-10 pl-8 pr-3 text-right font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between -mx-6 -mb-6 p-4 px-6 bg-emerald-50/70 rounded-b-2xl">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Ingresos No Dependientes</span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">Cifra B</span>
              </div>
              <span className="text-xl font-black text-emerald-700">{formatMoney(subD)}</span>
            </div>
          </div>

        </div>

        {/* Panel Diagnóstico */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Diagnóstico Patrimonial Inmediato</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Métricas clave para contrastar tu estilo de vida contra tus fuentes de libertad financiera.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Brecha Mensual (A - B)</span>
              <div className="text-2xl font-black text-slate-900">{formatMoney(brecha)}</div>
              <p className="text-xs text-slate-500 mt-2">
                {subC === 0
                  ? 'Ingresa tus gastos en la Sección C para ver tu brecha.'
                  : brecha === 0
                  ? '¡Excelente! Tus ingresos no dependientes cubren el 100% de tu costo de vida.'
                  : `Monto mensual que aún depende de tu actividad laboral o ventas activas.`}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Cobertura de Flujo No Dependiente</span>
              <div className="text-2xl font-black text-slate-900">{cobertura}%</div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full my-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${cobertura}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {cobertura >= 100
                  ? 'Libertad financiera básica alcanzada.'
                  : `Meta: 100% para cubrir el costo de vida con rentas y rendimientos.`}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Meses de Autonomía (Runway)</span>
              <div className="text-2xl font-black text-slate-900">{runway} meses</div>
              <p className="text-xs text-slate-500 mt-2">
                {subC > 0
                  ? parseFloat(runway) >= 6
                    ? 'Excelente colchón de seguridad (supera los 6 meses).'
                    : 'Margen ajustado. Se sugiere reforzar la reserva de emergencia.'
                  : 'Ingresa tus gastos para calcular los meses de autonomía.'}
              </p>
            </div>
          </div>
        </section>

        {/* Callout to Mapa de Capital */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">¿Listo para estructurar tus 4 Zonas de Riqueza?</h4>
            <p className="text-xs text-slate-400 max-w-xl">
              Toma tu <strong>Cifra A</strong> ({formatMoney(subC)}) y tu <strong>Cifra B</strong> ({formatMoney(subD)}) para proyectar la asignación de tu patrimonio en el Mapa de Capital.
            </p>
          </div>
          <a
            href={`/mapacapital?necesidad=${subC}&nodep=${subD}&moneda=${currency}`}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-5 py-3 rounded-xl transition shadow-md whitespace-nowrap"
          >
            <span>Ir a Mapa de Capital</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 shadow-lg z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-7 w-full sm:w-auto">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monto Seguridad</span>
              <span className="text-base font-extrabold text-slate-900">{formatMoney(subA)}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Capital Disponible</span>
              <span className="text-base font-extrabold text-slate-900">{formatMoney(subB)}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Necesidad (Cifra A)</span>
              <span className="text-base font-extrabold text-amber-700">{formatMoney(subC)}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Ingreso No Dep. (Cifra B)</span>
              <span className="text-base font-extrabold text-emerald-700">{formatMoney(subD)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Datos</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
