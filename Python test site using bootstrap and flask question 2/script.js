let timer = 10800; // 3 hours in seconds
let interval;

document.addEventListener("DOMContentLoaded", () => {
    const toggleDarkModeButton = document.getElementById("toggleDarkMode");
    const runButton = document.getElementById("runButton");
    const resetButton = document.getElementById("resetButton");
    const codeTextarea = document.getElementById("code");
    const resultContainer = document.getElementById("results");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const startButton = document.getElementById("startButton");

    // Restore saved code from localStorage
    try {
        const savedCode = localStorage.getItem("code");
        if (savedCode !== null) {
            codeTextarea.value = savedCode;
        }
    } catch (e) {
        console.error("Error accessing localStorage:", e);
    }

    // Save code on input
    codeTextarea.addEventListener("input", () => {
        try {
            localStorage.setItem("code", codeTextarea.value);
        } catch (e) {
            console.error("Error saving to localStorage:", e);
        }
    });

    // Restore dark mode preference
    if (localStorage.getItem("dark-mode") === "enabled") {
        document.body.classList.add("bg-dark", "text-white");
        document.querySelectorAll(".card").forEach(card => {
            card.classList.add("bg-dark", "text-white");
        });
    }

    // Toggle dark mode with Bootstrap compatibility
    toggleDarkModeButton.addEventListener("click", () => {
        document.body.classList.toggle("bg-dark");
        document.body.classList.toggle("text-white");
        document.querySelectorAll(".card").forEach(card => {
            card.classList.toggle("bg-dark");
            card.classList.toggle("text-white");
        });

        const isDarkMode = document.body.classList.contains("bg-dark");
        localStorage.setItem("dark-mode", isDarkMode ? "enabled" : "disabled");
    });

    // Run button functionality
    runButton.addEventListener("click", () => {
        const code = codeTextarea.value.trim();
        if (!code) {
            alert("Please write your Python code.");
            return;
        }

        // Define test cases
        const testCases = [
            { timesA: 5, timesB: 2, timesC: 3, expected: "Distance: 259.81 miles" },
            { timesA: 1, timesB: 1, timesC: 1, expected: "Distance: 90.14 miles" },
            { timesA: 0, timesB: 0, timesC: 0, expected: "Distance: 0.00 miles" },
            { timesA: 3, timesB: 0, timesC: 2, expected: "Distance: 112.20 miles" },
            { timesA: 10, timesB: 5, timesC: 8, expected: "Distance: 626.81 miles" },
        ];

        console.log("Payload being sent:", {
            questionId: "question2", // Add questionId here
            code: code,
            test_cases: testCases,
        }); // Debug log for payload

        let correctCount = 0;
        resultContainer.innerHTML = ""; // Clear previous results

        // Fetch request to backend
        fetch("http://127.0.0.1:5000/run_code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: "question2", // Include questionId in the payload
                code: code,
                test_cases: testCases,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Response from server:", data); // Debug log for server response

                if (data.results && data.results.length > 0) {
                    data.results.forEach((result, index) => {
                        const resultDiv = document.createElement("div");
                        resultDiv.classList.add("resultItem");

                        // Ensure input data is displayed correctly
                        const inputText = `Input: ${result.input.timesA}, ${result.input.timesB}, ${result.input.timesC}`;
                        const userOutputText = `Your Output: ${result.user_output || "Error"}`;
                        const expectedOutputText = `Expected Output: ${result.expected_output}`;
                        const matchText = result.match
                            ? `<span style="color: green; font-weight: bold;">Pass</span>`
                            : `<span style="color: red; font-weight: bold;">Fail</span>`;

                        resultDiv.innerHTML = `
                            <p>${inputText}</p>
                            <p>${userOutputText}</p>
                            <p>${expectedOutputText}</p>
                            <p>${matchText}</p>
                        `;

                        if (result.match) {
                            correctCount++;
                        }

                        resultContainer.appendChild(resultDiv);

                        // Display final score after processing all test cases
                        if (index === testCases.length - 1) {
                            scoreDisplay.textContent = `Score: ${correctCount}/${testCases.length}`;
                            scoreDisplay.style.color = correctCount === testCases.length ? "green" : "red";
                        }
                    });
                } else {
                    alert("No results returned from the server.");
                }
            })
            .catch((error) => {
                console.error("Error processing test cases:", error);
            });
    });

    // Reset button functionality
    resetButton.addEventListener("click", () => {
        resultContainer.innerHTML = "";
        scoreDisplay.textContent = "";
        codeTextarea.value = "";
        localStorage.removeItem("code");
    });

    // Timer functionality
    startButton.addEventListener("click", () => {
        startButton.disabled = true; // Disable the start button to prevent multiple timers
        interval = setInterval(() => {
            if (timer <= 0) {
                clearInterval(interval);
                alert("Time's up! Please review your results.");
                return;
            }
            const hours = Math.floor(timer / 3600);
            const minutes = Math.floor((timer % 3600) / 60);
            const seconds = timer % 60;
            timerDisplay.textContent = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            timer--;
        }, 1000);
    });
});
