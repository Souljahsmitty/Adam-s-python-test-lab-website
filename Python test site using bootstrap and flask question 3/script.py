from flask import Flask, request, jsonify
from flask_cors import CORS
import contextlib
import io

app = Flask(__name__)
CORS(app)

@app.route('/run_code', methods=['POST', 'OPTIONS'])
def run_code():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight OK"}), 200

    data = request.json
    question_id = data.get('questionId', '')
    code = data.get('code', '')
    test_cases = data.get('test_cases', [])

    results = []

    if question_id == "question3":
        for test_case in test_cases:
            ounces = test_case.get('ounces', 0)
            expected_output = test_case.get('expected', '')

            # Simulate `input` behavior
            input_values = iter([str(ounces)])  # Ensure it's a string
            output_buffer = io.StringIO()

            def mock_input(prompt=None):
                return next(input_values)

            try:
                # Redirect stdout to capture print output
                with contextlib.redirect_stdout(output_buffer):
                    exec(code, {"input": mock_input}, {})
                user_output = output_buffer.getvalue().strip()
                match = user_output == expected_output
                results.append({
                    "input": {"ounces": ounces},
                    "user_output": user_output,
                    "expected_output": expected_output,
                    "match": match,
                })
            except Exception as e:
                results.append({
                    "input": {"ounces": ounces},
                    "user_output": f"Error: {e}",
                    "expected_output": expected_output,
                    "match": False,
                })
    else:
        return jsonify({"error": "Invalid questionId"}), 400

    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
