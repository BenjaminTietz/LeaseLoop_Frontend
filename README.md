# Guesthouse PMS Frontend 🌐

## A responsive Angular frontend for managing hotel and guesthouse operations — fully integrated with a Django REST API backend.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup Instructions](#setup-instructions)
5. [Development](#development)
6. [Build & Deployment](#build--deployment)
7. [Contact](#contact)

---

## Introduction

The Guesthouse PMS frontend is built with **Angular 19**. It provides a modern user interface for managing properties, bookings, availability calendars, clients, services, and analytics.

The UI includes multilingual support (DE/EN), reactive forms, Signals API, responsive layout, and component-based architecture with modular dialogs and calendar views.

---

## Features

- 🧭 Dashboard with key analytics
- 📅 Availability Calendar
- 🏠 Property & Unit Management
- 🧾 Booking & Invoice Handling
- 🔒 AuthGuard + AuthInterceptor
- 📊 Revenue & Occupancy Charts (ApexCharts)
- 🌐 Multilingual with `Signals`
- 🧩 Modular Forms via Reactive Dialog Components
- 🧪 Built-in validation & error handling

---

## Tech Stack

- **Angular 19**
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

````ts
export const environment = {
  production: false,
  baseRefUrl: 'http://localhost:8000', // Django backend
};

###  Code scaffolding

```ts
ng generate component my-component
ng generate service my-service
````

## Contact

### 👤 Personal

- [Portfolio](https://benjamin-tietz.com/)
- [Drop me a mail](mailto:mail@benjamin-tietz.com)

### 🌍 Social

- [LinkedIn](https://www.linkedin.com/in/benjamin-tietz/)

### 💻 Project Repository

- [GitHub Repository](https://github.com/BenjaminTietz/LeaseLoop_Frontend)
