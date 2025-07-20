# db.py  – central place for the Mongo client
from flask_pymongo import PyMongo

mongo = PyMongo()          

def init_app(app):
    """Call this ONCE in app.py after you create the Flask app."""
    app.config["MONGO_URI"] = "mongodb://localhost:27017/ATSportal"
    mongo.init_app(app)

def db():
    """Shortcut used by the rest of the code."""
    return mongo.db
