# 🏥 Hospital Management System

A comprehensive web-based Hospital Management System built with Flask, SQLAlchemy, and Flask-Security for managing hospital operations including patient appointments, doctor schedules, and treatment records.

## 📋 Project Overview

This project is for MAD 2 IITM (Modern Application Development). It provides a complete solution for hospital management with role-based access control for Admins, Doctors, and Patients.

## ✨ Features

### 👨‍⚕️ Admin Features
- **Dashboard**: View statistics (total doctors, patients, appointments)
- **Doctor Management**: Add, update, remove/blacklist doctors
- **Patient Management**: View, update, and manage patient records
- **Appointment Management**: View all appointments (upcoming/past/today)
- **Search Functionality**: Search patients by name or doctors by name/specialization
- **Department Management**: Create and manage departments/specializations
- **Pre-existing Admin**: Admin is created automatically on first run

### 🩺 Doctor Features
- **Dashboard**: View upcoming appointments for today/week
- **Patient List**: See all assigned patients
- **Appointment Management**: Mark appointments as completed or cancelled
- **Availability Management**: Set availability for the next 7 days
- **Treatment Records**: Add diagnosis, prescriptions, and treatment notes
- **Patient History**: View complete treatment history for each patient

### 👤 Patient Features
- **Registration & Login**: Self-registration with profile creation
- **Dashboard**: View all available departments and specializations
- **Doctor Search**: Find doctors by specialization with 7-day availability
- **Appointment Booking**: Book appointments with available doctors
- **Appointment Management**: Cancel and reschedule appointments
- **Medical History**: View past appointments with diagnosis and prescriptions
- **Profile Management**: Update personal and medical information

## 🏗️ Database Models

### Core Models:
1. **User** - Base user model with authentication (email, password, roles)
2. **Role** - User roles (Admin, Doctor, Patient)
3. **Doctor** - Doctor profiles with specialization and availability
4. **Patient** - Patient profiles with medical history
5. **Department** - Medical departments/specializations
6. **Appointment** - Patient-doctor appointments with status tracking
7. **Treatment** - Medical records with diagnosis and prescriptions

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hospital_management
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   - Open browser: `http://localhost:5000`
   - Admin credentials:
     - Email: `admin@hospital.com`
     - Password: `admin123`

## 📦 Dependencies

```
Flask
Flask-SQLAlchemy
Flask-Security-Too
Werkzeug
Celery (for background tasks)
```

See `requirements.txt` for complete list.

## 🗂️ Project Structure

```
Hospital_management/
├── app.py                      # Main application file
├── requirements.txt            # Python dependencies
├── API_DOCUMENTATION.md        # Complete API documentation
├── application/
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database initialization
│   ├── models.py              # ORM models
│   ├── routes.py              # API endpoints
│   ├── task.py                # Celery tasks
│   └── utils.py               # Utility functions
├── templates/
│   └── index.html             # Landing page
└── static/
    └── scripts.js             # Frontend scripts
```

## 🔐 Authentication & Security

- **Role-Based Access Control**: Three roles (Admin, Doctor, Patient)
- **Token-Based Authentication**: Flask-Security with JWT tokens
- **Password Hashing**: Bcrypt password hashing
- **Audit Logging**: Track all important actions
- **Session Management**: Secure session handling

## 📡 API Endpoints

