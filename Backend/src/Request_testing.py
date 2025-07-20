# # 

# # import bcrypt

# # # User's password (this should be entered by the user during registration)
# # password = '1234'

# # # Hash the password with bcrypt
# # hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# # # Store the hashed password in the database (in your case, under the `password` column)
# # print("Hashed Password:", hashed_password)

# # # You would then insert `hashed_password` into your database


# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText

# # Set up the server (Gmail in this case)
# smtp_server = 'smtp.gmail.com'
# smtp_port = 587  # Common port for sending email
# sender_email = 'shithaarthan13@gmail.com'  # Replace with your email address
# receiver_email = 'shona.ad21@bitsathy.ac.in'  # Replace with the recipient's email address
# password = 'wjba dvum wpzm qeew'  # Replace with your email password or app-specific password

# # Set up the message
# subject = 'This is a mail from me'
# body = 'Hi vicky'

# # Create a MIME object to hold the email content
# msg = MIMEMultipart()
# msg['From'] = sender_email
# msg['To'] = receiver_email
# msg['Subject'] = subject
# msg.attach(MIMEText(body, 'plain'))

# # Send the email
# try:
#     # Establish a connection to the server
#     server = smtplib.SMTP(smtp_server, smtp_port)
#     server.starttls()  # Upgrade the connection to secure
#     server.login(sender_email, password)  # Log in with the email credentials

#     # Send the email
#     text = msg.as_string()
#     server.sendmail(sender_email, receiver_email, text)

#     print('Email sent successfully!')

# except Exception as e:
#     print(f'Error: {e}')

# finally:
#     # Close the server connection
#     server.quit()
# from datetime import datetime

# # Get the current date, month, hour, and minute
# current_time = datetime.now()

# # Format it as YYYYMMDDHHMM, then extract the last 8 digits (for example, based on DD, HH, MM)
# generated_number = f"{current_time.day:02d}{current_time.month:02d}{current_time.hour:02d}{current_time.minute:02d}"

# # Output the 8-digit number
# print("Generated 8-digit number:", generated_number)


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