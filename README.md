#  Secure APP programming

## Description

This project is an open-source web application built with Node.js and Express, using SQLite3 for the database. The application is designed in two versions: an insecure version and a secure version.

The insecure version intentionally includes vulnerabilities such as SQL Injection, Cross-Site Scripting (XSS), and Sensitive Data Exposure for educational purposes.

The secure version rectifies these vulnerabilities and implements security measures including Cross-Site Request Forgery (CSRF) tokens, proper session management, use of security headers, and adequate logging and monitoring. Detailed explanations of the security improvements are provided.

This application serves as a practical study of common web vulnerabilities and their countermeasures.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install all the dependencies.

## Usage

1. Run `node app.js` to start the server.
2. Open your browser and navigate to `http://localhost:3000`.
3. Use the application.

## File Structure

- `app.js`: This is the main application file.
- `css/style.css`: This file contains all the styles for the application.
- `views/`: This directory contains all the EJS templates for the application.

## Contributing

Contributions are welcome. Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.