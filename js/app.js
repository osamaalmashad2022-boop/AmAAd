const preTestCompleted = {}; // Track completed pre-tests per module e.g. {0: true, 1: true}
let currentModuleId = null;
let currentQuizType = null; // 'pre' or 'post'

// --- View Management Functions ---
function hideAllViews() {
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('module-view').classList.add('hidden');
    document.getElementById('lesson-view').classList.add('hidden');
}

function showHome() {
    hideAllViews();
    const home = document.getElementById('home-view');
    home.classList.remove('hidden');
    retriggerFade(home);
    updateNavActive(null);
    currentModuleId = null;
}

// --- Login Logic ---
function checkLogin() {
    const isLoggedIn = sessionStorage.getItem('amaad_logged_in') === 'true';
    if (!isLoggedIn) {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('user-profile').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('flex');
        document.getElementById('login-btn-container').classList.remove('hidden');
        document.getElementById('login-btn-container').classList.add('flex');
        showHome(); // Default to home page
    } else {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('login-btn-container').classList.add('hidden');
        document.getElementById('login-btn-container').classList.remove('flex');
        updateUserProfileUI();
        showHome(); // Ensure home page is active
    }
}

function updateUserProfileUI() {
    const userProfile = document.getElementById('user-profile');
    const navUsername = document.getElementById('nav-username');
    userProfile.classList.remove('hidden');
    userProfile.classList.add('flex');
    const username = sessionStorage.getItem('amaad_username') || 'مستخدم';
    navUsername.innerText = "أهلاً، " + username;
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    
    if (user.length > 0 && pass.length > 0) {
        sessionStorage.setItem('amaad_logged_in', 'true');
        sessionStorage.setItem('amaad_username', user);
        updateUserProfileUI();
        document.getElementById('login-btn-container').classList.add('hidden');
        document.getElementById('login-btn-container').classList.remove('flex');
        document.getElementById('login-view').classList.add('opacity-0');
        setTimeout(() => {
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('login-view').classList.remove('opacity-0');
            showHome(); // Ensure we show home after login
        }, 300); // Wait for transition
        document.getElementById('login-error').classList.add('hidden');
    } else {
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-error').classList.add('animate-pulse');
        setTimeout(() => document.getElementById('login-error').classList.remove('animate-pulse'), 1000);
    }
}

function handleLogout() {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
        sessionStorage.removeItem('amaad_logged_in');
        location.reload(); // Simplest way to reset state
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
});

