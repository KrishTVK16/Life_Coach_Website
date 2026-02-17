// Dashboard JavaScript
// Handles goal tracking, session management, and progress visualization

let goals = [];
let sessions = [];
let milestoneCounter = 0;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function () {
    loadGoals();
    loadSessions(); // Keep loadSessions as it's not explicitly removed by the snippet's context
    // Initial render
    renderGoals();
    renderSessions();
    updateStats(); // Changed from updateStatistics()

    // Goal form submission
    const goalForm = document.getElementById('newGoalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function (e) {
            e.preventDefault();
            createGoal();
        });
    }
});

// Load Data from LocalStorage
function loadGoals() {
    const saved = localStorage.getItem('goals');
    if (saved) {
        goals = JSON.parse(saved);
    } else {
        // Seed with sample goals if empty
        goals = [
            {
                id: 1,
                title: 'Morning Meditation',
                description: 'Complete 10 minutes of mindfulness meditation every morning',
                category: 'Health & Wellness',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                milestones: [
                    { id: 1, text: 'Download meditation app', completed: true },
                    { id: 2, text: 'Set daily reminder', completed: true },
                    { id: 3, text: 'Complete first week streak', completed: false }
                ],
                progress: 66,
                status: 'active'
            },
            {
                id: 2,
                title: 'Career Transition Plan',
                description: 'Update resume and apply to 5 new positions',
                category: 'Career',
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                milestones: [
                    { id: 1, text: 'Update LinkedIn profile', completed: true },
                    { id: 2, text: 'Draft cover letter template', completed: false }
                ],
                progress: 50,
                status: 'active'
            },
            {
                id: 3,
                title: 'Read "Atomic Habits"',
                description: 'Read 20 pages daily',
                category: 'Personal Growth',
                milestones: [],
                progress: 30,
                status: 'active'
            }
        ];
        // Add some completed goals for stats
        for (let i = 0; i < 12; i++) {
            goals.push({ id: `c${i}`, title: `Completed Goal ${i}`, status: 'completed', progress: 100, milestones: [] });
        }
    }
}

function loadSessions() {
    const saved = localStorage.getItem('sessions');
    if (saved) {
        sessions = JSON.parse(saved);
        // Sort by date
        sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        // Seed with sample sessions
        sessions = [
            {
                id: 1,
                type: 'Career Coaching',
                date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                time: '10:00 AM',
                duration: 60,
                status: 'upcoming'
            },
            {
                id: 2,
                type: 'Life Planning Strategy',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
                time: '2:00 PM',
                duration: 45,
                status: 'upcoming'
            }
        ];
    }
}

// Save Data to LocalStorage
function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

function saveSessions() {
    localStorage.setItem('sessions', JSON.stringify(sessions));
}

// Goal Management
function createGoal() {
    const title = document.getElementById('goalTitle').value;
    const description = document.getElementById('goalDescription').value;
    const category = document.getElementById('goalCategory').value;
    const deadline = document.getElementById('goalDeadline').value;

    // Get milestones
    const milestoneInputs = document.querySelectorAll('.milestone-input');
    const milestones = Array.from(milestoneInputs)
        .map(input => ({
            id: milestoneCounter++,
            text: input.value,
            completed: false
        }))
        .filter(m => m.text.trim() !== '');

    const goal = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        deadline: deadline,
        milestones: milestones,
        progress: 0,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    goals.push(goal);
    saveGoals();

    // Reset form
    document.getElementById('newGoalForm').reset();
    document.getElementById('milestonesContainer').innerHTML = '';
    hideGoalForm();

    renderGoals();
    updateStatistics();
}

function updateGoalProgress(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const totalMilestones = goal.milestones.length;

    if (totalMilestones > 0) {
        goal.progress = Math.round((completedMilestones / totalMilestones) * 100);
    }

    saveGoals();
    renderGoals();
    updateStatistics();
}

function toggleMilestone(goalId, milestoneId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (milestone) {
        milestone.completed = !milestone.completed;
        updateGoalProgress(goalId);
    }
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(g => g.id !== goalId);
        saveGoals();
        renderGoals();
        updateStatistics();
    }
}

