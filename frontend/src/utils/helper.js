// Helper function to parse browser string
export const parseBrowserString = (browserStr) => {
    try {
      // Remove quotes and split by comma
      const browsers = browserStr.replace(/"/g, '').split(',');
      // Get the first browser name
      return browsers[0].split(';')[0].trim();
    } catch (error) {
      console.warn('Failed to parse browser string:', error);
      return 'Unknown Browser';
    }
  };
  
  // Helper function to parse platform string
  export const parsePlatformString = (platformStr) => {
    try {
      // Remove quotes and get the platform
      return platformStr.replace(/"/g, '').trim();
    } catch (error) {
      console.warn('Failed to parse platform string:', error);
      return 'Unknown Platform';
    }
  };
  
  // Helper function to format date and time
  export const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
  
      // Format the date
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
  
      // Format the time
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
  
      // Add relative time
      let relativeTime = '';
      if (diffInSeconds < 60) {
        relativeTime = 'just now';
      } else if (diffInMinutes < 60) {
        relativeTime = `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        relativeTime = `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        relativeTime = `${diffInDays}d ago`;
      }
  
      return {
        date: formattedDate,
        time: formattedTime,
        relative: relativeTime
      };
    } catch (error) {
      console.warn('Failed to format date:', error);
      return {
        date: 'Unknown Date',
        time: 'Unknown Time',
        relative: ''
      };
    }
  };
  