function loadModule(id) {
    currentModuleId = id;
    const data = modulesData[id];
    
    hideAllViews();
    const modView = document.getElementById('module-view');
    modView.classList.remove('hidden');
    retriggerFade(modView);

    // Populate Header
    document.getElementById('mod-badge').innerText = data.badge;
    document.getElementById('mod-title').innerText = data.title;
    document.getElementById('mod-desc').innerText = data.desc;
    document.getElementById('mod-icon').innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
    document.getElementById('mod-bg-icon').innerHTML = `<i class="fa-solid ${data.icon}"></i>`;

    // Manage Pre-test Lock
    const isUnlocked = preTestCompleted[id] === true;
    const lockOverlay = document.getElementById('content-locked-overlay');
    const actualContent = document.getElementById('actual-content');
    const postTestBtn = document.getElementById('post-test-btn');
    const preTestBtn = document.getElementById('pre-test-btn');
    const preTestBadge = document.getElementById('pre-test-badge');

    if (isUnlocked) {
        lockOverlay.classList.add('hidden');
        actualContent.classList.remove('hidden');
        
        // Disable Pre-test, enable Post-test UI
        preTestBtn.classList.replace('bg-primary', 'bg-gray-100');
        preTestBtn.classList.replace('text-white', 'text-gray-400');
        preTestBtn.classList.replace('border-primary', 'border-gray-200');
        preTestBtn.classList.add('cursor-not-allowed');
        preTestBadge.classList.remove('hidden');
        
        postTestBtn.classList.replace('bg-gray-100', 'bg-secondary');
        postTestBtn.classList.replace('text-gray-400', 'text-white');
        postTestBtn.classList.replace('border-gray-200', 'border-secondary');
        postTestBtn.classList.remove('cursor-not-allowed');
        postTestBtn.disabled = false;
        
    } else {
        lockOverlay.classList.remove('hidden');
        actualContent.classList.add('hidden');
        
        // Enable Pre-test, disable Post-test UI
        preTestBtn.classList.replace('bg-gray-100', 'bg-primary');
        preTestBtn.classList.replace('text-gray-400', 'text-white');
        preTestBtn.classList.replace('border-gray-200', 'border-primary');
        preTestBtn.classList.remove('cursor-not-allowed');
        preTestBadge.classList.add('hidden');
        
        postTestBtn.classList.replace('bg-secondary', 'bg-gray-100');
        postTestBtn.classList.replace('text-white', 'text-gray-400');
        postTestBtn.classList.replace('border-secondary', 'border-gray-200');
        postTestBtn.classList.add('cursor-not-allowed');
        postTestBtn.disabled = true;
    }

    // Populate Sections (Cards)
    let contentHTML = '';
    data.sections.forEach((sec, secIndex) => {
        let cardsHTML = sec.items.map((item, itemIndex) => `
            <div onclick="openLesson(${id}, ${secIndex}, ${itemIndex})" class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex items-start gap-5 transform hover:-translate-y-1">
                <div class="w-14 h-14 rounded-xl bg-indigo-50 text-primary flex justify-center items-center text-2xl shrink-0 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-indigo-600 group-hover:text-white transition-colors shadow-inner">
                    <i class="fa-solid ${item.icon || 'fa-book-open'}"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-xl text-dark group-hover:text-primary transition-colors">${item.title}</h4>
                    <p class="text-gray-500 text-sm md:text-base mt-2">${item.shortDesc}</p>
                </div>
                <div class="text-gray-300 group-hover:text-primary self-center transition-colors text-xl">
                    <i class="fa-solid fa-chevron-left"></i>
                </div>
            </div>
        `).join('');

        contentHTML += `
            <div class="mb-8 bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h4 class="font-black text-2xl mb-6 text-dark border-r-4 border-primary pr-4">${sec.title}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    ${cardsHTML}
                </div>
            </div>
        `;
    });
    document.getElementById('mod-content').innerHTML = contentHTML;

    // Populate Activities
    let actHTML = '';
    data.activities.forEach(act => {
        actHTML += `
            <div class="bg-white p-6 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm hover:shadow-lg transition">
                <h4 class="font-bold text-xl text-dark flex items-center gap-2 mb-3"><i class="fa-solid fa-lightbulb text-yellow-500"></i> ${act.title}</h4>
                <p class="text-gray-600 text-base leading-relaxed">${act.desc}</p>
            </div>
        `;
    });
    document.getElementById('mod-activities').innerHTML = actHTML;

    updateNavActive(id);
}

function openLesson(moduleId, sectionIndex, itemIndex) {
    if(!preTestCompleted[moduleId]) return; // Extra security

    const lessonData = modulesData[moduleId].sections[sectionIndex].items[itemIndex];
    const sectionTitle = modulesData[moduleId].sections[sectionIndex].title;
    
    hideAllViews();
    const lessonView = document.getElementById('lesson-view');
    lessonView.classList.remove('hidden');
    retriggerFade(lessonView);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Populate Lesson Page
    document.getElementById('lesson-page-section').innerText = sectionTitle;
    document.getElementById('lesson-page-title').innerText = lessonData.title;
    
    // Render Objectives
    const objList = document.getElementById('lesson-objectives-list');
    objList.innerHTML = '';
    if(lessonData.objectives && lessonData.objectives.length > 0) {
        lessonData.objectives.forEach(obj => {
            objList.innerHTML += `<li>${obj}</li>`;
        });
        document.getElementById('lesson-page-objectives').classList.remove('hidden');
    } else {
        document.getElementById('lesson-page-objectives').classList.add('hidden');
    }

    document.getElementById('lesson-page-content').innerHTML = lessonData.content;
}