### Authentication
- `POST /api/register` - Patient registration
- `POST /api/login` - User login (all roles)

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET/POST /api/admin/doctors` - Manage doctors
- `PUT/DELETE /api/admin/doctors/<id>` - Update/delete doctor
- `GET /api/admin/patients` - View patients
- `GET /api/admin/appointments` - View all appointments
- `GET /api/admin/search` - Search patients/doctors

### Doctor Endpoints
- `GET /api/doctor/dashboard` - Doctor dashboard
- `GET /api/doctor/appointments` - View appointments
- `GET /api/doctor/patients` - View assigned patients
- `PUT /api/doctor/appointments/<id>/status` - Update appointment status
- `PUT /api/doctor/availability` - Update availability
- `POST /api/doctor/treatments` - Add treatment record
- `GET /api/doctor/patients/<id>/history` - View patient history

### Patient Endpoints
- `GET /api/patient/dashboard` - Patient dashboard
- `GET /api/patient/departments` - View departments
- `GET /api/patient/doctors` - View available doctors
- `GET /api/patient/appointments` - View appointments
- `POST /api/patient/appointments` - Book appointment
- `DELETE /api/patient/appointments/<id>` - Cancel appointment
- `PUT /api/patient/appointments/<id>/reschedule` - Reschedule
- `GET/PUT /api/patient/profile` - View/update profile

**For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

## 💾 Database

- **Database**: SQLite (development) - `hospital.sqlite3`
- **ORM**: SQLAlchemy
- **Migrations**: Automatic table creation on first run

### Pre-populated Data
On first run, the system creates:
- Admin user (admin@hospital.com)
- Three roles (Admin, Doctor, Patient)
- Six departments (Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine)

## 🧪 Testing

### Using cURL

**Register a patient:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123","first_name":"John","last_name":"Doe"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

### Using Postman
1. Import the endpoints from API_DOCUMENTATION.md
2. Set `Content-Type: application/json` header
3. For protected routes, add `Authentication-Token: <token>` header

## 🔄 Workflow Examples

### Patient Booking Workflow
1. Patient registers → `POST /api/register`
2. Patient logs in → `POST /api/login`
3. View departments → `GET /api/patient/departments`
4. View available doctors → `GET /api/patient/doctors?department_id=1`
5. Book appointment → `POST /api/patient/appointments`

### Doctor Treatment Workflow
1. Doctor logs in → `POST /api/login`
2. View today's appointments → `GET /api/doctor/appointments?time=today`
3. Complete appointment → `PUT /api/doctor/appointments/<id>/status`
4. Add treatment record → `POST /api/doctor/treatments`

### Admin Management Workflow
1. Admin logs in → `POST /api/login`
2. Add new doctor → `POST /api/admin/doctors`
3. View all appointments → `GET /api/admin/appointments`
4. Search for patient → `GET /api/admin/search?type=patient&q=john`

## 🎯 Key Terminologies

- **Admin**: Hospital staff with highest access level
- **Doctor**: Medical professional who treats patients
- **Patient**: User seeking medical care
- **Appointment**: Scheduled meeting between patient and doctor
- **Treatment**: Medical record of diagnosis and prescription
- **Department**: Medical specialization (e.g., Cardiology)

## 📊 Status Values

### Appointment Status
- `Booked` - Appointment scheduled
- `Completed` - Appointment finished with treatment
- `Cancelled` - Appointment cancelled by patient/doctor
- `Rescheduled` - Appointment time changed
- `No-Show` - Patient didn't attend

## 🛠️ Development

### Adding New Features
1. Create model in `application/models.py`
2. Add route in `application/routes.py`
3. Update `API_DOCUMENTATION.md`
4. Test endpoints

### Database Reset
```bash
# Remove database file
rm hospital.sqlite3

# Restart application (will recreate database)
python app.py
```

## 📝 Future Enhancements

- [ ] Email notifications for appointments
- [ ] SMS reminders
- [ ] Payment integration
- [ ] Medical report file uploads
- [ ] Video consultation
- [ ] Prescription printing
- [ ] Analytics dashboard
- [ ] Mobile app integration

## 👥 Contributors

- Shubham - IITM MAD 2 Project

## 📄 License

This project is created for educational purposes as part of IITM MAD 2 coursework.

## 🤝 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. Review the code comments
3. Contact project maintainer

## 🙏 Acknowledgments

- Flask Framework
- Flask-Security
- SQLAlchemy
- IIT Madras BS Degree Program

---

**Built with ❤️ for Modern Application Development - IIT Madras**



Vue.js------>

v-model ----> it is basically a bridge between object and data in frontend 
v-if  ---> if condition block
v-else ---> else condition block
v-for ---> loop similar to python 
v-else-if --> block similar to if else if 
v-bind --> binding and object with data  Shorhand--> :
v-on----> @click ---> Event trigger

<div v-for="i in message">
   <p>Hello</p>
</div>
--> Print Hello 4 times

<div @click="add">
function add(){
   --------
   -------
}
message=[1,2,3,5]

export--  function
template
components
methods 
data
mounted
computed

Javascript----> const, var , let -----> data const a ="Shubham" ==> a="Rahul" this is not acceptable in JS 
String---> a="" 
Object ---> formData={..........} ---> Object also has a property which we can access like ---> x.y
Array ---> []