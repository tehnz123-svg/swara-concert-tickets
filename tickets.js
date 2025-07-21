document.addEventListener('DOMContentLoaded', function () {
    const decreaseBtn = document.getElementById('decreaseTickets');
    const increaseBtn = document.getElementById('increaseTickets');
    const ticketCount = document.getElementById('ticketCount');
    const additionalContainer = document.getElementById('additionalTicketsContainer');
    const ticketForm = document.getElementById('ticketForm');
    const paymentProofInput = document.getElementById('paymentProof');

    let ticketQuantity = 1;

    decreaseBtn.addEventListener('click', function () {
        if (ticketQuantity > 1) {
            ticketQuantity--;
            updateTicketCount();
            updateAdditionalTickets();
        }
    });

    increaseBtn.addEventListener('click', function () {
        if (ticketQuantity < 6) {
            ticketQuantity++;
            updateTicketCount();
            updateAdditionalTickets();
        } else {
            alert('Maximum 6 tickets per transaction');
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
            alert('Please fill in all required fields and agree to the terms.');
            return;
        }

        // Validate payment proof
        if (!paymentProof || paymentProof.size === 0) {
            alert('Please select a valid payment proof file (JPG, PNG, or PDF).');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Validate WhatsApp number
        const phoneRegex = /^\+?\d{9,15}$/;
        if (!phoneRegex.test(whatsapp)) {
            alert('Please enter a valid WhatsApp number.');
            return;
        }

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(paymentProof.type)) {
            alert('Please upload a JPG, PNG, or PDF file.');
            return;
        }
        if (paymentProof.size > maxSize) {
            alert('File size exceeds 5MB limit.');
            return;
        }

        // Collect additional ticket holders
        const additionalTickets = [];
        for (let i = 1; i < ticketQuantity; i++) {
            const name = formData.get(`additionalName${i}`);
            const saNumber = formData.get(`additionalSANumber${i}`);
            if (!name || !saNumber) {
                alert(`Please fill in all fields for Ticket Holder #${i + 1}.`);
                return;
            }
            additionalTickets.push({ name, saNumber });
        }

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
                    alert('Thank you for your purchase! Your tickets and payment proof have been registered successfully.');
                    ticketForm.reset();
                    ticketQuantity = 1;
                    updateTicketCount();
                    updateAdditionalTickets();
                    window.location.href = 'index.html';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Fetch error:', error.message);
                alert('Error submitting form: ' + error.message);
            });
        };
        reader.onerror = function () {
            alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(paymentProof);
    });
});