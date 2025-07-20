


import bcrypt

# Get password (for demonstration purposes, use a hardcoded password)
import bcrypt

# The password you want to hash
password = "1234"

# Generate a salt
salt = bcrypt.gensalt()

# Hash the password with the salt
hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

print(f"Hashed password: {hashed_password.decode('utf-8')}")
stored_hash = "$2b$12$.Qfd2uIg9nYq.85qltvOxemO.7ioqhmiZYieRCc9LOrCQNKWvrCbG"

# The password to check
password_to_check = "1234"

# Check if the password matches the hashed password
if bcrypt.checkpw(password_to_check.encode('utf-8'), stored_hash.encode('utf-8')):
    print("Password matches!")
else:
    print("Password does not match.")
