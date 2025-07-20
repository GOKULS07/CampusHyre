
from flask import Flask, request, jsonify      
from flask_cors import CORS

from db import init_app, db                    # helper that returns Mongo client

app = Flask(__name__)
CORS(app )
init_app(app)                                  # connect to Mongo here


# ─── import helper modules ─────────────────────────────────────────
from login import (
    login, getuser_type, check_sessions,
    get_students, get_upcoming_drives, get_analytics,
    get_student_analysis, forgetpassword, reset_password_db
)

from Recruiter_operations import (
    get_all_jobs, post_jobs, inactive, get_student_data,
    get_all_jobs_pro, get_all_jobs_for_rec, update_job, stats
)

from Staff_operations import (
    add_user, get_applied_jobs, update_job_status, get_pdf,
    feedback_submit, update_job_status_to_approve,
    get_applied_jobs_rec, get_all_applied_jobs_rec,
    approve_application                      # ⟵ NEW: import the new helper
)

from students import (
    faq, studentfetch, update_student, job_sub, get_attendance,
    get_profile, feedback, check_for_application_status
)

from ats import ats_checks

# ───────────────────────── Routes ─────────────────────────────────
@app.route('/check_session', methods=['POST'])
def check_session():
    return check_sessions()

@app.route('/login', methods=['POST'])
def handle_login():
    return login()

@app.route('/upcoming_drives', methods=['POST'])
def upcoming_drives():
    return get_upcoming_drives()

@app.route('/analytics', methods=['POST'])
def analytics():
    return get_analytics()

@app.route('/students', methods=['POST'])
def students():
    return get_students()

@app.route('/jobs', methods=['GET'])
def jobs():
    return get_all_jobs()

@app.route('/alljobs', methods=['POST'])
def alljobs():
    return get_all_applied_jobs_rec()

@app.route('/jobs_rec', methods=['POST'])
def jobs_rec():
    return get_all_jobs_for_rec()

@app.route('/student_analysis', methods=['POST'])
def student_analysis():
    return get_student_analysis()

@app.route('/stat', methods=['POST'])
def stat():
    return stats()

@app.route('/jobs_pro', methods=['POST'])
def jobs_pro():
    return get_all_jobs_pro()

@app.route('/forget', methods=['POST'])
def forget():
    return forgetpassword()

@app.route('/post_job', methods=['POST'])
def post_job():
    return post_jobs()

@app.route('/add_users', methods=['POST'])
def add_users():
    return add_user()

@app.route('/faqs', methods=['GET'])
def faqs():
    return faq()

@app.route('/delete', methods=['POST'])
def delete():
    return inactive()

@app.route('/updated/<int:job_id>', methods=['POST'])
def updated(job_id):
    if not request.is_json:
        return jsonify({'error': 'Expecting application/json'}), 415
    return update_job(job_id)

@app.route('/student', methods=['GET'])
def student():
    return studentfetch()

@app.route('/student_update', methods=['PUT'])
def student_update():
    return update_student()

@app.route('/ats_check', methods=['POST'])
def ats_check():
    return ats_checks()

@app.route('/applyjobs', methods=['POST'])
def applyjobs():
    return job_sub()

# -------- HERE is the important change ----------------------------
@app.route('/approveApplication', methods=['POST'])
def approve_application_route():              # ⟵ NEW name to avoid clash
    return approve_application()              # ⟵ call the correct helper
# ------------------------------------------------------------------

@app.route('/get_applied', methods=['POST'])
def get_applied():
    return get_applied_jobs()

@app.route('/get_applied_rec', methods=['POST'])
def get_applied_rec():
    return get_applied_jobs_rec()

@app.route('/reject/<job_id>', methods=['PATCH'])
def reject(job_id):
    return update_job_status(job_id)

@app.route('/approve/<job_id>', methods=['PATCH'])
def approve(job_id):
    return update_job_status_to_approve(job_id)

@app.route('/attendance', methods=['POST'])
def attendance():
    return get_attendance()

@app.route('/studentjob', methods=['GET'])
def studentjob():
    return get_student_data()

@app.route('/get_student_by_email', methods=['GET'])
def get_student_by_email():
    return get_profile()

@app.route('/get_resume_pdf/<job_id>', methods=['GET'])
def get_resume_pdf(job_id):
    return get_pdf(job_id)

@app.route('/feedback_fetch', methods=['GET'])
def feedback_fetch():
    return feedback()

@app.route('/get-user-type', methods=['GET'])
def get_user_type():
    return getuser_type()

@app.route('/check_application_status', methods=['POST'])
def check_application_status():
    return check_for_application_status()

@app.route('/feedbackSubmit', methods=['POST'])
def feedbackSubmit():
    return feedback_submit()

@app.route('/reset_password', methods=['POST'])
def reset_password():
    return reset_password_db()


# ─── optional quick sanity route ─────────────────────────
@app.route('/dbtest')
def dbtest():
    return jsonify({"collections": db().list_collection_names()})

# ─────────────────────────── main ────────────────────────
if __name__ == '__main__':
    app.run(debug=True)
