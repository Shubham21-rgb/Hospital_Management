from celery import shared_task
from .models import Patient,User,Appointment,Doctor
import time
import datetime
import csv
from .utils import format_report
from .mail import send_email
import requests

@shared_task(ignore_result=False,name="download_csv_report")
def csv_report(pat_id):
    transactions = Appointment.query.filter_by(patient_id=pat_id) # admin
    csv_file_name = f"Appoinment_{datetime.datetime.now().strftime("%f")}.csv" #transaction_123456.csv
    with open(f'static/{csv_file_name}', 'w', newline = "") as csvfile:
    # csvfile = open(f'static/{csv_file_name}', 'w', newline = "")
        sr_no = 1
        trans_csv = csv.writer(csvfile, delimiter = ',')
        trans_csv.writerow(['Sr No.','Patient id', 'Patient Name', 'Appointment Date', 'Appointment Time', 'Status', ' Reason for Visit','Created At','Doctor in Charge'])
        for t in transactions:
            this_trans = [sr_no, t.patient_id,t.patient.user.username, t.appointment_date, t.appointment_time, t.status, t.reason_for_visit, t.created_at, t.doctor.user.username]
            trans_csv.writerow(this_trans)
            sr_no += 1

    return csv_file_name


@shared_task(ignore_result = False, name = "monthly_report")
def monthly_report(doc_id=None):
    today = datetime.date.today()
    start_of_month = today.replace(day=1)
    if today.month == 12:
        next_month = datetime.date(today.year + 1, 1, 1)
    else:
        next_month = datetime.date(today.year, today.month + 1, 1)

    if doc_id:
        doctors = Doctor.query.filter_by(id=doc_id).all()
    else:
        doctors = Doctor.query.all()

    for doctor in doctors:
        appointments = doctor.appointments.filter(
            Appointment.appointment_date >= start_of_month,
            Appointment.appointment_date < next_month
        ).order_by(
            Appointment.appointment_date,
            Appointment.appointment_time
        ).all()

        # If there are no appointments in this month, include all appointments
        # so doctors still receive a meaningful report instead of an empty table.
        if not appointments:
            appointments = doctor.appointments.order_by(
                Appointment.appointment_date,
                Appointment.appointment_time
            ).all()

        report_data = {
            'Doctor Name': doctor.user.full_name if doctor.user else 'Doctor',
            'appointments': []
        }

        for appointment in appointments:
            treatment = appointment.treatment
            report_data['appointments'].append({
                'Appointment Date': appointment.appointment_date,
                'Appointment Time': appointment.appointment_time,
                'Status': appointment.status,
                'Reason for Visit': appointment.reason_for_visit,
                'Symptoms': appointment.symptoms,
                'Diagnosis': treatment.diagnosis if treatment else 'Not Available'
            })

        message = format_report('templates/mail_details.html', report_data)
        if doctor.user and doctor.user.email:
            send_email(doctor.user.email, subject = "Monthly Patient Report - UNITY SERVICES", message = message)

    return "Monthly reports sent"


@shared_task(ignore_result=False,name="delivery_update")
def delivery_report(username):
    text=f"Hi {username},Check your Dasboard For the Changes From UNITY SERVICES"
    response=requests.post("https://chat.googleapis.com",json={"text":text})
    return"The Updated Details send to user"