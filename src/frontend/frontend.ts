import '@/frontend/styles.less';
import { loadFullScreenContainer } from '@/frontend/components/container/container';
import { TestSpinner } from '@/frontend/components/TestSpinner';

// Initialize when DOM is ready
jQuery(async () => {
  await loadFullScreenContainer();
  const cardManager = new TestSpinner();
  cardManager.setupEventListeners();

  // Expose for debugging in console
  (window as unknown as { cardManager: TestSpinner }).cardManager = cardManager;
  console.log('CardManager available globally as window.cardManager');
  console.log('Try: cardManager.pingBackend(5) for 5-second delay test');
});
