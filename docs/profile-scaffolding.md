# Profile Scaffolding

NusaTestLab v0.5.0 menambahkan profile scaffolding agar developer bisa membuat testing profile baru dengan cepat.

## Tujuan

Fitur ini membuat NusaTestLab lebih standalone dan reusable untuk berbagai SaaS.

Contoh SaaS yang bisa dibuatkan profile:

- clinic-saas
- school-saas
- hr-saas
- accounting-saas
- booking-saas
- koperasi-saas

## Command

```bash
npm run cli -- profile:create clinic-saas --display-name "Clinic SaaS Testing Profile"

Atau menggunakan npm script:

npm run profile:create -- clinic-saas --display-name "Clinic SaaS Testing Profile"
Custom Roles
npm run cli -- profile:create clinic-saas --roles owner,admin,doctor,staff
Custom Modules
npm run cli -- profile:create clinic-saas --modules api,auth,patients,appointments,billing,security,performance
Output

Command ini akan membuat folder:

profiles/clinic-saas/

Dengan file:

profiles/clinic-saas/profile.config.json
profiles/clinic-saas/endpoints.json
profiles/clinic-saas/scenarios/core.smoke.json
profiles/clinic-saas/security.scenarios.json
profiles/clinic-saas/performance.scenarios.json
Setelah Profile Dibuat

Cek profile:

npm run cli -- profiles show clinic-saas

Run smoke test:

npm run cli -- run clinic-saas

Run security dry-run:

npm run cli -- security:run -p clinic-saas --mode dry-run

Run performance dry-run:

npm run cli -- performance:run -p clinic-saas --mode dry-run
Overwrite Existing Files

Secara default, scaffolder tidak akan overwrite file yang sudah ada.

Untuk overwrite:

npm run cli -- profile:create clinic-saas --overwrite
Naming Rule

Profile name harus menggunakan kebab-case:

valid   : clinic-saas
valid   : school-management
invalid : Clinic SaaS
invalid : clinic_saas

