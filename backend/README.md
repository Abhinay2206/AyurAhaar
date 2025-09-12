Backend API for AyurAhaar

Quick start

1. Copy .env.example to .env and update values.
2. Install deps and run server.

Env
- PORT: default 4000
- MONGODB_URI: mongodb connection string
- JWT_SECRET: secret for JWT signing

Endpoints
- GET /health

Auth
- POST /api/auth/doctor/register { name, email, password, phone?, specialization?, licenseNumber, experience?, location? }
- POST /api/auth/doctor/login { email, password }
- POST /api/auth/patient/register { name, email, password, phone?, age?, weight?, height?, lifestyle?, allergies?, healthConditions? }
- POST /api/auth/patient/login { email, password }
- POST /api/auth/super-admin/register { name, email, password }
- POST /api/auth/super-admin/login { email, password }

Models
- Appointment: patient, doctor, date, status, paymentStatus, timestamps
- MealPlan: patient, doctor?, planType, meals[{ day, breakfast, lunch, dinner, snacks }], approved, timestamps

Response
{ user: { id, name, email, role }, token }

Notes
- Passwords are hashed with bcryptjs.
- JWT expires in 7d.
