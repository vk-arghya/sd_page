document.addEventListener('DOMContentLoaded', () => {
    // Get header height for scroll offset
    const headerContainer = document.querySelector('.header-container');
    const headerHeight = headerContainer ? headerContainer.offsetHeight : 110;

    // ====================================================================
    // 1. PREMIUM MOBILE MENU & SMOOTH SCROLL FIX
    // ====================================================================
    
    // Find ALL links that start with '#' (internal links)
    const allScrollLinks = document.querySelectorAll('a[href^="#"]');
    const navLinksList = document.querySelectorAll('.nav-link');
    
    // Mobile Menu elements
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // This is the <ul>
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const backdrop = document.querySelector('.mobile-menu-backdrop');

    function openMenu() {
        if(navLinks) navLinks.classList.add('active');
        if(backdrop) backdrop.classList.add('active');
    }

    function closeMenu() {
        if(navLinks) navLinks.classList.remove('active');
        if(backdrop) backdrop.classList.remove('active');
    }

    // Open menu with hamburger button
    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }
    // Close menu with 'X' button inside panel
    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', closeMenu);
    }
    // Close menu by clicking the backdrop
    if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
    }

    // THIS IS THE FIX: Apply smart scrolling to ALL anchor links
    allScrollLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Stop the default browser jump

            // 1. Find target and scroll manually
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (navLinks && navLinks.classList.contains('active')) {
                    closeMenu();
                }
                return;
            }

            const targetId = href.substring(1); 
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } else {
                console.warn("Section not found for ID:", targetId); 
            }

            // 2. If it's a nav link, set active state
            if (this.classList.contains('nav-link')) {
                navLinksList.forEach(lnk => lnk.classList.remove('active'));
                this.classList.add('active');
            }
            
            // 3. If the mobile menu is open, close it
            if (navLinks && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    });

    // ====================================================================
    // 2. CONSULTATION FORM SUBMISSION
    // ====================================================================

    // --- CONFIGURATION ---
    const EMAILJS_SERVICE_ID = "service_9ftekd8"; 
    const EMAILJS_TEMPLATE_ID = "template_tseeaeq"; 
    const YOUR_CLIENT_EMAIL = "arghyaghoshal44@gmail.com"; 

    // --- Get Elements ---
    const form = document.getElementById('consultation-form');
    const formMessage = document.getElementById('form-message');
    const ctaButton = form ? form.querySelector('.cta-button') : null;

    // --- HELPER FUNCTIONS ---
    function showStatusMessage(message, isSuccess = true) {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        if (isSuccess) {
            formMessage.style.color = 'var(--primary-color)'; 
        } else {
            formMessage.style.color = 'red';
        }
    }

    function hideStatusMessage() {
        if (formMessage) {
            formMessage.style.display = 'none';
            formMessage.textContent = '';
        }
    }

    function setSubmitting(isSubmitting) {
        if (!ctaButton) return;
        ctaButton.disabled = isSubmitting;
        ctaButton.textContent = isSubmitting ? 'Sending...' : 'Request a Call Back';
        ctaButton.style.opacity = isSubmitting ? '0.5' : '1'; 
    }

    // --- FORM SUBMISSION ---
    async function handleSubmit(event) {
        event.preventDefault();
        hideStatusMessage();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()); 

        if (!data.user_name || !data.user_email || !data.user_phone) {
            showStatusMessage("Please fill in all required fields.", false);
            return;
        }
        setSubmitting(true);
        const emailSubject = "New Consultation Request from Shark Velocity";
        const emailBody = `
Hey [Company Name],
We have received a new client consultation request:
Name: ${data.user_name}
Email: ${data.user_email}
Phone Number: ${data.user_phone}
Message: ${data.user_message || 'N/A'}
Thank You
Shark Velocity Website
        `;
        const templateParams = {
            to_email: YOUR_CLIENT_EMAIL,
            email_subject: emailSubject,
            email_body: emailBody,
            from_name: data.user_name,
            reply_to: data.user_email 
        };
        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );
            showStatusMessage("✅ Success! Your consultation is booked. We will contact you soon.", true);
            form.reset();
            setTimeout(hideStatusMessage, 7000); 
        } catch (error) {
            console.error('EmailJS sending error:', error);
            showStatusMessage(`❌ Failed to send. Error: ${error.text}`, false);
        } finally {
            setSubmitting(false);
        }
    }
    if (form) { 
        form.addEventListener('submit', handleSubmit);
    }


    // ====================================================================
    // 3. Active Navigation Link Highlighting on Scroll
    // ====================================================================
    const sections = document.querySelectorAll('main section');

    function activateNavLink() {
        let current = '';
        const scrollPos = window.scrollY + headerHeight + 50; 

        if (sections.length > 0) {
            sections.forEach(section => {
                if (scrollPos >= section.offsetTop) {
                    current = section.getAttribute('id');
                }
            });
            
            if (window.scrollY < sections[0].offsetTop - headerHeight - 50) {
                current = sections[0].getAttribute('id');
            }
        }

        navLinksList.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', activateNavLink);
    activateNavLink(); // Run on initial load


    // ====================================================================
    // 4. CLIENT VIDEO PLAY/PAUSE LOGIC
    // ====================================================================
    const videoWrappers = document.querySelectorAll('.client-video-wrapper');

    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('.client-video');
        const playIcon = wrapper.querySelector('.play-button-overlay i');

        if (video && playIcon) { 
            video.muted = true; 
            wrapper.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    video.muted = false; 
                    wrapper.classList.add('is-playing');
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                } else {
                    video.pause();
                    video.muted = true; 
                    video.load(); 
                    wrapper.classList.remove('is-playing');
                    playIcon.classList.remove('fa-pause');
                    playIcon.classList.add('fa-play');
                }
            });
            video.addEventListener('ended', () => {
                 video.pause();
                 video.muted = true; 
                 video.load(); 
                 wrapper.classList.remove('is-playing');
                 playIcon.classList.remove('fa-pause');
                 playIcon.classList.add('fa-play');
            });
        }
    });

    // ==================================
    // 5. FAQ ACCORDION LOGIC
    // ==================================
    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        const faqQuestions = faqContainer.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.closest('.faq-item');
                const answerContainer = item.querySelector('.faq-answer-container');
                if (!item || !answerContainer) return;

                const isAlreadyActive = item.classList.contains('active');

                faqContainer.querySelectorAll('.faq-item.active').forEach(activeItem => {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.faq-answer-container').style.maxHeight = 0;
                    activeItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });
                
                if (!isAlreadyActive) {
                    item.classList.add('active');
                    answerContainer.style.maxHeight = answerContainer.scrollHeight + 'px';
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // ==================================
    // 6. AI CHATBOT (GEMINI) LOGIC
    // ==================================
    const chatModalBackdrop = document.getElementById('chat-modal-backdrop');
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSubmitBtn = document.getElementById('chat-submit-btn');
    const chatMessages = document.getElementById('chat-messages');

    if (openChatBtn) {
        openChatBtn.addEventListener('click', () => {
            if(chatModalBackdrop) chatModalBackdrop.classList.remove('hidden');
        });
    }
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            if(chatModalBackdrop) chatModalBackdrop.classList.add('hidden');
        });
    }
    if (chatModalBackdrop) {
        chatModalBackdrop.addEventListener('click', (e) => {
            if (e.target === chatModalBackdrop) {
                chatModalBackdrop.classList.add('hidden');
            }
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessageToChat(userMessage, 'user');
        chatInput.value = '';
        setChatLoading(true);

        try {
            // MODIFIED: Call our own backend, not Google
            const aiResponse = await getGeminiResponse(userMessage);
            addMessageToChat(aiResponse, 'ai');
        } catch (error) {
            console.error("Gemini API Error:", error);
            addMessageToChat("Sorry, I'm having trouble connecting. Please try again later.", 'ai');
        } finally {
            setChatLoading(false);
        }
    }

    function addMessageToChat(message, sender) {
        const typingBubble = document.getElementById('typing-bubble');
        if (typingBubble) {
            typingBubble.remove();
        }

        if (!chatMessages) return;
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', sender);
        bubble.innerHTML = `<p>${message}</p>`; 
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setChatLoading(isLoading) {
        const typingBubble = document.getElementById('typing-bubble');
        if (isLoading) {
            if (!typingBubble && chatMessages) {
                const bubble = document.createElement('div');
                bubble.classList.add('chat-bubble', 'typing');
                bubble.id = 'typing-bubble';
                bubble.innerHTML = `<p>Pioneering AI is typing...</p>`;
                chatMessages.appendChild(bubble);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            if(chatSubmitBtn) chatSubmitBtn.disabled = true;
        } else {
            if (typingBubble) {
                typingBubble.remove();
            }
            if(chatSubmitBtn) chatSubmitBtn.disabled = false;
        }
    }

    // ======================================================
    // THIS FUNCTION IS NOW SECURE
    // It calls your middle-man, not Google.
    // ======================================================
    async function getGeminiResponse(userQuery) {
        // This is the path to your new serverless function
        // It's relative to your website's root.
        const proxyUrl = '/.netlify/functions/chat';

        try {
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery: userQuery }) // Send the user's query
            });

            if (!response.ok) {
                throw new Error(`Proxy server error: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
            return result.reply; // Return the AI's reply from your server

        } catch (error) {
            console.error("Error calling proxy function:", error);
            throw error; // Throw error to be caught by handleChatSubmit
        }
    }

}); // This is the closing tag for 'DOMContentLoaded'

