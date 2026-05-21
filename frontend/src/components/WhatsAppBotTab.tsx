import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'bot';
  timestamp: string;
}

export const WhatsAppBotTab: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState<string>(() => {
    return localStorage.getItem('wa_welcome_message') || 
      '¡Hola! Te damos la bienvenida a nuestro canal de *Agendamiento Virtual por WhatsApp* 🦷✨. ¿Me podrías indicar tu *nombre y apellido* completo para poder registrarte?';
  });

  const [botStatus, setBotStatus] = useState<'active' | 'inactive'>('active');
  const [phoneSimulated, setPhoneSimulated] = useState<string>('+54 9 11 9999-8888');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Presiona el botón "Iniciar Chat" para enviar el primer mensaje simulado como paciente y ver cómo responde el bot en tiempo real.',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [currentState, setCurrentState] = useState<string>('WELCOME');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([
    'Consola lista. Esperando interacción en el chat...'
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Obtener tenantId activo de localStorage o fallback
  const tenantId = localStorage.getItem('active_tenant_id') || '10';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addDebugLog = (logText: string) => {
    setDebugLogs(prev => [logText, ...prev].slice(0, 10));
  };

  const handleSaveConfig = () => {
    localStorage.setItem('wa_welcome_message', welcomeMessage);
    alert('¡Configuración del bot guardada con éxito!');
    addDebugLog('Configuración: Mensaje de bienvenida personalizado actualizado en localStorage.');
  };

  const handleResetSession = async () => {
    setMessages([]);
    setCurrentState('WELCOME');
    addDebugLog(`API: Reiniciando máquina de estados para el teléfono ${phoneSimulated}...`);
    
    try {
      await api.delete(`/whatsapp/session/${tenantId}/${phoneSimulated}`);
      addDebugLog('API: Sesión de chat borrada con éxito en el servidor Spring Boot.');
    } catch (e) {
      addDebugLog('FALLBACK: El servidor no está corriendo. Sesión reiniciada localmente.');
    }

    setMessages([
      {
        id: 'reset',
        text: 'La sesión ha sido reiniciada. Envía un mensaje como "hola" o presiona el botón rápido para iniciar el flujo de agendamiento de turnos.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Motor conversacional offline (Fallback) si el backend no responde
  const handleOfflineFallback = (text: string) => {
    const norm = text.trim().toLowerCase();
    
    if (currentState === 'WELCOME' || norm === 'hola' || norm === 'buenas' || norm === 'menu') {
      setCurrentState('MAIN_MENU');
      return `¡Hola! Bienvenido de nuevo a la agenda virtual de la clínica. 👋😊\n\n¿En qué te puedo ayudar hoy? Escribe el número de tu opción:\n1️⃣ *Solicitar un nuevo turno*\n2️⃣ *Consultar mis turnos activos*\n3️⃣ *Cancelar un turno*`;
    }

    if (currentState === 'AWAITING_NAME') {
      setCurrentState('MAIN_MENU');
      return `¡Excelente, *${text}*! Te he registrado con éxito. 🎉\n\n¿En qué te puedo ayudar hoy? Escribe el número de la opción:\n1️⃣ *Solicitar un nuevo turno*\n2️⃣ *Consultar mis turnos activos*\n3️⃣ *Cancelar un turno*`;
    }

    if (currentState === 'MAIN_MENU') {
      if (text === '1') {
        setCurrentState('SELECT_SERVICE');
        return `🦷 *Elige el tratamiento o servicio médico*\n\n[1] *Consulta de Diagnóstico* (30 min) - $35.00\n[2] *Servicio Estándar* (60 min) - $80.00\n[3] *Asesoría Personalizada* (45 min) - $50.00\n\n_Escribe el número de la opción deseada:_`;
      } else if (text === '2') {
        setCurrentState('WELCOME');
        return `📅 *Tus Turnos Programados:*\n\n👉 *Consulta de Diagnóstico* con *Dra. Clara Ortega*\n📆 Mañana a las 09:00 hs (Estado: CONFIRMADO)\n\n_Escribe cualquier mensaje para regresar al menú principal._`;
      } else if (text === '3') {
        setCurrentState('CANCEL_SELECT');
        return `❌ *Selecciona el turno que deseas CANCELAR*\n\n[1] *Consulta de Diagnóstico* el Mañana a las 09:00 hs\n\n_Escribe el número de la opción que deseas cancelar:_`;
      } else {
        return `Opción no válida. Por favor, escribe:\n1️⃣ Para solicitar turno\n2️⃣ Para ver tus turnos\n3️⃣ Para cancelar un turno`;
      }
    }

    if (currentState === 'SELECT_SERVICE') {
      if (['1', '2', '3'].includes(text)) {
        setCurrentState('SELECT_PROFESSIONAL');
        return `👩‍⚕️ *Selecciona el profesional médico*\n\n[1] *Dra. Clara Ortega*\n[2] *Dr. Mateo Ramos*\n[3] *Cualquiera disponible (Más veloz)*\n\n_Escribe el número de tu opción:_`;
      }
      return 'Por favor, selecciona una opción válida de la lista (1, 2 o 3).';
    }

    if (currentState === 'SELECT_PROFESSIONAL') {
      if (['1', '2', '3'].includes(text)) {
        setCurrentState('SELECT_SLOT');
        return `⏰ *Selecciona un horario disponible:*\n\n[1] *Mañana* a las *09:00 hs*\n[2] *Mañana* a las *11:00 hs*\n[3] *Pasado mañana* a las *14:00 hs*\n\n_Escribe el número del turno que más te convenga:_`;
      }
      return 'Selecciona un especialista válido escribiendo un número.';
    }

    if (currentState === 'SELECT_SLOT') {
      if (['1', '2', '3'].includes(text)) {
        setCurrentState('WELCOME');
        return `🎉 *¡Excelente! Tu turno ha sido agendado con éxito:*\n\n🏥 *Especialista:* Dra. Clara Ortega\n💆‍♂️ *Tratamiento:* Consulta de Diagnóstico\n📆 *Día:* Mañana\n⏰ *Hora:* 09:00 hs\n\nTe hemos enviado la confirmación. ¡Te esperamos! 😊\n\n⚠️ *Recuerda:* Los turnos se cancelan con 24 hs de anticipación, de lo contrario se cobrará el valor del mismo.\n\n_Escribe cualquier mensaje si necesitas volver al menú principal._`;
      }
      return 'Por favor, ingresa el número correspondiente al turno deseado.';
    }

    if (currentState === 'CANCEL_SELECT') {
      if (text === '1') {
        setCurrentState('WELCOME');
        return `❌ *Tu turno de Consulta de Diagnóstico ha sido CANCELADO con éxito.*\n\nLamentamos que no puedas asistir. Escribe cualquier mensaje si deseas volver a agendar en el futuro. ¡Que tengas un buen día!`;
      }
      return 'Escribe 1 para confirmar la cancelación de tu turno.';
    }

    setCurrentState('WELCOME');
    return 'Lo sentimos, sesión expirada o no reconocida. Escribe "hola" para volver a iniciar el bot.';
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const patientMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'patient',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, patientMsg]);
    setInputText('');
    setIsTyping(true);

    addDebugLog(`CHAT: Enviando mensaje como paciente: "${textToSend}"`);
    
    // Simular un pequeño retardo de escritura del bot (Wow effect)
    setTimeout(async () => {
      try {
        addDebugLog(`API: Enviando petición POST a /api/v1/whatsapp/simulate/${tenantId}`);
        const response = await api.post(`/whatsapp/simulate/${tenantId}`, {
          phone: phoneSimulated,
          message: textToSend
        });

        const data = response.data;
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: data.botResponse,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMsg]);
        setCurrentState(data.sessionState);
        addDebugLog(`API: Servidor respondió con éxito. Nuevo estado de sesión: ${data.sessionState}`);
        
        // Simular logs de triggers o SQL ejecutados
        if (data.sessionState === 'MAIN_MENU' && textToSend.length > 2) {
          addDebugLog('SQL: SELECT * FROM patients WHERE phone = ' + phoneSimulated);
          addDebugLog('JPA: Creación de paciente nuevo en caso de no existir.');
        } else if (data.sessionState === 'SELECT_SLOT') {
          addDebugLog('JPA: SELECT FROM appointments WHERE professional_id = ... AND start_time BETWEEN ...');
          addDebugLog('ALGORITMO: Calculando huecos libres en el calendario.');
        } else if (data.botResponse.includes('confirmado con éxito')) {
          addDebugLog('TRIGGER: tg_appointments_calculate_endtime_insert disparado en MySQL.');
          addDebugLog('JPA: INSERT INTO appointments. Turno guardado bajo tenant_id: ' + tenantId);
        }

      } catch (error) {
        addDebugLog('WARNING: No se pudo conectar con el Backend en Spring Boot. Ejecutando motor de fallback local.');
        
        const fallbackResponse = handleOfflineFallback(textToSend);
        
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackResponse,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMsg]);
        addDebugLog(`FALLBACK: Respuesta simulada. Estado local: ${currentState}`);
      } finally {
        setIsTyping(false);
      }
    }, 850);
  };

  const handleStartChat = () => {
    handleResetSession();
    setTimeout(() => {
      handleSendMessage('hola');
    }, 300);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-1 h-full w-full overflow-hidden animate-fade-in font-sans">
      
      {/* 1. SECCIÓN IZQUIERDA: CONFIGURACIÓN GENERAL DEL BOT */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-slate-800">Panel de Control WhatsApp Bot</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configura las credenciales y el flujo conversacional del bot de tu clínica.</p>
        </div>

        <div className="space-y-4">
          {/* Switch de Estado */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-700">Estado del Bot</h3>
              <p className="text-[10px] text-slate-500">Habilita o deshabilita la respuesta automática del bot.</p>
            </div>
            <button
              onClick={() => setBotStatus(botStatus === 'active' ? 'inactive' : 'active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                botStatus === 'active' 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {botStatus === 'active' ? '● ACTIVO' : '○ INACTIVO'}
            </button>
          </div>

          {/* URL Webhook para Meta */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">URL de Webhook oficial (Meta Developer Console)</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`https://api.agenda-multi.com/api/v1/whatsapp/webhook/${tenantId}`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 focus:outline-none select-all"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://api.agenda-multi.com/api/v1/whatsapp/webhook/${tenantId}`);
                  alert('¡URL de Webhook copiada al portapapeles!');
                }}
                className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors"
                title="Copiar URL"
              >
                Copiar
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Esta es la URL única que debes pegar en el panel de desarrollador de Meta o Twilio para conectar tu número real.</p>
          </div>

          {/* Personalización Mensaje Bienvenida */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Mensaje de Bienvenida Automático</label>
            <textarea
              rows={4}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
            />
            <p className="text-[10px] text-slate-400">Se enviará automáticamente a pacientes nuevos que escriban por primera vez desde un número de teléfono.</p>
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors w-full"
          >
            Guardar Configuración del Bot
          </button>
        </div>

        {/* Consola Técnica Debugger */}
        <div className="border-t border-slate-100 pt-5 flex-1 flex flex-col min-h-[160px]">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Consola del Desarrollador (Live Debugger)
          </h4>
          <div className="flex-1 bg-slate-950 text-slate-300 font-mono text-[10px] p-4 rounded-xl overflow-y-auto space-y-1.5 shadow-inner">
            {debugLogs.map((log, i) => {
              let color = 'text-slate-400';
              if (log.startsWith('SQL')) color = 'text-amber-400';
              if (log.startsWith('API')) color = 'text-sky-400';
              if (log.startsWith('TRIGGER')) color = 'text-emerald-400';
              if (log.startsWith('WARNING')) color = 'text-rose-400';
              
              return (
                <div key={i} className={`${color} leading-relaxed`}>
                  <span className="text-slate-600 font-bold mr-1">&gt;</span>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DERECHA: EL SMARTPHONE SIMULATOR */}
      <div className="w-full xl:w-[380px] shrink-0 flex flex-col items-center justify-center p-3">
        
        {/* Teléfono Estilo iPhone Premium */}
        <div className="w-[340px] h-[640px] bg-slate-950 rounded-[48px] p-3 shadow-2xl relative border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
          
          {/* Botón de encendido / sensores */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-30 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
            <div className="w-14 h-1.5 bg-slate-800 rounded-full"></div>
          </div>

          {/* Pantalla del Celular */}
          <div className="flex-1 bg-[#efeae2] rounded-[36px] overflow-hidden flex flex-col relative">
            
            {/* Cabecera del WhatsApp (Verde) */}
            <div className="h-[74px] bg-[#075e54] text-white pt-6 px-4 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={handleResetSession}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
                  title="Reiniciar Sesión"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-100/10 border border-white/10 flex items-center justify-center font-bold text-sm shrink-0">
                  🤖
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-none">TurnoBot Dental</h4>
                  <span className="text-[9px] text-emerald-200 font-semibold mt-0.5 block">En línea</span>
                </div>
              </div>

              {/* Debugger Estado de la sesión */}
              <div className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-[8px] font-mono tracking-wider font-bold">
                {currentState}
              </div>
            </div>

            {/* Fondo de pantalla oficial de WhatsApp (Pattern) */}
            <div className="absolute inset-0 top-[74px] bottom-[54px] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.06] pointer-events-none" />

            {/* Listado de Mensajes */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col relative top-0 z-10">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[82%] px-3 py-1.5 rounded-2xl text-[11px] shadow-sm leading-relaxed whitespace-pre-wrap transition-all animate-fade-in ${
                      isBot
                        ? 'bg-white text-slate-800 self-start rounded-tl-none border border-slate-200/50'
                        : 'bg-[#dcf8c6] text-slate-800 self-end rounded-tr-none'
                    }`}
                  >
                    {/* Renderización básica de negritas tipo WhatsApp markdown */}
                    {msg.text.split('\n').map((line, lineIdx) => (
                      <p key={lineIdx} className={lineIdx > 0 ? 'mt-1' : ''}>
                        {line.split('**').map((chunk, chunkIdx) => {
                          if (chunkIdx % 2 === 1) {
                            return <strong key={chunkIdx} className="font-bold">{chunk}</strong>;
                          }
                          return chunk.split('*').map((subChunk, subChunkIdx) => {
                            if (subChunkIdx % 2 === 1) {
                              return <strong key={subChunkIdx} className="font-bold text-slate-900">{subChunk}</strong>;
                            }
                            return subChunk;
                          });
                        })}
                      </p>
                    ))}
                    
                    <div className="flex justify-end items-center gap-1 mt-1 text-[8px] text-slate-400 leading-none">
                      <span>{msg.timestamp}</span>
                      {!isBot && (
                        <svg className="w-3 h-3 text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Animación "Escribiendo..." del Bot */}
              {isTyping && (
                <div className="bg-white text-slate-500 self-start rounded-2xl rounded-tl-none px-3 py-2 text-[10px] shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input del Chat (Abajo) */}
            <div className="h-[54px] bg-[#f0f0f0] border-t border-slate-200/80 px-3 flex items-center gap-2 shrink-0 z-10">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
                className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#075e54]"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                className="w-8.5 h-8.5 bg-[#075e54] hover:bg-[#128c7e] text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md"
                title="Enviar Mensaje"
              >
                <svg className="w-4.5 h-4.5 transform rotate-90 -mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Acceso Rápido Flujo Simulado */}
        <div className="mt-3.5 flex flex-col gap-2 w-full max-w-[340px]">
          <button
            onClick={handleStartChat}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>🚀 Iniciar Chat de Prueba</span>
          </button>
          <div className="flex justify-between gap-2">
            <button
              onClick={() => handleSendMessage('1')}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
            >
              Opción "1" (Agendar)
            </button>
            <button
              onClick={() => handleSendMessage('2')}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
            >
              Opción "2" (Ver Turnos)
            </button>
            <button
              onClick={() => handleSendMessage('3')}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
            >
              Opción "3" (Cancelar)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
