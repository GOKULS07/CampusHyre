# ─── recruiter_operations_mongo.py ─────────────────────────────────
from flask import request, jsonify
from datetime import datetime, date
import json
from db import db                        
from bson import ObjectId

# ------------------------------------------------------------------
# 1. GET ALL PUBLIC JOBS  (status = 1)
# ------------------------------------------------------------------
def get_all_jobs():
    jobs = db().jobs.find({"status": 1})
    job_list = []

    for j in jobs:
        skills     = j["skills"].get("skills", [])
        job_list.append({
            "company":  j["company"],
            "location": j["location"],
            "jobTitle": j["position"],
            "jobtype":  j.get("workplace"),
            "ctc":      j["ctc"],
            "skills":   skills if isinstance(skills, list)
                        else [s.strip() for s in skills.split(",")],
            "jobDescription":   j["description"],
            "deadline":         j["deadline"],
            "jobResponsibility":j["skills"].get("responsibility"),
            "jobRequirement":   j["skills"].get("requirement"),
            "job_id":           str(j["_id"])
        })
    return jsonify(job_list)

# ------------------------------------------------------------------
# 2. POST NEW JOB (Recruiter)
# ------------------------------------------------------------------
def post_jobs():
    job_data = request.get_json() or {}
    recruiter = db().recruiters.find_one({"email": job_data.get("email")})
    if not recruiter:
        return jsonify({"error": "Recruiter not found"}), 400

    skills_doc = {
        "skills":        job_data.get("skills"),
        "responsibility":job_data.get("jobResponsibility", ""),
        "requirement":   job_data.get("jobRequirement", "")
    }

    now = datetime.utcnow()
    gen_id = now.strftime("%d%m%H%M")        # matches old 8‑digit scheme

    doc = {
        "_id":        gen_id,
        "company":    job_data.get("company"),
        "recruiter_id": recruiter["recruiter_id"],
        "position":   job_data.get("jobTitle"),
        "location":   job_data.get("location"),
        "deadline":   job_data.get("deadline"),
        "url":        job_data.get("website"),
        "status":     1,
        "ctc":        job_data.get("ctc"),
        "description":job_data.get("jobDescription"),
        "workplace":  job_data.get("jobtype"),
        "skills":     skills_doc,
        "created_at": now
    }

    db().jobs.insert_one(doc)
    return jsonify({"message": "Job posted successfully!",
                    "jobData": {"job_id": gen_id}}), 200

# ------------------------------------------------------------------
# 3. SET JOB INACTIVE
# ------------------------------------------------------------------
def inactive():
    job_id = (request.get_json() or {}).get("job_id")
    result = db().jobs.update_one({"_id": job_id}, {"$set": {"status": 0}})
    if result.matched_count:
        return jsonify({"message": "Job set to inactive"}), 200
    return jsonify({"error": "Job not found"}), 404

# ------------------------------------------------------------------
# 4. STUDENT DASHBOARD COUNTS
# ------------------------------------------------------------------
def get_student_data():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    applied   = db().job_logs.count_documents({"email": email})
    rejected  = db().job_logs.count_documents({"email": email, "status": 0})
    return jsonify({
        "jobApplicationAnalytics": {
            "appliedJobs":  applied,
            "rejectedJobs": rejected
        }
    })

# ------------------------------------------------------------------
# 5. ALL JOBS (STAFF / RECRUITER DASHBOARD)
# ------------------------------------------------------------------
def get_all_jobs_pro():
    email = (request.get_json() or {}).get("email")
    cred  = db().credentials.find_one({"_id": email}, {"designation":1})
    if not cred or cred["designation"] not in {"Staff", "Recruiter"}:
        return jsonify({"message": "Unauthorized access"}), 403

    jobs = db().jobs.find({})
    job_list = []
    for j in jobs:
        skills = j["skills"].get("skills", [])
        job_list.append({
            "company": j["company"],
            "location": j["location"],
            "jobTitle": j["position"],
            "ctc": j["ctc"],
            "skills": skills if isinstance(skills, list)
                      else [s.strip() for s in skills.split(",")],
            "jobDescription": j["description"],
            "deadline": j["deadline"],
            "responsibility": j["skills"].get("responsibility"),
            "jobRequirement": j["skills"].get("requirement"),
            "job_id": str(j["_id"])
        })
    return jsonify(job_list)

# ------------------------------------------------------------------
# 6. JOBS FOR A PARTICULAR RECRUITER
# ------------------------------------------------------------------
def get_all_jobs_for_rec():
    data = request.get_json() or {}
    rec_email = data.get("email")
    recruiter = db().recruiters.find_one({"email": rec_email})
    if not recruiter:
        return jsonify([])

    jobs = db().jobs.find({"recruiter_id": recruiter["recruiter_id"], "status": 1})
    res  = []
    for j in jobs:
        skills = j["skills"].get("skills", [])
        res.append({
            "company": j["company"],
            "location": j["location"],
            "jobTitle": j["position"],
            "ctc": j["ctc"],
            "skills": skills if isinstance(skills, list)
                      else [s.strip() for s in skills.split(",")],
            "jobDescription": j["description"],
            "deadline": j["deadline"],
            "website": j.get("url"),
            "jobtype": j.get("workplace"),
            "jobResponsibility": j["skills"].get("responsibility"),
            "jobRequirement": j["skills"].get("requirement"),
            "job_id": str(j["_id"])
        })
    return jsonify(res)

# ------------------------------------------------------------------
# 7. UPDATE EXISTING JOB
# ------------------------------------------------------------------
def update_job(job_id):
    job_data = request.get_json() or {}
    recruiter = db().recruiters.find_one({"email": job_data.get("email")})
    if not recruiter:
        return jsonify({"error": "Recruiter not found"}), 400

    skills_doc = {
        "skills":        job_data.get("skills"),
        "responsibility":job_data.get("jobResponsibility", ""),
        "requirement":   job_data.get("jobRequirement", "")
    }

    update_doc = {
        "company":     job_data.get("company"),
        "recruiter_id":recruiter["recruiter_id"],
        "position":    job_data.get("jobTitle"),
        "location":    job_data.get("location"),
        "deadline":    job_data.get("deadline"),
        "url":         job_data.get("website"),
        "status":      1,
        "ctc":         job_data.get("ctc"),
        "description": job_data.get("jobDescription"),
        "workplace":   job_data.get("jobtype"),
        "skills":      skills_doc
    }

    result = db().jobs.update_one({"_id": job_id}, {"$set": update_doc})
    if result.matched_count:
        return jsonify({"message": "Job updated!", "jobData": {"job_id": job_id}}), 200
    return jsonify({"error": "Job not found"}), 404

# ------------------------------------------------------------------
# 8. RECRUITER STATS DASHBOARD
# ------------------------------------------------------------------
def stats():
    data  = request.get_json() or {}
    email = data.get("email")
    recruiter = db().recruiters.find_one({"email": email})
    if not recruiter:
        return jsonify({"error": "Recruiter not found"}), 404

    rid = recruiter["recruiter_id"]

    posted_jobs   = db().jobs.count_documents({"recruiter_id": rid})
    open_jobs     = db().jobs.count_documents({"recruiter_id": rid, "status": 1})
    total_apps    = db().job_logs.count_documents({"recruiter_id": rid})
    pending_apps  = db().job_logs.count_documents({"recruiter_id": rid, "status": 1})

    return jsonify({
        "pendingApprovals":   pending_apps,
        "applicationsReceived": total_apps,
        "activeJobPosts":     open_jobs,
        "jobsPosted":         posted_jobs
    }), 200
