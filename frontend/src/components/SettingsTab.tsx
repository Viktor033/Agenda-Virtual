import React, { useState } from 'react';

interface SettingsTabProps {
  tenantName: string;
  setTenantName: (name: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  tenantName,
  setTenantName,
  themeColor,
  setThemeColor,
}) => {
  const [phone, setPhone] = useState('+54 9 11 9988-7766');
  const [email, setEmail] = useState('contacto@agendavirtual.com');
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');
  
  // Días laborables interactivos
  const [workDays, setWorkDays] = useState({
    lun: true,
    mar: true,
    mie: true,
    jue: true,
    vie: true,
    sab: false,
    dom: false,
  });

  const colors = [
    { id: 'indigo', label: 'Índigo Clásico', bg: 'bg-indigo-600', ring: 'ring-indigo-500/30' },
    { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-emerald-600', ring: 'ring-emerald-500/30' },
    { id: 'violet', label: 'Violeta Eléctrico', bg: 'bg-violet-600', ring: 'ring-violet-500/30' },
    { id: 'amber', label: 'Ámbar Cálido', bg: 'bg-amber-500', ring: 'ring-amber-500/30' },
    { id: 'rose', label: 'Rosa Magenta', bg: 'bg-rose-500', ring: 'ring-rose-500/30' },
  ];

  const handleDayToggle = (day: keyof typeof workDays) => {
    setWorkDays({ ...workDays, [day]: !workDays[day] });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-10">
      
      {/* SECCIÓN 1: IDENTIDAD VISUAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Identidad Visual y Temas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Elige el color principal de la marca para personalizar toda tu interfaz</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
          {colors.map((c) => {
            const isActive = themeColor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setThemeColor(c.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-200 ${
                  isActive 
                    ? 'border-slate-300 bg-slate-50 shadow-md scale-102 ring-4 ring-offset-1 ' + c.ring
                    : 'border-slate-100 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center text-white shadow-sm`}>
                  {isActive && (
                    <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: INFORMACIÓN DE LA AGENDA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ficha y Perfil Comercial</h2>
          <p className="text-xs text-slate-500 mt-0.5">Modifica los datos que se muestran en el Sidebar y notificaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nombre Comercial</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Teléfono Comercial</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Correo de Contacto</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-semibold text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: PARÁMETROS OPERATIVOS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Parámetros Operativos de Turnos</h2>
          <p className="text-xs text-slate-500 mt-0.5">Controla los días laborales de la agenda y sus rangos horarios</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          {/* Checkboxes de días */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3.5">Días Laborales Habilitados</label>
            <div className="flex flex-wrap gap-2.5">
              {(Object.keys(workDays) as Array<keyof typeof workDays>).map((day) => {
                const isSelected = workDays[day];
                let activeBg = 'bg-indigo-600 text-white';
                if (themeColor === 'emerald') activeBg = 'bg-emerald-600 text-white';
                if (themeColor === 'violet') activeBg = 'bg-violet-600 text-white';
                if (themeColor === 'amber') activeBg = 'bg-amber-50 text-white';
                if (themeColor === 'rose') activeBg = 'bg-rose-600 text-white';

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 border ${
                      isSelected 
                        ? activeBg + ' border-transparent shadow-sm scale-102'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rango Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Hora Apertura</label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
              >
                <option value="06:00">06:00 AM</option>
                <option value="07:00">07:00 AM</option>
                <option value="08:00">08:00 AM</option>
                <option value="09:00">09:00 AM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Hora Cierre</label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold text-slate-700"
              >
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="19:00">07:00 PM</option>
                <option value="20:00">08:00 PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
