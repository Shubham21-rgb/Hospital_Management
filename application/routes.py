from flask import current_app as app,jsonify,request,render_template,send_from_directory
from flask_security import auth_required, roles_required,current_user,login_user,roles_accepted
from application.database import db
from werkzeug.security import check_password_hash,generate_password_hash
#from .resources import roles_list
from .models import *
from celery.result import AsyncResult
#from .task import csv_report,monthly_report,delivery_report
from sqlalchemy import cast,Float
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime
import uuid
#from celery.result import AsyncResult
#from .task import csv_report,monthly_report,delivery_report

@app.route('/',methods=['GET'])
def home():
    return render_template('index.html')

    
def roles_list(roles):
    role_list=[]
    for role in roles:
        role_list.append(role.name)
    return role_list

@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_home():
    return {
        "message":"admin logged in success"
    }
@app.route('/api/home')   
@auth_required('token')
@roles_accepted('user','admin')
def userhome():
    user=current_user
    return jsonify({
        "id":user.id,
        "email":user.email,
        "password":user.password,
        "username":user.username,
        "roles":roles_list(user.roles) 
    })
#--Patient Registration Route ---->
@app.route('/api/patient_register',methods=['POST'])
def cregister():
    cred=request.get_json()
    print("List of entries sent from frontend",cred)
    
    # Validate required fields
    if not cred.get("username"):
        return jsonify({
            "message":"username is required please register again"
        }), 400
    if not cred.get("email"):
        return jsonify({
            "message":"email is required please register again"
        }), 400
    if not cred.get("password"):
        return jsonify({
            "message":"password is required please register again"
        }), 400
    
    # Check if user already exists
    if app.security.datastore.find_user(username=cred["username"]):
        return jsonify({   
            "message": "User already exists"
        }), 400
    
    if app.security.datastore.find_user(email=cred["email"]):
        return jsonify({   
            "message": "Email already registered"
        }), 400
    
    try:
        # Create user with all provided fields
        new_user = app.security.datastore.create_user(
            username=cred["username"],
            email=cred["email"],
            password=generate_password_hash(cred["password"]),
            first_name=cred.get("first_name", ""),
            last_name=cred.get("last_name", ""),
            phone=cred.get("phone", ""),
            address=cred.get("address", ""),
            date_of_birth=datetime.strptime(cred.get("date_of_birth"), "%Y-%m-%d").date() if cred.get("date_of_birth") else None,
            gender=cred.get("gender", ""),
            roles=['patient']
        )
        db.session.flush()  
        
        # Create patient profile with patient-specific fields
        new_patient = Patient(
            user_id=new_user.id,
            blood_group=cred.get("blood_group", ""),
            emergency_contact=cred.get("emergency_contact", ""),
            emergency_contact_name=cred.get("emergency_contact_name", ""),
            emergency_contact_relation=cred.get("emergency_contact_relation", ""),
            allergies=cred.get("allergies", ""),
            chronic_conditions=cred.get("chronic_conditions", "")
        )
        db.session.add(new_patient)
        db.session.commit()
        
        return jsonify({
            "message":"User registered successfully"
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {str(e)}")
        return jsonify({
            "message": f"Registration failed: {str(e)}"
        }), 500

#--User Login Route ---->
@app.route('/api/login',methods=['POST'])
def log34():
    body=request.get_json()
    email=body['email']
    password=body['password']
    if not email:
        return jsonify({
            "message":"Email is required"
        })
    if not password:
        return jsonify({
            "message":"password is required"
        })
    user=app.security.datastore.find_user(email=email)
    if user:
        if check_password_hash(user.password,password):
            login_user(user)
            return jsonify({
                "id":user.id,
                "email":user.email,
                "username":user.username,
                "auth-token":user.get_auth_token(),
                "roles":roles_list(user.roles)
            })
        else:
            return jsonify({
                "message":"Wrong credentials"
            })
    else:
        return jsonify({
            "message":"User does not exsist "
        })
#-----------------Patient Dashboard Actions--------------------------------------
### --- Get Departments ---
@app.route('/api/get_departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    dept_list = [{"id": dept.id, "name": dept.name, "description": dept.description , 'active': dept.is_active} for dept in departments]
    return jsonify({"departments": dept_list}), 200

### --Genreating Patient Appointments based on Department--

@app.route('/api/book_appointment', methods=['POST'])
@auth_required('token')
@roles_accepted('user','admin')
def book_appointments(department_id):
    appointments = Appointment.query.filter_by(department_id=department_id).all()
    app_list = []
    for app in appointments:
        app_list.append({
            "id": app.id,
            "doctor_name": app.doctor_name,
            "appointment_date": app.appointment_date,
            "time_slot": app.time_slot,
            "description": app.description,
            "is_active": app.is_active
        })
    return jsonify({"appointments": app_list}), 200



### --- Get patient details ---
@app.route('/api/get_patient')
def rot():
    user=current_user
    d=[{"id":user.id,'email':user.email,'username':user.username}]
    return jsonify({"user": d}),200


### --- Booking Appointment -- Work in progress---
@app.route('/api/book_appointment', methods=['POST'])
@auth_required('token')
@roles_accepted('user','admin')
def book_appointment():
    data = request.get_json()
    appointment_id = data.get('appointment_id')
    #{ department_id: deptId, user_id: userId, username: username, email: email }
    appointment = Appointment.query.get(appointment_id)
    if not appointment or not appointment.is_active:
        return jsonify({"message": "Appointment not available"}), 404

    try:
        new_booking = Appointment(
            appointment_id=appointment.id,
            user_id=current_user.id,
            booking_date=datetime.utcnow().isoformat(),
            status='confirmed'
        )
        db.session.add(new_booking)
        db.session.commit()

        return jsonify({"message": "Appointment booked successfully."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error booking appointment: {str(e)}"}), 500







#-----------------Admin Updates-----------------------------------
@app.route('/api/admin/parking-lots', methods=['GET'])
@auth_required('token')
@roles_required('admin')
#@cache.cached(key_prefix="admin_parking_lots") ---> This is for caching purpose not mandatory
def admin_get_lots():
    lots = ParkingLot.query.all()
    lots_data = []
    for lot in lots:
        lots_data.append({
            "id": lot.id,
            "prime_location_name": lot.prime_location_name,
            "price_per_hour": lot.price_per_hour,
            "address": lot.address,
            "pin_code": lot.pin_code,
            "city": lot.city,
            "state": lot.state,
            "number_of_spots": lot.number_of_spots,
            "is_active": lot.is_active,
            "parking_spots": [
                {"id": s.id, "spot_number": s.spot_number, "status": s.status}
                for s in lot.parking_spots
            ]
        })
    return jsonify({"lots": lots_data}), 200


@app.route('/api/admin/create-lot', methods=['POST'])
@auth_required('token')
@roles_required('admin')

def admin_create_lot():
    data = request.get_json()
    try:
        new_lot = ParkingLot(
            prime_location_name=data['prime_location_name'],
            price_per_hour=data['price_per_hour'],
            address=data['address'],
            pin_code=data['pin_code'],
            city=data.get('city', ''),
            state=data.get('state', ''),
            number_of_spots=int(data['number_of_spots'])
        )
        db.session.add(new_lot)
        db.session.commit()

        # Automatically create spots for this lot
        for i in range(1, new_lot.number_of_spots + 1):
            spot = ParkingSpot(lot_id=new_lot.id, spot_number=f"S-{i:03d}")
            db.session.add(spot)
        db.session.commit()

        return jsonify({"message": "Parking lot created successfully."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating lot: {str(e)}"}), 500


@app.route('/api/admin/update-lot', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_update_lot():
    data = request.get_json()
    lot = ParkingLot.query.get(data.get('id'))
    if not lot:
        return jsonify({"message": "Parking lot not found"}), 404

    try:
        # Update lot fields
        lot.prime_location_name = data['prime_location_name']
        lot.price_per_hour = data['price_per_hour']
        lot.address = data['address']
        lot.city = data['city']
        lot.state = data['state']
        lot.pin_code = data['pin_code']

        old_spots = lot.number_of_spots
        new_spots = int(data['number_of_spots'])
        lot.number_of_spots = new_spots
        lot.updated_at = datetime.utcnow().isoformat()
        db.session.commit()

        # Adjust number of parking spots
        if new_spots > old_spots:
            # Add new spots
            for i in range(old_spots + 1, new_spots + 1):
                new_spot = ParkingSpot(lot_id=lot.id, spot_number=f"S-{i:03d}")
                db.session.add(new_spot)
        elif new_spots < old_spots:
            # Remove extra spots
            extra_spots = ParkingSpot.query.filter(
                ParkingSpot.lot_id == lot.id
            ).order_by(ParkingSpot.id.desc()).limit(old_spots - new_spots).all()
            for s in extra_spots:
                db.session.delete(s)

        db.session.commit()
        return jsonify({"message": "Parking lot updated successfully."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating lot: {str(e)}"}), 500


@app.route('/api/admin/delete-lot/<int:lot_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def admin_delete_lot(lot_id):
    lot = ParkingLot.query.get(lot_id)
    if not lot:
        return jsonify({"message": "Parking lot not found"}), 404

    try:
        db.session.delete(lot)
        db.session.commit()
        return jsonify({"message": "Parking lot deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting lot: {str(e)}"}), 500





#-----------------patient Updates-----------------------------------

@app.route('/api/patient_info', methods=['GET'])
@auth_required('token')
@roles_required('patient')
def user_get_lots():
    lots = ParkingLot.query.filter_by(is_active=True).all()
    result = []
    for lot in lots:
        available = ParkingSpot.query.filter_by(lot_id=lot.id, status='A').count()
        result.append({
            "id": lot.id,
            "prime_location_name": lot.prime_location_name,
            "address": lot.address,
            "city": lot.city,
            "price_per_hour": lot.price_per_hour,
            "available_spots": available
        })
    return jsonify({"lots": result})


@app.route('/api/user/book', methods=['POST'])
@auth_required('token')
@roles_required('user')
def user_book_spot():
    data = request.get_json()
    lot_id = data.get('lot_id')
    payment_method = data.get('payment_method', 'upi')

    lot = ParkingLot.query.get(lot_id)
    if not lot:
        return jsonify({"message": "Parking lot not found"}), 404

    # Find available spot
    available_spot = ParkingSpot.query.filter_by(lot_id=lot_id, status='A').first()
    if not available_spot:
        return jsonify({"message": "No available spots in this lot."}), 400

    # Create reservation
    available_spot.status = 'O'
    new_res = Reservation(
        spot_id=available_spot.id,
        user_id=current_user.id,
        vehicle_number=f"VEH-{current_user.id}-{available_spot.id}",
        parking_timestamp=datetime.utcnow().isoformat(),
        booking_status='active',
        payment_status='paid'
    )
    db.session.add(new_res)
    db.session.commit()

    # Create dummy payment
    transaction_id = str(uuid.uuid4())
    payment = Payment(
        reservation_id=new_res.id,
        user_id=current_user.id,
        amount=lot.price_per_hour,
        payment_method=payment_method,
        transaction_id=transaction_id,
        payment_status='success',
        payment_date=datetime.utcnow().isoformat()
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify({
        "message": f"Spot {available_spot.spot_number} booked and paid successfully!",
        "status": "success"
    })


@app.route('/api/user/reservations', methods=['GET'])
@auth_required('token')
@roles_required('user')
def user_reservations():
    reservations = Reservation.query.filter_by(user_id=current_user.id).all()
    active = []
    history = []
    for r in reservations:
        record = {
            "id": r.id,
            "spot_number": r.spot.spot_number,
            "lot_name": r.spot.lot.prime_location_name,
            "parking_timestamp": r.parking_timestamp,
            "leaving_timestamp": r.leaving_timestamp,
            "booking_status": r.booking_status,
            "payment_status": r.payment_status
        }
        if r.booking_status == 'active':
            active.append(record)
        else:
            history.append(record)
    return jsonify({"active": active, "history": history})


@app.route('/api/user/release', methods=['POST'])
@auth_required('token')
@roles_required('user')
def user_release_spot():
    data = request.get_json()
    reservation_id = data.get('reservation_id')

    res = Reservation.query.filter_by(id=reservation_id, user_id=current_user.id).first()
    if not res:
        return jsonify({"message": "Reservation not found"}), 404

    spot = res.spot

    # Only active reservations can be released
    if res.booking_status != 'active':
        return jsonify({"message": "Reservation already completed or cancelled."}), 400

    # Update reservation and spot
    res.booking_status = 'completed'
    res.leaving_timestamp = datetime.utcnow().isoformat()
    spot.status = 'A'
    db.session.commit()

    return jsonify({"message": f"Spot {spot.spot_number} released successfully."})
    
#------------------------------------------------------------------------------
#----Backend Tasks and Reports --------------------------------
@app.route('/api/export')
def export_csv():
    user=current_user
    result=csv_report.delay()#async object
    return jsonify({
        "id":result.id,
        "result":result.result,
    })

@app.route('/api/csv_result/<id>')
def csv_result(id):
    result = AsyncResult(id)
    
    return send_from_directory('static', result.result)






#----------------- Admin (Hospital Staff) Routes -----------------------------------

### --- Admin: Dashboard Stats ---
@app.route('/api/admin/stats', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_get_stats():
    try:
        total_doctors = Doctor.query.filter_by(is_active=True).count()
        total_patients = Patient.query.filter_by(is_active=True).count()
        total_appointments = Appointment.query.count()
        upcoming_appointments = Appointment.query.filter_by(status='Booked').count()
        completed_appointments = Appointment.query.filter_by(status='Completed').count()
        
        return jsonify({
            "total_doctors": total_doctors,
            "total_patients": total_patients,
            "total_appointments": total_appointments,
            "upcoming_appointments": upcoming_appointments,
            "completed_appointments": completed_appointments
        }), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching stats: {str(e)}"}), 500


### --- Admin: Manage Patient Profile ---
@app.route('/api/admin/update_patient', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_update_patient():
    data = request.get_json()
    
    try:
        patient = Patient.query.get(data.get('patient_id'))
        if not patient:
            return jsonify({"message": "Patient not found"}), 404
        
        user = patient.user
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'address' in data:
            user.address = data['address']
        if 'blood_group' in data:
            patient.blood_group = data['blood_group']
        if 'allergies' in data:
            patient.allergies = data['allergies']
        if 'chronic_conditions' in data:
            patient.chronic_conditions = data['chronic_conditions']
        
        db.session.commit()
        return jsonify({"message": "Patient updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating patient: {str(e)}"}), 500


### --- Admin: Blacklist/Remove Doctor ---
@app.route('/api/admin/blacklist_doctor/<int:doctor_id>', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_blacklist_doctor(doctor_id):
    try:
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({"message": "Doctor not found"}), 404
        
        doctor.is_active = False
        doctor.user.active = False
        db.session.commit()
        
        return jsonify({"message": "Doctor blacklisted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error blacklisting doctor: {str(e)}"}), 500


### --- Admin: Blacklist/Remove Patient ---
@app.route('/api/admin/blacklist_patient/<int:patient_id>', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_blacklist_patient(patient_id):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"message": "Patient not found"}), 404
        
        patient.is_active = False
        patient.user.active = False
        db.session.commit()
        
        return jsonify({"message": "Patient blacklisted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error blacklisting patient: {str(e)}"}), 500


### --- Admin: Get All Doctors ---
@app.route('/api/admin/doctors', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_get_doctors():
    try:
        doctors = Doctor.query.all()
        doctors_list = []
        for doc in doctors:
            doctors_list.append({
                "id": doc.id,
                "user_id": doc.user_id,
                "name": doc.user.full_name,
                "email": doc.user.email,
                "phone": doc.user.phone,
                "department_id": doc.department_id,
                "department": doc.department.name,
                "license_number": doc.license_number,
                "qualification": doc.qualification,
                "experience_years": doc.experience_years,
                "consultation_fee": doc.consultation_fee,
                "is_available": doc.is_available,
                "available_days": doc.available_days,
                "available_from": doc.available_from.strftime("%H:%M") if doc.available_from else None,
                "available_to": doc.available_to.strftime("%H:%M") if doc.available_to else None,
                "is_active": doc.is_active
            })
        return jsonify({"doctors": doctors_list}), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching doctors: {str(e)}"}), 500


### --- Admin: Create Doctor Profile ---
@app.route('/api/admin/create_doctor', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_create_doctor():
    data = request.get_json()
    
    try:
        # Check if user already exists
        if app.security.datastore.find_user(email=data['email']):
            return jsonify({"message": "Email already registered"}), 400
        
        # Create user account
        new_user = app.security.datastore.create_user(
            username=data['email'].split('@')[0],
            email=data['email'],
            password=generate_password_hash(data.get('password', 'doctor123')),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            roles=['doctor']
        )
        db.session.flush()
        
        # Create doctor profile
        from datetime import time
        new_doctor = Doctor(
            user_id=new_user.id,
            department_id=data['department_id'],
            license_number=data['license_number'],
            qualification=data.get('qualification', ''),
            experience_years=data.get('experience_years', 0),
            consultation_fee=data.get('consultation_fee', 0),
            is_available=data.get('is_available', True),
            available_days=data.get('available_days', 'Mon,Tue,Wed,Thu,Fri'),
            available_from=time.fromisoformat(data['available_from']) if data.get('available_from') else None,
            available_to=time.fromisoformat(data['available_to']) if data.get('available_to') else None
        )
        db.session.add(new_doctor)
        db.session.commit()
        
        return jsonify({"message": "Doctor created successfully"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating doctor: {str(e)}"}), 500


### --- Admin: Update Doctor Profile ---
@app.route('/api/admin/update_doctor', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_update_doctor():
    data = request.get_json()
    
    try:
        doctor = Doctor.query.get(data.get('id'))
        if not doctor:
            return jsonify({"message": "Doctor not found"}), 404
        
        # Update user fields
        user = doctor.user
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        
        # Update doctor fields
        if 'department_id' in data:
            doctor.department_id = data['department_id']
        if 'license_number' in data:
            doctor.license_number = data['license_number']
        if 'qualification' in data:
            doctor.qualification = data['qualification']
        if 'experience_years' in data:
            doctor.experience_years = data['experience_years']
        if 'consultation_fee' in data:
            doctor.consultation_fee = data['consultation_fee']
        if 'is_available' in data:
            doctor.is_available = data['is_available']
        if 'available_days' in data:
            doctor.available_days = data['available_days']
        if 'available_from' in data:
            from datetime import time
            doctor.available_from = time.fromisoformat(data['available_from'])
        if 'available_to' in data:
            from datetime import time
            doctor.available_to = time.fromisoformat(data['available_to'])
        
        doctor.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({"message": "Doctor updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating doctor: {str(e)}"}), 500


### --- Admin: Delete Doctor ---
@app.route('/api/admin/delete_doctor/<int:doctor_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def admin_delete_doctor(doctor_id):
    try:
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({"message": "Doctor not found"}), 404
        
        # Check if doctor has upcoming appointments
        upcoming = Appointment.query.filter_by(doctor_id=doctor_id).filter(
            Appointment.status == 'Booked'
        ).count()
        
        if upcoming > 0:
            return jsonify({"message": f"Cannot delete doctor with {upcoming} upcoming appointments"}), 400
        
        # Soft delete by setting is_active to False
        doctor.is_active = False
        db.session.commit()
        
        return jsonify({"message": "Doctor deactivated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting doctor: {str(e)}"}), 500
### --- Admin: Restore Doctor ---
@app.route('/api/admin/restore_doctor/<int:doctor_id>', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_restore_doctor(doctor_id):
    try:
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({"message": "Doctor not found"}), 404
        
        # Check if doctor has upcoming appointments
        upcoming = Appointment.query.filter_by(doctor_id=doctor_id).filter(
            Appointment.status == 'Booked'
        ).count()
        
        if upcoming > 0:
            return jsonify({"message": f"Cannot restore doctor with {upcoming} upcoming appointments"}), 400
        
        # Soft restore by setting is_active to True
        doctor.is_active = True
        db.session.commit()
        
        return jsonify({"message": "Doctor restored successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting doctor: {str(e)}"}), 500

### --- Admin: View All Appointments ---
@app.route('/api/admin/appointments', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_get_all_appointments():
    try:
        appointments = Appointment.query.order_by(Appointment.appointment_date.desc()).all()
        
        appointments_list = []
        for apt in appointments:
            appointments_list.append({
                "id": apt.id,
                "pat_id":apt.patient_id,
                "patient_name": apt.patient.user.full_name,
                "patient_email": apt.patient.user.email,
                "doctor_name": apt.doctor.user.full_name,
                "department": apt.doctor.department.name,
                "appointment_date": apt.appointment_date.strftime("%Y-%m-%d"),
                "appointment_time": apt.appointment_time.strftime("%H:%M"),
                "status": apt.status,
                "reason_for_visit": apt.reason_for_visit,
                "created_at": apt.created_at.strftime("%Y-%m-%d %H:%M")
            })
        
        return jsonify({"appointments": appointments_list}), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching appointments: {str(e)}"}), 500


### --- Admin: Update Appointment Status ---
@app.route('/api/admin/update_appointment', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_update_appointment_status():
    data = request.get_json()
    
    try:
        appointment = Appointment.query.get(data.get('appointment_id'))
        if not appointment:
            return jsonify({"message": "Appointment not found"}), 404
        
        if 'status' in data:
            appointment.status = data['status']
            if data['status'] == 'Cancelled':
                appointment.cancelled_by = 'admin'
                appointment.cancelled_at = datetime.utcnow()
                appointment.cancellation_reason = data.get('reason', 'Cancelled by admin')
        
        db.session.commit()
        
        return jsonify({"message": "Appointment updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating appointment: {str(e)}"}), 500


### --- Admin: Search Patients and Doctors ---
@app.route('/api/admin/search', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_search():
    query = request.args.get('query', '')
    search_type = request.args.get('type', 'all')  
    print(f"Search query: {query}, Search type: {search_type}")
    
    try:
        results = {"patients": [], "doctors": []}
        
        if search_type in ['all', 'patient']:
            # Search patients
            patients = Patient.query.join(User).filter(
                db.or_(
                    User.first_name.ilike(f'%{query}%'),
                    User.last_name.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%')
                )
            ).all()
            
            for patient in patients:
                results['patients'].append({
                    "id": patient.id,
                    "name": patient.user.full_name,
                    "email": patient.user.email,
                    "phone": patient.user.phone,
                    "blood_group": patient.blood_group
                })
        
        if search_type in ['all', 'doctor']:
            # Search doctors
            doctors = Doctor.query.join(User).join(Department).filter(
                db.or_(
                    User.first_name.ilike(f'%{query}%'),
                    User.last_name.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%'),
                    Department.name.ilike(f'%{query}%')
                )
            ).all()
            
            for doctor in doctors:
                results['doctors'].append({
                    "id": doctor.id,
                    "name": doctor.user.full_name,
                    "email": doctor.user.email,
                    "department": doctor.department.name,
                    "qualification": doctor.qualification,
                    "is_available": doctor.is_available
                })
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"message": f"Error searching: {str(e)}"}), 500

#-------------ADMIN TO FETCH Patient status----------------------------
@app.route('/api/admin/patient_status', methods=['GET'])
@auth_required('token') 
@roles_required('admin')
def admin_get_patient_status():
    try:
        patients = Patient.query.all()
        if not patients:
            return jsonify({"message": "No patients found"}), 404
        patient_data=[]
        for patient in patients:
            patient_data.append({
                "id": patient.id,
                "name": patient.user.full_name,
                "email": patient.user.email,
                "phone": patient.user.phone,
                "blood_group": patient.blood_group,
                "allergies": patient.allergies,
                "chronic_conditions": patient.chronic_conditions,
                "active": patient.is_active
            })
        
        return jsonify({"patient": patient_data}), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching patient status: {str(e)}"}), 500
    
#--deactivate patient by admin
@app.route('/api/admin/deactive_patient', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_deactivate_patient():
    data = request.get_json()
    patient_id = data.get('patient_id')
    
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"message": "Patient not found"}), 404
        
        patient.is_active = False
        db.session.commit()
        
        return jsonify({"message": "Patient deactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deactivating patient: {str(e)}"}), 500

#--reactivate patient by admin
@app.route('/api/admin/reactivate_patient', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def admin_reactivate_patient():
    data = request.get_json()
    patient_id = data.get('patient_id')
    
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"message": "Patient not found"}), 404
        
        patient.is_active = True
        db.session.commit()
        
        return jsonify({"message": "Patient reactivated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error reactivating patient: {str(e)}"}), 500

#----------------- Doctor Dashboard Routes -----------------------------------

### --- Doctor: View Assigned Appointments ---
@app.route('/api/doctor/appointments', methods=['GET'])
@auth_required('token')
@roles_required('doctor')
def doctor_get_appointments():
    try:
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"message": "Doctor profile not found"}), 404
        
        # Get all appointments for this doctor
        appointments = Appointment.query.filter_by(doctor_id=doctor.id).all()
        
        upcoming = []
        completed = []
        
        for apt in appointments:
            apt_data = {
                "id": apt.id,
                "patient_name": apt.patient.user.full_name,
                "patient_email": apt.patient.user.email,
                "patient_phone": apt.patient.user.phone,
                "appointment_date": apt.appointment_date.strftime("%Y-%m-%d"),
                "appointment_time": apt.appointment_time.strftime("%H:%M"),
                "status": apt.status,
                "reason_for_visit": apt.reason_for_visit,
                "symptoms": apt.symptoms,
                "created_at": apt.created_at.strftime("%Y-%m-%d %H:%M")
            }
            
            if apt.status == 'Completed':
                completed.append(apt_data)
            else:
                upcoming.append(apt_data)
        
        return jsonify({
            "upcoming": upcoming,
            "completed": completed
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching appointments: {str(e)}"}), 500


### --- Doctor: Mark Appointment as Completed and Add Diagnosis ---
@app.route('/api/doctor/complete_appointment', methods=['POST'])
@auth_required('token')
@roles_required('doctor')
def doctor_complete_appointment():
    data = request.get_json()
    appointment_id = data.get('appointment_id')
    
    try:
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"message": "Doctor profile not found"}), 404
        
        appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=doctor.id).first()
        if not appointment:
            return jsonify({"message": "Appointment not found"}), 404
        
        # Update appointment status
        appointment.status = 'Completed'
        appointment.completed_at = datetime.utcnow()
        
        # Create treatment record
        treatment = Treatment(
            appointment_id=appointment.id,
            diagnosis=data.get('diagnosis', ''),
            prescription=data.get('prescription', ''),
            tests_recommended=data.get('tests_recommended', ''),
            blood_pressure=data.get('blood_pressure', ''),
            temperature=data.get('temperature', None),
            pulse_rate=data.get('pulse_rate', None),
            weight=data.get('weight', None),
            height=data.get('height', None),
            notes=data.get('notes', ''),
            follow_up_required=data.get('follow_up_required', False),
            follow_up_date=datetime.strptime(data.get('follow_up_date'), "%Y-%m-%d").date() if data.get('follow_up_date') else None,
            follow_up_notes=data.get('follow_up_notes', '')
        )
        
        db.session.add(treatment)
        db.session.commit()
        
        return jsonify({"message": "Appointment marked as completed successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error completing appointment: {str(e)}"}), 500


### --- Doctor: View Patient History ---
@app.route('/api/doctor/patient_history/<int:appointment_id>', methods=['GET'])
@auth_required('token')
@roles_required('doctor')
def doctor_get_patient_history(appointment_id):
    try:
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"message": "Doctor profile not found"}), 404
        
        # Get appointment to verify it belongs to this doctor
        appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=doctor.id).first()
        if not appointment:
            return jsonify({"message": "Appointment not found"}), 404
        
        patient_id = appointment.patient_id
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"message": "Patient not found"}), 404
        
        # Get all completed appointments with treatments
        appointments = Appointment.query.filter_by(
            patient_id=patient_id,
            status='Completed'
        ).order_by(Appointment.appointment_date.desc()).all()
        
        history = []
        for apt in appointments:
            if apt.treatment:
                history.append({
                    "appointment_id": apt.id,
                    "appointment_date": apt.appointment_date.strftime("%Y-%m-%d"),
                    "doctor_name": apt.doctor.user.full_name,
                    "department": apt.doctor.department.name,
                    "diagnosis": apt.treatment.diagnosis,
                    "prescription": apt.treatment.prescription,
                    "tests_recommended": apt.treatment.tests_recommended,
                    "notes": apt.treatment.notes,
                    "follow_up_required": apt.treatment.follow_up_required,
                    "follow_up_date": apt.treatment.follow_up_date.strftime("%Y-%m-%d") if apt.treatment.follow_up_date else None
                })
        
        return jsonify({
            "patient_name": patient.user.full_name,
            "patient_email": patient.user.email,
            "blood_group": patient.blood_group,
            "allergies": patient.allergies,
            "chronic_conditions": patient.chronic_conditions,
            "history": history
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching patient history: {str(e)}"}), 500


### --- Doctor: Update Treatment Record ---
@app.route('/api/doctor/update_treatment', methods=['POST'])
@auth_required('token')
@roles_required('doctor')
def doctor_update_treatment():
    data = request.get_json()
    treatment_id = data.get('treatment_id')
    
    try:
        treatment = Treatment.query.get(treatment_id)
        if not treatment:
            return jsonify({"message": "Treatment record not found"}), 404
        
        # Verify the doctor owns this treatment
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if treatment.appointment.doctor_id != doctor.id:
            return jsonify({"message": "Unauthorized"}), 403
        
        # Update treatment fields
        if 'diagnosis' in data:
            treatment.diagnosis = data['diagnosis']
        if 'prescription' in data:
            treatment.prescription = data['prescription']
        if 'tests_recommended' in data:
            treatment.tests_recommended = data['tests_recommended']
        if 'notes' in data:
            treatment.notes = data['notes']
        if 'follow_up_required' in data:
            treatment.follow_up_required = data['follow_up_required']
        if 'follow_up_date' in data:
            treatment.follow_up_date = datetime.strptime(data['follow_up_date'], "%Y-%m-%d").date()
        if 'follow_up_notes' in data:
            treatment.follow_up_notes = data['follow_up_notes']
        
        treatment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({"message": "Treatment record updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating treatment: {str(e)}"}), 500


### --- Doctor: Cancel Appointment ---
@app.route('/api/doctor/cancel_appointment', methods=['POST'])
@auth_required('token')
@roles_required('doctor')
def doctor_cancel_appointment():
    data = request.get_json()
    appointment_id = data.get('appointment_id')
    
    try:
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"message": "Doctor profile not found"}), 404
        
        appointment = Appointment.query.filter_by(id=appointment_id, doctor_id=doctor.id).first()
        if not appointment:
            return jsonify({"message": "Appointment not found"}), 404
        
        if appointment.status in ['Completed', 'Cancelled']:
            return jsonify({"message": "Cannot cancel this appointment"}), 400
        
        appointment.status = 'Cancelled'
        appointment.cancelled_by = 'doctor'
        appointment.cancelled_at = datetime.utcnow()
        appointment.cancellation_reason = data.get('reason', 'Cancelled by doctor')
        
        db.session.commit()
        
        return jsonify({"message": "Appointment cancelled successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error cancelling appointment: {str(e)}"}), 500


### --- Doctor: Update Availability ---
@app.route('/api/doctor/update_availability', methods=['POST'])
@auth_required('token')
@roles_required('doctor')
def doctor_update_availability():
    data = request.get_json()
    
    try:
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"message": "Doctor profile not found"}), 404
        
        if 'is_available' in data:
            doctor.is_available = data['is_available']
        if 'available_days' in data:
            doctor.available_days = data['available_days']
        if 'available_from' in data:
            from datetime import time
            doctor.available_from = time.fromisoformat(data['available_from'])
        if 'available_to' in data:
            from datetime import time
            doctor.available_to = time.fromisoformat(data['available_to'])
        
        doctor.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({"message": "Availability updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating availability: {str(e)}"}), 500


### --- Doctor: Get List of Patients ---
@app.route('/api/doctor/patients', methods=['GET'])
@auth_required('token')
@roles_required('doctor')
def doctor_get_patients():
    try:
        doctor = Doctor.query.filter_by(user_id=current_user.id).first()
        if not doctor:
            return jsonify({"message": "Doctor profile not found"}), 404
        
        # Get unique patients who have appointments with this doctor
        patient_ids = db.session.query(Appointment.patient_id).filter_by(doctor_id=doctor.id).distinct().all()
        patient_ids = [pid[0] for pid in patient_ids]
        
        patients = Patient.query.filter(Patient.id.in_(patient_ids)).all()
        
        patients_list = []
        for patient in patients:
            # Get appointment count for this patient with this doctor
            appointment_count = Appointment.query.filter_by(
                doctor_id=doctor.id,
                patient_id=patient.id
            ).count()
            
            patients_list.append({
                "id": patient.id,
                "name": patient.user.full_name,
                "email": patient.user.email,
                "phone": patient.user.phone,
                "blood_group": patient.blood_group,
                "allergies": patient.allergies,
                "chronic_conditions": patient.chronic_conditions,
                "total_appointments": appointment_count
            })
        
        return jsonify({"patients": patients_list}), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching patients: {str(e)}"}), 500


#----------------- Patient Dashboard Routes -----------------------------------

### --- Patient: Update Profile ---
@app.route('/api/patient/update_profile', methods=['POST'])
@auth_required('token')
@roles_required('patient')
def patient_update_profile():
    data = request.get_json()
    
    try:
        user = current_user
        patient = Patient.query.filter_by(user_id=user.id).first()
        
        if not patient:
            return jsonify({"message": "Patient profile not found"}), 404
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'address' in data:
            user.address = data['address']
        if 'date_of_birth' in data:
            user.date_of_birth = datetime.strptime(data['date_of_birth'], "%Y-%m-%d").date()
        if 'gender' in data:
            user.gender = data['gender']
        
        # Update patient-specific fields
        if 'blood_group' in data:
            patient.blood_group = data['blood_group']
        if 'emergency_contact' in data:
            patient.emergency_contact = data['emergency_contact']
        if 'emergency_contact_name' in data:
            patient.emergency_contact_name = data['emergency_contact_name']
        if 'emergency_contact_relation' in data:
            patient.emergency_contact_relation = data['emergency_contact_relation']
        if 'allergies' in data:
            patient.allergies = data['allergies']
        if 'chronic_conditions' in data:
            patient.chronic_conditions = data['chronic_conditions']
        
        user.updated_at = datetime.utcnow()
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({"message": "Profile updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating profile: {str(e)}"}), 500


### --- Patient: Get Profile ---
@app.route('/api/patient/profile', methods=['GET'])
@auth_required('token')
@roles_required('patient')
def patient_get_profile():
    try:
        user = current_user
        print("#########################3",user.id)
        patient = Patient.query.filter_by(user_id=user.id).first()
        
        if not patient:
            return jsonify({"message": "Patient profile not found"}), 404
        
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "address": user.address,
            "date_of_birth": user.date_of_birth.strftime("%Y-%m-%d") if user.date_of_birth else None,
            "gender": user.gender,
            "blood_group": patient.blood_group,
            "emergency_contact": patient.emergency_contact,
            "emergency_contact_name": patient.emergency_contact_name,
            "emergency_contact_relation": patient.emergency_contact_relation,
            "allergies": patient.allergies,
            "chronic_conditions": patient.chronic_conditions,
            "active":patient.is_active
        }), 200
        
    except Exception as e:
        print(str(e))
        return jsonify({"message": f"Error fetching profile: {str(e)}"}), 500


### --- Patient: Search Doctors ---
@app.route('/api/patient/search_doctors', methods=['GET'])
@auth_required('token')
@roles_required('patient')
def patient_search_doctors():
    department_id = request.args.get('department_id', None)
    availability = request.args.get('availability', None)
    
    try:
        from datetime import date, timedelta
        query = Doctor.query.filter_by(is_active=True)
        
        if department_id:
            query = query.filter_by(department_id=department_id)
        
        if availability == 'available':
            query = query.filter_by(is_available=True)
        
        doctors = query.all()
        
        # Get next 7 days
        today = date.today()
        next_7_days = [(today + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
        
        doctors_list = []
        for doc in doctors:
            # Calculate available slots for next 7 days
            available_dates = []
            if doc.is_available and doc.available_days:
                days_map = {
                    'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 
                    'Fri': 4, 'Sat': 5, 'Sun': 6
                }
                available_day_nums = [days_map.get(day.strip(), -1) for day in doc.available_days.split(',')]
                
                for day_str in next_7_days:
                    day_obj = datetime.strptime(day_str, "%Y-%m-%d").date()
                    if day_obj.weekday() in available_day_nums:
                        available_dates.append(day_str)
            
            doctors_list.append({
                "id": doc.id,
                "name": doc.user.full_name,
                "email": doc.user.email,
                "phone": doc.user.phone,
                "department": doc.department.name,
                "qualification": doc.qualification,
                "experience_years": doc.experience_years,
                "consultation_fee": doc.consultation_fee,
                "is_available": doc.is_available,
                "available_days": doc.available_days,
                "available_from": doc.available_from.strftime("%H:%M") if doc.available_from else None,
                "available_to": doc.available_to.strftime("%H:%M") if doc.available_to else None,
                "next_7_days_availability": available_dates
            })
        
        return jsonify({"doctors": doctors_list}), 200
        
    except Exception as e:
        return jsonify({"message": f"Error searching doctors: {str(e)}"}), 500


### --- Patient: Book Appointment ---
@app.route('/api/patient/book_appointment', methods=['POST'])
@auth_required('token')
@roles_required('patient')
def patient_book_appointment():
    data = request.get_json()
    
    try:
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"message": "Patient profile not found"}), 404
        
        doctor_id = data.get('doctor_id')
        appointment_date = datetime.strptime(data.get('appointment_date'), "%Y-%m-%d").date()
        appointment_time = datetime.strptime(data.get('appointment_time'), "%H:%M").time()
        
        # Check if doctor exists and is available
        doctor = Doctor.query.get(doctor_id)
        if not doctor or not doctor.is_available:
            return jsonify({"message": "Doctor not available"}), 400
        
        # Check for existing appointment at same time
        existing = Appointment.query.filter_by(
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).filter(Appointment.status.in_(['Booked', 'Rescheduled'])).first()
        
        if existing:
            return jsonify({"message": "This slot is already booked"}), 400
        
        # Create appointment
        new_appointment = Appointment(
            patient_id=patient.id,
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            reason_for_visit=data.get('reason_for_visit', ''),
            symptoms=data.get('symptoms', ''),
            status='Booked'
        )
        
        db.session.add(new_appointment)
        db.session.commit()
        
        return jsonify({"message": "Appointment booked successfully"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error booking appointment: {str(e)}"}), 500


### --- Patient: View Appointments ---
@app.route('/api/patient/appointments', methods=['GET'])
@auth_required('token')
@roles_required('patient')
def patient_get_appointments():
    try:
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient:
            return jsonify({"message": "Patient profile not found"}), 404
        
        appointments = Appointment.query.filter_by(patient_id=patient.id).all()
        
        upcoming = []
        history = []
        
        for apt in appointments:
            apt_data = {
                "id": apt.id,
                "doctor_name": apt.doctor.user.full_name,
                "department": apt.doctor.department.name,
                "appointment_date": apt.appointment_date.strftime("%Y-%m-%d"),
                "appointment_time": apt.appointment_time.strftime("%H:%M"),
                "status": apt.status,
                "reason_for_visit": apt.reason_for_visit,
                "symptoms": apt.symptoms
            }
            
            if apt.status in ['Completed', 'Cancelled']:
                # Add treatment info if exists
                if apt.treatment and apt.status == 'Completed':
                    apt_data['diagnosis'] = apt.treatment.diagnosis
                    apt_data['prescription'] = apt.treatment.prescription
                    apt_data['notes'] = apt.treatment.notes
                history.append(apt_data)
            else:
                upcoming.append(apt_data)
        
        return jsonify({
            "upcoming": upcoming,
            "history": history
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error fetching appointments: {str(e)}"}), 500


### --- Patient: Cancel Appointment ---
@app.route('/api/patient/cancel_appointment', methods=['POST'])
@auth_required('token')
@roles_required('patient')
def patient_cancel_appointment():
    data = request.get_json()
    appointment_id = data.get('appointment_id')
    
    try:
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        appointment = Appointment.query.filter_by(id=appointment_id, patient_id=patient.id).first()
        
        if not appointment:
            return jsonify({"message": "Appointment not found"}), 404
        
        if appointment.status in ['Completed', 'Cancelled']:
            return jsonify({"message": "Cannot cancel this appointment"}), 400
        
        appointment.status = 'Cancelled'
        appointment.cancellation_reason = data.get('reason', '')
        appointment.cancelled_by = 'patient'
        appointment.cancelled_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({"message": "Appointment cancelled successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error cancelling appointment: {str(e)}"}), 500


### --- Patient: Reschedule Appointment ---
@app.route('/api/patient/reschedule_appointment', methods=['POST'])
@auth_required('token')
@roles_required('patient')
def patient_reschedule_appointment():
    data = request.get_json()
    appointment_id = data.get('appointment_id')
    
    try:
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        old_appointment = Appointment.query.filter_by(id=appointment_id, patient_id=patient.id).first()
        
        if not old_appointment:
            return jsonify({"message": "Appointment not found"}), 404
        
        if old_appointment.status in ['Completed', 'Cancelled']:
            return jsonify({"message": "Cannot reschedule this appointment"}), 400
        
        new_date = datetime.strptime(data.get('new_date'), "%Y-%m-%d").date()
        new_time = datetime.strptime(data.get('new_time'), "%H:%M").time()
        
        # Check if new slot is available
        existing = Appointment.query.filter_by(
            doctor_id=old_appointment.doctor_id,
            appointment_date=new_date,
            appointment_time=new_time
        ).filter(Appointment.status.in_(['Booked', 'Rescheduled'])).first()
        
        if existing:
            return jsonify({"message": "This slot is already booked"}), 400
        
        # Mark old appointment as rescheduled
        old_appointment.status = 'Rescheduled'
        
        # Create new appointment
        new_appointment = Appointment(
            patient_id=patient.id,
            doctor_id=old_appointment.doctor_id,
            appointment_date=new_date,
            appointment_time=new_time,
            reason_for_visit=old_appointment.reason_for_visit,
            symptoms=old_appointment.symptoms,
            status='Booked',
            previous_appointment_id=old_appointment.id
        )
        
        db.session.add(new_appointment)
        db.session.commit()
        
        return jsonify({"message": "Appointment rescheduled successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error rescheduling appointment: {str(e)}"}), 500


