# TOA Cares - Charity Website

A modern, responsive website for TOA Cares charity organization, featuring a clean design with the specified color palette and comprehensive functionality.

## 🎨 Design Features

### Color Palette
- **Space Cadet** (`#2B2D42`) - Primary dark blue-gray
- **Slate Gray** (`#708090`) - Medium gray-blue for text and accents
- **Tan** (`#D2B48C`) - Warm beige for highlights and branding
- **Coffee** (`#6F4E37`) - Rich brown for buttons and emphasis
- **Caput Mortuum** (`#592720`) - Dark reddish-brown for hover states

### Key Sections
- **Hero Section** - Compelling introduction with logo showcase
- **Mission Statement** - Clear organizational purpose
- **About Section** - Organization background with impact statistics
- **Programs** - Four main service areas with icons
- **News** - Latest updates and announcements
- **Volunteer** - Get involved section with application form
- **Donation** - Multiple giving options with impact examples
- **Contact** - Complete contact information and contact form
- **Footer** - Comprehensive site navigation and social links

## 🚀 Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Hamburger menu for mobile navigation
- Flexible grid layouts

### Interactive Elements
- Smooth scrolling navigation
- Animated counters for statistics
- Form validation and submission
- Hover effects and transitions
- Scroll-triggered animations
- Dynamic navbar background

### Accessibility
- Semantic HTML structure
- Proper contrast ratios
- Keyboard navigation support
- Screen reader friendly
- Focus indicators

## 📁 Project Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # Complete CSS styling
├── script.js           # Interactive functionality
└── README.md           # Project documentation
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript** - Interactive functionality
- **Font Awesome** - Icon library
- **CSS Variables** - Consistent color management

## 🎯 MVP Features Implemented

### Core Functionality
1. **Navigation** - Fixed header with smooth scrolling
2. **Hero Section** - Prominent call-to-action area
3. **Information Architecture** - Clear content organization
4. **Forms** - Donation, volunteer, and contact forms
5. **Responsive Design** - Works on all device sizes
6. **Visual Branding** - Consistent color scheme throughout

### Interactive Features
1. **Donation System** - Amount selection with custom input
2. **Volunteer Registration** - Application form with validation
3. **Contact Forms** - Multiple ways to get in touch
4. **Mobile Navigation** - Hamburger menu functionality
5. **Animations** - Scroll-triggered and hover effects
6. **Form Feedback** - Success messages and validation

## 🖥️ Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Features

- Touch-friendly navigation
- Optimized form inputs
- Readable typography scaling
- Efficient loading and performance
- Swipe-friendly interactions

## 🎨 Design Inspiration

The website design draws inspiration from modern academic and institutional websites while maintaining the warmth and approachability needed for a charity organization. The color palette creates a professional yet welcoming atmosphere that builds trust with potential donors and volunteers.

## 🔧 Customization

### Colors
All colors are defined as CSS variables in `:root` for easy customization:
```css
:root {
  --space-cadet: #2B2D42;
  --slate-gray: #708090;
  --tan: #D2B48C;
  --coffee: #6F4E37;
  --caput-mortuum: #592720;
}
```

### Content
- Update text content in `index.html`
- Replace placeholder images with actual photos
- Modify contact information
- Update social media links

### Functionality
- Form submission endpoints can be configured in `script.js`
- Additional interactive features can be added
- Payment processing integration available

## 📈 Performance Optimizations

- Minimal external dependencies
- Optimized CSS for fast rendering
- Efficient JavaScript event handling
- Proper image sizing and formatting
- CSS and JS minification ready

## 🚀 Deployment

The website is ready for deployment to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting

Simply upload all files to your web server or hosting platform.

## 📝 Future Enhancements

- Content Management System integration
- Online payment processing
- Event calendar functionality
- Volunteer portal
- Newsletter signup integration
- Multi-language support
- Blog/news management system

## 🤝 Contributing

This is a charity website template that can be customized for any charitable organization. Feel free to adapt the design and functionality for your specific needs.

## 📄 License

This project is open source and available for charitable organizations to use and modify as needed.

---

**TOA Cares** - Making a difference together through community support and advocacy.

## Payments (DOKU Checkout)

- Backend lives in `server/` and serves the static site plus payment APIs.
- Setup:
  1. `cd server && npm install`
  2. Copy `.env.example` to `.env` and fill `DOKU_CLIENT_ID` and `DOKU_SECRET_KEY` from your DOKU Sandbox.
  3. `npm start` then open `http://localhost:3000`.
- Donation flow:
  - The Donate form calls `POST /api/donations`, creates a DOKU Checkout session, and opens the hosted payment.
  - Webhook endpoint: `POST /api/webhooks/doku` (configure in DOKU dashboard). Logs to `doku-webhook.log`.
  - Success/failed pages: `/payment/success` and `/payment/failed`.