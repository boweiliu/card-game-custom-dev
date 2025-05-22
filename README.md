# Windsurf Project

## Overview
This project is a web application that manages cards. Users can create, edit, and delete cards through a user-friendly interface.

## Prerequisites
- Node.js v20.12.2
- npm v0.39.3

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate into the project directory:
   ```bash
   cd windsurf-project
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Application
To start the application, run:
```bash
PORT=9009 npm run start:dev # just webpack, proxies to localhost:3000
PORT=4321 npm run dev # both FE and BE, BE operates on localhost:43210
```

## Development
- The main code is located in the `src/frontend` directory.
- Use `npm run build` to compile the TypeScript files.

## API
The application communicates with a backend API to manage card data. Ensure the backend server is running on `/api/cards` for full functionality.

## Contributing
Feel free to open issues or submit pull requests for improvements or fixes.

## License
This project is licensed under the MIT License.
