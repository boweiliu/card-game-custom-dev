import * as styles from '@/frontend/spinner.module.less';
import { SPINNER, $id, APP_ROOT } from './div-ids';

function spinnerTemplate() {
  return `<div id="${SPINNER}" class="${styles.spinner}"></div>`;
}

export class Spinner {
  private spinnerElement: JQuery<HTMLElement>;

  constructor() {
    const tempDiv = $('<div>');
    tempDiv.html(spinnerTemplate());
    this.spinnerElement = tempDiv.children().first();
  }

  show() {
    const appRoot = $id(APP_ROOT);
    appRoot.append(this.spinnerElement);
  }

  hide() {
    this.spinnerElement.detach();
  }
}
