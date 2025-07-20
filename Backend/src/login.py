# login.py
from flask import request, jsonify
import bcrypt, random, string
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from db import db     # ← your MongoDB helper ‑ must return a Database object

# ─── CONFIG (move to env vars / settings in production) ────────────────
smtp_server   = "smtp.gmail.com"
smtp_port     = 587
sender_email  = "admin@example.com"
email_pwd     = "admin123"                 # Gmail App Password

# Toggle: allow “Student” users to pass /check_sessions
ALLOW_STUDENTS = False                     # ← change to True if needed

# ─── HELPERS ───────────────────────────────────────────────────────────
def _bcrypt_ok(raw_pwd: str, stored_hash):
    """
    Safely check a bcrypt hash. Returns True or False,
    never raises ValueError (‘Invalid salt’).
    """
    if stored_hash is None:                       # no password in DB
        return False

    if isinstance(stored_hash, str):              # convert to bytes
        stored_hash = stored_hash.encode("utf‑8")
    elif not isinstance(stored_hash, (bytes, bytearray)):
        # Something weird was stored – treat as mismatch
        return False

    try:
        return bcrypt.checkpw(raw_pwd.encode("utf‑8"), stored_hash)
    except ValueError:
        # Hash is corrupted / not valid bcrypt
        return False


def _send_mail(to_addr: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_addr
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as srv:
        srv.starttls()
        srv.login(sender_email, email_pwd)
        srv.sendmail(sender_email, to_addr, msg.as_string())


# ─── AUTH & SESSION ────────────────────────────────────────────────────
def login():
    data  = request.json or {}
    email = data.get("email")
    pwd   = data.get("password")

    if not (email and pwd):
        return jsonify({"error": "Email and password are required"}), 400

    user = db().credentials.find_one({"_id": email}, {"password": 1})
    if user and _bcrypt_ok(pwd, user["password"]):
        db().email_logs.insert_one({"email": email,
                                    "ts": datetime.now(timezone.utc)})
        return jsonify({"message": "Login successful!"}), 200

    return jsonify({"error": "Invalid credentials"}), 401


def getuser_type():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    doc = db().credentials.find_one({"_id": email}, {"designation": 1})
    if not doc:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"type": doc["designation"]}), 200


def check_sessions():
    email = (request.json or {}).get("email")
    if not email:
        return jsonify({"message": "Email is required"}), 400

    cred = db().credentials.find_one({"_id": email}, {"designation": 1})
    if not cred:
        return jsonify({"message": "Unauthorized", "status": "error"}), 403

    allowed = {"Staff", "Recruiter"}
    if ALLOW_STUDENTS:
        allowed.add("Student")

    if cred["designation"] in allowed:
        return jsonify({"message": "Access granted", "status": "success"}), 200

    return jsonify({"message": "Unauthorized", "status": "error"}), 403


# ─── EMAIL ACTIONS ─────────────────────────────────────────────────────
def send_next_steps():
    data     = request.get_json() or {}
    receiver = data.get("studentEmail")
    body     = data.get("instruction", "")
    subject  = f'{data.get("company")}  Role: {data.get("jobTitle")}'

    _send_mail(receiver, subject, body)
    return jsonify({"success": "Email sent successfully!"}), 200


# ─── PASSWORD RESET (OTP) ──────────────────────────────────────────────
def forgetpassword():
    data     = request.get_json() or {}
    receiver = data.get("email")
    if not receiver:
        return jsonify({"error": "Email is required"}), 400

    otp_plain = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    otp_hash  = bcrypt.hashpw(otp_plain.encode(), bcrypt.gensalt()).decode()

    db().credentials.update_one(
        {"_id": receiver},
        {"$set": {"otp": otp_hash}},
        upsert=True,
    )

    _send_mail(
        receiver,
        "New password",
        f"This is an auto‑generated mail for password change.\n"
        f"Your new password is {otp_plain}",
    )
    return jsonify({"success": "Email sent and OTP stored"}), 200


def reset_password_db():
    data  = request.get_json() or {}
    email = data.get("email")
    otp   = data.get("otp", "")
    newpw = data.get("password")

    if not all([email, otp, newpw]):
        return jsonify({"error": "email, otp, password required"}), 400

    cred = db().credentials.find_one({"_id": email}, {"otp": 1})
    if cred and cred.get("otp") and _bcrypt_ok(otp, cred["otp"]):
        new_hash = bcrypt.hashpw(newpw.encode(), bcrypt.gensalt()).decode()
        db().credentials.update_one(
            {"_id": email},
            {"$set": {"password": new_hash, "otp": None}},
        )
        return jsonify({"success": "Password updated"}), 200

    return jsonify({"message": "Invalid credentials"}), 400


# ─── STUDENT LIST ──────────────────────────────────────────────────────
def get_students():
    docs = db().students.find(
        {},
        {
            "name": 1,
            "email": 1,
            "roll_number": 1,
            "department": 1,
            "batch": 1,
            "skills": 1,
        },
    )
    res = []
    for d in docs:
        skill_str = ", ".join(d.get("skills", {}).get("skills", []))
        res.append(
            {
                "name": d["name"],
                "rollno": d.get("roll_number"),
                "department": d.get("department"),
                "batch": d.get("batch"),
                "email": d["email"],
                "skills": skill_str,
            }
        )
    return jsonify({"students": res}), 200


# ─── UPCOMING DRIVES ───────────────────────────────────────────────────
def get_upcoming_drives():
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    cursor = (
        db().jobs.find({"deadline": {"$gte": today_start}})
        .sort("deadline", 1)
        .limit(3)
    )

    drives = []
    for j in cursor:
        # ensure we always have a datetime
        deadline = j["deadline"]
        if isinstance(deadline, datetime):
            date_str = deadline.strftime("%d-%m-%Y")
        else:                              # stored as string / date?
            date_str = str(deadline)
        drives.append({"companyName": j["company"], "date": date_str})

    return jsonify({"upcomingDrives": drives}), 200


# ─── ANALYTICS ─────────────────────────────────────────────────────────
def get_analytics():
    total_jobs       = db().jobs.count_documents({})
    ongoing          = db().jobs.count_documents({"status": 1})
    students_applied = len(db().job_logs.distinct("email"))

    return jsonify(
        {
            "TotaljobPosts": total_jobs,
            "ongoingRecruitment": ongoing,
            "studentsApplied": students_applied,
        }
    ), 200


def get_student_analysis():
    docs = list(db().student_analysis.find({}, {"_id": 0}).sort("month", 1))
    if not docs:
        return jsonify({"error": "No data found"}), 404
    return jsonify(docs), 200
