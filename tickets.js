document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const ticketForm = document.getElementById('ticketForm');
    const paymentProofInput = document.getElementById('paymentProof');
    const modal = new bootstrap.Modal(document.getElementById('ticketModal'), { 
        backdrop: 'static', 
        keyboard: false 
    });
    const modalTitle = document.getElementById('ticketModalLabel');
    const modalMessage = document.getElementById('modalMessage');
    const modalSpinner = document.getElementById('modalSpinner');
    const modalCloseButton = document.getElementById('modalCloseButton');
    const submitButton = ticketForm.querySelector('button[type="submit"]');

    // Form Validation Messages
    const validationMessages = {
        required: 'Please fill in all required fields.',
        email: 'Please enter a valid email address.',
        whatsapp: 'Please enter a valid WhatsApp number (9-15 digits, may include +).',
        fileType: 'Please upload a JPG, PNG, or PDF file.',
        fileSize: 'File size exceeds 5MB limit.',
        terms: 'You must agree to the terms and conditions.',
        batch: 'Please select a valid batch.',
        faculty: 'Please select a valid faculty.'
    };

    // Show modal with different statuses
    function showModal(status, message, ticketId = null) {
        modalSpinner.style.display = status === 'processing' ? 'block' : 'none';
        modalCloseButton.style.display = status !== 'processing' ? 'block' : 'none';
        
        // Update modal appearance based on status
        switch(status) {
            case 'success':
                modalTitle.textContent = 'Success!';
                modalTitle.style.color = '#28a745';
                modalMessage.innerHTML = `
                    <i class="fas fa-check-circle text-success mb-3" style="font-size: 3rem;"></i>
                    <h4 class="text-success mb-3">Registration Successful!</h4>
                    <p>${message}</p>
                    ${ticketId ? `<p class="small text-muted">Ticket ID: ${ticketId}</p>` : ''}
                    <p class="mt-3">You'll receive a confirmation email shortly.</p>
                `;
                break;
            case 'failed':
                modalTitle.textContent = 'Error';
                modalTitle.style.color = '#dc3545';
                modalMessage.innerHTML = `
                    <i class="fas fa-times-circle text-danger mb-3" style="font-size: 3rem;"></i>
                    <h4 class="text-danger mb-3">Registration Failed</h4>
                    <p>${message}</p>
                `;
                break;
            default: // processing
                modalTitle.textContent = 'Processing';
                modalTitle.style.color = '#ffc107';
                modalMessage.textContent = message;
        }
        
        modal.show();
    }

    // Reset form and redirect on success
    modalCloseButton.addEventListener('click', function () {
        if (modalTitle.textContent === 'Success!') {
            ticketForm.reset();
            window.location.href = 'index.html';
        }
    });

    // Validate email format
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate phone number
    function validatePhone(phone) {
        const re = /^\+?\d{9,15}$/;
        return re.test(phone);
    }

    // Validate file
    function validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, message: validationMessages.fileType };
        }
        
        if (file.size > maxSize) {
            return { valid: false, message: validationMessages.fileSize };
        }
        
        return { valid: true };
    }

    // Form submission handler
    ticketForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Disable submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        // Collect form data
        const formData = new FormData(ticketForm);
        const primaryName = formData.get('primaryName').trim();
        const primarySANumber = formData.get('primarySANumber').trim();
        const batch = formData.get('batch');
        const faculty = formData.get('faculty');
        const email = formData.get('email').trim();
        const whatsapp = formData.get('whatsapp').trim();
        const paymentProof = formData.get('paymentProof');
        const agreeTerms = ticketForm.querySelector('#agreeTerms').checked;

        // Validate required fields
        if (!primaryName || !primarySANumber || !batch || !faculty || !email || !whatsapp) {
            showModal('failed', validationMessages.required);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        if (!agreeTerms) {
            showModal('failed', validationMessages.terms);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        if (!validateEmail(email)) {
            showModal('failed', validationMessages.email);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        if (!validatePhone(whatsapp)) {
            showModal('failed', validationMessages.whatsapp);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        const validBatches = ['Foundation 1', 'Foundation 2', 'Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Graduated'];
        if (!validBatches.includes(batch)) {
            showModal('failed', validationMessages.batch);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        const validFaculties = ['Computing', 'Engineering', 'Business', 'Humanities', 'Architecture'];
        if (!validFaculties.includes(faculty)) {
            showModal('failed', validationMessages.faculty);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        const fileValidation = validateFile(paymentProof);
        if (!fileValidation.valid) {
            showModal('failed', fileValidation.message);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
            return;
        }

        // Show processing modal
        showModal('processing', 'Please wait while we process your ticket registration...');

        try {
            // Convert file to base64
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(paymentProof);
            });

            // Prepare JSON data
            const jsonData = {
                primaryName,
                primarySANumber,
                batch,
                faculty,
                email,
                whatsapp,
                paymentProof: {
                    fileName: paymentProof.name,
                    fileType: paymentProof.type,
                    data: base64Data
                },
                timestamp: new Date().toISOString()
            };

            // Send data to Netlify Function
            const response = await fetch('/.netlify/functions/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                showModal('success', 'Thank you for your purchase! Your ticket has been reserved.', data.ticketId);
                // Optional: Save to localStorage for reference
                localStorage.setItem('lastTicketSubmission', JSON.stringify({
                    name: primaryName,
                    email: email,
                    ticketId: data.ticketId,
                    date: new Date().toLocaleString()
                }));
            } else {
                showModal('failed', data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('failed', 'An error occurred while processing your request. Please try again later.');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Registration';
        }
    });

    // File input change handler for better UX
    paymentProofInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const fileValidation = validateFile(file);
            const feedbackElement = document.getElementById('fileFeedback') || 
                document.createElement('div');
            
            feedbackElement.id = 'fileFeedback';
            feedbackElement.className = 'mt-2 small';
            
            if (!fileValidation.valid) {
                feedbackElement.innerHTML = `<span class="text-danger">${fileValidation.message}</span>`;
                submitButton.disabled = true;
            } else {
                feedbackElement.innerHTML = `<span class="text-success">${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) - Ready to upload</span>`;
                submitButton.disabled = false;
            }
            
            if (!this.nextElementSibling || this.nextElementSibling.id !== 'fileFeedback') {
                this.parentNode.insertBefore(feedbackElement, this.nextSibling);
            }
        }
    });

    // Add input formatting for WhatsApp number
    const whatsappInput = ticketForm.querySelector('input[name="whatsapp"]');
    whatsappInput.addEventListener('input', function(e) {
        // Remove all non-digit characters except leading +
        this.value = this.value.replace(/[^\d+]/g, '');
        
        // Ensure only one + at the start
        if (this.value.indexOf('+') > 0) {
            this.value = this.value.replace(/\+/g, '');
        }
        if (this.value.length > 1 && this.value[0] !== '+') {
            this.value = this.value.replace(/\+/g, '');
        }
    });
});