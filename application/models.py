from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime


# Association table for User-Role many-to-many relationship
# available roles: Admin, Doctor, Patient
roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)


class Role(db.Model, RoleMixin):
    """Role model for defining user roles (Admin, Doctor, Patient)"""
    __tablename__ = 'role'
    
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))
    
    def __repr__(self):
        return f'<Role {self.name}>'


class User(db.Model, UserMixin):
    """Base User model for all users (Admin, Doctor, Patient)"""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    
    # Common profile fields
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(15))
    address = db.Column(db.Text)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))  # Male, Female, Other
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    @property
    def full_name(self):
        """Returns full name of the user"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def has_role(self, role_name):
        """Check if user has a specific role"""
        return any(role.name == role_name for role in self.roles)


class Department(db.Model):
    """Department/Specialization model"""
    __tablename__ = 'department'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctors = db.relationship('Doctor', back_populates='department', lazy='dynamic')
    
    def __repr__(self):
        return f'<Department {self.name}>'
    
    @property
    def doctors_count(self):
        """Returns count of registered doctors"""
        return self.doctors.filter_by(is_active=True).count()


class Doctor(db.Model):
    """Doctor profile model extending User"""
    __tablename__ = 'doctor'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    
    # Doctor specific fields
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    qualification = db.Column(db.String(255))
    experience_years = db.Column(db.Integer, default=0)
    consultation_fee = db.Column(db.Float, default=0.0)
    
    # Availability
    is_available = db.Column(db.Boolean, default=True)
    available_days = db.Column(db.String(100))  # e.g., "Mon,Tue,Wed,Thu,Fri"
    available_from = db.Column(db.Time)  # Start time
    available_to = db.Column(db.Time)    # End time
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('doctor_profile', uselist=False))
    department = db.relationship('Department', back_populates='doctors')
    appointments = db.relationship('Appointment', back_populates='doctor', lazy='dynamic')
    
    def __repr__(self):
        return f'<Doctor {self.user.full_name if self.user else "Unknown"}>'
    
    @property
    def total_appointments(self):
        """Returns total number of appointments"""
        return self.appointments.count()


class Patient(db.Model):
    """Patient profile model extending User"""
    __tablename__ = 'patient'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    
    # Patient specific fields
    blood_group = db.Column(db.String(5))  # A+, B+, O+, AB+, etc.
    emergency_contact = db.Column(db.String(15))
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_relation = db.Column(db.String(50))
    
    # Medical info
    allergies = db.Column(db.Text)  # Comma-separated or JSON
    chronic_conditions = db.Column(db.Text)  # Comma-separated or JSON
    current_medications = db.Column(db.Text)
    
    # Insurance
    insurance_provider = db.Column(db.String(100))
    insurance_number = db.Column(db.String(50))
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('patient_profile', uselist=False))
    appointments = db.relationship('Appointment', back_populates='patient', lazy='dynamic')
    
    def __repr__(self):
        return f'<Patient {self.user.full_name if self.user else "Unknown"}>'
    
    @property
    def total_appointments(self):
        """Returns total number of appointments"""
        return self.appointments.count()


class Appointment(db.Model):
    """Appointment model for patient-doctor meetings"""
    __tablename__ = 'appointment'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    
    # Appointment details
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    appointment_time = db.Column(db.Time, nullable=False)
    
    # Status: Booked, Completed, Cancelled, Rescheduled, No-Show
    status = db.Column(db.String(20), default='Booked', nullable=False, index=True)
    
    # Additional fields
    reason_for_visit = db.Column(db.Text)
    symptoms = db.Column(db.Text)
    
    # Cancellation/Rescheduling
    cancellation_reason = db.Column(db.Text)
    cancelled_by = db.Column(db.String(20))  # patient, doctor, admin
    cancelled_at = db.Column(db.DateTime)
    
    previous_appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'), nullable=True)
    
    # Notes
    admin_notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    patient = db.relationship('Patient', back_populates='appointments')
    doctor = db.relationship('Doctor', back_populates='appointments')
    treatment = db.relationship('Treatment', back_populates='appointment', uselist=False, cascade='all, delete-orphan')
    
    # Self-referential relationship for rescheduling
    previous_appointment = db.relationship('Appointment', remote_side=[id], backref='rescheduled_to')
    
    def __repr__(self):
        return f'<Appointment {self.id} - {self.status}>'
    
    @property
    def is_upcoming(self):
        """Check if appointment is in the future"""
        from datetime import datetime, date, time
        appointment_datetime = datetime.combine(self.appointment_date, self.appointment_time)
        return appointment_datetime > datetime.now() and self.status == 'Booked'
    
    @property
    def is_past(self):
        """Check if appointment is in the past"""
        from datetime import datetime
        appointment_datetime = datetime.combine(self.appointment_date, self.appointment_time)
        return appointment_datetime < datetime.now()


class Treatment(db.Model):
    """Treatment/Medical Record model"""
    __tablename__ = 'treatment'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'), unique=True, nullable=False)
    
    # Medical details
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text)
    tests_recommended = db.Column(db.Text)
    
    # Vital signs
    blood_pressure = db.Column(db.String(20))  # e.g., "120/80"
    temperature = db.Column(db.Float)  # in Celsius
    pulse_rate = db.Column(db.Integer)  # bpm
    weight = db.Column(db.Float)  # in kg
    height = db.Column(db.Float)  # in cm
    
    # Additional information
    notes = db.Column(db.Text)
    follow_up_required = db.Column(db.Boolean, default=False)
    follow_up_date = db.Column(db.Date)
    follow_up_notes = db.Column(db.Text)
    
    # Documents/Reports (store file paths or URLs)
    attachments = db.Column(db.Text)  # JSON array of file paths
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointment = db.relationship('Appointment', back_populates='treatment')
    
    def __repr__(self):
        return f'<Treatment for Appointment {self.appointment_id}>'
    
    @property
    def patient(self):
        """Get patient through appointment"""
        return self.appointment.patient if self.appointment else None
    
    @property
    def doctor(self):
        """Get doctor through appointment"""
        return self.appointment.doctor if self.appointment else None

