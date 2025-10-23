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
            // User is logged in - show profile dropdown
            document.body.classList.add('logged-in');
            createProfileDropdown(session.user);
        } else {
            // User is not logged in - show login button
            document.body.classList.remove('logged-in');
            removeProfileDropdown();
        }
    }

    /**
     * Create profile dropdown in navbar
     */
    function createProfileDropdown(user) {
        // Remove existing profile dropdown if any
        removeProfileDropdown();
        
        // Get navbar auth actions container
        const authActions = document.querySelector('.nav-auth-actions');
        if (!authActions) return;
        
        // Create profile dropdown HTML
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown visible';
        
        // Get user initials
        const initials = getUserInitials(user.name || user.email);
        const displayName = user.name || user.email.split('@')[0];
        const isPremium = user.role === 'premium' || user.role === 'admin';
        
        dropdown.innerHTML = `
            <div class="profile-trigger">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-info">
                    <div class="profile-name">
                        ${displayName}
                        ${isPremium ? '<span class="profile-badge"><i class="fas fa-crown"></i> Premium</span>' : ''}
                    </div>
                    <div class="profile-email">${user.email}</div>
                </div>
                <i class="fas fa-chevron-down profile-arrow"></i>
            </div>
            <div class="profile-menu">
                <div class="profile-menu-header">
                    <strong>${user.name || 'User'}</strong>
                    <span>${user.email}</span>
                </div>
                <a href="/profile.html" class="profile-menu-item" data-action="profile">
                    <i class="fas fa-user"></i>
                    <span>My Profile</span>
                </a>
                <a href="/downloads.html" class="profile-menu-item" data-action="downloads">
                    <i class="fas fa-download"></i>
                    <span>My Downloads</span>
                </a>
                <a href="/settings.html" class="profile-menu-item" data-action="settings">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
                <hr>
                <button class="profile-menu-item" data-action="signout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                </button>
            </div>
        `;
        
        // Insert at the beginning of auth actions (replacing login button position)
        authActions.insertBefore(dropdown, authActions.firstChild);
        
        // Add click handlers
        const trigger = dropdown.querySelector('.profile-trigger');
        const menu = dropdown.querySelector('.profile-menu');
        const signoutBtn = dropdown.querySelector('[data-action="signout"]');
        
        // Toggle dropdown on click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Handle sign out
        if (signoutBtn) {
            signoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await signOut();
            });
        }
        
        console.log('✅ Profile dropdown created for:', user.email);
    }

    /**
     * Remove profile dropdown
     */
    function removeProfileDropdown() {
        const existing = document.querySelector('.profile-dropdown');
        if (existing) {
            existing.remove();
        }
    }

    /**
     * Get user initials from name or email
     */
    function getUserInitials(nameOrEmail) {
        if (!nameOrEmail) return 'U';
        
        const name = nameOrEmail.split('@')[0]; // Remove email domain if present
        const parts = name.split(' ');
        
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        
        return name.substring(0, 2).toUpperCase();
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
