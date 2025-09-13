import { router } from 'expo-router';

export class NavigationUtils {
  /**
   * Reset navigation stack and redirect to a specific route
   * This prevents back navigation to authenticated screens after logout
   */
  static async resetToRoute(routePath: string) {
    try {
      // For Expo Router, we need to be careful about how we reset the stack
      // The best approach is to use router.replace with the push approach
      
      // Method 1: Direct replace (simplest)
      router.replace(routePath as any);
      
      // Additional safety: If the user can still go back after a replace,
      // we'll push the route and then replace it to ensure a clean stack
      setTimeout(() => {
        if (router.canGoBack()) {
          console.log('Navigation stack not properly reset, attempting alternative method');
          // Push the route again to ensure it's the only route in the stack
          router.push(routePath as any);
          // Then immediately replace to clean up
          setTimeout(() => {
            router.replace(routePath as any);
          }, 50);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error resetting navigation:', error);
      // Fallback - just replace current route
      router.replace(routePath as any);
    }
  }

  /**
   * Navigate to home screen and reset navigation stack
   * Used for logout functionality
   */
  static async resetToHome() {
    console.log('🏠 Resetting navigation to home screen');
    return this.resetToRoute('/home');
  }

  /**
   * Navigate to auth screen and reset navigation stack
   */
  static async resetToAuth() {
    console.log('🔐 Resetting navigation to auth screen');
    return this.resetToRoute('/auth');
  }

  /**
   * Check if we can go back in navigation
   */
  static canGoBack(): boolean {
    return router.canGoBack();
  }

  /**
   * Force clear navigation by going through index
   * This is a more aggressive approach for stubborn navigation stacks
   */
  static async forceResetToRoute(routePath: string) {
    try {
      console.log('🔄 Force resetting navigation stack');
      
      // Step 1: Go to index to reset everything
      router.replace('/');
      
      // Step 2: Wait a bit for navigation to process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Step 3: Navigate to target route
      router.replace(routePath as any);
      
    } catch (error) {
      console.error('Error force resetting navigation:', error);
      // Ultimate fallback
      router.replace(routePath as any);
    }
  }
}