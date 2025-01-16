from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import contextlib

app = Flask(__name__)
CORS(app, resources={r"/run_code": {"origins": "*"}})

@app.route('/')
def home():
    return "Flask server for Question 2 is running!"

@app.route('/run_code', methods=['POST'])
def run_code():
    data = request.json
    question_id = data.get('questionId', '')  # Get the questionId
    code = data.get('code', '')
    test_cases = data.get('test_cases', [])

    results = []

    if question_id == "question2":  # Process only Question 2
        for test_case in test_cases:
            timesA = test_case.get('timesA', 0)
            timesB = test_case.get('timesB', 0)
            timesC = test_case.get('timesC', 0)
            expected_output = test_case.get('expected', '')

            input_values = iter([timesA, timesB, timesC])
            output_buffer = io.StringIO()

            def mock_input(prompt=None):
                return str(next(input_values))

            try:
                with contextlib.redirect_stdout(output_buffer):
                    exec(code, {"input": mock_input}, {})
                user_output = output_buffer.getvalue().strip()
                match = user_output == expected_output
                results.append({
                    "input": {"timesA": timesA, "timesB": timesB, "timesC": timesC},
                    "user_output": user_output,
                    "expected_output": expected_output,
                    "match": match,
                })
            except Exception as e:
                results.append({
                    "input": {"timesA": timesA, "timesB": timesB, "timesC": timesC},
                    "user_output": f"Error: {e}",
                    "expected_output": expected_output,
                    "match": False,
                })
    else:
        return jsonify({"error": "Invalid or missing questionId"}), 400

    return jsonify({"results": results})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port)
