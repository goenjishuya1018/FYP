// Password strength checker
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const strengthBar = document.getElementById('strengthBar');

// Requirement elements
const reqLength = document.getElementById('reqLength');
const reqUpper = document.getElementById('reqUpper');
const reqLower = document.getElementById('reqLower');
const reqNumber = document.getElementById('reqNumber');
const reqSpecial = document.getElementById('reqSpecial');

// Password validation
function checkPasswordStrength() {
    const value = password.value;
    let strength = 0;
    
    // Check length
    if (value.length >= 8) {
        strength++;
        reqLength.innerHTML = '<span>🟢</span> At least 8 characters';
        reqLength.style.color = '#10b981';
    } else {
        reqLength.innerHTML = '<span>🔴</span> At least 8 characters';
        reqLength.style.color = '#ef4444';
    }
    
    // Check uppercase
    if (/[A-Z]/.test(value)) {
        strength++;
        reqUpper.innerHTML = '<span>🟢</span> One uppercase letter';
        reqUpper.style.color = '#10b981';
    } else {
        reqUpper.innerHTML = '<span>🔴</span> One uppercase letter';
        reqUpper.style.color = '#ef4444';
    }
    
    // Check lowercase
    if (/[a-z]/.test(value)) {
        strength++;
        reqLower.innerHTML = '<span>🟢</span> One lowercase letter';
        reqLower.style.color = '#10b981';
    } else {
        reqLower.innerHTML = '<span>🔴</span> One lowercase letter';
        reqLower.style.color = '#ef4444';
    }
    
    // Check number
    if (/[0-9]/.test(value)) {
        strength++;
        reqNumber.innerHTML = '<span>🟢</span> One number';
        reqNumber.style.color = '#10b981';
    } else {
        reqNumber.innerHTML = '<span>🔴</span> One number';
        reqNumber.style.color = '#ef4444';
    }
    
    // Check special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        strength++;
        reqSpecial.innerHTML = '<span>🟢</span> One special character';
        reqSpecial.style.color = '#10b981';
    } else {
        reqSpecial.innerHTML = '<span>🔴</span> One special character';
        reqSpecial.style.color = '#ef4444';
    }
    
    // Update strength bar
    if (strength <= 2) {
        strengthBar.className = 'strength-bar weak';
    } else if (strength <= 4) {
        strengthBar.className = 'strength-bar medium';
    } else {
        strengthBar.className = 'strength-bar strong';
    }
}

password.addEventListener('input', checkPasswordStrength);

// Confirm password validation
function validateConfirmPassword() {
    const confirmError = document.getElementById('confirmPasswordError');
    if (confirmPassword.value && password.value !== confirmPassword.value) {
        confirmError.style.display = 'block';
        return false;
    } else {
        confirmError.style.display = 'none';
        return true;
    }
}

confirmPassword.addEventListener('input', validateConfirmPassword);

// Form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    
    let isValid = true;
    
    // Validate first name
    if (!document.getElementById('firstName').value.trim()) {
        document.getElementById('firstNameError').style.display = 'block';
        isValid = false;
    }
    
    // Validate last name
    if (!document.getElementById('lastName').value.trim()) {
        document.getElementById('lastNameError').style.display = 'block';
        isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }
    
    // Validate password strength
    const passwordValue = password.value;
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPassword.test(passwordValue)) {
        isValid = false;
    }
    
    // Validate confirm password
    if (!validateConfirmPassword()) {
        isValid = false;
    }
    
    // Validate terms
    if (!document.getElementById('terms').checked) {
        document.getElementById('termsError').style.display = 'block';
        isValid = false;
    }
    
    // if (isValid) {
    //     // Show success message
    //     const successMsg = document.getElementById('successMessage');
    //     successMsg.classList.add('show');
        
    //     // Disable form
    //     document.querySelectorAll('input, button').forEach(el => el.disabled = true);
        
    //     setTimeout(() => {
    //         // Redirect to dashboard or login
    //         window.location.href = 'createUser';
    //     }, 2000);
    // }

    // Inside register.js, within the "if (isValid)" block:

    if (isValid) {
        // Collect form data - Make sure these IDs match your HTMLExactly
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            userid: document.getElementById('userid').value.trim(), // Added this
            email: document.getElementById('email').value.trim(),
            password: password.value, 
            phone: document.getElementById('phone').value
        };

        // Send to Python Backend
        fetch('/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // This tells Flask to expect JSON
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Success logic remains the same
                const successMsg = document.getElementById('successMessage');
                successMsg.classList.add('show');
                document.querySelectorAll('input, button').forEach(el => el.disabled = true);
                setTimeout(() => { window.location.href = '/'; }, 2000);
            } else {
                // Handle errors sent from Python (like "Email already registered")
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during registration.');
        });
    }
});

// Social sign up
function socialSignUp(provider) {
    alert(`Signing up with ${provider}... (Demo - Would redirect to ${provider} OAuth)`);
}

// Modal functions
function showTerms() {
    document.getElementById('termsModal').style.display = 'flex';
}

function showPrivacy() {
    alert('Privacy Policy - Demo version');
}

function closeModal() {
    document.getElementById('termsModal').style.display = 'none';
}

// Close modal when clicking outside
document.getElementById('termsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Real-time email validation
document.getElementById('email').addEventListener('input', function() {
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
        emailError.style.display = 'block';
    } else {
        emailError.style.display = 'none';
    }
});

// // Phone number formatting
// document.getElementById('phone').addEventListener('input', function(e) {
//     let value = e.target.value.replace(/\D/g, '');
//     if (value.length > 0) {
//         if (value.length <= 3) {
//             value = value;
//         } else if (value.length <= 6) {
//             value = value.slice(0, 3) + '-' + value.slice(3);
//         } else {
//             value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
//         }
//         e.target.value = value;
//     }
// });