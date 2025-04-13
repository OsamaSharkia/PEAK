// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function() {
          navLinks.classList.toggle('active');
          menuToggle.classList.toggle('active');
      });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
      const isClickInsideNav = navLinks?.contains(event.target);
      const isClickOnToggle = menuToggle?.contains(event.target);
      
      if (navLinks?.classList.contains('active') && !isClickInsideNav && !isClickOnToggle) {
          navLinks.classList.remove('active');
          menuToggle?.classList.remove('active');
      }
  });

  // Testimonial Slider
  const testimonialSlider = document.getElementById('testimonial-slider');
  const prevButton = document.getElementById('prev-testimonial');
  const nextButton = document.getElementById('next-testimonial');

  if (testimonialSlider && prevButton && nextButton) {
      const testimonials = testimonialSlider.querySelectorAll('.testimonial');
      let currentIndex = 0;

      // Hide all testimonials except the first one
      testimonials.forEach((testimonial, index) => {
          if (index !== 0) {
              testimonial.style.display = 'none';
          }
      });

      // Function to show a specific testimonial
      function showTestimonial(index) {
          testimonials.forEach(testimonial => {
              testimonial.style.display = 'none';
          });
          testimonials[index].style.display = 'block';
      }

      // Event listeners for next and previous buttons
      nextButton.addEventListener('click', function() {
          currentIndex = (currentIndex + 1) % testimonials.length;
          showTestimonial(currentIndex);
      });

      prevButton.addEventListener('click', function() {
          currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
          showTestimonial(currentIndex);
      });

      // Auto-rotate testimonials every 5 seconds
      setInterval(function() {
          currentIndex = (currentIndex + 1) % testimonials.length;
          showTestimonial(currentIndex);
      }, 5000);
  }

  // Chat Widget
  const chatToggle = document.getElementById('chat-toggle');
  const chatBox = document.getElementById('chat-box');
  const closeChat = document.getElementById('close-chat');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const openChatFromCard = document.getElementById('open-chat-from-card');

  function toggleChat() {
      if (chatBox && chatToggle) {
          const isVisible = chatBox.style.display === 'block';
          chatBox.style.display = isVisible ? 'none' : 'block';
          chatToggle.style.display = isVisible ? 'flex' : 'none';
          
          if (!isVisible) {
              chatInput?.focus();
              // Scroll to bottom of chat messages
              if (chatMessages) {
                  chatMessages.scrollTop = chatMessages.scrollHeight;
              }
          }
      }
  }

  if (chatToggle) {
      chatToggle.addEventListener('click', toggleChat);
  }

  if (closeChat) {
      closeChat.addEventListener('click', toggleChat);
  }

  if (openChatFromCard) {
      openChatFromCard.addEventListener('click', function() {
          if (chatBox && chatToggle) {
              chatBox.style.display = 'block';
              chatToggle.style.display = 'none';
              chatInput?.focus();
              // Scroll to bottom of chat messages
              if (chatMessages) {
                  chatMessages.scrollTop = chatMessages.scrollHeight;
              }
          }
      });
  }

  if (chatForm && chatInput && chatMessages) {
      chatForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const message = chatInput.value.trim();
          if (message === '') return;
          
          // Add user message
          const userMessageElement = document.createElement('div');
          userMessageElement.className = 'message sent';
          userMessageElement.innerHTML = `<p>${message}</p>`;
          chatMessages.appendChild(userMessageElement);
          
          // Clear input
          chatInput.value = '';
          
          // Scroll to bottom of chat messages
          chatMessages.scrollTop = chatMessages.scrollHeight;
          
          // Simulate response (in a real implementation, this would be handled by a backend)
          setTimeout(function() {
              const responseElement = document.createElement('div');
              responseElement.className = 'message received';
              responseElement.innerHTML = `<p>Thank you for your message. One of our advisors will respond to you shortly. In the meantime, you might find helpful information in our FAQ section.</p>`;
              chatMessages.appendChild(responseElement);
              
              // Scroll to bottom of chat messages
              chatMessages.scrollTop = chatMessages.scrollHeight;
          }, 1000);
      });
  }

  // FAQ Accordion (if on FAQ page)
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
      faqItems.forEach(item => {
          const question = item.querySelector('.faq-question');
          const answer = item.querySelector('.faq-answer');
          const toggleButton = item.querySelector('.toggle-answer');
          
          if (question && answer && toggleButton) {
              question.addEventListener('click', function() {
                  const isOpen = answer.style.display === 'block';
                  
                  // Close all other answers
                  document.querySelectorAll('.faq-answer').forEach(a => {
                      a.style.display = 'none';
                  });
                  document.querySelectorAll('.toggle-answer i').forEach(icon => {
                      icon.className = 'fas fa-plus';
                  });
                  
                  // Toggle current answer
                  answer.style.display = isOpen ? 'none' : 'block';
                  toggleButton.querySelector('i').className = isOpen ? 'fas fa-plus' : 'fas fa-minus';
              });
          }
      });
      
      // FAQ Search functionality
      const faqSearch = document.getElementById('faq-search');
      const searchBtn = document.getElementById('search-btn');
      const faqList = document.getElementById('faq-list');
      const faqNotFound = document.getElementById('faq-not-found');
      
      if (faqSearch && searchBtn && faqList && faqNotFound) {
          function searchFAQs() {
              const searchTerm = faqSearch.value.toLowerCase();
              let resultsFound = false;
              
              faqItems.forEach(item => {
                  const questionText = item.querySelector('.faq-question h3').textContent.toLowerCase();
                  const answerText = item.querySelector('.faq-answer').textContent.toLowerCase();
                  
                  if (questionText.includes(searchTerm) || answerText.includes(searchTerm) || searchTerm === '') {
                      item.style.display = 'block';
                      resultsFound = true;
                  } else {
                      item.style.display = 'none';
                  }
              });
              
              faqNotFound.style.display = resultsFound ? 'none' : 'block';
          }
          
          searchBtn.addEventListener('click', searchFAQs);
          faqSearch.addEventListener('keyup', function(e) {
              if (e.key === 'Enter') {
                  searchFAQs();
              }
          });
          
          // Category filtering
          const categoryTabs = document.querySelectorAll('.category-tab');
          if (categoryTabs.length > 0) {
              categoryTabs.forEach(tab => {
                  tab.addEventListener('click', function() {
                      // Remove active class from all tabs
                      categoryTabs.forEach(t => t.classList.remove('active'));
                      
                      // Add active class to clicked tab
                      tab.classList.add('active');
                      
                      const category = tab.getAttribute('data-category');
                      
                      faqItems.forEach(item => {
                          if (category === 'all' || item.getAttribute('data-category') === category) {
                              item.style.display = 'block';
                          } else {
                              item.style.display = 'none';
                          }
                      });
                      
                      faqNotFound.style.display = 'none';
                  });
              });
          }
      }
  }

  // Form submission handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          alert('Thank you for your message. We will get back to you soon!');
          contactForm.reset();
      });
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
      bookingForm.addEventListener('submit', function(e) {
          e.preventDefault();
          alert('Thank you for booking a consultation. We will confirm your appointment shortly!');
          bookingForm.reset();
      });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href !== '#') {
              e.preventDefault();
              const targetElement = document.querySelector(href);
              if (targetElement) {
                  window.scrollTo({
                      top: targetElement.offsetTop - 100,
                      behavior: 'smooth'
                  });
              }
          }
      });
  });
});