// Goal Form Management
function showGoalForm() {
    document.getElementById('goalForm').style.display = 'block';
    document.getElementById('goalForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideGoalForm() {
    document.getElementById('goalForm').style.display = 'none';
}

function addMilestone() {
    const container = document.getElementById('milestonesContainer');
    const milestoneDiv = document.createElement('div');
    milestoneDiv.className = 'milestone-item';
    milestoneDiv.innerHTML = `
        <input type="text" class="milestone-input" placeholder="Enter milestone..." style="flex: 1; padding: 0.5rem; border: 2px solid var(--border-color); border-radius: 6px;">
        <button type="button" class="btn-outline" onclick="removeMilestone(this)" style="padding: 0.5rem 1rem;">Remove</button>
    `;
    container.appendChild(milestoneDiv);
}

function removeMilestone(button) {
    button.parentElement.remove();
}

// Render Functions
function renderGoals() {
    const goalsList = document.getElementById('goalsList');
    if (!goalsList) return;

    if (goals.length === 0) {
        goalsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">No goals yet</p>
                <p>Create your first goal to start tracking your progress!</p>
                <button class="btn-primary" onclick="showGoalForm()" style="margin-top: 1rem;">Create Your First Goal</button>
            </div>
        `;
        return;
    }

    goalsList.innerHTML = goals.map(goal => `
        <div class="goal-item">
            <div class="goal-header">
                <div>
                    <div class="goal-title">${goal.title}</div>
                    ${goal.description ? `<p style="color: var(--text-light); font-size: 0.9rem; margin-top: 0.5rem;">${goal.description}</p>` : ''}
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                        <span style="background: var(--bg-light); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; color: var(--text-dark);">${goal.category}</span>
                        ${goal.deadline ? `<span style="background: var(--bg-light); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; color: var(--text-dark);">Due: ${new Date(goal.deadline).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                <button class="btn-outline" onclick="deleteGoal(${goal.id})" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
            </div>
            ${goal.milestones.length > 0 ? `
                <div class="milestone-list" style="margin-top: 1rem;">
                    ${goal.milestones.map(milestone => `
                        <div class="milestone-item">
                            <input type="checkbox" class="milestone-checkbox" 
                                   ${milestone.completed ? 'checked' : ''} 
                                   onchange="toggleMilestone(${goal.id}, ${milestone.id})">
                            <span class="milestone-text ${milestone.completed ? 'milestone-completed' : ''}">${milestone.text}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="progress-text">${goal.progress}% Complete</div>
            </div>
        </div>
    `).join('');
}

function renderSessions() {
    const sessionsList = document.getElementById('sessionsList');
    if (!sessionsList) return;

    const upcomingSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= new Date();
    }).slice(0, 5);

    if (upcomingSessions.length === 0) {
        sessionsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <p>No upcoming sessions</p>
            </div>
        `;
        return;
    }

    sessionsList.innerHTML = upcomingSessions.map(session => {
        const sessionDate = new Date(session.date);
        const sessionDateString = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Determine status badge style
        let statusBadge = '<span style="background: var(--bg-gray); color: var(--text-light); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Scheduled</span>';
        if (sessionDate < new Date(Date.now() + 48 * 60 * 60 * 1000)) {
            statusBadge = '<span style="background: var(--primary-light); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Confirmed</span>';
        }

        return `
            <div class="session-card" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem; background: var(--bg-light);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-dark);">${session.type}</h4>
                    ${statusBadge}
                </div>
                <div style="display: flex; gap: 1rem; color: var(--text-light); font-size: 0.9rem;">
                    <span><i class="far fa-calendar"></i> ${sessionDateString}</span>
                    <span><i class="far fa-clock"></i> ${session.time}</span>
                </div>
                <div style="margin-top: 0.75rem;">
                        <a href="#" class="btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">Join Zoom</a>
                </div>
            </div>
        `;
    }).join('');
}

// Statistics
function updateStatistics() {
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const upcomingSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= new Date();
    }).length;

    const totalProgress = goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
        : 0;

    document.getElementById('totalGoals').textContent = activeGoals;
    document.getElementById('completedGoals').textContent = completedGoals;
    document.getElementById('upcomingSessions').textContent = upcomingSessions;
    document.getElementById('progressAverage').textContent = `${totalProgress}%`;
}

// Goal Details Modal
function showGoalDetails(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    document.getElementById('modalGoalTitle').textContent = goal.title;
    document.getElementById('goalDetailsContent').innerHTML = `
        <p><strong>Description:</strong> ${goal.description || 'No description'}</p>
        <p><strong>Category:</strong> ${goal.category}</p>
        ${goal.deadline ? `<p><strong>Deadline:</strong> ${new Date(goal.deadline).toLocaleDateString()}</p>` : ''}
        <p><strong>Progress:</strong> ${goal.progress}%</p>
    `;
    document.getElementById('goalDetailsModal').style.display = 'block';
}

function closeGoalModal() {
    document.getElementById('goalDetailsModal').style.display = 'none';
}

// Auto-update sessions from bookings
function syncSessionsFromBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.forEach(booking => {
        if (booking.selectedDate && booking.selectedTime) {
            const existingSession = sessions.find(s =>
                s.date === booking.selectedDate.toISOString() &&
                s.time === booking.selectedTime
            );

            if (!existingSession) {
                const session = {
                    id: Date.now(),
                    type: booking.sessionType,
                    date: booking.selectedDate.toISOString(),
                    time: booking.selectedTime,
                    duration: booking.sessionDuration,
                    status: 'upcoming'
                };
                sessions.push(session);
            }
        }
    });
    saveSessions();
    renderSessions();
    updateStatistics();
}

// Sync on load
setTimeout(syncSessionsFromBookings, 100);

// Scroll to Top Functionality
const scrollBtn = document.getElementById('scrollToTop');

if (scrollBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
