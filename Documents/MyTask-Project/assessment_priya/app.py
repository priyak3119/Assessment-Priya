import os
from flask import Flask, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=os.path.join(BASE_DIR, 'static'))

kpi_data = {
    'process_maturity': {'value': 3.2, 'max': 5, 'trend': '+0.1 vs last month'},
    'process_health': {'value': 76.4, 'unit': '%', 'trend': '+2.7% vs last month'},
    'op_efficiency': {'value': 68, 'unit': '%', 'trend': '+3.5% vs last month'},
    'cost_to_serve': {'value': 920, 'unit': 'AED', 'trend': '-5.2% vs last month'},
}
weekly_health = {
    'this_month': [68, 69, 70, 71, 71, 72, 73, 74, 75, 75, 76, 76],
    'last_month': [65, 65, 66, 67, 68, 68, 69, 70, 70, 71, 71, 72],
    'weeks': ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']
}
improvement_actions = {
    'total': 47,
    'previous_period': 31,
    'completed': 29,
    'in_progress': 11,
    'overdue': 7,
    'weekly_counts': [3, 4, 3, 5, 4, 3, 4, 5, 4, 4, 5, 3]
}
roadmap = [
    {'name': 'R1 - Foundation', 'progress': 85, 'status': 'ON TRACK'},
    {'name': 'R2 - Cost & ROI', 'progress': 22, 'status': 'IN BUILD'},
    {'name': 'R3 - Drill-Through', 'progress': 65, 'status': 'PLANNED'},
    {'name': 'R4 - Full Integration', 'progress': 5, 'status': 'PLANNED'},
]
initiatives = {
    'functions': ['Operations', 'Finance', 'IT'],
    'data': {
        'Operations': [30, 35, 40, 42, 45, 50, 55, 58, 62, 66, 70, 75],
        'Finance': [20, 22, 25, 27, 28, 30, 32, 34, 35, 36, 37, 38],
        'IT': [10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    },
}
roi = {'value': 2.4, 'unit': 'x', 'trend': '+0.4x vs last quarter'}

@app.route('/')
def home():
    return send_from_directory(BASE_DIR, 'home.html')

@app.route('/api/kpi')
def get_kpi():
    try:
        response = {
            'process_maturity': kpi_data['process_maturity'],
            'process_health': kpi_data['process_health'],
            'op_efficiency': kpi_data['op_efficiency'],
            'cost_to_serve': kpi_data['cost_to_serve'],
        }
        return jsonify(response)
    except Exception:
        return jsonify({'error': 'Failed to load KPI data.'}), 500

@app.route('/api/dashboard')
def get_dashboard():
    try:
        data = {
            'weekly_health': weekly_health,
            'improvement_actions': improvement_actions,
            'roadmap': roadmap,
            'initiatives': initiatives,
            'roi': roi,
        }
        return jsonify(data)
    except Exception:
        return jsonify({'error': 'Failed to load dashboard data.'}), 500

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'static'), filename)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
