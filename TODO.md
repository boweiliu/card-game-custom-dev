# TODO List

## Webpack Integration

### Objective
- Introduce Webpack to handle the bundling and live-reloading of the frontend code.
- Use Webpack Dev Server to serve the frontend and proxy API requests to the backend server.

### Steps
1. **Install Webpack and Webpack Dev Server**: Add `webpack`, `webpack-cli`, and `webpack-dev-server` as development dependencies.
2. **Create Webpack Configuration**: Setup `webpack.config.js` to bundle the frontend code and configure the dev server.
3. **Update Development Script**: Modify the `dev` script in `package.json` to use `webpack-dev-server` for live reloading.
4. **Proxy API Requests**: Ensure API requests from the frontend are proxied to the backend server.

### Benefits
- Simplifies the development workflow with automatic bundling and live reloading.
- Provides a single command to start both frontend and backend during development.
