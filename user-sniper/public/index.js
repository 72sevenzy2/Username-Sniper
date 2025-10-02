const wrapper1_input = document.getElementById("wr1input");
const wrapper1_button = document.getElementById("wr1button");
const wrapper1_label = document.getElementById("wr1label");

// reuse logContainer + addLogLine from observe code
// (make sure addLogLine() is defined before this code runs)

wrapper1_button.addEventListener("click", async () => {
    const username = wrapper1_input.value.trim();
    if (!username) return alert("Enter a username!");

    wrapper1_label.textContent = "Checking...";

    try {
        const res = await fetch(`/check?username=${username}`);

        // if server returns 404 for available
        if (!res.ok && res.status === 404) {
            wrapper1_label.textContent = "Status: Available!";
            addLogLine(`Checked (Quick): ${username} -> Available`);
            return;
        }

        const data = await res.json();

        if (data.taken) {
            wrapper1_label.textContent = `Status: Taken (${data.message || ""})`;
            addLogLine(`Checked (Quick): ${username} -> Taken`);
        } else {
            wrapper1_label.textContent = "Status: Available!";
            addLogLine(`Checked (Quick): ${username} -> Available`);
        }
    } catch (err) {
        console.error(err);
        wrapper1_label.textContent = "Error checking username.";
        addLogLine(`Checked (Quick): ${username} -> Error`);
    }
});



// --- Observe (wrapper2) functionality ---
const observeInput = document.getElementById("wr2input");
const observeBtn = document.getElementById("wr2button");   // Observe
const stopBtn = document.getElementById("wr2button2");    // Stop
const observeLabel = document.getElementById("wr2label");
const logContainer = document.querySelector(".wr5mainc"); // container to append logs

let observerIntervalId = null;
let isChecking = false;

// Choose a polling interval in ms (you can change this)
const POLL_MS = 1200;

function addLogLine(text) {
    const p = document.createElement("p");
    p.className = "wr5p";
    p.textContent = text;
    // prepend newest at top
    logContainer.insertBefore(p, logContainer.firstChild);
    // optionally limit history length
    const max = 20;
    while (logContainer.children.length > max) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

async function checkUsernameOnce(username) {
    if (isChecking) return; // avoid overlapping requests
    isChecking = true;
    try {
        const res = await fetch(`/check?username=${encodeURIComponent(username)}`);
        if (!res.ok && res.status === 404) {
            // your server used 404 to indicate available
            observeLabel.textContent = `Status: Available!`;
            addLogLine(`Checked: ${username} -> Available`);
            return { taken: false };
        }
        const data = await res.json();
        if (data.taken) {
            observeLabel.textContent = `Status: Taken`;
            addLogLine(`Checked: ${username} -> Taken`);
            return { taken: true, info: data };
        } else {
            observeLabel.textContent = `Status: Available!`;
            addLogLine(`Checked: ${username} -> Available`);
            return { taken: false, info: data };
        }
    } catch (err) {
        console.error("Observe check failed:", err);
        observeLabel.textContent = "Status: Error";
        addLogLine(`Checked: ${username} -> Error`);
        return { error: true };
    } finally {
        isChecking = false;
    }
}

function startObserving() {
    const username = observeInput.value.trim();
    if (!username) {
        alert("Enter a username to observe.");
        return;
    }
    if (observerIntervalId !== null) return; // already running

    observeBtn.disabled = true;
    stopBtn.disabled = false;
    observeLabel.textContent = "Status: Observing...";

    // Initial check immediately
    checkUsernameOnce(username);

    // Poll repeatedly
    observerIntervalId = setInterval(() => {
        checkUsernameOnce(username);
    }, POLL_MS);
}

function stopObserving() {
    if (observerIntervalId !== null) {
        clearInterval(observerIntervalId);
        observerIntervalId = null;
    }
    observeBtn.disabled = false;
    stopBtn.disabled = true;
    observeLabel.textContent = "Status: Stopped";
}

// wire buttons
observeBtn.addEventListener("click", startObserving);
stopBtn.addEventListener("click", stopObserving);

// initial state
stopBtn.disabled = true;
