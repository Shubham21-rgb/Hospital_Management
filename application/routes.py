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