function backToModule() {
    if(currentModuleId !== null) {
        loadModule(currentModuleId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showHome();
    }
}

// --- Helper Functions ---
function retriggerFade(element) {
    element.classList.remove('fade-in');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('fade-in');
}

function updateNavActive(id) {
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach((btn, index) => {
        if (index === id) {
            btn.classList.add('text-primary');
            btn.classList.remove('text-gray-700');
        } else {
            btn.classList.remove('text-primary');
            btn.classList.add('text-gray-700');
        }
    });
}

// --- Quiz Logic ---
function startQuiz(type) {
    if (currentModuleId === null) return;
    
    // Check if pre-test is already done
    if (type === 'pre' && preTestCompleted[currentModuleId]) {
         alert("لقد قمت بإتمام الاختبار القبلي مسبقاً.");
         return;
    }
    // Check if post-test can be taken
    if (type === 'post' && !preTestCompleted[currentModuleId]) {
         return;
    }

    currentQuizType = type;
    const isPretest = type === 'pre';
    
    // Update Modal UI
    document.getElementById('quiz-modal-title').innerHTML = isPretest 
        ? '<i class="fa-solid fa-file-pen text-yellow-400"></i> الاختبار القبلي للموديول'
        : '<i class="fa-solid fa-graduation-cap text-yellow-400"></i> الاختبار البعدي للموديول';
        
    const submitBtn = document.getElementById('submit-quiz-btn');
    submitBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> تسليم الإجابات';
    submitBtn.classList.remove('hidden');

    const quizData = modulesData[currentModuleId].quiz;
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    
    // Notice Pre-test
    if(isPretest) {
         container.innerHTML += `
            <div class="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl mb-6 flex gap-3 items-center">
                 <i class="fa-solid fa-circle-info text-2xl text-blue-500"></i>
                 <p class="font-bold text-sm">هذا اختبار لحصر مستواك الحالي. لا تقلق من الإجابات الخاطئة، ابذل أقصى جهدك للتعرف على مستواك.</p>
            </div>
         `;
    }

    quizData.forEach((q, qIndex) => {
        let optionsHTML = '';
        q.options.forEach((opt, oIndex) => {
            optionsHTML += `
                <div class="relative mt-3">
                    <input type="radio" name="q${qIndex}" id="q${qIndex}_o${oIndex}" value="${oIndex}" class="quiz-option sr-only">
                    <label for="q${qIndex}_o${oIndex}" class="block p-5 border-2 rounded-xl cursor-pointer transition-colors bg-white hover:bg-gray-50 text-gray-700 font-bold border-gray-100 shadow-sm">
                        ${opt}
                    </label>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm mb-6 border border-gray-100" id="question-box-${qIndex}">
                <h4 class="font-black text-xl text-dark mb-5 leading-relaxed flex items-start gap-3">
                    <span class="bg-gradient-to-br from-indigo-100 to-indigo-50 text-primary w-10 h-10 flex justify-center items-center rounded-xl text-base flex-shrink-0 shadow-inner">${qIndex + 1}</span> 
                    <span>${q.q}</span>
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${optionsHTML}
                </div>
            </div>
        `;
    });

    const modalInner = document.getElementById('quiz-modal-inner');
    document.getElementById('quiz-modal').classList.remove('hidden');
    document.getElementById('quiz-modal').classList.add('flex');
    document.getElementById('quiz-score').classList.add('hidden');
    
    // Animation trigger
    setTimeout(() => {
        modalInner.classList.remove('scale-95');
        modalInner.classList.add('scale-100');
    }, 10);
}

function closeQuiz() {
    const modalInner = document.getElementById('quiz-modal-inner');
    modalInner.classList.remove('scale-100');
    modalInner.classList.add('scale-95');
    setTimeout(() => {
        document.getElementById('quiz-modal').classList.add('hidden');
        document.getElementById('quiz-modal').classList.remove('flex');
    }, 200);
}

function submitQuiz() {
    const quizData = modulesData[currentModuleId].quiz;
    let score = 0;
    let answeredAll = true;

    quizData.forEach((q, qIndex) => {
        const selected = document.querySelector(`input[name="q${qIndex}"]:checked`);
        const qBox = document.getElementById(`question-box-${qIndex}`);
        
        // Reset styling
        qBox.querySelectorAll('label').forEach(l => {
            l.classList.remove('correct-answer', 'wrong-answer');
            l.style.opacity = "0.6";
        });

        if (!selected) {
            answeredAll = false;
        } else {
            const selectedVal = parseInt(selected.value);
            const correctLabel = document.querySelector(`label[for="q${qIndex}_o${q.correct}"]`);
            correctLabel.style.opacity = "1";
            correctLabel.classList.add('correct-answer');

            if (selectedVal === q.correct) {
                score++;
            } else {
                const wrongLabel = document.querySelector(`label[for="q${qIndex}_o${selectedVal}"]`);
                wrongLabel.style.opacity = "1";
                wrongLabel.classList.add('wrong-answer');
            }
        }
    });

    if (!answeredAll) {
         // Show error validation visually
         quizData.forEach((q, qIndex) => {
            const selected = document.querySelector(`input[name="q${qIndex}"]:checked`);
            if(!selected) {
                 const qBox = document.getElementById(`question-box-${qIndex}`);
                 qBox.querySelectorAll('label').forEach(l => l.style.opacity = "1");
                 qBox.classList.add('border-red-300', 'bg-red-50');
                 setTimeout(() => qBox.classList.remove('border-red-300', 'bg-red-50'), 2000);
            }
         });
         alert("يرجى الإجابة على جميع الأسئلة قبل التسليم.");
        return;
    }

    // Show Score
    const scoreDiv = document.getElementById('quiz-score');
    scoreDiv.classList.remove('hidden');
    
    let message = '';
    let color = '';
    
    if (currentQuizType === 'pre') {
        preTestCompleted[currentModuleId] = true;
        color = 'text-blue-600';
        message = 'تم تسجيل مستواك المبدئي. يمكنك الآن تصفح محتوى الموديول المغلق!';
        
        // Modify submission button to be "close"
        const submitBtn = document.getElementById('submit-quiz-btn');
        submitBtn.innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> فتح المحتوى الآن';
        submitBtn.setAttribute('onclick', 'unlockModuleAndClose()');
        
    } else {
        if(score >= 8) { message = 'عمل ممتاز! لقد أتقنت هذا الموديول بفضل الله.'; color = 'text-green-600'; }
        else if(score >= 5) { message = 'مستوى جيد، ولكن ننصحك بمراجعة بعض الدروس لزيادة الاستفادة.'; color = 'text-yellow-600'; }
        else { message = 'تحتاج إلى إعادة قراءة الدروس بتمعن والمحاولة مرة أخرى.'; color = 'text-red-600'; }
        document.getElementById('submit-quiz-btn').classList.add('hidden');
    }

    scoreDiv.innerHTML = `<span class="block text-sm text-gray-500 mb-2 font-bold uppercase tracking-widest">نتيجة التقييم</span> <span class="block text-5xl font-black ${color} mb-3">${score} <span class="text-2xl text-gray-400 font-bold mx-1">/</span> 10</span> <span class="block text-base font-bold bg-gray-100 p-3 rounded-xl inline-block ${color}">${message}</span>`;
    
    // disable inputs
    document.querySelectorAll('.quiz-option').forEach(input => input.disabled = true);
}

function unlockModuleAndClose() {
    closeQuiz();
    loadModule(currentModuleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset submit button for future tests
    const submitBtn = document.getElementById('submit-quiz-btn');
    submitBtn.setAttribute('onclick', 'submitQuiz()');
}

// --- Logo Modal Functions ---
function openLogoModal() {
    const modal = document.getElementById('logo-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeLogoModal() {
    const modal = document.getElementById('logo-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
