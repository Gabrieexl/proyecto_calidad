# 🧠 Sistema CRM – Compina S.A.C.

![Portada](https://media.licdn.com/dms/image/v2/D4E2DAQHAca4_vKVhYQ/profile-treasury-image-shrink_800_800/B4EZiEFlbKHEAY-/0/1754562714774?e=1758441600&v=beta&t=_uwCIhOzFG5jk4wFz1W9Vq5ZyXNijr3Ivln3t0bEy0g)

**CRM Compina** es un sistema de gestión de relaciones con clientes (Customer Relationship Management) desarrollado especialmente para **Compina S.A.C.**, una agencia de marketing peruana con enfoque en campañas digitales, fidelización y automatización comercial.

Desarrollado con **Next.js** y **Firebase**, este sistema permite a los asesores y ejecutivos de Compina acceder rápidamente a la información de más de **6,000 clientes activos** en tiempo real.

---

## 🚀 Características principales

- 👤 **Gestión masiva de clientes:** Administra más de 6,000 clientes en tiempo real con acceso instantáneo a sus datos.
- 📊 **KPIs y estado de clientes:** Recopila y visualiza indicadores clave de desempeño y el estado actualizado de cada cliente.
- 🔍 **Buscador inteligente y filtros avanzados:** Enpidamecuentra clientes ránte y segmenta la información con filtros dinámicos.
- 📝 **Generación automática de reportes PDF:** Crea reportes personalizados en PDF con un solo clic.
- 📦 **Inventario conectado vía API Go:** Mapea y sincroniza el inventario en tiempo real gracias a la integración con una API desarrollada en Go.
- 🔒 **Autenticación segura:** Acceso protegido y gestión de usuarios mediante **Firebase Auth**.
- 🔄 **Sincronización instantánea:** Actualización de datos en tiempo real con **Firebase Firestore**.
- 🌐 **Acceso multiplataforma y diseño responsive:** Utiliza el sistema desde cualquier dispositivo, adaptado para escritorio y móvil.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Descripción |
|------------|-------------|
| **Next.js** | Framework React fullstack con SSR/CSR |
| **Firebase Auth** | Autenticación de usuarios con roles |
| **Cloud Firestore** | Almacenamiento NoSQL de +6000 registros de clientes |
| **Vercel** | Hosting rápido y escalable para producción |
| **Tailwind CSS** | Estilización rápida y responsiva |
| **Chart.js / Recharts** | Gráficos y métricas |
| **Day.js** | Manejo de fechas y horas |
| **React Hook Form + Zod** | Validación de formularios |

---

## 🏗️ Estructura del proyecto

```
/sistema-crm-compina
├── /components # Componentes reutilizables de UI
├── /pages # Rutas Next.js (auth, dashboard, etc.)
├── /firebase # Configuración de Firebase SDK
├── /lib # Funciones auxiliares (formatos, validadores, API)
├── /styles # Archivos Tailwind
├── /public # Assets (logos, íconos)
└── /types # Tipos TypeScript
```

---

## 🔧 Instalación del Proyecto

```bash
git clone https://github.com/ArcGabicho/sistema-crm-compina.git
```

```bash
cd sistema-crm-compina
```

```bash
npm install
```

---

## 🔧 Configurar Variables de Entorno

Crea un archivo llamado `.env.local` en la raíz del proyecto y agrega las siguientes variables con los valores de tu proyecto de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=TU_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=TU_APP_ID
NEXT_PUBLIC_API_URL=URL_API_PRODUCTOS
```

redeployy
