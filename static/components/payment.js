// Payment Component - For future payment integration
export default class Payment {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="payment-page py-5">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-8">
                            <h2 class="mb-4 text-center">
                                <i class="fas fa-credit-card"></i> Payment
                            </h2>

                            <div class="card mb-4">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="mb-0">Payment Summary</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p><strong>Doctor:</strong> <span id="payment-doctor">Dr. John Doe</span></p>
                                            <p><strong>Department:</strong> <span id="payment-department">Cardiology</span></p>
                                            <p><strong>Date:</strong> <span id="payment-date">2026-01-25</span></p>
                                            <p><strong>Time:</strong> <span id="payment-time">10:00 AM</span></p>
                                        </div>
                                        <div class="col-md-6">
                                            <p><strong>Consultation Fee:</strong> <span id="consultation-fee">$100</span></p>
                                            <p><strong>Tax (10%):</strong> <span id="tax-amount">$10</span></p>
                                            <p><strong>Processing Fee:</strong> <span id="processing-fee">$5</span></p>
                                            <hr>
                                            <h5><strong>Total Amount:</strong> <span id="total-amount" class="text-primary">$115</span></h5>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Payment Method</h5>
                                </div>
                                <div class="card-body">
                                    <form id="payment-form">
                                        <div class="mb-4">
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                                       id="card" value="card" checked>
                                                <label class="form-check-label" for="card">
                                                    <i class="fas fa-credit-card"></i> Credit/Debit Card
                                                </label>
                                            </div>
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                                       id="upi" value="upi">
                                                <label class="form-check-label" for="upi">
                                                    <i class="fas fa-mobile-alt"></i> UPI Payment
                                                </label>
                                            </div>
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                                       id="wallet" value="wallet">
                                                <label class="form-check-label" for="wallet">
                                                    <i class="fas fa-wallet"></i> Digital Wallet
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="paymentMethod" 
                                                       id="payAtHospital" value="payAtHospital">
                                                <label class="form-check-label" for="payAtHospital">
                                                    <i class="fas fa-hospital"></i> Pay at Hospital
                                                </label>
                                            </div>
                                        </div>

                                        <!-- Card Details (shown when card is selected) -->
                                        <div id="card-details" class="payment-details">
                                            <div class="mb-3">
                                                <label class="form-label">Card Number</label>
                                                <input type="text" class="form-control" id="card-number" 
                                                       placeholder="1234 5678 9012 3456" maxlength="19">
                                            </div>
                                            <div class="row">
                                                <div class="col-md-6 mb-3">
                                                    <label class="form-label">Expiry Date</label>
                                                    <input type="text" class="form-control" id="expiry-date" 
                                                           placeholder="MM/YY" maxlength="5">
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <label class="form-label">CVV</label>
                                                    <input type="text" class="form-control" id="cvv" 
                                                           placeholder="123" maxlength="3">
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Cardholder Name</label>
                                                <input type="text" class="form-control" id="cardholder-name" 
                                                       placeholder="John Doe">
                                            </div>
                                        </div>

                                        <!-- UPI Details -->
                                        <div id="upi-details" class="payment-details d-none">
                                            <div class="mb-3">
                                                <label class="form-label">UPI ID</label>
                                                <input type="text" class="form-control" id="upi-id" 
                                                       placeholder="yourname@upi">
                                            </div>
                                            <div class="alert alert-info">
                                                <i class="fas fa-info-circle"></i> You will receive a payment request on your UPI app
                                            </div>
                                        </div>

                                        <!-- Wallet Details -->
                                        <div id="wallet-details" class="payment-details d-none">
                                            <div class="mb-3">
                                                <label class="form-label">Select Wallet</label>
                                                <select class="form-select" id="wallet-type">
                                                    <option value="">Choose wallet...</option>
                                                    <option value="paytm">Paytm</option>
                                                    <option value="phonepe">PhonePe</option>
                                                    <option value="googlepay">Google Pay</option>
                                                    <option value="amazonpay">Amazon Pay</option>
                                                </select>
                                            </div>
                                            <div class="alert alert-info">
                                                <i class="fas fa-info-circle"></i> You will be redirected to your wallet app
                                            </div>
                                        </div>

                                        <!-- Pay at Hospital -->
                                        <div id="payAtHospital-details" class="payment-details d-none">
                                            <div class="alert alert-warning">
                                                <i class="fas fa-exclamation-triangle"></i> 
                                                Please pay at the hospital reception before your appointment.
                                                Your appointment will be confirmed upon payment.
                                            </div>
                                        </div>

                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" id="terms" required>
                                            <label class="form-check-label" for="terms">
                                                I agree to the terms and conditions
                                            </label>
                                        </div>

                                        <div id="payment-message" class="alert d-none"></div>

                                        <button type="submit" class="btn btn-primary btn-lg w-100">
                                            <i class="fas fa-lock"></i> Proceed to Pay
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div class="text-center mt-4">
                                <p class="text-muted">
                                    <i class="fas fa-shield-alt"></i> Your payment information is secure and encrypted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Payment method radio buttons
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.togglePaymentDetails(e.target.value);
            });
        });

        // Payment form submission
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePayment();
            });
        }

        // Card number formatting
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            });
        }

        // Expiry date formatting
        const expiryDate = document.getElementById('expiry-date');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            });
        }
    }

    togglePaymentDetails(method) {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.classList.add('d-none');
        });

        // Show selected payment details
        const selectedDetail = document.getElementById(`${method}-details`);
        if (selectedDetail) {
            selectedDetail.classList.remove('d-none');
        }
    }

    async handlePayment() {
        const method = document.querySelector('input[name="paymentMethod"]:checked').value;
        const messageDiv = document.getElementById('payment-message');

        // Show processing message
        messageDiv.className = 'alert alert-info';
        messageDiv.textContent = 'Processing payment...';
        messageDiv.classList.remove('d-none');

        // Simulate payment processing
        setTimeout(() => {
            if (method === 'payAtHospital') {
                messageDiv.className = 'alert alert-success';
                messageDiv.innerHTML = `
                    <i class="fas fa-check-circle"></i> Appointment booked successfully! 
                    Please pay at the hospital reception.
                `;
            } else {
                messageDiv.className = 'alert alert-success';
                messageDiv.innerHTML = `
                    <i class="fas fa-check-circle"></i> Payment successful! 
                    Your appointment has been confirmed.
                `;
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'dashboard' } }));
            }, 2000);
        }, 2000);
    }
}
