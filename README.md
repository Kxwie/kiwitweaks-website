# KiwiTweaks Website

A modern, 3D-inspired website for KiwiTweaks, a system optimization tool that enhances gaming and system performance. This website features a responsive design, smooth animations, interactive 3D elements, and a complete conversion-optimized layout.

## 🚀 Features

- **3D Visualizations**: Interactive 3D elements powered by Three.js
- **Fully Responsive**: Works on all device sizes from mobile to desktop
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Features Section**: Showcases 6 key product features with icons
- **Pricing Comparison**: Three pricing tiers with detailed feature comparison
- **Download Section**: Clear download CTA with system requirements
- **FAQ Section**: Interactive accordion with 6 common questions
- **Mobile Menu**: Responsive hamburger menu for mobile devices
- **Legal Pages**: Comprehensive Privacy Policy, User Agreement, and Refund Policy
- **Testimonials**: Dynamic testimonial carousel showcasing user feedback
- **Cookie Consent**: GDPR-compliant cookie consent banner
- **SEO Optimized**: Complete meta tags, sitemap, and robots.txt

## 📁 Project Structure

```
├── index.html              # Main landing page (enhanced with new sections)
├── benchmarks.html         # Performance benchmarks page
├── privacy-policy.html     # Privacy policy page
├── user-agreement.html     # User agreement page
├── refund-policy.html      # Refund policy page
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
├── netlify.toml           # Netlify configuration
├── css/
│   ├── style.css          # Main stylesheet
│   ├── animations.css     # Animation styles
│   ├── hero.css          # Hero section styles
│   ├── new-sections.css  # NEW: Features, Pricing, FAQ, Download sections
│   ├── clean-tabs.css    # Product tabs
│   ├── comparison.css    # Feature comparison table
│   └── testimonial-carousel-new.css # Testimonial carousel
├── js/
│   ├── main.js           # Main JavaScript
│   ├── ui-components.js  # NEW: Mobile menu & FAQ accordion
│   ├── animations.js     # Animation engine
│   ├── hero-animation.js # Hero 3D effects
│   └── testimonial-carousel-new.js # Testimonial slider
└── assets/
    └── images/
        └── icons.svg      # SVG icon definitions
```

## 🛠️ Technologies Used

**This is a pure HTML/CSS/JavaScript website - NO frameworks!**

- **HTML5**: Semantic markup for better accessibility and SEO
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **JavaScript (ES6+)**: Vanilla JS - no jQuery, React, Vue, or Angular
- **Three.js**: For 3D visualizations and animations
- **Font Awesome 6.4.0**: For icons
- **Google Fonts**: Inter font family for typography
- **gl-matrix 2.8.1**: For matrix operations in 3D

## ✨ Recent Improvements (Oct 2025)

### Latest Updates (Oct 22)
- 🎉 **3D Particle Background** - Interactive floating particles with Three.js
- 🔝 **Scroll-to-Top Fix** - Always starts at page top on load/refresh
- 📊 **Benchmarks Section** - Prominent performance metrics on homepage
- 🎯 **Enhanced Benchmarks Page** - Improved navigation and SEO

### New Sections Added
- ✅ **Features Section** - 6 key product features with icons
- ✅ **Benchmarks Section** - Real-world performance metrics
- ✅ **Pricing Section** - 3 pricing tiers with comparison
- ✅ **Download Section** - Clear CTA with system requirements
- ✅ **FAQ Section** - Interactive accordion with 6 Q&As

### Bug Fixes
- ✅ Fixed broken social media links (Discord, Twitter, GitHub)
- ✅ Fixed unclosed div in cookie consent banner
- ✅ Updated footer navigation (removed non-existent pages)
- ✅ Fixed all internal anchor links
- ✅ Fixed scroll position on page load

### Mobile Improvements
- ✅ Added responsive hamburger menu
- ✅ Mobile-optimized all new sections
- ✅ Touch-friendly interactions
- ✅ Breakpoints at 1024px, 768px, 480px

### SEO Enhancements
- ✅ Added Open Graph meta tags
- ✅ Added Twitter Card meta tags
- ✅ Created robots.txt
- ✅ Created sitemap.xml
- ✅ Enhanced meta descriptions and keywords
- ✅ Benchmarks page SEO optimization

For a complete list of improvements, see:
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Full documentation
- [LATEST-IMPROVEMENTS.md](LATEST-IMPROVEMENTS.md) - Oct 22 updates

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/kiwitweaks-website.git
   cd kiwitweaks-website
   ```

2. Open `index.html` in your web browser to view the website locally.

## 🎨 Customization

### Colors

Edit the CSS variables in `css/style.css` to customize the color scheme:

```css
:root {
    --primary: #8a2be2;
    --primary-light: #9d4edd;
    --secondary: #00ff88;
    --dark: #1a1a2e;
    --dark-2: #16213e;
    --light: #f8f9fa;
    --gray: #6c757d;
    --radius: 8px;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
}
```

### 3D Elements

To modify the 3D elements, edit the `init3DVisualization()` function in `js/main.js`.

## 🌐 Browser Support

The website is tested and works on:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 12+)
- Chrome for Android (latest)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or feedback, please join our [Discord server](https://discord.gg/RT6SCASxUJ).

---

Built with ❤️ by the KiwiTweaks Team
