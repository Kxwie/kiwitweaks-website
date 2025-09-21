class CleanTabs {
    constructor(containerSelector = '.tab-system') {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.warn('Tab system container not found');
            return;
        }
        
        this.tabButtons = Array.from(this.container.querySelectorAll('.tab-button'));
        this.tabContents = Array.from(this.container.querySelectorAll('.tab-content'));
        this.transitionDuration = 300; // ms
        
        this.init();
    }
    
    init() {
        if (!this.tabButtons.length || !this.tabContents.length) {
            console.warn('No tab buttons or contents found');
            return;
        }

        // Set up ARIA attributes
        this.tabButtons.forEach((button, index) => {
            const tabId = button.getAttribute('data-tab');
            const content = this.container.querySelector(`#${tabId}`);
            
            if (!content) {
                console.warn(`No content found for tab: ${tabId}`);
                return;
            }
            
            // Set ARIA attributes
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('aria-controls', tabId);
            button.setAttribute('tabindex', '-1');
            
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-labelledby', button.id || `tab-${index}`);
            content.setAttribute('tabindex', '0');
            
            // Add event listeners
            button.addEventListener('click', (e) => this.switchTab(e));
            button.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
        });
        
        // Show first tab by default
        this.showTab(this.tabButtons[0], false);
    }
    
    handleKeyDown(event, currentIndex) {
        let newIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                newIndex = (currentIndex - 1 + this.tabButtons.length) % this.tabButtons.length;
                this.tabButtons[newIndex].focus();
                this.showTab(this.tabButtons[newIndex]);
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                newIndex = (currentIndex + 1) % this.tabButtons.length;
                this.tabButtons[newIndex].focus();
                this.showTab(this.tabButtons[newIndex]);
                break;
                
            case 'Home':
                event.preventDefault();
                this.tabButtons[0].focus();
                this.showTab(this.tabButtons[0]);
                break;
                
            case 'End':
                event.preventDefault();
                const lastIndex = this.tabButtons.length - 1;
                this.tabButtons[lastIndex].focus();
                this.showTab(this.tabButtons[lastIndex]);
                break;
        }
    }
    
    switchTab(event) {
        event.preventDefault();
        const button = event.currentTarget;
        this.showTab(button);
    }
    
    async showTab(button, animate = true) {
        if (!button) return;
        
        const tabId = button.getAttribute('data-tab');
        const content = this.container.querySelector(`#${tabId}`);
        
        if (!content) {
            console.warn(`No content found for tab: ${tabId}`);
            return;
        }
        
        // Update active states
        this.tabButtons.forEach(btn => {
            const isSelected = btn === button;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-selected', isSelected);
            btn.setAttribute('tabindex', isSelected ? '0' : '-1');
        });
        
        // Handle content transition
        if (animate) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(10px)';
            content.style.transition = 'none';
            
            // Force repaint
            content.offsetHeight;
            
            content.style.transition = `opacity ${this.transitionDuration}ms ease-out, transform ${this.transitionDuration}ms ease-out`;
        }
        
        // Update content visibility
        this.tabContents.forEach(tabContent => {
            const isActive = tabContent === content;
            tabContent.classList.toggle('active', isActive);
            tabContent.setAttribute('aria-hidden', !isActive);
            
            if (isActive) {
                tabContent.style.display = 'block';
                if (animate) {
                    // Trigger reflow and start animation
                    requestAnimationFrame(() => {
                        tabContent.style.opacity = '1';
                        tabContent.style.transform = 'translateY(0)';
                    });
                }
            } else {
                tabContent.style.display = 'none';
            }
        });
        
        // Focus the content for screen readers
        if (button.getAttribute('aria-selected') === 'true') {
            content.focus();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CleanTabs();
});
