from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import jwt
import uuid
from app import db
from app.config import Config
from app.models.user import User
from app.utils.decorators import token_required

medications_bp = Blueprint('medications', __name__)