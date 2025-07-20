# seed_student_full.py  ──────────────────────────────
"""
Run once:
    $ python seed_student_full.py
It will upsert a single student document with all
properties the React dashboard expects.
"""
from datetime import datetime
import bcrypt
from pymongo import MongoClient

DB = MongoClient()["ATSportal"]

def hash_pw(p):                   # ---------- credentials collection
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

DB.credentials.replace_one(
    {"_id": "gokuls.cs22@bitsathy.ac.in"},
    {
        "_id"       : "gokuls.cs22@bitsathy.ac.in",
        "designation": "Student",
        "password"  : hash_pw("student123")
    },
    upsert=True
)

# ---------- students collection
student = {
    "email"      : "gokuls.cs22@bitsathy.ac.in",
    "name"       : "Gokul S",
    "roll_number": "22CS999",
    "department" : "CSE",
    "batch"      : "2022‑2026",
    # extra dash‑boards fields
    "year"               : "III",        # ← shows under “Year”
    "cgpa"               : 8.47,
    "arrear"             : 0,
    "placement_fa"       : 85,           # ← “Placement FA %”
    "fullstackpoint"     : 120,          # ← “Full Stack Point”
    "rank"               : 12,           # optional “(Rank n)”
    # attendance widget
    "present_days"       : 90,
    "total_days"         : 100,
    # personal info
    "dob"                : datetime(2004, 3, 19),   # **datetime.datetime**
    "phone"              : "9876543210",
    "address"            : "Coimbatore",
    "linkedin"           : "https://www.linkedin.com/in/gokul",
    "github"             : "https://github.com/gokul",
    # skills
    "skills"             : {"skills": ["Python", "React", "MongoDB"]}
}
DB.students.replace_one({"email": student["email"]}, student, upsert=True)

print("✅ student record inserted / updated")
