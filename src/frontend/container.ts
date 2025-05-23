const fullScreenContainerTemplate = () => `
  <div id="fullscreen-container-parent">
    <div id="full-screen-container" class="full-screen-container">
      <div class="container">
        <h1>Card Game Simulator</h1>
        <div id="content-container">
          <button id="add-card">Add Card</button>
          <div id="card-container"></div>
        </div>
        <div id="loading-indicator"></div>
      </div>
    </div>
  </div>
`;

export function loadFullScreenContainer() {
  const appRoot = $('#app-root');
  appRoot.addClass('global-body-style');
  appRoot.append(fullScreenContainerTemplate());
}
