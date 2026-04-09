document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const errorEl = document.getElementById("errorMessage");
    const btn = document.getElementById("loginBtn");
    const btnText = btn.querySelector(".btn-text");
    const loader = document.getElementById("loader");

    if (user === "" || pass === "") {
        errorEl.innerText = "Please fill in all fields";
        return;
    }

    errorEl.innerText = ""; 
    btnText.style.display = "none";
    loader.style.display = "block";
    btn.disabled = true;

    setTimeout(() => {
        if (user === "admin" && pass === "1234") {
            localStorage.setItem("loggedInUser", user);
            window.location.href = "index.html"; 
        } else {
            errorEl.innerText = "Invalid username or password";
            btnText.style.display = "block";
            loader.style.display = "none";
            btn.disabled = false;
        }
    }, 1200);
});

// Recovery Logic
const loginSection = document.getElementById("login-section");
const recoverySection = document.getElementById("recovery-section");
const forgotBtn = document.getElementById("forgotPasswordBtn");
const backBtn = document.getElementById("backToLogin");
const recoveryInputContainer = document.getElementById("recovery-input-container");
const recoveryLabel = document.getElementById("recovery-label");
const recoveryIcon = document.getElementById("recovery-icon");
const recoveryDetailInput = document.getElementById("recovery-detail");

forgotBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    recoverySection.style.display = "block";
});

backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    recoverySection.style.display = "none";
    loginSection.style.display = "block";
    recoveryInputContainer.style.display = "none";
});

function showRecoveryInput(method) {
    recoveryInputContainer.style.display = "block";
    if (method === 'email') {
        recoveryLabel.innerText = "Enter your Gmail/Email";
        recoveryIcon.className = "fa-solid fa-envelope";
    } else {
        recoveryLabel.innerText = "Enter your Phone Number";
        recoveryIcon.className = "fa-solid fa-phone";
    }
}

function sendRecoveryCode() {
    if (recoveryDetailInput.value === "") {
        alert("Please enter your details!");
        return;
    }
    alert(`A recovery code has been sent to: ${recoveryDetailInput.value}`);
}