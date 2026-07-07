# Generate the complete JavaScript file
js_content = '''// ============================================
// Val's Revision - Main Application JavaScript
// Created for Valentine Godson Govina
// ============================================

// Global Variables
let currentQuiz = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;
let quizStartTime = null;
let selectedQuestionCount = 20;

// Course Data Mapping
const courseData = {
    'physics101': { name: 'Physics 101', file: 'physics101.json', time: 10 },
    'physics102': { name: 'Physics 102', file: 'physics102.json', time: 10 },
    'chemistry101': { name: 'Chemistry 101', file: 'chemistry101.json', time: 10 },
    'chemistry102': { name: 'Chemistry 102', file: 'chemistry102.json', time: 10 },
    'math101': { name: 'Mathematics 101', file: 'math101.json', time: 10 },
    'math102': { name: 'Mathematics 102', file: 'math102.json', time: 10 },
    'biology101': { name: 'Biology 101', file: 'biology101.json', time: 10 },
    'biology102': { name: 'Biology 102', file: 'biology102.json', time: 10 },
    'english101': { name: 'English 101', file: 'english101.json', time: 10 },
    'english102': { name: 'English 102', file: 'english102.json', time: 10 }
};

// ============================================
// NAVIGATION & UI
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                navLinks.classList.remove('active');
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        }
    });
    
    // Quiz option buttons
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedQuestionCount = parseInt(this.dataset.questions);
            
            const timeInfo = document.getElementById('timeInfo');
            if (timeInfo) {
                timeInfo.textContent = selectedQuestionCount === 20 ? '10 minutes' : '20 minutes';
            }
        });
    });
    
    // Payment method buttons
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// ============================================
// QUIZ FUNCTIONS
// ============================================

function startQuiz(courseId) {
    currentQuiz = courseId;
    const modal = document.getElementById('quizModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modalTitle && courseData[courseId]) {
        modalTitle.textContent = `Start ${courseData[courseId].name} Quiz`;
    }
    
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('quizModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function beginQuiz() {
    closeModal();
    const course = courseData[currentQuiz];
    if (!course) return;
    
    // Store quiz settings in sessionStorage
    sessionStorage.setItem('currentQuiz', currentQuiz);
    sessionStorage.setItem('questionCount', selectedQuestionCount);
    
    // Navigate to quiz page
    window.location.href = 'quiz.html';
}

// ============================================
// QUIZ PAGE INITIALIZATION
// ============================================

function initQuiz() {
    const quizId = sessionStorage.getItem('currentQuiz');
    const questionCount = parseInt(sessionStorage.getItem('questionCount')) || 20;
    
    if (!quizId || !courseData[quizId]) {
        window.location.href = 'index.html';
        return;
    }
    
    const course = courseData[quizId];
    selectedQuestionCount = questionCount;
    
    // Update quiz header
    const quizTitle = document.getElementById('quizTitle');
    if (quizTitle) quizTitle.textContent = course.name;
    
    // Load questions
    loadQuestions(quizId, questionCount);
}

async function loadQuestions(quizId, count) {
    try {
        const course = courseData[quizId];
        const response = await fetch(`js/data/${course.file}`);
        const data = await response.json();
        
        // Randomly select questions
        const allQuestions = data.questions;
        currentQuestions = shuffleArray([...allQuestions]).slice(0, count);
        userAnswers = new Array(currentQuestions.length).fill(null);
        
        // Set timer
        const timeMinutes = count === 20 ? 10 : 20;
        timeRemaining = timeMinutes * 60;
        quizStartTime = Date.now();
        
        // Start timer
        startTimer();
        
        // Display first question
        displayQuestion(0);
        updateProgressBar();
        createQuestionDots();
        
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Error loading quiz. Please try again.');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ============================================
// TIMER FUNCTIONS
// ============================================

function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            showTimeUpModal();
        }
        
        // Warning when less than 1 minute
        if (timeRemaining <= 60) {
            const timerBox = document.querySelector('.timer-box');
            if (timerBox) timerBox.classList.add('warning');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// QUESTION DISPLAY
// ============================================

function displayQuestion(index) {
    currentQuestionIndex = index;
    const question = currentQuestions[index];
    
    // Update question number
    const currentQNum = document.getElementById('currentQNum');
    const questionCounter = document.getElementById('questionCounter');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    
    if (currentQNum) currentQNum.textContent = index + 1;
    if (questionCounter) questionCounter.textContent = `${index + 1} / ${currentQuestions.length}`;
    if (questionText) questionText.textContent = question.question;
    
    // Generate options
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        
        question.options.forEach((option, i) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'option';
            if (userAnswers[index] === i) optionEl.classList.add('selected');
            
            optionEl.innerHTML = `
                <div class="option-letter">${letters[i]}</div>
                <div class="option-text">${option}</div>
            `;
            
            optionEl.addEventListener('click', () => selectAnswer(i));
            optionsContainer.appendChild(optionEl);
        });
    }
    
    // Update navigation buttons
    updateNavButtons();
    updateQuestionDots();
    updateProgressBar();
}

function selectAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
    
    // Update visual selection
    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        opt.classList.remove('selected');
        if (i === answerIndex) opt.classList.add('selected');
    });
    
    updateQuestionDots();
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// ============================================
// QUESTION DOTS NAVIGATOR
// ============================================

function createQuestionDots() {
    const dotsContainer = document.getElementById('questionDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < currentQuestions.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'q-dot';
        dot.textContent = i + 1;
        dot.addEventListener('click', () => displayQuestion(i));
        dotsContainer.appendChild(dot);
    }
}

function updateQuestionDots() {
    const dots = document.querySelectorAll('.q-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('current', 'answered');
        if (i === currentQuestionIndex) dot.classList.add('current');
        if (userAnswers[i] !== null) dot.classList.add('answered');
    });
}

// ============================================
// SUBMIT & RESULTS
// ============================================

function submitQuiz() {
    clearInterval(timerInterval);
    showResults();
}

function showTimeUpModal() {
    const modal = document.getElementById('timeUpModal');
    if (modal) modal.classList.add('active');
}

function forceSubmit() {
    const modal = document.getElementById('timeUpModal');
    if (modal) modal.classList.remove('active');
    showResults();
}

function showResults() {
    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    let correctCount = 0;
    
    userAnswers.forEach((answer, index) => {
        if (answer === currentQuestions[index].correctAnswer) {
            correctCount++;
        }
    });
    
    const wrongCount = currentQuestions.length - correctCount;
    const percentage = Math.round((correctCount / currentQuestions.length) * 100);
    
    // Update results modal
    const scorePercent = document.getElementById('scorePercent');
    const correctCountEl = document.getElementById('correctCount');
    const wrongCountEl = document.getElementById('wrongCount');
    const totalCountEl = document.getElementById('totalCount');
    const timeTakenEl = document.getElementById('timeTaken');
    const performanceMessage = document.getElementById('performanceMessage');
    const scoreCircle = document.getElementById('scoreCircle');
    
    if (scorePercent) scorePercent.textContent = `${percentage}%`;
    if (correctCountEl) correctCountEl.textContent = correctCount;
    if (wrongCountEl) wrongCountEl.textContent = wrongCount;
    if (totalCountEl) totalCountEl.textContent = currentQuestions.length;
    
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    if (timeTakenEl) timeTakenEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Performance message
    let message = '';
    if (percentage >= 80) message = 'Excellent! You\'re on track for a First Class!';
    else if (percentage >= 60) message = 'Good job! Keep practicing to improve!';
    else if (percentage >= 40) message = 'Not bad! Review the explanations and try again!';
    else message = 'Keep studying! Practice makes perfect!';
    
    if (performanceMessage) performanceMessage.textContent = message;
    
    // Animate score circle
    if (scoreCircle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percentage / 100) * circumference;
        setTimeout(() => {
            scoreCircle.style.strokeDashoffset = offset;
        }, 300);
    }
    
    // Show results modal
    const resultsModal = document.getElementById('resultsModal');
    if (resultsModal) resultsModal.classList.add('active');
}

// ============================================
// REVIEW ANSWERS
// ============================================

function reviewAnswers() {
    const resultsModal = document.getElementById('resultsModal');
    const reviewModal = document.getElementById('reviewModal');
    const reviewBody = document.getElementById('reviewBody');
    
    if (resultsModal) resultsModal.classList.remove('active');
    if (reviewModal) reviewModal.classList.add('active');
    
    if (reviewBody) {
        reviewBody.innerHTML = '';
        
        currentQuestions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const letters = ['A', 'B', 'C', 'D'];
            
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            reviewItem.innerHTML = `
                <div class="review-question">
                    <span class="review-status ${isCorrect ? 'correct' : 'wrong'}">
                        ${isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                    <span>${index + 1}. ${question.question}</span>
                </div>
                <div class="review-answer">
                    <span class="label">Your answer: </span>
                    <span class="value your-ans">${userAnswer !== null ? letters[userAnswer] + '. ' + question.options[userAnswer] : 'Not answered'}</span>
                </div>
                <div class="review-answer">
                    <span class="label">Correct answer: </span>
                    <span class="value correct-ans">${letters[question.correctAnswer]}. ${question.options[question.correctAnswer]}</span>
                </div>
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
            `;
            
            reviewBody.appendChild(reviewItem);
        });
    }
}

function closeReviewModal() {
    const reviewModal = document.getElementById('reviewModal');
    if (reviewModal) reviewModal.classList.remove('active');
}

function retakeQuiz() {
    const resultsModal = document.getElementById('resultsModal');
    if (resultsModal) resultsModal.classList.remove('active');
    
    // Reset and restart
    userAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    
    const timeMinutes = selectedQuestionCount === 20 ? 10 : 20;
    timeRemaining = timeMinutes * 60;
    quizStartTime = Date.now();
    
    startTimer();
    displayQuestion(0);
}

// ============================================
// PAYMENT FUNCTIONS
// ============================================

function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.add('active');
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('active');
}

function processPayment() {
    // This is a demo - in production, integrate with Paystack/Flutterwave
    showToast('Payment processing demo - integrate Paystack for real payments');
    closePaymentModal();
}

// ============================================
// CONTACT FORM
// ============================================

function handleContactSubmit(e) {
    e.preventDefault();
    showToast('Thank you for your message! We will get back to you soon.');
    e.target.reset();
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toastMessage) toastMessage.textContent = message;
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
'''

with open(f"{output_dir}/js/app.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("app.js created successfully!")
print(f"File size: {len(js_content)} characters")
