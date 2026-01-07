from flask import Blueprint, jsonify
from app.utils.decorators import token_required
from app.services.pattern_analysis import analyze_correlations, get_summary_data, calculate_correlation_matrix
from app.services.ai_service import generate_health_insights
from app.models.pattern import Pattern
from app import db
import hashlib
import json
import uuid

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/patterns', methods=['GET'])
@token_required
def get_patterns(current_user):
    """Get statistical correlations and AI-generated health insights"""
    try:
        # 1. Get statistical correlations (insights)
        correlations = analyze_correlations(current_user.id)
        
        # 2. Get full correlation matrix for the heatmap
        matrix = calculate_correlation_matrix(current_user.id)
        
        # 3. Get data summary for AI
        summary_text = get_summary_data(current_user.id)
        
        # 4. Check for cached AI insights
        # We create a hash of the current data state to see if anything changed
        data_state = {
            'summary': summary_text,
            'correlations': correlations,
            'matrix': matrix
        }
        state_hash = hashlib.sha256(json.dumps(data_state, sort_keys=True).encode()).hexdigest()
        
        cached_pattern = Pattern.query.filter_by(
            user_id=current_user.id, 
            pattern_type='ai_insight_cache'
        ).first()
        
        ai_insights = ""
        
        if cached_pattern and cached_pattern.variables.get('state_hash') == state_hash:
            # Use cached insight
            ai_insights = cached_pattern.description
        else:
            # Generate new insights
            ai_insights = generate_health_insights(summary_text, correlations)
            
            # Update or create cache record
            if not cached_pattern:
                cached_pattern = Pattern(
                    id=str(uuid.uuid4()),
                    user_id=current_user.id,
                    pattern_type='ai_insight_cache',
                    confidence_score=1.0
                )
                db.session.add(cached_pattern)
            
            cached_pattern.description = ai_insights
            cached_pattern.variables = {'state_hash': state_hash}
            db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'correlations': correlations,
                'matrix': matrix,
                'aiInsights': ai_insights
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
