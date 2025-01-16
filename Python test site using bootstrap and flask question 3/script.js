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
    const ouncesInput = document.getElementById("ounces");

    // Restore dark mode preference
    if (localStorage.getItem("dark-mode") === "enabled") {
        document.body.classList.add("bg-dark", "text-white");
        document.querySelectorAll(".card").forEach(card => {
            card.classList.add("bg-dark", "text-white");
        });
    }

    // Toggle dark mode
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
        const ounces = ouncesInput.value.trim();
        const code = codeTextarea.value.trim();

        if (!code || !ounces) {
            alert("Please provide both code and input.");
            return;
        }

        // Validate ounces input
        if (isNaN(parseInt(ounces, 10))) {
            alert("Please enter a valid number for ounces.");
            return;
        }

        // Calculate dynamic expected output
        const ouncesValue = parseInt(ounces, 10);
        const ouncesPerPound = 16;
        const poundsPerTon = 2000;

        const tons = Math.floor(ouncesValue / (ouncesPerPound * poundsPerTon));
        let remainingOunces = ouncesValue % (ouncesPerPound * poundsPerTon);
        const pounds = Math.floor(remainingOunces / ouncesPerPound);
        remainingOunces = remainingOunces % ouncesPerPound;

        const dynamicExpectedOutput = `Tons: ${tons}\nPounds: ${pounds}\nOunces: ${remainingOunces}`;

        const testCases = [
            { ounces: ouncesValue, expected: dynamicExpectedOutput }, // Dynamic user input
            { ounces: 34567, expected: "Tons: 1\nPounds: 160\nOunces: 7" },
            { ounces: 35035, expected: "Tons: 1\nPounds: 189\nOunces: 11" },
            { ounces: 12345, expected: "Tons: 0\nPounds: 771\nOunces: 9" },
            { ounces: 200000, expected: "Tons: 6\nPounds: 500\nOunces: 0" },
            { ounces: 16000, expected: "Tons: 0\nPounds: 1000\nOunces: 0" },
        ];

        fetch("https://adam-s-python-test-lab-website.onrender.com/run_code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: "question3",
                code: code,
                test_cases: testCases,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                resultContainer.innerHTML = ""; // Clear previous results
                if (data.results && data.results.length > 0) {
                    let correctCount = 0;

                    data.results.forEach((result, index) => {
                        const resultDiv = document.createElement("div");
                        resultDiv.classList.add("resultItem");

                        const inputText = `Input: ${result.input.ounces}`;
                        const userOutputText = `Your Output: <pre>${result.user_output || "Error"}</pre>`;
                        const expectedOutputText = `Expected Output: <pre>${result.expected_output}</pre>`;
                        const matchText = result.match
                            ? `<span style="color: green; font-weight: bold;">Pass</span>`
                            : `<span style="color: red; font-weight: bold;">Fail</span>`;

                        resultDiv.innerHTML = `
                            <p>${inputText}</p>
                            <p>${userOutputText}</p>
                            <p>${expectedOutputText}</p>
                            <p>${matchText}</p>
                        `;

                        if (result.match) correctCount++;

                        resultContainer.appendChild(resultDiv);

                        // Display final score at the end of processing all test cases
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
                console.error("Error processing the request:", error);
                alert("An error occurred while processing your request. Please try again.");
            });
    });

    // Reset button functionality
    resetButton.addEventListener("click", () => {
        ouncesInput.value = ""; // Clear ounces input
        codeTextarea.value = ""; // Clear code textarea
        resultContainer.innerHTML = ""; // Clear results
        scoreDisplay.textContent = ""; // Clear score
        localStorage.removeItem("code"); // Clear saved code
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
