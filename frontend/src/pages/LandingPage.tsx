import React, { useState } from 'react';
import axios from 'axios';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onSelectPlan: (plan: string, price: number) => void;
  onRegisterSuccess: (email: string, tenantId: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Signup Wizard State
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Datos clínica, 2: Pago Stripe, 3: Éxito
  
  const [formData, setFormData] = useState({
    tenantName: '',
    oficioId: 2, // Odontología por defecto
    subdomain: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTenantId, setCreatedTenantId] = useState<number | null>(null);

  const categories = [
    { id: 1, name: 'Barbería' },
    { id: 2, name: 'Odontología' },
    { id: 3, name: 'Veterinaria' },
    { id: 4, name: 'Peluquería / Estética' },
    { id: 5, name: 'Medicina General' }
  ];

  const plans = [
    {
      name: 'Plan Básico',
      tagline: 'Ideal para profesionales independientes.',
      price: billingCycle === 'monthly' ? 19 : 15,
      features: [
        '1 Especialista / Profesional',
        'Hasta 150 turnos al mes',
        'Historial clínico básico',
        'Recordatorios por WhatsApp (Simulado)',
        'Soporte por correo electrónico',
      ],
      popular: false,
      buttonText: 'Comenzar ahora',
      color: 'indigo'
    },
    {
      name: 'Plan Estándar',
      tagline: 'Diseñado para clínicas en crecimiento.',
      price: billingCycle === 'monthly' ? 49 : 39,
      features: [
        'Hasta 5 Especialistas',
        'Turnos ilimitados',
        'Historial clínico avanzado + Fichas',
        'Recordatorios de WhatsApp automáticos',
        'Soporte prioritario 24/7',
        'Multi-dispositivo en tiempo real',
      ],
      popular: true,
      buttonText: 'Elegir Estándar (Popular)',
      color: 'emerald'
    },
    {
      name: 'Plan Premium',
      tagline: 'Para grandes centros médicos.',
      price: billingCycle === 'monthly' ? 99 : 79,
      features: [
        'Especialistas ilimitados',
        'Turnos ilimitados',
        'Módulo de Facturación SaaS',
        'WhatsApp ilimitado con chatbot',
        'Soporte telefónico exclusivo',
        'Subdominio personalizado gratis',
      ],
      popular: false,
      buttonText: 'Elegir Premium',
      color: 'violet'
    }
  ];

  const handlePlanClick = (planName: string, planPrice: number) => {
    setSelectedPlan({ name: planName, price: planPrice });
    setStep(1);
    setError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'oficioId' ? parseInt(value) : value,
    }));
  };

  const executeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantName || !formData.subdomain || !formData.adminEmail || !formData.adminPassword) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }
    setError(null);
    setStep(2); // Avanzar a pantalla de pago simulada de Stripe
  };

  const handlePaymentAndProvision = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Llamar al backend real de aprovisionamiento
      const response = await axios.post('/api/v1/provision/register', {
        tenantName: formData.tenantName,
        oficioId: formData.oficioId,
        subdomain: formData.subdomain.toLowerCase().trim(),
        adminEmail: formData.adminEmail.toLowerCase().trim(),
        adminPassword: formData.adminPassword,
      });

      const tenantId = response.data.tenantId;
      setCreatedTenantId(tenantId);

      // 2. Simular llamada exitosa a webhook de Stripe para actualizar la suscripción activa
      await axios.post('/api/v1/webhooks/stripe', {
        id: "evt_test_signup_" + Date.now(),
        type: "checkout.session.completed",
        dataObjectDeserializer: {
          object: {
            customer: "cus_simulated_" + Date.now(),
            subscription: "sub_simulated_" + Date.now(),
            clientReferenceId: tenantId.toString(),
            expiresAt: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            metadata: {
              tenant_id: tenantId.toString(),
              plan_type: selectedPlan?.name.toLowerCase().includes('premium') ? 'premium' :
                         selectedPlan?.name.toLowerCase().includes('estándar') ? 'standard' : 'basic'
            }
          }
        }
      }, {
        headers: {
          'Stripe-Signature': 'simulated_signature'
        }
      });

      setStep(3); // Registro exitoso
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error durante el registro y provisión de la clínica.');
      setStep(1); // Regresa al formulario en caso de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-y-auto relative pb-12">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Shifty SaaS
          </span>
        </div>
        <button
          onClick={onNavigateToLogin}
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300 text-sm font-semibold hover:scale-[1.02] active:scale-95"
        >
          Iniciar Sesión
        </button>
      </header>

      {/* Main Pricing View */}
      {!selectedPlan ? (
        <section className="max-w-5xl mx-auto px-6 text-center pt-16 pb-20 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            ✨ Planes Flexibles & Escalables
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Elige el plan ideal para tu <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Consultorio o Clínica
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sin contratos de permanencia. Todos los planes cuentan con la robusta tecnología de aislamiento multi-cliente y velocidad enterprise.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-900/80 border border-white/5 p-1.5 rounded-2xl mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Anual <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Ahorra 20%</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-slate-900/90 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/5 backdrop-blur-md hover:translate-y-[-4px]'
                    : 'bg-slate-900/40 border border-white/5 backdrop-blur-sm hover:border-white/10 hover:translate-y-[-2px]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    RECOMENDADO
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="text-slate-500 text-sm">USD / {billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                  </div>

                  <div className="w-full h-px bg-white/5 mb-8"></div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-slate-300">
                        <svg
                          className={`w-5 h-5 shrink-0 ${
                            plan.popular ? 'text-emerald-400' : 'text-indigo-400'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanClick(plan.name, plan.price)}
                  className={`w-full py-3.5 rounded-2xl font-semibold transition text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/20'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Sign Up & Checkout Modal Wizard Overlay */
        <div className="max-w-xl mx-auto px-6 pt-8 pb-16 relative z-10">
          <button
            onClick={() => setSelectedPlan(null)}
            className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
          >
            ← Volver a planes
          </button>

          {/* Form Step */}
          {step === 1 && (
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                Paso 1 de 2
              </span>
              <h2 className="text-2xl font-extrabold mb-6">
                Crear cuenta para {selectedPlan.name}
              </h2>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={executeRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Nombre de tu Clínica o Consultorio
                  </label>
                  <input
                    type="text"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleFormChange}
                    placeholder="Ej. Clínica Dental Smile"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Especialidad / Oficio
                    </label>
                    <select
                      name="oficioId"
                      value={formData.oficioId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Subdominio Deseado
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="subdomain"
                        value={formData.subdomain}
                        onChange={handleFormChange}
                        placeholder="ej. smile"
                        className="w-full pl-4 pr-24 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm text-right"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">
                        .agenda.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5 my-6"></div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Correo del Administrador
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleFormChange}
                    placeholder="ej. admin@clinica.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleFormChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition text-sm text-white flex items-center justify-center gap-2"
                >
                  Continuar al Pago →
                </button>
              </form>
            </div>
          )}

          {/* Stripe Payment Step */}
          {step === 2 && (
            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                Paso 2 de 2
              </span>
              <h2 className="text-2xl font-extrabold mb-2">
                Pasarela de Pago Segura
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full mb-6">
                🔒 Encriptado vía <strong className="text-white">Stripe Checkout</strong>
              </span>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 mb-6">
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span>{selectedPlan.name} ({billingCycle === 'monthly' ? 'Mensual' : 'Anual'})</span>
                  <span className="text-indigo-400">${selectedPlan.price}.00 USD</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Aprovisionamiento inmediato de subdominio</span>
                  <span>Gratis</span>
                </div>
                <div className="w-full h-px bg-white/5 my-3"></div>
                <div className="flex justify-between items-center text-base font-bold">
                  <span>Total a Pagar</span>
                  <span className="text-emerald-400">${selectedPlan.price}.00 USD</span>
                </div>
              </div>

              {/* Simulated Card Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Número de Tarjeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    />
                    <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      CVC / Código
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 focus:border-indigo-500 focus:outline-none transition text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePaymentAndProvision}
                  disabled={loading}
                  className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-bold transition text-sm text-slate-950 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Aprovisionando Clínica...
                    </span>
                  ) : (
                    `Pagar $${selectedPlan.price}.00 USD`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 3 && (
            <div className="bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 text-3xl">
                ✓
              </div>
              <h2 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                ¡Clínica Registrada!
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                El sistema ha completado de forma asíncrona la suscripción para tu clínica <strong className="text-white">"{formData.tenantName}"</strong>.
              </p>

              {/* Client Access Details Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-white/5 text-left space-y-3 mb-8">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
                    URL de acceso único
                  </span>
                  <a
                    href={`http://${formData.subdomain}.agenda.com:8082`}
                    className="text-emerald-400 font-semibold hover:underline text-sm break-all"
                  >
                    http://{formData.subdomain}.agenda.com:8082
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
                      ID del Cliente
                    </span>
                    <span className="text-white font-bold text-sm">
                      {createdTenantId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
                      Plan Seleccionado
                    </span>
                    <span className="text-white font-bold text-sm">
                      {selectedPlan.name}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRegisterSuccess(formData.adminEmail, createdTenantId || 1)}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold transition text-sm text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Acceder a la Agenda Virtual
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm relative z-10">
        <span>© 2026 Shifty SaaS Inc. Todos los derechos reservados.</span>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-300 transition">Términos de Servicio</a>
          <a href="#" className="hover:text-slate-300 transition">Política de Privacidad</a>
          <a href="#" className="hover:text-slate-300 transition">Soporte</a>
        </div>
      </footer>
    </div>
  );
};
