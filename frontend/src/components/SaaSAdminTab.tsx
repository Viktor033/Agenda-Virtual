import React, { useState } from 'react';
import { SuccessModal } from './SuccessModal';

interface TenantSubscription {
  id: number;
  businessName: string;
  ownerName: string;
  planName: string;
  monthlyPrice: number;
  status: 'paid' | 'pending' | 'unpaid';
  lastPaymentDate: string;
  rubro: string;
}

const getRubroBadge = (rubro: string) => {
  const normalized = rubro?.toLowerCase().trim() || 'medicina';
  if (normalized.includes('medicina')) {
    return { text: rubro, emoji: '🩺', classes: 'bg-blue-50 text-blue-700 border-blue-150' };
  }
  if (normalized.includes('veterinaria')) {
    return { text: rubro, emoji: '🐾', classes: 'bg-emerald-50 text-emerald-700 border-emerald-150' };
  }
  if (normalized.includes('peluquería') || normalized.includes('peluqueria')) {
    return { text: rubro, emoji: '✂️', classes: 'bg-purple-50 text-purple-700 border-purple-150' };
  }
  if (normalized.includes('barbería') || normalized.includes('barberia')) {
    return { text: rubro, emoji: '💈', classes: 'bg-amber-50 text-amber-700 border-amber-150' };
  }
  return { text: rubro || 'Otro', emoji: '🏷️', classes: 'bg-slate-50 text-slate-700 border-slate-200' };
};

