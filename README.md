# SaaS Agenda Multi - Sistema de Gestión de Turnos Multi-Inquilino

Este proyecto es una plataforma web de nivel enterprise tipo **SaaS (Software as a Service) Multi-Inquilino** diseñada para la gestión integral de turnos, agendas clínicas, personal de trabajo, catálogo de servicios y fichas de pacientes.

El sistema está estructurado con una arquitectura robusta que garantiza el aislamiento lógico de datos entre diferentes clínicas o inquilinos, ofreciendo al mismo tiempo un panel unificado de control administrativo global.

---

## 🎨 Filosofía de Diseño y Experiencia de Usuario (UX)

La aplicación cuenta con una interfaz moderna construida bajo los más altos estándares de diseño digital:
*   **Estética Midnight Blue & Glassmorphism:** Fondo de gradientes oscuros combinados con tarjetas translúcidas con desenfoque de fondo (*backdrop-blur*) para los paneles de acceso y pantallas principales.
*   **Temas Dinámicos en Tiempo Real:** El inquilino tiene la capacidad de cambiar la identidad visual de su clínica al instante eligiendo entre 5 paletas de colores cuidadosamente curadas (Índigo, Esmeralda, Violeta, Ámbar y Rosa).
*   **Micro-Animaciones e Indicadores Visuales:** Transiciones suaves para la navegación, estados activos/inactivos en el calendario y rebotes interactivos de confirmación para una experiencia fluida.

---

## 🔑 Pantalla de Acceso Unificada (Login)

La puerta de entrada a la plataforma cuenta con utilidades avanzadas de seguridad y usabilidad:
*   **Detección Automática de Rol:** Un único formulario procesa dinámicamente si el correo ingresado corresponde al administrador global del SaaS o a un profesional/inquilino particular.
*   **Visualización Flexible:** Toggle interactivo (ícono de ojo vectorizado) para mostrar u ocultar la contraseña en tiempo real.
*   **Persistencia de Sesión ("Recordar Contraseña"):** Casilla de verificación inteligente que guarda localmente en el navegador (`localStorage`) las credenciales seleccionadas únicamente tras un login exitoso.
*   **Recuperador de Credenciales Integrado:** Un flujo dinámico en la misma tarjeta que simula la búsqueda en la base de datos de inquilinos y proporciona de forma didáctica la clave correspondiente en caso de coincidencia.

---

## 👥 Roles del Sistema y Flujos de Trabajo

La plataforma bifurca su funcionamiento en dos grandes roles de negocio claramente diferenciados:

### 1. Super Administrador del SaaS (SaaS Owner)
Este rol tiene visibilidad y gobernanza total sobre la infraestructura del negocio. Sus módulos incluyen:
*   **Facturación SaaS:** Panel de métricas financieras que resume los ingresos recurrentes mensuales (MRR), el total de suscripciones activas, tasas de abandono (*churn rate*) y gráficos interactivos de rendimiento.
*   **Gestión de Clientes / Inquilinos:** CRUD centralizado de clínicas afiliadas. Permite suspender accesos, cambiar planes (Básico, Estándar, Premium) y asignar contraseñas corporativas de manera directa.
*   **Configuración Global:** Panel técnico donde se controlan las pasarelas de pago virtuales (Stripe Checkout y MercadoPago Subscriptions) y se simula el envío automatizado de correos de cobranza periódica.

### 2. Inquilino / Profesional (Agenda de la Clínica)
Es el panel operativo para cada centro clínico o profesional independiente. Sus módulos operativos son:
*   **Agenda / Calendario Interactivo:** 
    *   Una grilla interactiva dividida por horas de trabajo y columnas individuales para cada profesional de la clínica.
    *   Soporta creación de turnos con un clic directamente sobre el bloque horario disponible.
    *   Control visual de estados: *Pendiente* (color amarillo/alerta), *Confirmado* (color sólido del tema corporativo) y *Cancelado* (tachado discreto y atenuado).
*   **Equipo de Trabajo:** Gestión de miembros que forman parte de la clínica, distinguiendo entre **Especialistas Clínicos** (médicos, odontólogos, etc.) y **Secretarios/as**.
*   **Catálogo de Servicios:** Administración de los tratamientos o consultas provistos, con definición exacta de la duración en minutos y arancel monetario correspondiente.
*   **Fichero de Pacientes:** Base de datos relacional de contacto (nombre, correo y teléfono) para un seguimiento clínico y agendamiento veloz.
*   **Configuración de Marca:** Customización local del nombre comercial del inquilino y selección de la paleta cromática de la interfaz.

---

## 🔒 Arquitectura Multi-Tenant (Aislamiento de Datos)

La seguridad y la privacidad de la información son la prioridad en el núcleo de la aplicación:
1.  **Aislamiento en Base de Datos (Backend):** 
    Cada tabla clave del esquema lógico (`appointments`, `patients`, `professionals`, `services`) cuenta con una columna `tenant_id` indexada. La base de datos y el backend en Java aseguran que ninguna consulta pueda cruzar registros entre inquilinos diferentes.
2.  **Segregación Dinámica de Dominio (Frontend):** 
    *   El sistema analiza el *subdominio* del navegador (ej. `clinicasmile.agenda.com`) para fijar el `tenant_id` de manera automática en las cabeceras HTTP (`X-Tenant-ID`).
    *   En entornos de desarrollo local, el sistema utiliza un *fallback* inteligente a través del almacenamiento local para que la experiencia multi-inquilino se pueda simular sin alterar configuraciones de red.
3.  **Seguridad Basada en Tokens:** 
    Toda petición saliente se autentica mediante tokens JWT, garantizando que el usuario logueado solo tenga privilegios de lectura/escritura sobre los recursos que pertenecen estrictamente a su ID de inquilino asignado.
