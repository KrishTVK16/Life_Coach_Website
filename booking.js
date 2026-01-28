// Booking System JavaScript
// Handles session booking flow: session type, date/time selection, and confirmation

let bookingData = {
    sessionType: null,
    sessionPrice: 0,
    sessionDuration: 0,
    selectedDate: null,
    selectedTime: null,
    clientDetails: {}
};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateElement = null;
let selectedTimeElement = null;

// Initialize booking system
document.addEventListener('DOMContentLoaded', function() {
    initializeSessionTypes();
    initializeCalendar();
    loadBookingData();
});

// Session Type Selection
function initializeSessionTypes() {
    const sessionCards = document.querySelectorAll('.session-type-card');
    const step1Next = document.getElementById('step1Next');

    sessionCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            sessionCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Store booking data
            bookingData.sessionType = this.dataset.type;
            bookingData.sessionPrice = parseFloat(this.dataset.price);
            bookingData.sessionDuration = parseInt(this.dataset.duration);
            
            // Enable next button
            step1Next.disabled = false;
        });
    });
}

// Calendar Functions
function initializeCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    calendarGrid.innerHTML = '';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day';
        header.style.fontWeight = 'bold';
        header.style.border = 'none';
        header.style.cursor = 'default';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day disabled';
        calendarGrid.appendChild(empty);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const date = new Date(currentYear, currentMonth, day);
        const isPast = date < today && !(isCurrentMonth && day === today.getDate());
        const isToday = isCurrentMonth && day === today.getDate();
        
        if (isPast) {
            dayElement.classList.add('disabled');
        } else if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (!isPast) {
            dayElement.addEventListener('click', function() {
                if (selectedDateElement) {
                    selectedDateElement.classList.remove('selected');
                }
                this.classList.add('selected');
                selectedDateElement = this;
                
                const selectedDate = new Date(currentYear, currentMonth, day);
                bookingData.selectedDate = selectedDate;
                loadTimeSlots(selectedDate);
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// Time Slots
function loadTimeSlots(date) {
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const timeSlots = document.getElementById('timeSlots');
    const step2Next = document.getElementById('step2Next');
    
    timeSlotsContainer.style.display = 'block';
    timeSlots.innerHTML = '';
    
    // Generate available time slots (9 AM to 5 PM, every hour)
    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        availableSlots.push(timeString);
    }
    
    availableSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.dataset.time = time;
        
        slot.addEventListener('click', function() {
            if (selectedTimeElement) {
                selectedTimeElement.classList.remove('selected');
            }
            this.classList.add('selected');
            selectedTimeElement = this;
            
            bookingData.selectedTime = time;
            step2Next.disabled = false;
            updateSessionSummary();
        });
        
        timeSlots.appendChild(slot);
    });
}

// Step Navigation
function nextStep(step) {
    // Hide current step
    document.getElementById(`bookingStep${step - 1}`).style.display = 'none';
    
    // Update step indicators
    document.getElementById(`step${step - 1}`).classList.remove('active');
    document.getElementById(`step${step - 1}`).classList.add('completed');
    document.getElementById(`step${step}`).classList.add('active');
    
    // Show next step
    const nextStepElement = document.getElementById(`bookingStep${step}`);
    nextStepElement.style.display = 'block';
    
    if (step === 3) {
        updateSessionSummary();
        // Pre-fill form if data exists
        if (bookingData.clientDetails.firstName) {
            document.getElementById('firstName').value = bookingData.clientDetails.firstName;
        }
        if (bookingData.clientDetails.lastName) {
            document.getElementById('lastName').value = bookingData.clientDetails.lastName;
        }
        if (bookingData.clientDetails.email) {
            document.getElementById('email').value = bookingData.clientDetails.email;
        }
    } else if (step === 4) {
        confirmBooking();
    }
}

function previousStep(step) {
    document.getElementById(`bookingStep${step + 1}`).style.display = 'none';
    document.getElementById(`step${step + 1}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.remove('completed');
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`bookingStep${step}`).style.display = 'block';
}

// Session Summary
function updateSessionSummary() {
    const sessionTypes = {
        discovery: 'Discovery Call',
        individual: 'Individual Session',
        followup: 'Follow-up Session'
    };
    
    document.getElementById('summaryType').textContent = sessionTypes[bookingData.sessionType] || '-';
    
    if (bookingData.selectedDate) {
        const dateStr = bookingData.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('summaryDate').textContent = dateStr;
    }
    
    document.getElementById('summaryTime').textContent = bookingData.selectedTime || '-';
    document.getElementById('summaryDuration').textContent = `${bookingData.sessionDuration} minutes`;
    document.getElementById('summaryPrice').textContent = 
        bookingData.sessionPrice === 0 ? 'Free' : `$${bookingData.sessionPrice.toFixed(2)}`;
}

// Confirm Booking
function confirmBooking() {
    // Get client details
    bookingData.clientDetails = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        goals: document.getElementById('goals').value
    };
    
    // Update confirmation display
    const sessionTypes = {
        discovery: 'Discovery Call',
        individual: 'Individual Session',
        followup: 'Follow-up Session'
    };
    
    document.getElementById('confirmType').textContent = sessionTypes[bookingData.sessionType];
    
    if (bookingData.selectedDate) {
        const dateStr = bookingData.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('confirmDate').textContent = dateStr;
    }
    
    document.getElementById('confirmTime').textContent = bookingData.selectedTime;
    document.getElementById('confirmDuration').textContent = `${bookingData.sessionDuration} minutes`;
    
    // Save booking to localStorage
    saveBooking();
    
    // Save session to dashboard
    saveSessionToDashboard();
}

function saveBooking() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = {
        id: Date.now(),
        ...bookingData,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
    };
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function saveSessionToDashboard() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const session = {
        id: Date.now(),
        type: bookingData.sessionType,
        date: bookingData.selectedDate.toISOString(),
        time: bookingData.selectedTime,
        duration: bookingData.sessionDuration,
        status: 'upcoming'
    };
    sessions.push(session);
    localStorage.setItem('sessions', JSON.stringify(sessions));
}

function loadBookingData() {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
        bookingData = { ...bookingData, ...JSON.parse(saved) };
    }
}

// Add styles for selected session type
const style = document.createElement('style');
style.textContent = `
    .session-type-card {
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: var(--transition);
        background: var(--bg-white);
    }
    .session-type-card:hover {
        border-color: var(--primary-color);
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
    }
    .session-type-card.selected {
        border-color: var(--primary-color);
        background: var(--bg-light);
        box-shadow: var(--shadow-md);
    }
    .session-price {
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary-color);
        margin: 1rem 0;
    }
    .session-duration {
        color: var(--text-light);
        margin-bottom: 1rem;
    }
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .calendar-header h3 {
        margin: 0;
        color: var(--primary-color);
    }
    .session-type-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
`;
document.head.appendChild(style);
