# NusaTestLab

NusaTestLab adalah aplikasi standalone untuk melakukan testing terhadap sistem SaaS.

Pada versi awal, NusaTestLab difokuskan untuk mengetes aplikasi SaaS yang mirip dengan AI UMKM, terutama pada area:

- API testing
- business logic testing
- inventory validation
- report validation
- role-based access testing
- tenant isolation testing
- basic security testing

## Target Pertama

Profile pertama yang dikembangkan adalah:

```txt
ai-umkm
```

Profile ini digunakan untuk mengetes sistem SaaS seperti `ai-umkm-copilot`.

## Konsep Utama

NusaTestLab menggunakan pendekatan profile-based testing.

```txt
NusaTestLab
  -> Target SaaS Config
  -> SaaS Profile
  -> Test Scenarios
  -> Validators
  -> Reports
```

## Menjalankan Project

Install dependency:

`npm install`

Copy environment file:

`cp .env.example .env`

Cek konfigurasi target:

`npm run dev -- info`

Jalankan test scenario:

`npm run dev -- run`

## Status

```txt
Version: v0.1.0
Status : Initial MVP setup
```

## Roadmap

- v0.1.0: Core engine, AI UMKM profile, inventory validation, basic security testing
- v0.2.0: AI response accuracy testing and prompt injection testing
- v0.3.0: Load testing and stress testing
- v0.4.0: Dashboard and test history comparison
- v0.5.0: Multi-SaaS profile registry and no-code scenario builder
