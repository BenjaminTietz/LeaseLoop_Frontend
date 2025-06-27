# Guesthouse PMS Frontend 🌐

## A responsive Angular frontend for managing hotel and guesthouse operations — fully integrated with a Django REST API backend.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [System Areas](#system-areas)
4. [Tech Stack](#tech-stack)
5. [Setup Instructions](#setup-instructions)
6. [Development](#development)
7. [Contact](#contact)

---

## Introduction

The Guesthouse PMS frontend is built with **Angular 18**. It provides a modern user interface for managing properties, bookings, availability calendars, clients, services, and analytics.

The UI includes multilingual support (DE/EN), reactive forms, Signals API, responsive layout, and component-based architecture with modular dialogs and calendar views.

---

## Features

- 🧭 Dashboard with key analytics
- 📅 Availability Calendar
- 🏠 Property & Unit Management
- 🧾 Booking & Invoice Handling
- 🔒 AuthGuard + custom HTTP Client
- 📊 Revenue & Occupancy Charts (ApexCharts)
- 🌐 Angular `Signals`
- 🧩 Modular Forms via Reactive Dialog Components
- 🧪 Built-in validation & error handling
- 🏠 Client-side Booking.com-like landing page

---

## System Areas

### 🔑 Owner Section (Admin Dashboard)

Owners and managers can:

- Add and edit **properties** and **units**
- Manage **bookings**, **clients**, and **services**
- Track **occupancy**, **revenue**, and **guest movement**
- Configure **promo codes** and generate **invoices**

Key components:

- Sidenav Navigation (Dashboard, Properties, Units, Bookings, Invoices, Analytics, etc.)
- Availability Calendar (per unit & property)
- Revenue stats and occupancy KPIs

> 📸 See: `dashboard-view.png`, `sidenav.png`

---

### 🌴 Public Booking Page

End-users can:

- Discover vacation properties (like Airbnb or Booking.com)
- Search by location, dates & number of guests
- Submit booking requests with availability validation
- View beach-style UI with hero background & date selectors

Key highlights:

- Fully responsive
- No login required
- Dynamic filtering by check-in/out & guest count

> 📸 See: `booking-landing-page.png`

---

## Tech Stack

- **Angular 18**
- **TypeScript**
- **SCSS**
- **RxJS & Signals**
- **ApexCharts**
- **Angular Router**
- **REST API Integration (Django)**

---

## Setup Instructions

1. **Clone the repository:**

   ```sh
   git clone git@github.com:BenjaminTietz/LeaseLoop_Frontend.git
   cd leaseloop_frontend

   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Start the development server:**

   ```sh
   npm start
   or
   ng serve
   ```

4. **Open in browser:**

   ```sh
   http://localhost:4200

   ```

## Development

### Environment Configuration

Edit `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  baseRefUrl: "http://localhost:8000", // Django backend
};
```

### Code scaffolding

```ts
ng generate component my-component
ng generate service my-service
```

## Contact

### 👤 Personal - meet the developers

#### Paul Ivan

- [Portfolio](https://paul-ivan.com/)
- [Drop me a mail](mailto:contact@paul-ivan.com)

### 🌍 Social

- [LinkedIn](https://www.linkedin.com/in/paul-ivan-a87585328/)

#### Benjamin Tietz

- [Portfolio](https://benjamin-tietz.com/)
- [Drop me a mail](mailto:mail@benjamin-tietz.com)

### 🌍 Social

- [LinkedIn](https://www.linkedin.com/in/benjamin-tietz/)

### 💻 Project Repository

- [GitHub Repository](https://github.com/BenjaminTietz/LeaseLoop_Frontend)
