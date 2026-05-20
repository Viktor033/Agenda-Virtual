import React, { useState } from 'react';
import { Professional, Appointment } from '../types';

interface CalendarGridProps {
  professionals: Professional[];
  appointments: Appointment[];
  selectedDate: Date;
  onTimeSlotClick: (professionalId: number, hour: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  professionals,
  appointments,
  selectedDate,
  onTimeSlotClick,
  onAppointmentClick
}) => {
  // Estado local para alternar vistas: 'day' | 'week' | 'month'
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // Para la vista semanal, elegimos a qué profesional queremos visualizar (por defecto el primero)
  const [selectedProfId, setSelectedProfId] = useState<number>(professionals[0]?.id || 1);

  const startHour = 8;
  const endHour = 18;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Auxiliares de formato de fecha
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // ==========================================
  // LOGICA VISTA DIARIA (PROFESIONALES EN COLUMNAS)
  // ==========================================
  const getAppointmentsForDayAndProfessional = (professionalId: number, date: Date) => {
    return appointments.filter((app) => {
      const appDate = new Date(app.startTime);
      return app.professionalId === professionalId && isSameDay(appDate, date);
    });
  };

  const getCardPositionStyle = (startTimeStr: string, endTimeStr: string) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const workStartMinutes = startHour * 60;
    const hourHeight = 64; 
    const top = ((startMinutes - workStartMinutes) / 60) * hourHeight;
    const height = ((endMinutes - startMinutes) / 60) * hourHeight;
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // ==========================================
  // LOGICA VISTA SEMANAL (7 DIAS DEL PROFESIONAL SELECCIONADO)
  // ==========================================
  const getWeekDates = (baseDate: Date) => {
    const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedDate);
  const weekDaysLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // ==========================================
  // LOGICA VISTA MENSUAL (GRILLA DE PARED)
  // ==========================================
  const getMonthWeeksGrid = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const mondayOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() + mondayOffset);
    
    const gridDaysCount = 42; 
    return Array.from({ length: gridDaysCount }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });
  };

  const monthGridDays = getMonthWeeksGrid(selectedDate);
  const currentMonthActive = selectedDate.getMonth();

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(app => isSameDay(new Date(app.startTime), date));
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden font-sans select-none">
      
      {/* CABECERA INTERNA DEL CALENDARIO: SELECTORES */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 justify-between items-center shrink-0">
        
        {/* Selector de Profesional en Vista Semanal */}
        {viewMode === 'week' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ver agenda de:</span>
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.specialty})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {viewMode === 'day' ? 'Agenda diaria por recursos' : 'Consolidado mensual de turnos'}
          </div>
        )}

        {/* Botones de alternancia de Vistas (Día, Semana, Mes) */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl gap-0.5 self-end">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODO DE RENDERIZACIÓN: DÍA (RECURSOS SIDE-BY-SIDE) RESPONSIVO */}
      {/* ============================================================== */}
      {viewMode === 'day' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* CABECERA DIARIA DE MEDICOS */}
          <div className="flex border-b border-slate-100 bg-slate-50/20 shrink-0">
            {/* Espacio para alinear con columna fija de horas */}
            <div className="w-16 md:w-20 border-r border-slate-100 shrink-0" />
            
            {/* Listado de doctores (Desplazable en móvil) */}
            <div className="flex-1 overflow-hidden" id="calendar-header-scroll-day">
              <div className="min-w-[550px] md:min-w-0 grid" style={{ gridTemplateColumns: `repeat(${professionals.length}, minmax(0, 1fr))` }}>
                {professionals.map((prof) => (
                  <div key={prof.id} className="py-4 px-2 flex flex-col items-center gap-1.5 border-r border-slate-100 last:border-r-0">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white ring-2 ring-indigo-500/20"
                    />
                    <div className="text-center overflow-hidden w-full px-1">
                      <h3 className="font-bold text-slate-800 text-[10px] md:text-xs truncate">{prof.name}</h3>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold block truncate">{prof.specialty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GRID PRINCIPAL DE HORARIOS */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Eje de Horas Fijo a la Izquierda */}
            <div className="w-16 md:w-20 border-r border-slate-100 bg-slate-50/10 shrink-0 select-none overflow-y-hidden" id="calendar-hours-scroll-day">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-slate-100/60 pr-2.5 flex items-start justify-end text-[9px] md:text-[10px] font-bold text-slate-400 pt-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Columnas del Calendario Desplazables */}
            <div 
              className="flex-1 overflow-auto"
              onScroll={(e) => {
                const scrollLeftVal = (e.target as HTMLDivElement).scrollLeft;
                const scrollTopVal = (e.target as HTMLDivElement).scrollTop;
                
                const header = document.getElementById('calendar-header-scroll-day');
                if (header) header.scrollLeft = scrollLeftVal;
                
                const hoursScroll = document.getElementById('calendar-hours-scroll-day');
                if (hoursScroll) hoursScroll.scrollTop = scrollTopVal;
              }}
            >
              <div className="min-w-[550px] md:min-w-0 grid relative" style={{ gridTemplateColumns: `repeat(${professionals.length}, minmax(0, 1fr))` }}>
                {professionals.map((prof) => (
                  <div key={prof.id} className="relative border-r border-slate-100 last:border-r-0">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        onClick={() => onTimeSlotClick(prof.id, hour)}
                        className="h-16 border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors duration-100 cursor-pointer"
                      />
                    ))}

                    {getAppointmentsForDayAndProfessional(prof.id, selectedDate).map((app) => {
                      const positionStyle = getCardPositionStyle(app.startTime, app.endTime);
                      let statusClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
                      if (app.status === 'confirmed') statusClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
                      if (app.status === 'cancelled') statusClasses = 'bg-rose-50 text-rose-700 border-rose-200 line-through opacity-70';

                      return (
                        <div
                          key={app.id}
                          onClick={(e) => { e.stopPropagation(); onAppointmentClick(app); }}
                          style={positionStyle}
                          className={`absolute left-1.5 right-1.5 p-2 rounded-xl border text-[10px] md:text-[11px] font-medium transition-all duration-200 shadow-sm cursor-pointer hover:shadow flex flex-col justify-between overflow-hidden group ${statusClasses}`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-bold truncate leading-none">{app.patientName}</h4>
                              <span className="text-[8px] px-1 rounded-md bg-white/75 font-bold tracking-wide shrink-0">
                                {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[9px] opacity-90 truncate mt-0.5">{app.serviceName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODO DE RENDERIZACIÓN: SEMANA (7 DÍAS EN COLUMNAS) RESPONSIVO */}
      {/* ============================================================== */}
      {viewMode === 'week' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* CABECERA DIARIA DE LA SEMANA */}
          <div className="flex border-b border-slate-100 bg-slate-50/20 shrink-0">
            <div className="w-16 md:w-20 border-r border-slate-100 shrink-0" />
            
            <div className="flex-1 overflow-hidden" id="calendar-header-scroll-week">
              <div className="min-w-[650px] md:min-w-0 grid grid-cols-7">
                {weekDates.map((dateItem, idx) => {
                  const isSelectedDay = isSameDay(dateItem, selectedDate);
                  const isTodayDate = isSameDay(dateItem, new Date());
                  return (
                    <div key={idx} className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-100 last:border-r-0 select-none ${isSelectedDay ? 'bg-indigo-50/20' : ''}`}>
                      <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{weekDaysLabels[idx]}</span>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isTodayDate ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-800'
                      }`}>
                        {dateItem.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GRID PRINCIPAL DE SEMANA */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Eje de Horas Fijo */}
            <div className="w-16 md:w-20 border-r border-slate-100 bg-slate-50/10 shrink-0 select-none overflow-y-hidden" id="calendar-hours-scroll-week">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-slate-100/60 pr-2.5 flex items-start justify-end text-[9px] md:text-[10px] font-bold text-slate-400 pt-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Columnas desplazables de la semana */}
            <div 
              className="flex-1 overflow-auto"
              onScroll={(e) => {
                const scrollLeftVal = (e.target as HTMLDivElement).scrollLeft;
                const scrollTopVal = (e.target as HTMLDivElement).scrollTop;
                
                const header = document.getElementById('calendar-header-scroll-week');
                if (header) header.scrollLeft = scrollLeftVal;
                
                const hoursScroll = document.getElementById('calendar-hours-scroll-week');
                if (hoursScroll) hoursScroll.scrollTop = scrollTopVal;
              }}
            >
              <div className="min-w-[650px] md:min-w-0 grid grid-cols-7 relative">
                {weekDates.map((dateItem, colIdx) => (
                  <div key={colIdx} className="relative border-r border-slate-100 last:border-r-0">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        onClick={() => onTimeSlotClick(selectedProfId, hour)}
                        className="h-16 border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors duration-100 cursor-pointer"
                      />
                    ))}

                    {getAppointmentsForDayAndProfessional(selectedProfId, dateItem).map((app) => {
                      const positionStyle = getCardPositionStyle(app.startTime, app.endTime);
                      let statusClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
                      if (app.status === 'confirmed') statusClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
                      if (app.status === 'cancelled') statusClasses = 'bg-rose-50 text-rose-700 border-rose-200 line-through opacity-70';

                      return (
                        <div
                          key={app.id}
                          onClick={(e) => { e.stopPropagation(); onAppointmentClick(app); }}
                          style={positionStyle}
                          className={`absolute left-1 right-1 p-2 rounded-lg border text-[9px] md:text-[10px] font-medium transition-all duration-200 shadow-sm cursor-pointer hover:shadow flex flex-col justify-between overflow-hidden group ${statusClasses}`}
                        >
                          <div>
                            <h4 className="font-bold truncate leading-tight">{app.patientName}</h4>
                            <p className="text-[8px] opacity-90 truncate leading-none mt-0.5">{app.serviceName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODO DE RENDERIZACIÓN: MES (CUADRÍCULA DE PARED) RESPONSIVO */}
      {/* ============================================================== */}
      {viewMode === 'month' && (
        <div className="flex flex-col flex-1 overflow-x-auto">
          <div className="min-w-[650px] md:min-w-0 flex flex-col flex-1">
            
            {/* Cabecera de días de la semana */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/20 text-center shrink-0">
              {weekDaysLabels.map((dayLabel, idx) => (
                <div key={idx} className="py-2.5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">
                  {dayLabel}
                </div>
              ))}
            </div>

            {/* Grilla mensual de 42 celdas */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 border-b border-slate-100 h-[500px] md:h-[580px]">
              {monthGridDays.map((dateItem, cellIdx) => {
                const isCurrentMonth = dateItem.getMonth() === currentMonthActive;
                const isTodayDate = isSameDay(dateItem, new Date());
                const isSelectedDay = isSameDay(dateItem, selectedDate);
                const dayApps = getAppointmentsForDay(dateItem);

                return (
                  <div
                    key={cellIdx}
                    onClick={() => {
                      selectedDate.setDate(dateItem.getDate());
                      selectedDate.setMonth(dateItem.getMonth());
                      selectedDate.setFullYear(dateItem.getFullYear());
                      setViewMode('day');
                    }}
                    className={`border-b border-r border-slate-100 p-1.5 md:p-2 flex flex-col gap-1 hover:bg-slate-50/80 transition-colors duration-105 cursor-pointer relative ${
                      isCurrentMonth ? 'bg-white' : 'bg-slate-50/30'
                    } ${isSelectedDay ? 'bg-indigo-50/10' : ''}`}
                  >
                    {/* Número del día y contador */}
                    <div className="flex justify-between items-center shrink-0">
                      <span className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${
                        isTodayDate ? 'bg-indigo-600 text-white shadow-sm' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {dateItem.getDate()}
                      </span>

                      {dayApps.length > 0 && (
                        <span className="text-[8px] md:text-[9px] font-bold px-1 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50">
                          {dayApps.length}
                        </span>
                      )}
                    </div>

                    {/* Turnos micro */}
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                      {dayApps.slice(0, 2).map((app) => (
                        <div
                          key={app.id}
                          className={`px-1 py-0.5 rounded border text-[8px] font-semibold truncate leading-none ${
                            app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                            app.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100 line-through opacity-70' :
                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}
                        >
                          {app.patientName}
                        </div>
                      ))}
                      {dayApps.length > 2 && (
                        <div className="text-[8px] text-slate-400 font-bold pl-1">
                          + {dayApps.length - 2}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
