import * as styles from '@/frontend/spinner.module.less';
import { SPINNER } from './div-ids';

function spinnerTemplate() {
  return `<div id="${SPINNER}" class="${styles.spinner}"></div>`;
}

export class Spinner {
  private spinnerElement: HTMLElement;

  constructor() {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = spinnerTemplate();
    this.spinnerElement = tempDiv.firstElementChild as HTMLElement;
  }

  show() {
    document.body.appendChild(this.spinnerElement);
  }

  hide() {
    if (this.spinnerElement.parentNode) {
      this.spinnerElement.parentNode.removeChild(this.spinnerElement);
    }
  }
}
