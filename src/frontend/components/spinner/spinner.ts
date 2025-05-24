import * as styles from '@/frontend/components/spinner/spinner.module.less';
import { SPINNER, $id, APP_ROOT } from '@/frontend/utils/div-ids';

function createSpinnerElement(): JQuery<HTMLElement> {
  return $(`<div id="${SPINNER}" class="${styles.spinner}"></div>`);
}

export class Spinner {
  private spinnerElement: JQuery<HTMLElement>;

  constructor() {
    this.spinnerElement = createSpinnerElement();
  }

  show(): void {
    $id(APP_ROOT).append(this.spinnerElement);
  }

  hide(): void {
    this.spinnerElement.detach();
  }
}
