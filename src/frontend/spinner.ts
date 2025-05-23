import './spinner.less';

function spinnerTemplate() {
  return `<div id="spinner" class="spinner"></div>`;
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
