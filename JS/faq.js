document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const faqList = document.getElementById('faq-list');
    const faqSearch = document.getElementById('faq-search');
    const searchBtn = document.getElementById('search-btn');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const faqNotFound = document.getElementById('faq-not-found');
    const authRequiredMessage = document.getElementById('auth-required-message');
    const userContributionContent = document.getElementById('user-contribution-content');
    const contributionTabs = document.querySelectorAll('.contribution-tab');
    const contributionForms = document.querySelectorAll('.contribution-form');
    const askForm = document.getElementById('ask-form');
    const myQuestionsList = document.getElementById('my-questions-list');
    const myAnswersList = document.getElementById('my-answers-list');
    const imageUploadArea = document.getElementById('image-upload-area');
    const questionImage = document.getElementById('question-image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImage = document.getElementById('remove-image');
    
    // Current user and selected category
    let currentUser = null;
    let selectedCategory = 'all';
    let uploadedImageFile = null;
    let uploadedImageDataUrl = null;
    
    // Check authentication state
    function checkAuth() {
        currentUser = JSON.parse(localStorage.getItem('peak_current_user'));
        
        if (currentUser) {
            // User is signed in
            authRequiredMessage.style.display = 'none';
            userContributionContent.style.display = 'block';
            
            // Load user's questions and answers
            loadUserQuestions();
            loadUserAnswers();
        } else {
            // User is signed out
            authRequiredMessage.style.display = 'block';
            userContributionContent.style.display = 'none';
        }
    }
    
    // Load all FAQs (both official and user-contributed)
    function loadFAQs() {
        faqList.innerHTML = '<p class="loading-message">Loading questions...</p>';
        
        // First load official FAQs
        loadOfficialFAQs().then(() => {
            // Then load user-contributed questions
            loadUserContributedQuestions();
        });
    }
    
    // Load official FAQs from a JSON file or hardcoded data
    function loadOfficialFAQs() {
        return fetch('js/faq-data.json')
            .then(response => response.json())
            .then(data => {
                // Clear loading message
                if (faqList.querySelector('.loading-message')) {
                    faqList.innerHTML = '';
                }
                
                // Group FAQs by category
                const faqsByCategory = {};
                
                data.forEach(faq => {
                    if (!faqsByCategory[faq.category]) {
                        faqsByCategory[faq.category] = [];
                    }
                    faqsByCategory[faq.category].push(faq);
                });
                
                // Render FAQs by category
                for (const category in faqsByCategory) {
                    const categoryTitle = getCategoryTitle(category);
                    const categoryIcon = getCategoryIcon(category);
                    
                    const categoryElement = document.createElement('h2');
                    categoryElement.className = 'faq-category-title';
                    categoryElement.innerHTML = `<i class="${categoryIcon}"></i> ${categoryTitle}`;
                    faqList.appendChild(categoryElement);
                    
                    faqsByCategory[category].forEach(faq => {
                        renderFAQItem(faq, false); // false indicates it's not a user question
                    });
                }
            })
            .catch(error => {
                console.error('Error loading FAQ data:', error);
                faqList.innerHTML = '<p>Error loading FAQs. Please try again later.</p>';
            });
    }
    
    // Load user-contributed questions from localStorage
    function loadUserContributedQuestions() {
        // Get questions from localStorage
        const questions = JSON.parse(localStorage.getItem('peak_questions')) || [];
        
        if (questions.length === 0 && !faqList.hasChildNodes()) {
            faqList.innerHTML = '<p>No questions found. Be the first to ask a question!</p>';
            return;
        }
        
        // Check if we need to add a Community Questions category header
        let communityHeader = false;
        
        questions.forEach(question => {
            // Only show if category filter matches or 'all' is selected
            if (selectedCategory === 'all' || selectedCategory === 'community' || selectedCategory === question.category) {
                // Add community questions header if not already added
                if (!communityHeader) {
                    const categoryElement = document.createElement('h2');
                    categoryElement.className = 'faq-category-title';
                    categoryElement.innerHTML = '<i class="fas fa-users"></i> Community Questions';
                    faqList.appendChild(categoryElement);
                    communityHeader = true;
                }
                
                renderFAQItem(question, true); // true indicates it's a user question
            }
        });
    }
    
    // Render a single FAQ item
    function renderFAQItem(faq, isUserQuestion) {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.setAttribute('data-category', faq.category);
        
        if (isUserQuestion) {
            faqItem.classList.add('user-question');
        }
        
        const questionHTML = `
            <div class="faq-question">
                <h3>${faq.question}</h3>
                <button class="toggle-answer" aria-label="Toggle answer"><i class="fas fa-plus"></i></button>
            </div>
            <div class="faq-answer">
                <p>${faq.answer || faq.details || ''}</p>
                ${faq.imageUrl ? `<img src="${faq.imageUrl}" alt="Image for question">` : ''}
                ${isUserQuestion ? `
                    <div class="question-meta">
                        <span>Asked by: ${faq.userName || 'Anonymous'}</span>
                        <span>Posted: ${formatDate(faq.createdAt)}</span>
                    </div>
                    ${renderAnswers(faq)}
                    ${currentUser ? `
                        <div class="answer-form">
                            <h4>Add Your Answer</h4>
                            <div class="form-group">
                                <textarea id="answer-${faq.id}" rows="3" placeholder="Your answer..." required></textarea>
                            </div>
                            <button type="button" class="btn btn-primary submit-answer" data-question-id="${faq.id}">Submit Answer</button>
                        </div>
                    ` : ''}
                ` : ''}
            </div>
        `;
        
        faqItem.innerHTML = questionHTML;
        faqList.appendChild(faqItem);
        
        // Add event listener to toggle answer
        const toggleBtn = faqItem.querySelector('.toggle-answer');
        const answerDiv = faqItem.querySelector('.faq-answer');
        
        toggleBtn.addEventListener('click', () => {
            const isOpen = answerDiv.style.display === 'block';
            
            // Close all answers
            document.querySelectorAll('.faq-answer').forEach(answer => {
                answer.style.display = 'none';
            });
            
            document.querySelectorAll('.toggle-answer i').forEach(icon => {
                icon.className = 'fas fa-plus';
            });
            
            // Toggle current answer
            if (!isOpen) {
                answerDiv.style.display = 'block';
                toggleBtn.querySelector('i').className = 'fas fa-minus';
                
                // If it's a user question with answers, load them
                if (isUserQuestion && faq.id) {
                    loadAnswersForQuestion(faq.id);
                }
            }
        });
        
        // Add event listener to submit answer button if it exists
        const submitAnswerBtn = faqItem.querySelector('.submit-answer');
        if (submitAnswerBtn) {
            submitAnswerBtn.addEventListener('click', () => {
                const questionId = submitAnswerBtn.getAttribute('data-question-id');
                const answerText = document.getElementById(`answer-${questionId}`).value.trim();
                
                if (answerText) {
                    submitAnswer(questionId, answerText);
                }
            });
        }
    }
    
    // Render answers for a question
    function renderAnswers(question) {
        return `
            <div class="answer-list" id="answers-${question.id}">
                <h4>Answers</h4>
                <p class="loading-message">Loading answers...</p>
            </div>
        `;
    }
    
    // Load answers for a specific question
    function loadAnswersForQuestion(questionId) {
        const answersList = document.getElementById(`answers-${questionId}`);
        
        // Get answers from localStorage
        const allAnswers = JSON.parse(localStorage.getItem('peak_answers')) || [];
        const questionAnswers = allAnswers.filter(answer => answer.questionId === questionId);
        
        answersList.innerHTML = '<h4>Answers</h4>';
        
        if (questionAnswers.length === 0) {
            answersList.innerHTML += '<p>No answers yet. Be the first to answer!</p>';
            return;
        }
        
        // Sort answers by date (newest first)
        questionAnswers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        questionAnswers.forEach(answer => {
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';
            
            answerItem.innerHTML = `
                <div class="answer-content">${answer.text}</div>
                <div class="answer-meta">
                    <span>Answered by: ${answer.userName || 'Anonymous'}</span>
                    <span>Posted: ${formatDate(answer.createdAt)}</span>
                </div>
            `;
            
            answersList.appendChild(answerItem);
        });
    }
    
    // Submit a new answer
    function submitAnswer(questionId, answerText) {
        if (!currentUser) {
            alert('Please sign in to answer questions.');
            return;
        }
        
        // Create answer object
        const answer = {
            id: Date.now().toString(),
            questionId: questionId,
            text: answerText,
            userId: currentUser.id,
            userName: currentUser.name,
            createdAt: new Date().toISOString()
        };
        
        // Get existing answers
        const answers = JSON.parse(localStorage.getItem('peak_answers')) || [];
        
        // Add new answer
        answers.push(answer);
        
        // Save to localStorage
        localStorage.setItem('peak_answers', JSON.stringify(answers));
        
        // Clear the answer input
        document.getElementById(`answer-${questionId}`).value = '';
        
        // Reload answers for this question
        loadAnswersForQuestion(questionId);
    }
    
    // Load user's questions
    function loadUserQuestions() {
        if (!currentUser) return;
        
        myQuestionsList.innerHTML = '<p class="loading-message">Loading your questions...</p>';
        
        // Get questions from localStorage
        const allQuestions = JSON.parse(localStorage.getItem('peak_questions')) || [];
        const userQuestions = allQuestions.filter(q => q.userId === currentUser.id);
        
        myQuestionsList.innerHTML = '';
        
        if (userQuestions.length === 0) {
            myQuestionsList.innerHTML = '<p>You haven\'t asked any questions yet.</p>';
            return;
        }
        
        // Sort questions by date (newest first)
        userQuestions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        userQuestions.forEach(question => {
            const questionItem = document.createElement('div');
            questionItem.className = 'faq-item';
            
            questionItem.innerHTML = `
                <div class="faq-question">
                    <h3>${question.question}</h3>
                    <button class="toggle-answer" aria-label="Toggle answer"><i class="fas fa-plus"></i></button>
                </div>
                <div class="faq-answer">
                    <p>${question.details || ''}</p>
                    ${question.imageUrl ? `<img src="${question.imageUrl}" alt="Image for question">` : ''}
                    <div class="question-meta">
                        <span>Category: ${getCategoryTitle(question.category)}</span>
                        <span>Posted: ${formatDate(question.createdAt)}</span>
                    </div>
                </div>
            `;
            
            myQuestionsList.appendChild(questionItem);
            
            // Add event listener to toggle answer
            const toggleBtn = questionItem.querySelector('.toggle-answer');
            const answerDiv = questionItem.querySelector('.faq-answer');
            
            toggleBtn.addEventListener('click', () => {
                const isOpen = answerDiv.style.display === 'block';
                answerDiv.style.display = isOpen ? 'none' : 'block';
                toggleBtn.querySelector('i').className = isOpen ? 'fas fa-plus' : 'fas fa-minus';
            });
        });
    }
    
    // Load user's answers
    function loadUserAnswers() {
        if (!currentUser) return;
        
        myAnswersList.innerHTML = '<p class="loading-message">Loading your answers...</p>';
        
        // Get answers from localStorage
        const allAnswers = JSON.parse(localStorage.getItem('peak_answers')) || [];
        const userAnswers = allAnswers.filter(a => a.userId === currentUser.id);
        
        myAnswersList.innerHTML = '';
        
        if (userAnswers.length === 0) {
            myAnswersList.innerHTML = '<p>You haven\'t answered any questions yet.</p>';
            return;
        }
        
        // Sort answers by date (newest first)
        userAnswers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Get all questions
        const allQuestions = JSON.parse(localStorage.getItem('peak_questions')) || [];
        
        userAnswers.forEach(answer => {
            // Find the question this answer belongs to
            const question = allQuestions.find(q => q.id === answer.questionId);
            
            if (question) {
                const answerItem = document.createElement('div');
                answerItem.className = 'faq-item';
                
                answerItem.innerHTML = `
                    <div class="faq-question">
                        <h3>Re: ${question.question}</h3>
                        <button class="toggle-answer" aria-label="Toggle answer"><i class="fas fa-plus"></i></button>
                    </div>
                    <div class="faq-answer">
                        <p><strong>Your answer:</strong> ${answer.text}</p>
                        <div class="question-meta">
                            <span>Question by: ${question.userName || 'Anonymous'}</span>
                            <span>Answered: ${formatDate(answer.createdAt)}</span>
                        </div>
                    </div>
                `;
                
                myAnswersList.appendChild(answerItem);
                
                // Add event listener to toggle answer
                const toggleBtn = answerItem.querySelector('.toggle-answer');
                const answerDiv = answerItem.querySelector('.faq-answer');
                
                toggleBtn.addEventListener('click', () => {
                    const isOpen = answerDiv.style.display === 'block';
                    answerDiv.style.display = isOpen ? 'none' : 'block';
                    toggleBtn.querySelector('i').className = isOpen ? 'fas fa-plus' : 'fas fa-minus';
                });
            }
        });
    }
    
    // Ask form submission
    if (askForm) {
        askForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                alert('Please sign in to ask a question.');
                return;
            }
            
            const questionTitle = document.getElementById('question-title').value.trim();
            const questionDetails = document.getElementById('question-details').value.trim();
            const questionCategory = document.getElementById('question-category').value;
            
            if (!questionTitle || !questionCategory) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Disable submit button to prevent multiple submissions
            const submitBtn = askForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            // Create question object
            const question = {
                id: Date.now().toString(),
                question: questionTitle,
                details: questionDetails,
                category: questionCategory,
                userId: currentUser.id,
                userName: currentUser.name,
                createdAt: new Date().toISOString()
            };
            
            // Add image if uploaded
            if (uploadedImageDataUrl) {
                question.imageUrl = uploadedImageDataUrl;
            }
            
            // Get existing questions
            const questions = JSON.parse(localStorage.getItem('peak_questions')) || [];
            
            // Add new question
            questions.push(question);
            
            // Save to localStorage
            localStorage.setItem('peak_questions', JSON.stringify(questions));
            
            // Reset form
            askForm.reset();
            if (removeImage) removeImage.click();
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Question';
            
            // Show success message
            alert('Your question has been submitted successfully!');
            
            // Reload user's questions
            loadUserQuestions();
            
            // Reload all FAQs to include the new question
            loadFAQs();
        });
    }
    
    // Image upload handling
    if (imageUploadArea && questionImage) {
        imageUploadArea.addEventListener('click', () => {
            questionImage.click();
        });
        
        // Drag and drop handling
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.style.borderColor = '#0066cc';
            imageUploadArea.style.backgroundColor = '#f0f7ff';
        });
        
        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.style.borderColor = '#ddd';
            imageUploadArea.style.backgroundColor = '';
        });
        
        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.style.borderColor = '#ddd';
            imageUploadArea.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length) {
                handleImageFile(e.dataTransfer.files[0]);
            }
        });
        
        // File input change
        questionImage.addEventListener('change', () => {
            if (questionImage.files.length) {
                handleImageFile(questionImage.files[0]);
            }
        });
    }
    
    // Remove image button
    if (removeImage) {
        removeImage.addEventListener('click', () => {
            uploadedImageFile = null;
            uploadedImageDataUrl = null;
            previewImg.src = '#';
            imagePreview.style.display = 'none';
            imageUploadArea.style.display = 'flex';
            questionImage.value = '';
        });
    }
    
    // Handle image file
    function handleImageFile(file) {
        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPG, PNG, GIF).');
            return;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size exceeds 5MB. Please select a smaller image.');
            return;
        }
        
        uploadedImageFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageDataUrl = e.target.result;
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            imageUploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
    
    // Search functionality
    if (searchBtn && faqSearch) {
        searchBtn.addEventListener('click', performSearch);
        faqSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const searchTerm = faqSearch.value.trim().toLowerCase();
        
        if (!searchTerm) {
            // If search is empty, just filter by category
            filterByCategory(selectedCategory);
            return;
        }
        
        // Hide all FAQ items
        const faqItems = document.querySelectorAll('.faq-item');
        let matchFound = false;
        
        faqItems.forEach(item => {
            const question = item.querySelector('h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            const category = item.getAttribute('data-category');
            
            // Show if search term is found and category matches (or all categories selected)
            if ((question.includes(searchTerm) || answer.includes(searchTerm)) && 
                (selectedCategory === 'all' || selectedCategory === category || 
                 (selectedCategory === 'community' && item.classList.contains('user-question')))) {
                item.style.display = 'block';
                matchFound = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update category visibility
        updateCategoryVisibility();
        
        // Show not found message if no matches
        if (faqNotFound) {
            faqNotFound.style.display = matchFound ? 'none' : 'block';
        }
    }
    
    // Category filtering
    if (categoryTabs) {
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Get selected category
                selectedCategory = tab.getAttribute('data-category');
                
                // Filter items
                filterByCategory(selectedCategory);
                
                // Clear search
                if (faqSearch) faqSearch.value = '';
            });
        });
    }
    
    function filterByCategory(category) {
        // If category is 'community', reload to ensure we have the latest user questions
        if (category === 'community') {
            loadFAQs();
            return;
        }
        
        const faqItems = document.querySelectorAll('.faq-item');
        let matchFound = false;
        
        faqItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || category === itemCategory || 
                (category === 'community' && item.classList.contains('user-question'))) {
                item.style.display = 'block';
                matchFound = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update category visibility
        updateCategoryVisibility();
        
        // Show not found message if no matches
        if (faqNotFound) {
            faqNotFound.style.display = matchFound ? 'none' : 'block';
        }
    }
    
    // Update category title visibility based on visible items
    function updateCategoryVisibility() {
        const categoryTitles = document.querySelectorAll('.faq-category-title');
        
        categoryTitles.forEach(title => {
            // Get the next sibling elements until the next category title
            let nextElement = title.nextElementSibling;
            let hasVisibleItems = false;
            
            while (nextElement && !nextElement.classList.contains('faq-category-title')) {
                if (nextElement.classList.contains('faq-item') && nextElement.style.display !== 'none') {
                    hasVisibleItems = true;
                    break;
                }
                nextElement = nextElement.nextElementSibling;
            }
            
            // Show or hide category title based on visible items
            title.style.display = hasVisibleItems ? 'flex' : 'none';
        });
    }
    
    // Contribution tab switching
    if (contributionTabs) {
        contributionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Update active tab
                contributionTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding form
                contributionForms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${tabId}-form` || form.id === `${tabId}-tab`) {
                        form.classList.add('active');
                    }
                });
            });
        });
    }
    
    // Helper functions
    function getCategoryTitle(category) {
        const categories = {
            'admissions': 'Admissions',
            'language': 'Language Requirements',
            'funding': 'Funding & Scholarships',
            'qualifications': 'Qualifications',
            'visa': 'Visa & Immigration',
            'support': 'Support Services',
            'other': 'Other Questions'
        };
        
        return categories[category] || 'Other Questions';
    }
    
    function getCategoryIcon(category) {
        const icons = {
            'admissions': 'fas fa-university',
            'language': 'fas fa-language',
            'funding': 'fas fa-pound-sign',
            'qualifications': 'fas fa-graduation-cap',
            'visa': 'fas fa-passport',
            'support': 'fas fa-hands-helping',
            'other': 'fas fa-question-circle'
        };
        
        return icons[category] || 'fas fa-question-circle';
    }
    
    function formatDate(timestamp) {
        if (!timestamp) return 'Unknown date';
        
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    // Check authentication status and load FAQs on page load
    checkAuth();
    if (faqList) loadFAQs();
});