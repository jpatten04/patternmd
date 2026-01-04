from datetime import datetime
from app import db

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)  # comprehensive, symptoms, medications, custom
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'generatedAt': self.generated_at.isoformat(),
            'startDate': self.start_date.isoformat(),
            'endDate': self.end_date.isoformat(),
            'filePath': self.file_path,
            'reportType': self.report_type,
            'status': self.status
        }