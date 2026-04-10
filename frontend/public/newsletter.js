/**
 * Newsletter Subscription System for Wasteland Zero
 * Collects emails for updates and announcements
 */

const Newsletter = {
  async init() {
    console.log('Newsletter initialized');
  },
  
  show() {
    const modal = document.getElementById('newsletter-modal');
    if (!modal) {
      console.error('Newsletter modal not found');
      return;
    }
    
    modal.classList.add('show');
    
    // Reset form
    const form = document.getElementById('nl-form');
    const input = document.getElementById('nl-email-input');
    const success = document.getElementById('nl-success');
    const error = document.getElementById('nl-error');
    
    if (form) form.reset();
    if (success) success.classList.remove('show');
    if (error) error.classList.remove('show');
    if (input) input.disabled = false;
  },
  
  hide() {
    const modal = document.getElementById('newsletter-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  },
  
  async subscribe(event) {
    if (event) event.preventDefault();
    
    const input = document.getElementById('nl-email-input');
    const submitBtn = document.getElementById('nl-submit-btn');
    const successDiv = document.getElementById('nl-success');
    const errorDiv = document.getElementById('nl-error');
    
    if (!input || !submitBtn || !successDiv || !errorDiv) {
      console.error('Newsletter form elements not found');
      return;
    }
    
    const email = input.value.trim();
    
    // Basic validation
    if (!email || !this.isValidEmail(email)) {
      errorDiv.textContent = '❌ Please enter a valid email address';
      errorDiv.classList.add('show');
      successDiv.classList.remove('show');
      return;
    }
    
    // Disable form during submission
    input.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBSCRIBING...';
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
      const apiUrl = window.BACKEND_URL || '';
      const response = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          source: 'game_title_screen'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (data.already_subscribed) {
          successDiv.textContent = '✅ You\'re already subscribed!';
        } else {
          successDiv.textContent = '🎉 Successfully subscribed! Check your email for updates.';
        }
        successDiv.classList.add('show');
        input.value = '';
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          this.hide();
        }, 3000);
        
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      errorDiv.textContent = `❌ ${error.message}`;
      errorDiv.classList.add('show');
      input.disabled = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '📧 SUBSCRIBE';
    }
  },
  
  isValidEmail(email) {
    // Basic email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.Newsletter = Newsletter;
  Newsletter.init();
}
