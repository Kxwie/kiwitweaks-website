/**
 * Discord Member Count Fetcher
 * Fetches and displays the current Discord server member count
 */

(function() {
    'use strict';

    // Discord server invite code
    const DISCORD_INVITE_CODE = 'acWc7tnVeS';
    
    // Fetch Discord member count
    async function fetchDiscordMemberCount() {
        try {
            const response = await fetch(`https://discord.com/api/v9/invites/${DISCORD_INVITE_CODE}?with_counts=true`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch Discord stats');
            }
            
            const data = await response.json();
            const memberCount = data.approximate_member_count || 5000;
            
            // Format the number with comma separator
            const formattedCount = memberCount.toLocaleString();
            
            // Update the member count in the DOM
            const memberCountElements = document.querySelectorAll('#discord-members');
            memberCountElements.forEach(element => {
                element.textContent = formattedCount;
                element.classList.add('updated');
            });
            
            // Also update hero stats if present
            const heroStatElement = document.querySelector('.stat-value[data-count="5000"]');
            if (heroStatElement) {
                heroStatElement.setAttribute('data-count', memberCount);
                heroStatElement.textContent = formattedCount;
            }
            
            console.log('Discord member count updated:', formattedCount);
            
        } catch (error) {
            console.warn('Could not fetch Discord member count:', error);
            // Keep the fallback value in the HTML
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchDiscordMemberCount);
    } else {
        fetchDiscordMemberCount();
    }
})();
