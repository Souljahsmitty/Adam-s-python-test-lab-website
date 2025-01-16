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
            { red: 130, green: 50, blue: 130, expected: "80 0 80" },
            { red: 255, green: 255, blue: 255, expected: "0 0 0" },
            { red: 0, green: 0, blue: 0, expected: "0 0 0" },
            { red: 9, green: 0, blue: 15, expected: "9 0 15" },
            { red: 10, green: 50, blue: 90, expected: "0 40 80" },
        ];

        console.log("Payload being sent:", {
            code: code,
            test_cases: testCases,
        }); // Debug log for payload

        let correctCount = 0;
        resultContainer.innerHTML = ""; // Clear previous results

        fetch("https://adam-s-python-test-lab-website.onrender.com/run_code", {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
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

                        const inputText = `Input: ${result.input.red}, ${result.input.green}, ${result.input.blue}`;
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
