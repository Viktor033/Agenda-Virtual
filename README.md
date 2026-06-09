# 🏥 Shifty SaaS — Sistema de Gestión de Turnos para Policonsultorios

<p align="center">
  <strong>Plataforma web enterprise de nivel SaaS (Software as a Service) Multi-Consultorio</strong><br/>
  Gestión integral de turnos, agendas clínicas, profesionales, servicios, pacientes y facturación — todo en una sola solución.
</p>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Filosofía de Diseño y UX](#-filosofía-de-diseño-y-experiencia-de-usuario-ux)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura Multi-Consultorio](#-arquitectura-multi-consultorio-aislamiento-de-datos)
- [Pantalla de Acceso (Login)](#-pantalla-de-acceso-unificada-login)
- [Landing Page Comercial](#-landing-page-comercial)
- [Roles y Módulos del Sistema](#-roles-del-sistema-y-módulos-operativos)
  - [Super Administrador SaaS](#1-super-administrador-del-saas-saas-owner)
  - [Administrador del Consultorio](#2-administrador-del-consultorio-panel-operativo)
- [Bot de WhatsApp — Agendamiento Virtual](#-bot-de-whatsapp--agendamiento-virtual-por-conversación)
- [Notificaciones Automáticas](#-sistema-de-notificaciones-automáticas)
- [Pasarela de Pago — Stripe Checkout](#-pasarela-de-pago--stripe-checkout)
- [Planes y Límites por Suscripción](#-planes-y-límites-por-suscripción)
- [Aprovisionamiento Automático de Consultorios](#-aprovisionamiento-automático-de-consultorios)
- [Modelo de Base de Datos](#-modelo-de-base-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Cómo Ejecutar](#-cómo-ejecutar)

---

## 🎯 Descripción General

**Shifty** es una plataforma web diseñada para **policonsultorios, clínicas y profesionales independientes** que necesitan gestionar turnos, agendas, equipos de trabajo y fichas de pacientes de forma organizada y centralizada.

El sistema funciona bajo un modelo **SaaS Multi-Consultorio**: cada consultorio que se registra obtiene su propio espacio completamente aislado dentro de la plataforma, con su propia agenda, profesionales, servicios, pacientes y configuración visual personalizada. Un panel de administración global (Super Admin) supervisa toda la infraestructura comercial, suscripciones y facturación.

### Características Principales

| Funcionalidad | Descripción |
|---|---|
| 📅 **Agenda Interactiva** | Grilla de calendario dividida por hora y profesional con creación de turnos con un clic |
| 🤖 **Bot de WhatsApp** | Chatbot conversacional con máquina de estados para agendar, consultar y cancelar turnos |
| 💳 **Stripe Checkout** | Integración con Stripe para cobro de suscripciones y gestión del ciclo de vida de pagos |
| 🔔 **Notificaciones Programadas** | Motor asíncrono de recordatorios diarios vía WhatsApp a las 08:00 AM |
| 🏗️ **Aprovisionamiento Automático** | Alta de nuevos consultorios con usuario admin, servicios por defecto y suscripción trial |
| 🎨 **Temas Dinámicos** | 5 paletas de colores intercambiables en tiempo real por consultorio |
| 🔒 **Seguridad JWT + Multi-Tenant** | Aislamiento riguroso de datos por consultorio con tokens JWT y filtros de Hibernate |
| 📊 **Panel SaaS** | Métricas financieras: MRR, suscripciones activas, churn rate, gráficos de rendimiento |

---

## 🎨 Filosofía de Diseño y Experiencia de Usuario (UX)

La interfaz fue construida bajo los más altos estándares de diseño digital moderno:

- **Estética Midnight Blue & Glassmorphism:** Gradientes oscuros profundos combinados con tarjetas translúcidas con `backdrop-blur` para una sensación premium.
- **Temas Dinámicos en Tiempo Real:** Cada consultorio personaliza su identidad visual al instante eligiendo entre **5 paletas de colores** curadas:
  - 🟣 Índigo · 🟢 Esmeralda · 🟣 Violeta · 🟡 Ámbar · 🌸 Rosa
- **Micro-Animaciones e Indicadores Visuales:** Transiciones suaves, estados activos/inactivos en el calendario, rebotes interactivos de confirmación.
- **Responsive Design:** Adaptado para escritorio y dispositivos móviles.

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| **Java** | 17 | Lenguaje principal del servidor |
| **Spring Boot** | 3.2.5 | Framework de aplicación enterprise |
| **Spring Security** | — | Autenticación y autorización |
| **Spring Data JPA / Hibernate** | — | ORM con filtros multi-tenant automáticos |
| **Spring AOP** | — | Aspectos para inyección automática de `tenant_id` |
| **JJWT** | 0.12.6 | Generación y validación de tokens JWT |
| **Stripe Java SDK** | 25.10.0 | Integración con pasarela de pagos Stripe |
| **Lombok** | — | Reducción de boilerplate en entidades y servicios |
| **MySQL** | 8.0 | Motor de base de datos relacional |

### Frontend
| Tecnología | Propósito |
|---|---|
| **React + TypeScript** | Framework UI con tipado estricto |
| **Vite** | Bundler ultrarrápido para desarrollo |
| **Axios** | Cliente HTTP para comunicación con la API |
| **CSS Custom Properties** | Sistema de temas dinámicos por consultorio |

---

## 🔒 Arquitectura Multi-Consultorio (Aislamiento de Datos)

La seguridad y la privacidad de la información son el pilar del sistema. Cada consultorio opera en un espacio lógicamente aislado:

### 1. Aislamiento en Base de Datos (Backend)
Cada tabla clave del esquema (`appointments`, `patients`, `professionals`, `services`, `subscriptions`) incluye una columna `tenant_id` indexada. **Hibernate Filters** y un **`TenantFilterAspect` (AOP)** inyectan automáticamente el filtro del consultorio activo en cada consulta JPA, haciendo imposible que los datos se crucen entre consultorios.

### 2. Segregación Dinámica de Dominio (Frontend)
- El sistema analiza el **subdominio** del navegador (ej. `clinicasmile.agenda.com`) para fijar el `tenant_id` automáticamente en las cabeceras HTTP (`X-Tenant-ID`).
- En entornos de desarrollo local, se utiliza un **fallback inteligente** vía `localStorage` para simular la experiencia multi-consultorio sin configuraciones de red.

### 3. Seguridad Basada en Tokens JWT
- Toda petición saliente se autentica mediante **tokens JWT** con claims de `tenantId` y `role`.
- Un **`JwtFilter`** de Spring Security intercepta cada request, valida el token y establece el contexto del consultorio activo.
- El **`TenantFilter`** adicional extrae el `X-Tenant-ID` del header y lo inyecta en el `TenantContext` (ThreadLocal).

### 4. Auditoría Automatizada
Un sistema de **triggers en MySQL** registra automáticamente en la tabla `audit_logs` cada cambio de estado, reasignación de profesional o modificación de horario en los turnos, preservando los valores anteriores y nuevos en formato JSON.

---

## 🔑 Pantalla de Acceso Unificada (Login)

La puerta de entrada a la plataforma incluye:

- **Detección Automática de Rol:** Un único formulario procesa dinámicamente si el correo corresponde al Super Administrador global o a un profesional/administrador de un consultorio particular.
- **Toggle de Visibilidad:** Ícono vectorizado interactivo para mostrar u ocultar la contraseña.
- **Persistencia de Sesión ("Recordar Contraseña"):** Casilla inteligente que guarda credenciales en `localStorage` únicamente tras un login exitoso.
- **Recuperador de Credenciales:** Flujo dinámico en la misma tarjeta que busca en la base de datos del consultorio y proporciona la clave correspondiente.

---

## 🌐 Landing Page Comercial

Página de presentación pública de la plataforma con:

- **Hero Section** con llamada a la acción y descripción del producto.
- **Sección de Planes y Precios** (Básico, Estándar, Premium) con registro integrado.
- **Formulario de Alta Rápida:** Selección de oficio/rubro (Barbería, Odontología, Psicología, Kinesiología), email y contraseña para crear un consultorio nuevo directamente desde la landing.
- **Flujo de Onboarding:** Al registrarse, el sistema invoca el `TenantProvisioningService` que crea automáticamente el consultorio, usuario admin, servicios por defecto y suscripción trial.

---

## 👥 Roles del Sistema y Módulos Operativos

### 1. Super Administrador del SaaS (SaaS Owner)

Tiene visibilidad y gobernanza total sobre la infraestructura del negocio:

| Módulo | Descripción |
|---|---|
| **📊 Facturación SaaS** | Panel de métricas financieras: ingresos recurrentes mensuales (MRR), total de suscripciones activas, tasas de abandono (churn rate) y gráficos de rendimiento |
| **🏥 Gestión de Consultorios** | CRUD centralizado de consultorios afiliados. Suspender accesos, cambiar planes (Básico, Estándar, Premium), asignar contraseñas corporativas |
| **⚙️ Configuración Global** | Control de pasarelas de pago (Stripe Checkout / MercadoPago) y simulación de correos de cobranza |

### 2. Administrador del Consultorio (Panel Operativo)

Panel de gestión para cada consultorio o profesional independiente:

| Módulo | Descripción |
|---|---|
| **📅 Agenda / Calendario** | Grilla interactiva dividida por horas y columnas por profesional. Creación de turnos con un clic sobre el bloque horario. Estados visuales: *Pendiente* (amarillo), *Confirmado* (color del tema), *Cancelado* (tachado atenuado) |
| **👩‍⚕️ Equipo de Trabajo** | Gestión de profesionales distinguiendo entre **Especialistas Clínicos** (médicos, odontólogos) y **Secretarios/as**. CRUD completo con estados activo/inactivo |
| **🏷️ Catálogo de Servicios** | Administración de tratamientos con duración en minutos y arancel monetario |
| **📋 Fichero de Pacientes** | Base de datos de contacto (nombre, correo, teléfono) para seguimiento clínico y agendamiento rápido |
| **🤖 Bot de WhatsApp** | Panel de control del chatbot conversacional (ver sección dedicada) |
| **🎨 Configuración de Marca** | Personalización del nombre comercial del consultorio y selección de paleta cromática |

---

## 🤖 Bot de WhatsApp — Agendamiento Virtual por Conversación

Uno de los módulos más avanzados del sistema. Un **chatbot conversacional** basado en una **máquina de estados finitos** que permite a los pacientes agendar, consultar y cancelar turnos directamente desde WhatsApp.

### Flujo Conversacional

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  WELCOME    │────▶│  MAIN_MENU   │────▶│  SELECT_SERVICE     │
│  (Saludo)   │     │  1.Reservar  │     │  (Lista servicios)  │
└─────────────┘     │  2.Consultar │     └────────┬────────────┘
                    │  3.Cancelar  │              │
                    └──────┬───────┘              ▼
                           │            ┌─────────────────────┐
                           │            │ SELECT_PROFESSIONAL  │
                           │            │ (Lista especialistas)│
                           │            └────────┬────────────┘
                           │                     ▼
                           │            ┌─────────────────────┐
                           │            │   SELECT_SLOT       │
                           │            │  (Horarios libres)  │
                           │            └────────┬────────────┘
                           │                     ▼
                           │            ┌─────────────────────┐
                           │            │  ✅ TURNO CREADO     │
                           │            └─────────────────────┘
                           │
                           ├─(opción 3)─▶ CANCEL_SELECT
                           │              (Lista turnos activos)
                           │              → ❌ TURNO CANCELADO
                           │
                           └─(opción 2)─▶ Muestra turnos futuros
```

### Funcionalidades del Bot

- **Auto-registro de pacientes nuevos:** Si el teléfono no está registrado, inicia un flujo de captura de nombre y registro automático.
- **Catálogo dinámico:** Muestra los servicios activos del consultorio con precio y duración.
- **Selección de profesional:** Lista los especialistas disponibles con opción "Cualquiera disponible (más veloz)".
- **Cálculo inteligente de slots:** Algoritmo que calcula horarios libres para los próximos 3 días, excluyendo domingos, verificando colisiones con turnos existentes.
- **Confirmación directa:** Los turnos agendados por WhatsApp quedan con estado `confirmed` automáticamente.
- **Cancelación interactiva:** Lista turnos activos para seleccionar cuál cancelar.
- **Contexto multi-consultorio:** El `TenantContext` se establece dinámicamente por cada mensaje entrante.

---

## 🔔 Sistema de Notificaciones Automáticas

Motor asíncrono basado en `@Scheduled` + `@Async` de Spring:

- **Ejecución diaria a las 08:00 AM** (`cron = "0 0 8 * * *"`).
- Busca **todas las citas del día siguiente** (cross-tenant, nivel SaaS completo).
- Para cada cita, lanza un **hilo asíncrono** que:
  1. Establece el `TenantContext` del consultorio correspondiente.
  2. Resuelve paciente, profesional y servicio.
  3. Simula el envío de un **mensaje de recordatorio vía WhatsApp** con opción de confirmar o cancelar.
- El hilo principal queda **liberado inmediatamente** gracias a `@Async`.

---

## 💳 Pasarela de Pago — Stripe Checkout

Integración completa con el ciclo de vida de suscripciones de Stripe:

### Webhook Controller (`/api/v1/webhooks/stripe`)

| Evento Stripe | Acción del Sistema |
|---|---|
| `checkout.session.completed` | Crea/actualiza la suscripción local con IDs de Stripe, activa el consultorio y asigna el plan |
| `customer.subscription.updated` | Actualiza el estado de la suscripción |
| `invoice.payment_succeeded` | Confirma el pago exitoso del período actual |
| `customer.subscription.deleted` | Marca la suscripción como cancelada y suspende el consultorio |

### Seguridad del Webhook
- Verificación de firma con `Stripe-Signature` y `webhook-secret`.
- Modo desarrollo con fallback sin verificación de firma (configurable).

---

## 📦 Planes y Límites por Suscripción

El sistema implementa un `PlanLimitService` que valida restricciones en tiempo real antes de crear profesionales o turnos:

| Plan | Profesionales Activos | Turnos Mensuales | Precio |
|---|---|---|---|
| **Trial** | 1 | 2 | Gratis |
| **Basic** | 1 | 150 | $0 |
| **Standard** | 5 | Ilimitados | $10 |
| **Premium** | Ilimitados | Ilimitados | $20 |

Cuando se alcanza el límite, el sistema lanza una `PlanLimitExceededException` con un mensaje claro indicando al usuario que actualice su plan.

---

## 🏗️ Aprovisionamiento Automático de Consultorios

El `TenantProvisioningService` ejecuta el onboarding completo de un nuevo consultorio en una sola transacción:

1. **Crea el registro del consultorio** en la tabla `tenants` con nombre, oficio y subdominio.
2. **Crea el usuario administrador** con email y contraseña hasheada (BCrypt).
3. **Simula el envío de correo de bienvenida** con URL de acceso y credenciales temporales.
4. **Inicializa servicios por defecto** según el rubro seleccionado:
   - 🪒 *Barbería:* Corte Clásico, Afeitado y Barba
   - 🦷 *Odontología:* Consulta Diagnóstica, Profilaxis Dental
   - 🧠 *Psicología:* Terapia Individual, Evaluación Psicológica
   - 💪 *Kinesiología:* Sesión Motora, Rehabilitación Física
5. **Crea la suscripción trial** con plan `basic` y estado `active`.

---

## 🗄️ Modelo de Base de Datos

Motor: **MySQL 8.0** | Engine: **InnoDB** | Charset: **utf8mb4**

```
┌─────────────────────┐
│  categories_oficios  │  ← Rubros globales (Odontología, Barbería, etc.)
└─────────┬───────────┘
          │ 1:N
┌─────────▼───────────┐
│      tenants        │  ← Cada consultorio registrado
└─────────┬───────────┘
          │ 1:N
    ┌─────┼─────┬──────────┬──────────┬──────────┐
    ▼     ▼     ▼          ▼          ▼          ▼
users_auth │  services  patients  subscriptions  audit_logs
           ▼
     professionals
           │
           └──────┐
                  ▼
            appointments  ← (professional + patient + service + tenant)
```

### Tablas principales

| Tabla | Descripción | Particionamiento |
|---|---|---|
| `categories_oficios` | Catálogo global de rubros/oficios | — |
| `tenants` | Consultorios registrados (nombre, subdominio, estado) | — |
| `users_auth` | Credenciales de acceso (email, hash, rol, estado) | — |
| `professionals` | Especialistas y secretarios del consultorio | — |
| `services` | Tratamientos con duración y arancel | — |
| `patients` | Padrón de pacientes por consultorio | — |
| `appointments` | Turnos/citas (profesional + paciente + servicio) | `HASH(tenant_id)` × 32 |
| `subscriptions` | Suscripciones Stripe por consultorio | `HASH(tenant_id)` × 32 |
| `audit_logs` | Registro de auditoría de cambios | `HASH(tenant_id)` × 32 |

### Triggers Automáticos

- **`tg_appointments_calculate_endtime_insert/update`**: Calcula automáticamente el `end_time` de cada turno basándose en la duración del servicio.
- **`tg_appointments_audit_update`**: Registra en `audit_logs` cada cambio de estado, profesional u horario con valores old/new en JSON.

### Vista de Seguridad (Row-Level Security)

```sql
CREATE VIEW v_secure_appointments AS
SELECT * FROM appointments
WHERE tenant_id = fn_current_tenant();
```

---

## 📁 Estructura del Proyecto

```
agenda multi/
├── backend/                          # API REST — Spring Boot 3.2.5
│   └── src/main/java/com/saas/shifty/
│       ├── ShiftyApplication.java    # Punto de entrada
│       ├── config/
│       │   ├── JpaConfig.java        # Configuración de JPA/Hibernate
│       │   ├── security/
│       │   │   ├── SecurityConfig.java          # Filtros Spring Security
│       │   │   ├── JwtFilter.java               # Interceptor de tokens JWT
│       │   │   ├── JwtUtil.java                 # Generación/validación JWT
│       │   │   └── UserDetailsServiceImpl.java  # Carga de usuarios desde DB
│       │   └── tenant/
│       │       ├── TenantContext.java            # ThreadLocal del consultorio activo
│       │       ├── TenantFilter.java             # Filtro HTTP para X-Tenant-ID
│       │       └── TenantFilterAspect.java       # AOP para Hibernate @Filter
│       ├── controller/
│       │   ├── AuthController.java              # Login y generación de JWT
│       │   ├── AppointmentController.java       # CRUD de turnos
│       │   ├── ProfessionalController.java      # CRUD de profesionales
│       │   ├── PatientController.java           # CRUD de pacientes
│       │   ├── ServiceController.java           # CRUD de servicios
│       │   ├── TenantProvisioningController.java # Alta de consultorios nuevos
│       │   ├── StripeWebhookController.java     # Webhook de pagos Stripe
│       │   └── WhatsAppController.java          # Endpoint del bot de WhatsApp
│       ├── entity/
│       │   ├── AbstractTenantEntity.java        # Clase base con tenant_id
│       │   ├── Appointment.java                 # Turno/cita
│       │   ├── Patient.java                     # Paciente
│       │   ├── Professional.java                # Profesional/especialista
│       │   ├── Service.java                     # Servicio/tratamiento
│       │   ├── Subscription.java                # Suscripción Stripe
│       │   ├── UserAuth.java                    # Credenciales de acceso
│       │   ├── WhatsAppSession.java             # Sesión conversacional del bot
│       │   ├── WhatsAppSessionState.java        # Máquina de estados del bot
│       │   └── PaymentOption.java               # Enum de planes y precios
│       ├── repository/                          # Interfaces JPA Repository
│       ├── service/
│       │   ├── AuthService.java                 # Lógica de autenticación
│       │   ├── PlanLimitService.java            # Validación de límites por plan
│       │   ├── TenantProvisioningService.java   # Onboarding de consultorios
│       │   ├── WhatsAppService.java             # Motor conversacional del bot
│       │   ├── WhatsAppSessionService.java      # Gestión de sesiones del bot
│       │   ├── NotificationScheduler.java       # Recordatorios diarios @Scheduled
│       │   └── TestDataInitializer.java         # Datos de prueba para desarrollo
│       └── exception/
│           ├── GlobalExceptionHandler.java      # Manejo centralizado de errores
│           └── PlanLimitExceededException.java  # Excepción de límite de plan
│
├── frontend/                        # SPA — React + TypeScript + Vite
│   └── src/
│       ├── App.tsx                   # Router principal (Landing → Login → Dashboard)
│       ├── pages/
│       │   ├── LandingPage.tsx       # Página comercial con registro integrado
│       │   ├── Login.tsx             # Pantalla de acceso unificada
│       │   └── Dashboard.tsx         # Dashboard principal post-login
│       ├── components/
│       │   ├── CalendarGrid.tsx              # Grilla de agenda interactiva
│       │   ├── Sidebar.tsx                   # Navegación lateral del dashboard
│       │   ├── ProfessionalsTab.tsx          # Gestión de equipo de trabajo
│       │   ├── ServicesTab.tsx               # Catálogo de servicios
│       │   ├── PatientsTab.tsx               # Fichero de pacientes
│       │   ├── SettingsTab.tsx               # Configuración del consultorio
│       │   ├── WhatsAppBotTab.tsx            # Panel de control del bot
│       │   ├── SaaSAdminTab.tsx              # Panel de Super Admin
│       │   ├── SaaSUsersTab.tsx              # Gestión de consultorios (Admin)
│       │   ├── NewAppointmentModal.tsx       # Modal de nuevo turno
│       │   ├── AppointmentDetailModal.tsx    # Detalle/edición de turno
│       │   ├── NewProfessionalModal.tsx      # Modal de nuevo profesional
│       │   ├── NewPatientModal.tsx           # Modal de nuevo paciente
│       │   ├── NewServiceModal.tsx           # Modal de nuevo servicio
│       │   ├── NewSaaSUserModal.tsx          # Modal de nuevo consultorio
│       │   ├── ConfirmDeleteModal.tsx        # Modal de confirmación
│       │   └── SuccessModal.tsx              # Modal de éxito
│       ├── services/
│       │   ├── api.ts                        # Instancia Axios configurada
│       │   ├── authService.ts                # Servicio de autenticación
│       │   ├── appointmentService.ts         # API de turnos
│       │   ├── professionalService.ts        # API de profesionales
│       │   ├── patientService.ts             # API de pacientes
│       │   └── serviceService.ts             # API de servicios
│       └── types/
│           └── index.ts                      # Definiciones TypeScript
│
├── database/
│   ├── schema.sql                   # Esquema completo de la base de datos
│   └── seed.sql                     # Datos semilla para pruebas
│
└── README.md                        # Este archivo
```

---

## 🚀 Cómo Ejecutar

### Prerrequisitos

- **Java 17** (JDK)
- **Maven 3.8+**
- **Node.js 18+** y **npm**
- **MySQL 8.0**

### 1. Base de Datos

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

> El servidor arranca en `http://localhost:8080`

### 3. Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

> El cliente arranca en `http://localhost:5173`

### Variables de Entorno (Backend)

```properties
# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/agenda_multi_db
spring.datasource.username=root
spring.datasource.password=tu_password

# JWT
app.jwt.secret=tu_secreto_jwt

# Stripe (opcional)
app.stripe.webhook-secret=whsec_tu_secreto
stripe.api.key=sk_test_tu_api_key
```

---

## 📄 Licencia

Proyecto privado. Todos los derechos reservados.
