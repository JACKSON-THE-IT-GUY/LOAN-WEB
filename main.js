// Global variables for signature
const canvas = document.getElementById("signature-pad");
const ctx = canvas.getContext("2d");
let writing = false;

// 1. Setup Canvas size correctly
function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 2. Drawing functions
function startDrawing(e) {
    writing = true;
    draw(e);
}

function stopDrawing() {
    writing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!writing) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates for mouse or touch
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#002d62";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 3. Event Listeners for Signature
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);

canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

// 4. Loan Calculation Logic
function generateRef() {
    const ref = "JAC-" + Math.floor(Math.random() * 900000 + 100000);
    document.getElementById("refDisplay").innerText = "REF: " + ref;
}

const principalInput = document.getElementById("principal");
const periodSelect = document.getElementById("period");
const rateDisplay = document.getElementById("rateDisplay");
const totalDisplay = document.getElementById("totalReturn");
const startDateInput = document.getElementById("startDate");
const dueDateInput = document.getElementById("dueDate");

function updateRate() {
    const selectedOption = periodSelect.options[periodSelect.selectedIndex];
    const rate = parseFloat(selectedOption.getAttribute("data-rate"));
    const weeks = parseInt(selectedOption.value);

    rateDisplay.value = rate + "%";
    const principal = parseFloat(principalInput.value) || 0;
    const total = principal + principal * (rate / 100);
    totalDisplay.innerText = total.toFixed(2) + " ZMW";

    if (startDateInput.value) {
        const start = new Date(startDateInput.value);
        start.setDate(start.getDate() + weeks * 7);
        dueDateInput.value = start.toISOString().split("T")[0];
    }
}

principalInput.addEventListener("input", updateRate);
startDateInput.addEventListener("change", updateRate);

// 5. Initialize everything on load
window.onload = () => {
    generateRef();
    updateRate();
    resizeCanvas();
};