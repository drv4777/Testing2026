# Payment Gateway Application

This application provides a payment gateway for e-commerce, built with React and Express.

## Setup

1.  Follow the instructions in `setup.txt`.
2.  Start the backend: `cd backend && npm install && npm start`
3.  Start the frontend: `cd frontend && npm install && npm start`
4.  Open your browser at `http://localhost:3000`.

(comment, docker-compose up --build -d)

## Issues

This application contains approximately 30% functional and performance issues for testing purposes. These include:

- **Security:** Insecure password storage, potential XSS vulnerabilities.
- **Performance:** Unoptimized database queries, lack of proper caching.
- **Functionality:** Inconsistent transaction status updates, occasional failed payments without clear error messages.
- **Scalability:** Inefficient handling of concurrent transactions, leading to performance degradation under heavy load.
- **Error Handling:** Inadequate error handling and logging, making debugging difficult.
- **Responsiveness:** Some UI elements may not render correctly on all mobile devices.
- **API Rate limiting:** Lack of proper rate limiting on API endpoints, making it susceptible to abuse.
- **Transaction race conditions:** Potential race conditions when processing concurrent transactions.
- **Fraud Detection:** Basic fraud detection logic with potential false positives and negatives.
- **Refund issues:** Some refunds fail to process correctly.
