from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import contextlib
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/run_code', methods=['POST'])
def run_code():
    data = request.json
    question_id = data.get('questionId', '')  # Identify the question
    code = data.get('code', '')
    test_cases = data.get('test_cases', [])

    results = []

    if question_id == "question3":  # Process only Question 3
        for test_case in test_cases:
            ounces = test_case.get('ounces', 0)
            expected_output = test_case.get('expected', '')

            input_values = iter([ounces])
            output_buffer = io.StringIO()

            def mock_input(prompt=None):
                return str(next(input_values))

            try:
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
        return jsonify({"error": "Invalid or missing questionId"}), 400

    return jsonify({"results": results})

if __name__ == "__main__":
    #app.run(debug=True)
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port)
