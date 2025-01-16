from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import contextlib

app = Flask(__name__)
CORS(app, resources={r"/run_code": {"origins": "*"}})

@app.route('/')
def home():
    return "Flask server is running!"

# Route to handle multiple test cases in one request
@app.route('/run_code', methods=['POST'])
def run_code():
    data = request.json
    code = data.get('code', '')
    test_cases = data.get('test_cases', [])  # Receive all test cases in one request

    results = []

    for test_case in test_cases:
        # Adjust inputs dynamically
        a = test_case.get('red', 0)  # For Question 2: Employee A travel times
        b = test_case.get('green', 0)  # For Question 2: Employee B travel times
        c = test_case.get('blue', 0)  # For Question 2: Employee C travel times
        expected_output = test_case.get('expected', '')

        print(f"Processing Test Case: A={a}, B={b}, C={c}, Expected={expected_output}")

        user_vars = {}
        input_values = iter([a, b, c])  # Create an iterator for input values

        # Mock `input()` to simulate user input in Python code
        def mock_input(prompt=None):
            return next(input_values)

        output_buffer = io.StringIO()
        try:
            # Redirect stdout to capture print() outputs from the user's code
            with contextlib.redirect_stdout(output_buffer):
                exec(code, {"input": mock_input}, user_vars)

            user_output = output_buffer.getvalue().strip()

            if not user_output:
                user_output = "No output captured. Ensure you use print()."

            match = user_output == expected_output

            print(f"User Output: {user_output}")
            print(f"Expected Output: {expected_output}")
            print(f"Match: {match}")

            # Append the result for each test case
            results.append({
                "input": {"red": a, "green": b, "blue": c},
                "user_output": user_output,
                "expected_output": expected_output,
                "match": match,
            })
        except Exception as e:
            print(f"Error during code execution: {e}")
            results.append({
                "input": {"red": a, "green": b, "blue": c},
                "user_output": f"Error: {str(e)}",
                "expected_output": expected_output,
                "match": False,
            })

    print("All Test Case Results:", results)
    return jsonify({"results": results})

# Route to handle single test case requests for debugging
@app.route('/run_code_single', methods=['POST'])
def run_code_single():
    data = request.json
    code = data.get('code', '')
    a = data.get('red', 0)
    b = data.get('green', 0)
    c = data.get('blue', 0)

    print(f"Received Code: {code}")
    print(f"Inputs: A={a}, B={b}, C={c}")

    user_vars = {}
    input_values = iter([a, b, c])  # Create an iterator for input values

    def mock_input(prompt=None):
        return next(input_values)

    output_buffer = io.StringIO()
    try:
        with contextlib.redirect_stdout(output_buffer):
            exec(code, {"input": mock_input}, user_vars)

        user_output = output_buffer.getvalue().strip()

        if not user_output:
            user_output = "No output captured. Ensure you use print()."

        print(f"User Output: {user_output}")

        return jsonify({
            "user_output": user_output,
            "expected_output": "This is a debugging endpoint. Use the multi-case endpoint for comparison.",
            "match": "N/A",
        })
    except Exception as e:
        print(f"Error during code execution: {e}")
        return jsonify({"error": f"Error during code execution: {e}"})

if __name__ == "__main__":
    #app.run(debug=True)
    app.run()