export const SaaSAdminTab: React.FC = () => {
  // Lista inicial de clínicas/inquilinos que contrataron el SaaS
  const [tenants, setTenants] = useState<TenantSubscription[]>([
    { id: 1, businessName: 'Clínica Clara Ortega', ownerName: 'Dra. Clara Ortega', planName: 'Premium Dental', monthlyPrice: 250.00, status: 'paid', lastPaymentDate: '2026-05-10', rubro: 'Medicina' },
    { id: 2, businessName: 'Consultorio Kinesiología Ramos', ownerName: 'Lic. Mateo Ramos', planName: 'Plan Estándar', monthlyPrice: 180.00, status: 'paid', lastPaymentDate: '2026-05-08', rubro: 'Veterinaria' },
    { id: 3, businessName: 'Centro Estético Sofia Ortiz', ownerName: 'Dra. Sofia Ortiz', planName: 'Plan Estándar', monthlyPrice: 180.00, status: 'pending', lastPaymentDate: '2026-04-28', rubro: 'Peluquería' },
    { id: 4, businessName: 'Clínica Médica del Sol', ownerName: 'Dr. Alejandro Gil', planName: 'Platinum Ilimitado', monthlyPrice: 450.00, status: 'paid', lastPaymentDate: '2026-05-12', rubro: 'Medicina' },
    { id: 5, businessName: 'Estudio de Rehabilitación Sur', ownerName: 'Lic. Roberto Sosa', planName: 'Premium Dental', monthlyPrice: 250.00, status: 'unpaid', lastPaymentDate: '2026-04-05', rubro: 'Barbería' }
  ]);

  // Estados de Modales
  const [selectedTenantToEdit, setSelectedTenantToEdit] = useState<TenantSubscription | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [tenantToDelete, setTenantToDelete] = useState<TenantSubscription | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estado para Éxito
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados del Formulario
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [planName, setPlanName] = useState('Plan Estándar');
  const [monthlyPrice, setMonthlyPrice] = useState(180);
  const [status, setStatus] = useState<'paid' | 'pending' | 'unpaid'>('paid');
  const [rubro, setRubro] = useState('Medicina');
  const [customRubro, setCustomRubro] = useState('');

  // Abrir Modal de Registro
  const handleOpenAddModal = () => {
    setSelectedTenantToEdit(null);
    setBusinessName('');
    setOwnerName('');
    setPlanName('Plan Estándar');
    setMonthlyPrice(180);
    setStatus('paid');
    setRubro('Medicina');
    setCustomRubro('');
    setIsEditModalOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (tenant: TenantSubscription) => {
    setSelectedTenantToEdit(tenant);
    setBusinessName(tenant.businessName);
    setOwnerName(tenant.ownerName);
    setPlanName(tenant.planName);
    setMonthlyPrice(tenant.monthlyPrice);
    setStatus(tenant.status);
    
    const predefOptions = ['Medicina', 'Veterinaria', 'Peluquería', 'Barbería'];
    if (predefOptions.includes(tenant.rubro)) {
      setRubro(tenant.rubro);
      setCustomRubro('');
    } else {
      setRubro('Otro');
      setCustomRubro(tenant.rubro || '');
    }
    setIsEditModalOpen(true);
  };

  // Guardar Cambios (Alta / Modificación)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const finalRubro = rubro === 'Otro' ? customRubro : rubro;

    if (selectedTenantToEdit) {
      // Modificar existente
      setTenants(tenants.map(t => t.id === selectedTenantToEdit.id
        ? {
            ...t,
            businessName,
            ownerName,
            planName,
            monthlyPrice: Number(monthlyPrice),
            status,
            lastPaymentDate: status === 'paid' ? todayStr : t.lastPaymentDate,
            rubro: finalRubro
          }
        : t
      ));
      setSuccessTitle('Suscripción Actualizada');
      setSuccessMessage(`Los datos de facturación de "${businessName}" se guardaron exitosamente.`);
    } else {
      // Registrar nuevo
      const newTenant: TenantSubscription = {
        id: Date.now(),
        businessName,
        ownerName,
        planName,
        monthlyPrice: Number(monthlyPrice),
        status,
        lastPaymentDate: status === 'paid' ? todayStr : '-',
        rubro: finalRubro
      };
      setTenants([...tenants, newTenant]);
      setSuccessTitle('Cliente de Pago Registrado');
      setSuccessMessage(`Se incorporó exitosamente al cliente "${businessName}" al flujo de cobro.`);
    }

    setIsEditModalOpen(false);
    setIsSuccessOpen(true);
  };

  // Abrir Confirmar Eliminación
  const handleOpenDeleteModal = (tenant: TenantSubscription) => {
    setTenantToDelete(tenant);
    setIsDeleteModalOpen(true);
  };

  // Confirmar Eliminación
  const handleConfirmDelete = () => {
    if (!tenantToDelete) return;
    setTenants(tenants.filter(t => t.id !== tenantToDelete.id));
    setIsDeleteModalOpen(false);
    setSuccessTitle('Cliente Removido');
    setSuccessMessage(`La cuenta de cobro de "${tenantToDelete.businessName}" fue eliminada.`);
    setIsSuccessOpen(true);
    setTenantToDelete(null);
  };

  // Cambiar el estado de pago de un cliente interactivamente
  const handleTogglePaymentStatus = (id: number, currentStatus: 'paid' | 'pending' | 'unpaid') => {
    let nextStatus: 'paid' | 'pending' | 'unpaid' = 'paid';
    let nextPaymentDate = new Date().toISOString().split('T')[0];

    if (currentStatus === 'paid') {
      nextStatus = 'pending';
      nextPaymentDate = '-';
    } else if (currentStatus === 'pending') {
      nextStatus = 'unpaid';
      nextPaymentDate = '-';
    } else {
      nextStatus = 'paid';
    }

    setTenants(tenants.map(t => t.id === id 
      ? { ...t, status: nextStatus, lastPaymentDate: nextPaymentDate } 
      : t
    ));
  };

  // Ajuste automático de precio según el plan predefinido
  const handlePlanChange = (plan: string) => {
    setPlanName(plan);
    if (plan === 'Plan Estándar') setMonthlyPrice(180);
    if (plan === 'Premium Dental') setMonthlyPrice(250);
    if (plan === 'Platinum Ilimitado') setMonthlyPrice(450);
  };

  // Cálculo de Métricas Financieras del SaaS en tiempo real
  const totalMRR = tenants.reduce((acc, t) => acc + t.monthlyPrice, 0);
  const paidRevenue = tenants.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.monthlyPrice, 0);
  const pendingRevenue = tenants.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.monthlyPrice, 0);
  const unpaidRevenue = tenants.filter(t => t.status === 'unpaid').reduce((acc, t) => acc + t.monthlyPrice, 0);
  const activeTenantsCount = tenants.length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-10">
      
      {/* 📊 TARJETAS DE MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SaaS MRR (Ingreso Mensual)</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-extrabold text-slate-800">${totalMRR.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">USD</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold mt-2 block">✓ {activeTenantsCount} Inquilinos Activos</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cobrado este Mes</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">${paidRevenue.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">USD</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-2 block">
            {totalMRR > 0 ? ((paidRevenue / totalMRR) * 100).toFixed(0) : 0}% cobrado exitosamente
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pendiente de Cobro</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-extrabold text-amber-500">${pendingRevenue.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">USD</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-2 block">Avisos mensuales enviados</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Atrasados / Vencidos</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-extrabold text-rose-500">${unpaidRevenue.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">USD</span>
          </div>
          <span className="text-[10px] text-rose-500 font-bold mt-2 block">⚠️ Requieren Suspensión</span>
        </div>
      </div>

      {/* 📋 LISTADO DE CLIENTES SUSCRIPTORES */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Control de Inquilinos y Facturación (SaaS)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Controla las suscripciones de los clientes de salud y estética registrados en el sistema</p>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm"
          >
            + Registrar Cliente
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Identificador / Empresa</th>
                <th className="py-4 px-6">Profesional Responsable</th>
                <th className="py-4 px-6">Rubro</th>
                <th className="py-4 px-6">Plan Suscripto</th>
                <th className="py-4 px-6">Costo Mensual</th>
                <th className="py-4 px-6">Estado de Pago</th>
                <th className="py-4 px-6">Último Cobro</th>
                <th className="py-4 px-6 text-right">Acciones Comerciales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{t.businessName}</span>
                      <span className="text-[10px] text-slate-400">Tenant ID: {t.id}0{t.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600">{t.ownerName}</td>
                  <td className="py-4 px-6">
                    {(() => {
                      const badge = getRubroBadge(t.rubro);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-wide ${badge.classes}`}>
                          <span>{badge.emoji}</span>
                          <span>{badge.text}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/50 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {t.planName}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-extrabold text-slate-800">${t.monthlyPrice.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    {t.status === 'paid' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                        PAGADO
                      </span>
                    )}
                    {t.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
                        PENDIENTE
                      </span>
                    )}
                    {t.status === 'unpaid' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold">
                        IMPAGO
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-semibold">{t.lastPaymentDate}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      {/* Alternar estado de pago rápido */}
                      <button
                        onClick={() => handleTogglePaymentStatus(t.id, t.status)}
                        className="px-2 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-[10px] font-bold rounded-lg text-slate-600 transition-all"
                        title="Alternar Pago Mensual"
                      >
                        🔄 Pago
                      </button>

                      {/* Editar Ficha */}
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1.5 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-indigo-650 rounded-lg transition-all"
                        title="Modificar Suscripción"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Eliminar Suscripción */}
                      <button
                        onClick={() => handleOpenDeleteModal(t)}
                        className="p-1.5 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 text-rose-650 rounded-lg transition-all"
                        title="Baja de Suscripción"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/*   MODAL DE EDICIÓN / REGISTRO COMERCIAL    */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Cabecera */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {selectedTenantToEdit ? 'Modificar Registro de Cobro' : 'Nuevo Cliente de Suscripción'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Control de planes comerciales del SaaS</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitForm} className="p-6 flex flex-col gap-4">
              
              {/* Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nombre Comercial / Empresa *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="ej. Centro Médico Odontológico"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                />
              </div>

              {/* Titular */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Profesional Responsable (Dueño) *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="ej. Dra. Giselle Herrera"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                />
              </div>

              {/* Rubro Comercial */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Rubro Comercial *</label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700 transition-all"
                >
                  <option value="Medicina">🩺 Medicina</option>
                  <option value="Veterinaria">🐾 Veterinaria</option>
                  <option value="Peluquería">✂️ Peluquería</option>
                  <option value="Barbería">💈 Barbería</option>
                  <option value="Otro">🏷️ Otro (Personalizado)</option>
                </select>
              </div>

              {/* Rubro Personalizado (Condicional) */}
              {rubro === 'Otro' && (
                <div className="animate-slide-down">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Especificar Rubro *</label>
                  <input
                    type="text"
                    required
                    value={customRubro}
                    onChange={(e) => setCustomRubro(e.target.value)}
                    placeholder="ej. Centro de Estética, Kinesiología"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                  />
                </div>
              )}

              {/* Grid Plan y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Plan Comercial</label>
                  <select
                    value={planName}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                  >
                    <option value="Plan Estándar">Plan Estándar</option>
                    <option value="Premium Dental">Premium Dental</option>
                    <option value="Platinum Ilimitado">Platinum Ilimitado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Arancel Mensual (USD)</label>
                  <input
                    type="number"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* Estado de Cobro */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Estado de Pago Mensual</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'pending' | 'unpaid')}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
                >
                  <option value="paid">PAGADO (Al Día)</option>
                  <option value="pending">PENDIENTE (Aviso Enviado)</option>
                  <option value="unpaid">IMPAGO (Vencido)</option>
                </select>
              </div>

              {/* Botones de pie */}
              <div className="flex gap-3 mt-4 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 border border-slate-250 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {selectedTenantToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/*   MODAL DE CONFIRMACIÓN DE ELIMINACIÓN     */}
      {/* ========================================== */}
      {isDeleteModalOpen && tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-2xl p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Eliminar Ficha de Cobro</h3>
              <p className="text-xs text-slate-500 mt-2">
                ¿Estás seguro de que deseas eliminar la suscripción comercial de <strong>{tenantToDelete.businessName}</strong>? Se suspenderá la facturación automática.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
              >
                No, mantener
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO PREMIUM */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
        message={successMessage}
      />

    </div>
  );
};
