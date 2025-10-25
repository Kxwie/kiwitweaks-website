/**
 * Purchase Modal - DISABLED STUB
 * This file replaces the old purchase-modal.js which was causing UI overlapping issues
 * Purchase functionality now handled by demo-purchase-system.js
 */

(function() {
    'use strict';
    
    console.log('[Purchase Modal] Disabled - using demo-purchase-system.js for purchases');
    
    // Empty stubs to prevent errors if other code tries to call these
    window.openPurchaseModal = function() {
        console.log('[Purchase Modal] Redirecting to profile page for purchases');
        window.location.href = 'profile.html';
    };
    
    window.closePurchaseModal = function() {
        // Do nothing
    };
    
    window.startPurchaseFlow = function() {
        console.log('[Purchase Modal] Redirecting to profile page for purchases');
        window.location.href = 'profile.html';
    };
})();
