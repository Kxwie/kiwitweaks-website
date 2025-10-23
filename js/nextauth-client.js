/**
 * NextAuth Client-Side JavaScript
 * Works with vanilla HTML/JavaScript (no React needed!)
 */

(function() {
    'use strict';

    // NextAuth API endpoints
    const API = {
        session: '/api/auth/session',
        signin: '/api/auth/signin',
        signout: '/api/auth/signout',
        csrf: '/api/auth/csrf',
    };

    /**
     * Get current session
     */
    async function getSession() {
        try {
            const response = await fetch(API.session);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    /**
     * Sign in with credentials
     */
    async function signInWithCredentials(email, password) {
        try {
            const csrfToken = await getCSRFToken();
            
            const response = await fetch(API.signin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email,
                    password,
                    csrfToken,
                    callbackUrl: window.location.origin,
                    json: true,
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            if (data.url) {
                window.location.href = data.url;
            }

            return data;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    /**
     * Sign in with OAuth provider
     */
    async function signInWithProvider(provider) {
        const csrfToken = await getCSRFToken();
        
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'post';
        form.action = `/api/auth/signin/${provider}`;
        
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfToken';
        csrfInput.value = csrfToken;
        
        const callbackInput = document.createElement('input');
        callbackInput.type = 'hidden';
        callbackInput.name = 'callbackUrl';
        callbackInput.value = window.location.origin;
        
        form.appendChild(csrfInput);
        form.appendChild(callbackInput);
        document.body.appendChild(form);
        form.submit();
    }

    /**
     * Sign out
     */
    async function signOut() {
        try {
            const csrfToken = await getCSRFToken();
            
            const response = await fetch(API.signout, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    csrfToken,
                    callbackUrl: window.location.origin,
                }),
            });

            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    /**
     * Get CSRF token
     */
    async function getCSRFToken() {
        try {
            const response = await fetch(API.csrf);
            const data = await response.json();
            return data.csrfToken;
        } catch (error) {
            console.error('Error getting CSRF token:', error);
            return '';
        }
    }

    /**
     * Check if user is authenticated
     */
    async function isAuthenticated() {
        const session = await getSession();
        return session && session.user;
    }

    /**
     * Update UI based on authentication state
     */
    async function updateAuthUI() {
        const session = await getSession();
        
        if (session && session.user) {
            // User is logged in
            const loginLink = document.querySelector('.nav-link-auth');
            if (loginLink) {
                loginLink.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>${session.user.name || session.user.email}</span>
                `;
                loginLink.href = '#';
                loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showUserMenu(session.user);
                });
            }
        } else {
            // User is not logged in
            const loginLink = document.querySelector('.nav-link-auth');
            if (loginLink) {
                loginLink.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span>Login</span>
                `;
                loginLink.href = 'auth.html';
            }
        }
    }

    /**
     * Show user menu dropdown
     */
    function showUserMenu(user) {
        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'user-menu-dropdown';
        menu.innerHTML = `
            <div class="user-menu-header">
                <strong>${user.name || user.email}</strong>
            </div>
            <a href="#" class="user-menu-item" data-action="profile">
                <i class="fas fa-user"></i> Profile
            </a>
            <a href="#" class="user-menu-item" data-action="downloads">
                <i class="fas fa-download"></i> Downloads
            </a>
            <hr>
            <a href="#" class="user-menu-item" data-action="signout">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </a>
        `;

        // Position and show menu
        document.body.appendChild(menu);

        // Handle menu actions
        menu.addEventListener('click', async (e) => {
            e.preventDefault();
            const action = e.target.closest('[data-action]')?.dataset.action;
            
            if (action === 'signout') {
                await signOut();
            } else if (action === 'profile') {
                window.location.href = '/profile.html';
            } else if (action === 'downloads') {
                window.location.href = '/downloads.html';
            }
            
            menu.remove();
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    /**
     * Initialize NextAuth on page load
     */
    function init() {
        // Update auth UI
        updateAuthUI();

        // Add OAuth button handlers
        const discordBtn = document.querySelector('[data-provider="discord"]');
        if (discordBtn) {
            discordBtn.addEventListener('click', () => signInWithProvider('discord'));
        }

        const googleBtn = document.querySelector('[data-provider="google"]');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => signInWithProvider('google'));
        }

        const githubBtn = document.querySelector('[data-provider="github"]');
        if (githubBtn) {
            githubBtn.addEventListener('click', () => signInWithProvider('github'));
        }

        console.log('✅ NextAuth client initialized');
    }

    // Export functions to global scope
    window.NextAuth = {
        getSession,
        signInWithCredentials,
        signInWithProvider,
        signOut,
        isAuthenticated,
        updateAuthUI,
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
