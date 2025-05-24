import {
  CONTENT,
  ADD_CARD,
  CARD,
  LOADING,
  PROTOCARD_COUNT,
  SSE_STATUS,
} from '@/frontend/utils/div-ids';
import * as styles from '@/frontend/components/container/container.module.less';
import { sseService } from '@/frontend/services/sse-service';

export function getScreen2Content(protocardCount: number): string {
  const sseStatus = sseService.isSSEConnected()
    ? '🟢 Connected'
    : '🔴 Disconnected';
  return `
    <div>
      <h1>Screen 2 - Protocards View</h1>
      <div id="${CONTENT}">
        <div class="${styles.infoBox}">
          <h3>Protocards Count</h3>
          <div id="${PROTOCARD_COUNT}" class="${styles.countDisplay}">
            Total: ${protocardCount}
          </div>
        </div>
        <div class="${styles.infoBox}">
          <h3>Server Connection</h3>
          <div id="${SSE_STATUS}" class="${styles.statusDisplay}">
            SSE Status: ${sseStatus}
          </div>
        </div>
        <button id="${ADD_CARD}">Add Protocard</button>
        <div id="${CARD}"></div>
      </div>
      <div id="${LOADING}"></div>
    </div>
  `;
}
