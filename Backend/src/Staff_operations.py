# ─── staff_operations_mongo.py ─────────────────────────────────────
from flask import request, jsonify, Response
import bcrypt
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from db import db     
# ------------------------------------------------------------------
# 1. ADD NEW USER  (Staff / Recruiter creates accounts)
# ------------------------------------------------------------------
def add_user():
    data = request.get_json() or {}
    for f in ("email", "designation", "password", "eemail"):
        if f not in data:
            return jsonify({"error": f"{f} is required"}), 400

    caller = db().credentials.find_one(
        {"_id": data["eemail"]}, {"designation": 1}
    )
    if not caller or caller["designation"] not in {"Staff", "Recruiter"}:
        return jsonify({"message": "Unauthorized access"}), 403

    hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    try:
        db().credentials.insert_one(
            {
                "_id": data["email"],
                "password": hashed,
                "designation": data["designation"],
            }
        )
    except DuplicateKeyError:
        return (
            jsonify({"error": "User already exists", "email": data["email"]}),
            409,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "User stored successfully", "data": data}), 201


# ------------------------------------------------------------------
# 2. STAFF DASHBOARD – ALL PENDING APPLICATIONS
# ------------------------------------------------------------------
def get_applied_jobs():
    email = (request.json or {}).get("email")
    cred = db().credentials.find_one({"_id": email}, {"designation": 1})
    if not cred or cred["designation"] not in {"Staff", "Recruiter"}:
        return jsonify({"message": "Unauthorized access"}), 403

    apps = db().job_logs.find({"status": 1})  # 1 = pending
    res = []
    for j in apps:
        skills = j["skills"].get("skills", [])
        res.append(
            {
                "job_id": str(j["_id"]),
                "studentName": j["name"],
                "studentEmail": j["email"],
                "studentskills": ", ".join(skills),
                "jobName": j["company"],
                "jobTitle": j["role"],
                "status": j["status"],  # <- so the UI knows 'Incomplete'
            }
        )
    return jsonify({"applications": res})


# ------------------------------------------------------------------
# 3. PENDING APPLICATIONS FOR ONE RECRUITER
# ------------------------------------------------------------------
def get_applied_jobs_rec():
    email = (request.json or {}).get("email")
    cred = db().credentials.find_one({"_id": email}, {"designation": 1})
    if not cred or cred["designation"] not in {"Staff", "Recruiter"}:
        return jsonify({"message": "Unauthorized access"}), 403

    recruiter = db().recruiters.find_one({"email": email})
    if not recruiter:
        return jsonify({"applications": []})

    q = {"recruiter_id": recruiter["recruiter_id"], "status": 1}
    res = []
    for j in db().job_logs.find(q):
        skills = j["skills"].get("skills", [])
        stu = db().students.find_one(
            {"email": j["email"]}, {"github": 1, "linkedin": 1}
        )
        res.append(
            {
                "job_id": str(j["_id"]),
                "studentName": j["name"],
                "studentEmail": j["email"],
                "studentskills": ", ".join(skills),
                "jobName": j["company"],
                "studentgithub": stu.get("github") if stu else None,
                "studentlinkedin": stu.get("linkedin") if stu else None,
                "jobTitle": j["role"],
                "status": j["status"],
            }
        )
    return jsonify({"applications": res})


# ------------------------------------------------------------------
# 4. RETRIEVE RESUME PDF
# ------------------------------------------------------------------
def get_pdf(job_id):
    try:
        _id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
        doc = db().job_logs.find_one(
            {"_id": _id}, {"resume": 1, "resume_filename": 1}
        )
        if not doc or not doc.get("resume"):
            return jsonify({"message": "PDF not found"}), 404
        return Response(
            doc["resume"],
            mimetype="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename={doc.get("resume_filename","resume.pdf")}'
            },
        )
    except Exception as e:
        return jsonify({"message": f"Error retrieving PDF: {str(e)}"}), 500


# ------------------------------------------------------------------
# 5. REJECT APPLICATION  (status = 0)
# ------------------------------------------------------------------
def update_job_status(job_id):
    _id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
    res = db().job_logs.update_one({"_id": _id}, {"$set": {"status": 0}})
    if res.matched_count:
        return jsonify({"message": "Job status updated"}), 200
    return jsonify({"message": "Job not found"}), 404


# ------------------------------------------------------------------
# 6. APPROVE APPLICATION  (status = 2, clear feedback)
# ------------------------------------------------------------------
def update_job_status_to_approve(job_id):
    _id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
    res = db().job_logs.update_one(
        {"_id": _id}, {"$set": {"status": 2, "feedback": None}}
    )
    if res.matched_count:
        return jsonify({"message": "Job status updated"}), 200
    return jsonify({"message": "Job not found"}), 404


# ------------------------------------------------------------------
# 7. STAFF FEEDBACK SUBMIT  (decline path)
# ------------------------------------------------------------------
def feedback_submit():
    data = request.get_json() or {}
    jid = data.get("job_id")
    fb = data.get("feedbackStaff")
    if not (jid and fb):
        return {"error": "Missing required fields"}, 400

    _id = ObjectId(jid) if ObjectId.is_valid(jid) else jid
    db().job_logs.update_one({"_id": _id}, {"$set": {"feedback": fb}})
    return {"success": True}, 200


# ------------------------------------------------------------------
# 7b. APPROVAL FORM  (called from /approveApplication)
# ------------------------------------------------------------------
def approve_application():
    data = request.get_json() or {}
    jid = data.get("job_id")
    instruction = data.get("instruction", "")

    if not jid:
        return jsonify({"success": False, "error": "job_id missing"}), 400

    _id = ObjectId(jid) if ObjectId.is_valid(jid) else jid

    db().job_logs.update_one(
        {"_id": _id},
        {
            "$set": {
                "status": 2,  # approved
                "feedback": instruction,  # you can store under 'instruction' if you prefer
            }
        },
    )
    # ➜  optional: send email to student here
    return jsonify({"success": True}), 200


# ------------------------------------------------------------------
# 8. RECRUITER – ALL PROCESSED APPLICATIONS (rejected + approved)
# ------------------------------------------------------------------
def get_all_applied_jobs_rec():
    email = (request.json or {}).get("email")
    cred = db().credentials.find_one({"_id": email}, {"designation": 1})
    if not cred or cred["designation"] not in {"Staff", "Recruiter"}:
        return jsonify({"message": "Unauthorized access"}), 403

    recruiter = db().recruiters.find_one({"email": email})
    if not recruiter:
        return jsonify({"applications": []})

    q = {"recruiter_id": recruiter["recruiter_id"], "status": {"$in": [0, 2]}}
    res = []
    for j in db().job_logs.find(q):
        skills = j["skills"].get("skills", [])
        stu = db().students.find_one(
            {"email": j["email"]}, {"github": 1, "linkedin": 1}
        )
        res.append(
            {
                "job_id": str(j["_id"]),
                "studentName": j["name"],
                "studentEmail": j["email"],
                "studentskills": ", ".join(skills),
                "jobName": j["company"],
                "studentgithub": stu.get("github") if stu else None,
                "studentlinkedin": stu.get("linkedin") if stu else None,
                "jobTitle": j["role"],
                "status": j["status"],
            }
        )
    return jsonify({"applications": res})
