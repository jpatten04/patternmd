from flask import Blueprint, jsonify
from app.utils.decorators import token_required
from app.services.pattern_analysis import analyze_correlations, get_summary_data
from app.services.ai_service import generate_health_insights

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/patterns', methods=['GET'])
@token_required
def get_patterns(current_user):
    """Get statistical correlations and AI-generated health insights"""
    try:
        # 1. Get statistical correlations
        correlations = analyze_correlations(current_user.id)
        
        # 2. Get data summary for AI
        summary_text = get_summary_data(current_user.id)
        
        # 3. Generate AI insights
        ai_insights = generate_health_insights(summary_text, correlations)
        
        return jsonify({
            'success': True,
            'data': {
                'correlations': correlations,
                'aiInsights': ai_insights
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
