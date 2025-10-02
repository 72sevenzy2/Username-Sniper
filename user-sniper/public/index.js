const wrapper1_input = document.getElementById("wr1input");
const wrapper1_button = document.getElementById("wr1button");
const wrapper1_label = document.getElementById("wr1label");

wrapper1_button.addEventListener("click", async () => {
    const username = wrapper1_input.value.trim();
    if (!username) return alert("Enter a username!");

    wrapper1_label.textContent = "Checking...";

    try {
        const res = await fetch(`/check?username=${username}`);
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

const observeInput = document.getElementById("wr2input");
const observeBtn = document.getElementById("wr2button");
const stopBtn = document.getElementById("wr2button2");
const observeLabel = document.getElementById("wr2label");
const logContainer = document.querySelector(".wr5mainc");

let observerIntervalId = null;
let isChecking = false;

const POLL_MS = 1200;

function addLogLine(text) {
    const p = document.createElement("p");
    p.className = "wr5p";
    p.textContent = text;
    if (text.toLowerCase().includes("available")) {
        p.style.background = "rgba(255,255,255,0.2)";
        p.style.padding = "4px 8px";
        p.style.borderRadius = "6px";
    }
    logContainer.insertBefore(p, logContainer.firstChild);
    const max = 20;
    while (logContainer.children.length > max) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

async function checkUsernameOnce(username) {
    if (isChecking) return;
    isChecking = true;
    try {
        const res = await fetch(`/check?username=${encodeURIComponent(username)}`);
        if (!res.ok && res.status === 404) {
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
    if (observerIntervalId !== null) return;

    observeBtn.disabled = true;
    stopBtn.disabled = false;
    observeLabel.textContent = "Status: Observing...";

    checkUsernameOnce(username);

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

observeBtn.addEventListener("click", startObserving);
stopBtn.addEventListener("click", stopObserving);
stopBtn.disabled = true;

const radio4 = document.getElementById("wr3radio1");
const radio5 = document.getElementById("wr3radio2");
const charsetButtons = [
    document.getElementById("wr3button1"),
    document.getElementById("wr3button2"),
    document.getElementById("wr3button3"),
];
const wr3Label = document.getElementById("wr3h3");
const startBtn = document.getElementById("wr3button4");
const stopBt = document.getElementById("wr3button5");

let selectedCharset = null;
let sniperInterval = null;

charsetButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
        charsetButtons.forEach(b => b.style.background = "grey");
        btn.style.background = "darkgray";
        selectedCharset = idx;
    });
});

function getRandomUsername(len, charsetIndex) {
    const numbers = "0123456789";
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let chars = "";
    if (charsetIndex === 0) chars = numbers;
    if (charsetIndex === 1) chars = numbers + letters;
    if (charsetIndex === 2) chars = letters;

    let out = "";
    for (let i = 0; i < len; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
}

async function tryUsername(username) {
    try {
        const res = await fetch(`/check?username=${encodeURIComponent(username)}`);
        if (!res.ok && res.status === 404) {
            wr3Label.textContent = `Status: Available -> ${username}`;
            addLogLine(`AutoSniper found AVAILABLE: ${username}`);
            return { available: true, username };
        }
        const data = await res.json();
        if (data.taken) {
            wr3Label.textContent = `Status: Taken -> ${username}`;
            addLogLine(`AutoSniper: ${username} -> Taken`);
            return { taken: true, username };
        } else {
            wr3Label.textContent = `Status: Available -> ${username}`;
            addLogLine(`AutoSniper found AVAILABLE: ${username}`);
            return { available: true, username };
        }
    } catch (err) {
        wr3Label.textContent = "Status: Error";
        console.error("Sniper check failed:", err);
        addLogLine(`AutoSniper error for ${username}`);
        return { error: true };
    }
}

function startSniper() {
    if (!radio4.checked && !radio5.checked) {
        alert("Select preferred length (4 or 5).");
        return;
    }
    if (selectedCharset === null) {
        alert("Select a charset.");
        return;
    }

    const len = radio4.checked ? 4 : 5;
    wr3Label.textContent = "Status: Running Sniper...";

    startBtn.disabled = true;
    stopBt.disabled = false;

    if (sniperInterval) clearInterval(sniperInterval);

    sniperInterval = setInterval(() => {
        const username = getRandomUsername(len, selectedCharset);
        tryUsername(username);
    }, 1500);
}

function stopSniper() {
    if (sniperInterval) clearInterval(sniperInterval);
    sniperInterval = null;
    wr3Label.textContent = "Status: Stopped";
    startBtn.disabled = false;
    stopBt.disabled = true;
}

startBtn.addEventListener("click", startSniper);
stopBt.addEventListener("click", stopSniper);
stopBt.disabled = true;

const wr4Label1 = document.getElementById("wr4c1p1");
const wr4Label2 = document.getElementById("wr4c1p2");
const wr4Label3 = document.getElementById("wr4c1p3");

const btn1 = document.getElementById("buttonclass");
const btn2 = document.getElementById("buttonclass2");
const btn3 = document.getElementById("buttonclass3");

btn1.addEventListener("click", () => {
    navigator.clipboard.writeText(wr4Label1.textContent).then(() => {
        alert(`Copied: ${wr4Label1.textContent}`);
        addLogLine(`COPIED: ${wr4Label1.textContent}`);
    });
});

btn2.addEventListener("click", () => {
    navigator.clipboard.writeText(wr4Label2.textContent).then(() => {
        alert(`Copied: ${wr4Label2.textContent}`);
        addLogLine(`COPIED: ${wr4Label2.textContent}`);
    });
});

btn3.addEventListener("click", () => {
    navigator.clipboard.writeText(wr4Label3.textContent).then(() => {
        alert(`Copied: ${wr4Label3.textContent}`);
        addLogLine(`COPIED: ${wr4Label3.textContent}`)
    });
});

function generateRandomUsername(len = 4) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let candidate = "";
    for (let i = 0; i < len; i++) {
        candidate += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return candidate;
}

async function checkAndFormatUsername(username) {
    try {
        const res = await fetch(`/check?username=${encodeURIComponent(username)}`);
        if (!res.ok && res.status === 404) {
            return `${username} (Available)`;
        }
        const data = await res.json();
        return data.taken ? `${username}` : `${username}`;
    } catch (err) {
        console.error("Error checking username:", err);
        return `${username} (Error)`;
    }
}

async function loadRecentFinds() {
    const labels = [wr4Label1, wr4Label2, wr4Label3];
    for (let i = 0; i < 3; i++) {
        const candidate = generateRandomUsername(4);
        labels[i].textContent = await checkAndFormatUsername(candidate);
    }
}

loadRecentFinds();
