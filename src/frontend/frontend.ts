import '@/frontend/styles.less';
import { loadFullScreenContainer } from '@/frontend/components/container/container';
import { CardManager } from '@/frontend/components/card-manager';

// Initialize when DOM is ready
jQuery(async () => {
  await loadFullScreenContainer();
  const cardManager = new CardManager();
  cardManager.setupEventListeners();

  // Expose for debugging in console
  (window as unknown as { cardManager: CardManager }).cardManager = cardManager;
  console.log('CardManager available globally as window.cardManager');
  console.log('Try: cardManager.pingBackend(5) for 5-second delay test');
});
