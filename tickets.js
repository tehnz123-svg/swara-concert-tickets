document.addEventListener('DOMContentLoaded', function () {
    const decreaseBtn = document.getElementById('decreaseTickets');
    const increaseBtn = document.getElementById('increaseTickets');
    const ticketCount = document.getElementById('ticketCount');
    const additionalContainer = document.getElementById('additionalTicketsContainer');
    const ticketForm = document.getElementById('ticketForm');
    const paymentProofInput = document.getElementById('paymentProof');
    const modal = new bootstrap.Modal(document.getElementById('ticketModal'), { backdrop: 'static', keyboard: false });
    const modalTitle = document.getElementById('ticketModalLabel');
    const modalMessage = document.getElementById('modalMessage');
    const modalSpinner = document.getElementById('modalSpinner');
    const modalCloseButton = document.getElementById('modalCloseButton');

    let ticketQuantity = 1;

    function showModal(status, message) {
        modalSpinner.style.display = status === 'processing' ? 'block' : 'none';
        modalCloseButton.style.display = status !== 'processing' ? 'block' : 'none';
        modalTitle.textContent = status === 'processing' ? 'Processing' : status === 'success' ? 'Success' : 'Failed';
        modalMessage.textContent = message;
        modal.show();
    }

    decreaseBtn.addEventListener('click', function () {
        if (ticketQuantity > 1) {
            ticketQuantity--;
            updateTicketCount();
            updateAdditionalTickets();
        } else {
            showModal('failed', 'Minimum 1 ticket required.');
            setTimeout(() => modal.hide(), 2000);
        }
    });

    increaseBtn.addEventListener('click', function () {
        if (ticketQuantity < 6) {
            ticketQuantity++;
            updateTicketCount();
            updateAdditionalTickets();
        } else {
            showModal('failed', 'Maximum 6 tickets per transaction.');
            setTimeout(() => modal.hide(), 2000);
        }
    });

    function updateTicketCount() {
        ticketCount.textContent = ticketQuantity;
    }

    function updateAdditionalTickets() {
        additionalContainer.innerHTML = '';
        if (ticketQuantity > 1) {
            for (let i = 1; i < ticketQuantity; i++) {
                const ticketDiv = document.createElement('div');
                ticketDiv.className = 'additional-ticket';
                ticketDiv.innerHTML = `
                    <div class="ticket-header">
                        <i class="fas fa-user-friends"></i>Ticket Holder #${i + 1}
                    </div>
                    <input type="text" class="form-control" name="additionalName${i}" placeholder="Full Name" required>
                    <input type="text" class="form-control" name="additionalSANumber${i}" placeholder="SA Number" required>
                `;
                additionalContainer.appendChild(ticketDiv);
            }
        }
    }

    // Form submission with Netlify Function
    ticketForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(ticketForm);
        const primaryName = formData.get('primaryName');
        const primarySANumber = formData.get('primarySANumber');
        const email = formData.get('email');
        const whatsapp = formData.get('whatsapp');
        const paymentProof = formData.get('paymentProof');
        const agreeTerms = ticketForm.querySelector('#agreeTerms').checked;

        // Validate required fields
        if (!primaryName || !primarySANumber || !email || !whatsapp || !agreeTerms) {
            showModal('failed', 'Please fill in all required fields and agree to the terms.');
            setTimeout(() => modal.hide(), 3000);
            return;
        }

        // Validate payment proof
        if (!paymentProof || paymentProof.size === 0) {
            showModal('failed', 'Please select a valid payment proof file (JPG, PNG, or PDF).');
            setTimeout(() => modal.hide(), 3000);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showModal('failed', 'Please enter a valid email address.');
            setTimeout(() => modal.hide(), 3000);
            return;
        }

        // Validate WhatsApp number
        const phoneRegex = /^\+?\d{9,15}$/;
        if (!phoneRegex.test(whatsapp)) {
            showModal('failed', 'Please enter a valid WhatsApp number.');
            setTimeout(() => modal.hide(), 3000);
            return;
        }

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(paymentProof.type)) {
            showModal('failed', 'Please upload a JPG, PNG, or PDF file.');
            setTimeout(() => modal.hide(), 3000);
            return;
        }
        if (paymentProof.size > maxSize) {
            showModal('failed', 'File size exceeds 5MB limit.');
            setTimeout(() => modal.hide(), 3000);
            return;
        }

        // Collect additional ticket holders
        const additionalTickets = [];
        for (let i = 1; i < ticketQuantity; i++) {
            const name = formData.get(`additionalName${i}`);
            const saNumber = formData.get(`additionalSANumber${i}`);
            if (!name || !saNumber) {
                showModal('failed', `Please fill in all fields for Ticket Holder #${i + 1}.`);
                setTimeout(() => modal.hide(), 3000);
                return;
            }
            additionalTickets.push({ name, saNumber });
        }

        // Show processing modal
        showModal('processing', 'Please wait while we process your ticket registration...');

        // Convert file to base64
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Data = event.target.result.split(',')[1];
            const fileName = paymentProof.name;
            const fileType = paymentProof.type;

            // Prepare JSON data
            const jsonData = {
                timestamp: new Date().toISOString(),
                primaryName,
                primarySANumber,
                email,
                whatsapp,
                ticketCount: ticketQuantity,
                additionalTickets,
                paymentProof: {
                    fileName,
                    fileType,
                    data: base64Data
                }
            };

            // Debug: Log JSON data
            console.log('JSON Data:', jsonData);

            // Send data to Netlify Function
            fetch('/.netlify/functions/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Proxy Response:', data);
                if (data.status === 'success') {
                    showModal('success', `Thank you for your purchase! Your submission has been received with Ticket ID: ${data.ticketId}. You will receive a confirmation email once approved.`);
                    ticketForm.reset();
                    ticketQuantity = 1;
                    updateTicketCount();
                    updateAdditionalTickets();
                    setTimeout(() => {
                        modal.hide();
                        window.location.href = 'index.html';
                    }, 3000);
                } else {
                    showModal('failed', 'Registration failed: ' + data.message);
                    setTimeout(() => modal.hide(), 3000);
                }
            })
            .catch(error => {
                console.error('Fetch error:', error.message);
                showModal('failed', 'Error submitting form: ' + error.message);
                setTimeout(() => modal.hide(), 3000);
            });
        };
        reader.onerror = function () {
            showModal('failed', 'Error reading file. Please try again.');
            setTimeout(() => modal.hide(), 3000);
        };
        reader.readAsDataURL(paymentProof);
    });
});