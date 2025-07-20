# ─── students_mongo.py ────────────────────────────────────────────
from flask import request, jsonify, Response
from datetime import datetime, date
import json, base64, bson
from db import db                                   

# ── helpers ───────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {"pdf"}
def allowed_file(fname): return "." in fname and fname.rsplit(".",1)[1].lower() in ALLOWED_EXTENSIONS

# -----------------------------------------------------------------
# 1. FAQ
# -----------------------------------------------------------------
def faq():
    faqs = [{"question": f["question"], "answer": f["answer"]} for f in db().faq.find({})]
    return jsonify(faqs)

# -----------------------------------------------------------------
# 2. FETCH STUDENT BY EMAIL
# -----------------------------------------------------------------
def studentfetch():
    email = request.args.get("email")
    print("🎯 /student called with email:", email)

    if not email:
        return jsonify({"error": "Email is required"}), 400

    stu = db().students.find_one({"email": email})
    print("✅ Student found:", stu)

    if not stu:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(stu)


# -----------------------------------------------------------------
# 3. UPDATE STUDENT
# -----------------------------------------------------------------
def update_student():
    email = request.args.get("email")
    if not email: return jsonify({"error": "Email parameter is required"}), 400
    data  = request.get_json() or {}

    required = {"name","address","dob","phonenumber","linkedin","github","skills","department"}
    missing  = required - data.keys()
    if missing:
        return jsonify({"error": f"Missing required field(s): {', '.join(missing)}"}), 400

    # validate / transform DOB
    try:
        dob_obj = datetime.strptime(data["dob"].strip(), "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY‑MM‑DD"}), 400
    data["dob"] = dob_obj

    # normalise skills to dict
    sk = data["skills"]
    if isinstance(sk, str):
        sk = [s.strip() for s in sk.split(",")]
    elif not isinstance(sk, list):
        return jsonify({"error": "Skills should be list or comma‑separated string"}), 400
    data["skills"] = {"skills": sk}

    res = db().students.update_one({"email": email}, {"$set": data})
    if not res.matched_count:
        return jsonify({"error": "Student not found"}), 404

    # return cleaned record
    return studentfetch()

# -----------------------------------------------------------------
# 4. JOB APPLICATION (resume upload)
# -----------------------------------------------------------------
def job_sub():
    if "resume" not in request.files:   return jsonify({"error": "No resume part"}), 400
    file = request.files["resume"]
    if file.filename == "":             return jsonify({"error": "No file selected"}), 400
    if not allowed_file(file.filename): return jsonify({"error": "Only PDF allowed"}), 400

    job_id   = request.form.get("job_id")
    company  = request.form.get("company")
    email    = request.form.get("email")
    role     = request.form.get("role")
    if not all([job_id, company, email, role]):
        return jsonify({"error": "Missing form fields"}), 400

    stu = db().students.find_one({"email": email}, {"name":1,"skills":1})
    if not stu: return jsonify({"error": "Student not found"}), 404

    rec = db().jobs.find_one({"_id": job_id}, {"recruiter_id":1})
    if not rec: return jsonify({"error": "Job not found"}), 404

    doc = {
        "job_id": job_id,
        "company": company,
        "role": role,
        "name": stu["name"],
        "email": email,
        "resume_filename": file.filename,
        "resume": file.read(),                 # store raw PDF bytes
        "skills": stu.get("skills", {}),
        "status": 1,                           # pending
        "recruiter_id": rec["recruiter_id"],
        "applied_at": datetime.utcnow()
    }
    db().job_logs.insert_one(doc)
    return jsonify({"message": "Application submitted successfully!"}), 200

# -----------------------------------------------------------------
# 5. CHECK APPLICATION STATUS
# -----------------------------------------------------------------
def check_for_application_status():
    data = request.json or {}
    job_id, email = data.get("job_id"), data.get("email")
    if not (job_id and email):
        return jsonify({"error": "job_id and email required", "isApplied": False}), 400

    exists = db().job_logs.count_documents({"job_id": job_id, "email": email}) > 0
    return jsonify({"isApplied": exists, "message": "Application found" if exists else "No application"}), 200

# -----------------------------------------------------------------
# 6. ATTENDANCE
# -----------------------------------------------------------------
def get_attendance():
    email = (request.json or {}).get("email")
    if not email: return jsonify({"error": "Email is required"}), 400
    stu = db().students.find_one({"email": email}, {"present_days":1,"total_days":1})
    if not stu: return jsonify({"error": "No attendance data"}), 404
    return jsonify({"presentDays": stu.get("present_days",0),
                    "totalDays":   stu.get("total_days",0)}), 200

# -----------------------------------------------------------------
# 7. FULL PROFILE
# -----------------------------------------------------------------
def get_profile():
    email = request.args.get("email")
    if not email: return jsonify({"error": "Email parameter is missing"}), 400
    stu = db().students.find_one({"email": email}, {"_id":0})
    if not stu: return jsonify({"message": "Student not found"}), 404
    return jsonify({"student": stu})

# -----------------------------------------------------------------
# 8. FEEDBACK FOR STUDENT (status=0)
# -----------------------------------------------------------------
def feedback():
    email = request.args.get("email")
    if not email: return jsonify({"error": "Email parameter is required"}), 400

    rows = list(db().job_logs.find({"email": email, "status": 0},
                                   {"_id":0,"feedback":1,"company":1,"role":1}))
    if not rows:
        return jsonify({"message": "No feedback found"}), 404
    return jsonify(rows)
