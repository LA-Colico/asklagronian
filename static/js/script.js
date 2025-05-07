document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesContainer = document.querySelector('.messages-container');

    // Function to add new message to the chat
    function addMessage(content, role, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;

        let messageHTML = '';

        if (role === 'assistant') {
            messageHTML = `
                <div class="message-avatar">
                    <img src="/static/images/bot_avatar.png" alt="User">
                </div>
                <div class="message-content">
                    <div class="text-content">${content}</div>
                    <div class="message-timestamp">${timestamp}</div>
                </div>
            `;
        } else {
            messageHTML = `
                <div class="message-content">
                    <div class="text-content">${content}</div>
                    <div class="message-timestamp">${timestamp}</div>
                </div>
                <div class="user-avatar">
                    <img src="/static/images/user_avatar.png" alt="User">
                </div>
            `;
        }

        messageDiv.innerHTML = messageHTML;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to show typing effect for bot responses
    function showTypingEffect(message, element) {
        // Clear any existing content first
        const textContentDiv = element.querySelector('.text-content');
        textContentDiv.textContent = '';

        // Create and show the typing indicator while processing
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        textContentDiv.appendChild(typingIndicator);

        // Start typing effect after showing the thinking animation
        setTimeout(() => {
            // Remove the typing indicator
            textContentDiv.removeChild(typingIndicator);

            // Type out the message character by character
            const characters = message.split('');
            let currentIndex = 0;

            // Calculate delay based on message length to finish in ~1 second
            const totalTypingTime = 1000; // 1 second in milliseconds
            const baseDelay = totalTypingTime / characters.length;

            function typeNextCharacter() {
                if (currentIndex < characters.length) {
                    textContentDiv.textContent += characters[currentIndex];
                    currentIndex++;

                    // Add slight randomness but keep it fast
                    const randomDelay = Math.floor(Math.random() * 3) + baseDelay;
                    setTimeout(typeNextCharacter, randomDelay);
                }
            }

            typeNextCharacter();
        }, 1000); // Reduced to 1 second from 1.5 seconds
    }

    // Function to get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Function to handle message sending
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        const currentTime = getCurrentTime();

        // Add user message to the chat
        addMessage(message, 'user', currentTime);

        // Clear input
        userInput.value = '';

        // Show thinking/loading effect
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message assistant-message';
        thinkingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="/static/images/bot_avatar.png" alt="Profile">
            </div>
            <div class="message-content">
                <div class="thinking-animation">
                    <div class="thinking-bubble"></div>
                    <div class="thinking-bubble"></div>
                    <div class="thinking-bubble"></div>
                </div>
                <div class="text-content"></div>
                <div class="message-timestamp">${currentTime}</div>
            </div>
        `;
        messagesContainer.appendChild(thinkingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Send message to the backend
        fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            // Remove thinking animation
            const thinkingAnimation = thinkingDiv.querySelector('.thinking-animation');
            if (thinkingAnimation) {
                thinkingAnimation.remove();
            }

            // Start typing effect for the response
            showTypingEffect(data.response, thinkingDiv);
        })
        .catch(error => {
            console.error('Error:', error);
            const thinkingAnimation = thinkingDiv.querySelector('.thinking-animation');
            if (thinkingAnimation) {
                thinkingAnimation.remove();
            }
            showTypingEffect('Sorry, I encountered an error while processing your request.', thinkingDiv);
        });
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    // Tabs functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Nav items functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Section items functionality
    const sectionItems = document.querySelectorAll('.section-item');
    sectionItems.forEach(item => {
        item.addEventListener('click', function() {
            sectionItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Recent chats dropdown
    const recentHeader = document.querySelector('.recent-header');
    const chatList = document.querySelector('.chat-list');

    recentHeader.addEventListener('click', function() {
        chatList.classList.toggle('hidden');
        const icon = recentHeader.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    // Chat actions
    const chatActions = document.querySelectorAll('.chat-actions i');
    chatActions.forEach(action => {
        action.addEventListener('click', function(e) {
            e.stopPropagation();
            const chatItem = this.closest('.chat-item');

            if (this.classList.contains('fa-trash')) {
                chatItem.classList.add('deleting');
                setTimeout(() => {
                    chatItem.remove();
                }, 300);
            } else if (this.classList.contains('fa-edit')) {
                // Edit functionality would go here
                console.log('Edit chat');
            }
        });
    });

    // Add placeholder profile images for demonstration
    function setupPlaceholderImages() {
        const profilePic = document.querySelector('.profile-pic img');
        const userAvatars = document.querySelectorAll('.user-avatar img');

        // Set profile image from static file with fallback
        profilePic.src = "/static/images/user_avatar.png";
        profilePic.onerror = function() {
            // Fallback to generated avatar if image fails to load
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#4a69bd';
            ctx.fillRect(0, 0, 100, 100);
            ctx.fillStyle = '#ffffff';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('G', 50, 50);
            profilePic.src = canvas.toDataURL();
        };

        // Set user avatars from static file with fallback
        userAvatars.forEach(avatar => {
            avatar.src = "/static/images/user.png";
            avatar.onerror = function() {
                // Fallback to generated avatar if image fails to load
                const userCanvas = document.createElement('canvas');
                userCanvas.width = 100;
                userCanvas.height = 100;
                const userCtx = userCanvas.getContext('2d');
                userCtx.fillStyle = '#6ab04c';
                userCtx.fillRect(0, 0, 100, 100);
                userCtx.fillStyle = '#ffffff';
                userCtx.font = '40px Arial';
                userCtx.textAlign = 'center';
                userCtx.textBaseline = 'middle';
                userCtx.fillText('U', 50, 50);
                avatar.src = userCanvas.toDataURL();
            };
        });
    }

    // Call the function to set up placeholder images
    setupPlaceholderImages();

    // Add animation to messages
    function animateMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach((message, index) => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(20px)';
            message.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            setTimeout(() => {
                message.style.opacity = '1';
                message.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Call the animation function
    animateMessages();
});

// Add dark mode support
function setupDarkMode() {
    // Check for user preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Add CSS for dark mode
    const darkModeStyles = document.createElement('style');
    darkModeStyles.textContent = `
        body.dark-mode {
            --bg-color: #2d3436;
            --sidebar-color: #3b4a4d;
            --header-color: #3b4a4d;
            --text-color: #b2bec3;
            --accent-color: #6ab04c;
            --white-color: #2d3436;
            --black-color: #dfe6e9;
            --gray-light: #636e72;
            --shadow-color: rgba(0, 0, 0, 0.3);
        }

        body.dark-mode .assistant-message .message-content {
            background-color: #3b4a4d;
            color: #dfe6e9;
        }

        body.dark-mode .message-input,
        body.dark-mode .chat-item {
            background-color: #3b4a4d;
        }

        body.dark-mode .input-container input {
            color: #dfe6e9;
        }

        /* Dark mode support for typing and thinking animations */
        body.dark-mode .thinking-bubble {
            background-color: #636e72;
        }

        body.dark-mode .typing-indicator span {
            background-color: #6ab04c;
        }
    `;
    document.head.appendChild(darkModeStyles);

    // Add CSS for thinking and typing animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        /* Thinking animation (shown before typing starts) */
        .thinking-animation {
            display: flex;
            padding: 6px 0;
        }

        .thinking-bubble {
            background-color: #e2e2e2;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin: 0 2px;
            opacity: 0.6;
            animation: thinking 1.4s infinite ease-in-out both;
        }

        .thinking-bubble:nth-child(1) {
            animation-delay: -0.32s;
        }

        .thinking-bubble:nth-child(2) {
            animation-delay: -0.16s;
        }

        @keyframes thinking {
            0%, 80%, 100% {
                transform: scale(0.6);
            }
            40% {
                transform: scale(1);
            }
        }

        /* Typing indicator shown briefly before characters appear */
        .typing-indicator {
            display: flex;
            padding: 6px 0;
        }

        .typing-indicator span {
            height: 8px;
            width: 8px;
            background-color: #6ab04c;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
            animation: typingBounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) {
            animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay: -0.16s;
        }

        @keyframes typingBounce {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }

        /* Ensure the text-content div has proper styling for the typing effect */
        .message-content .text-content {
            min-height: 20px;
            white-space: pre-wrap;
            word-break: break-word;
        }
    `;
    document.head.appendChild(animationStyles);
}

// Initialize dark mode
setupDarkMode();