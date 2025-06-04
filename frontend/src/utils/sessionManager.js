import useAuthStore from '../store/useAuthStore';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.lastActivity = Date.now();
    this.setupActivityListeners();
  }

  setupActivityListeners() {
    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.updateLastActivity());
    });
  }

  updateLastActivity() {
    this.lastActivity = Date.now();
    this.resetTimers();
  }

  resetTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }

    // Set warning timeout
    this.warningTimeoutId = setTimeout(() => {
      this.showTimeoutWarning();
    }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT);

    // Set session timeout
    this.timeoutId = setTimeout(() => {
      this.handleSessionTimeout();
    }, SESSION_TIMEOUT);
  }

  showTimeoutWarning() {
    // Create warning modal
    const warningModal = document.createElement('div');
    warningModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    warningModal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 class="text-xl font-semibold mb-4">Session Timeout Warning</h2>
        <p class="mb-4">Your session will expire in 5 minutes due to inactivity. Would you like to stay logged in?</p>
        <div class="flex justify-end gap-4">
          <button id="extendSession" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Stay Logged In
          </button>
          <button id="logoutNow" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            Logout Now
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(warningModal);

    // Add event listeners
    document.getElementById('extendSession').addEventListener('click', () => {
      this.updateLastActivity();
      document.body.removeChild(warningModal);
    });

    document.getElementById('logoutNow').addEventListener('click', () => {
      this.handleSessionTimeout();
      document.body.removeChild(warningModal);
    });
  }

  handleSessionTimeout() {
    const { logout } = useAuthStore.getState();
    logout();
    window.location.href = '/';
  }

  start() {
    this.resetTimers();
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }
  }
}

export const sessionManager = new SessionManager(); 