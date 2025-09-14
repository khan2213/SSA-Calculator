# Sukanya Samriddhi Yojana (SSY) Calculator

A modern, interactive, and feature-rich calculator to help users plan investments for the Sukanya Samriddhi Yojana (SSY) government savings scheme. Built with React, TypeScript, and Tailwind CSS, this tool provides detailed financial projections in a user-friendly interface.

![SSY Calculator Screenshot](https://storage.googleapis.com/aistudio-hosting/ssy-screenshot.png)

## ✨ Features

- **Monthly Investment Planning**: Users can input their desired monthly investment amount.
- **Dynamic Projections**: Instantly calculates and displays the total investment, total interest earned, and the final maturity value.
- **Interactive Growth Chart**: Visualizes the investment growth over the 21-year tenure with a clean, responsive line chart.
- **Partial Withdrawal Simulation**: Allows users to simulate a one-time partial withdrawal after the girl child turns 18 and see its impact on the final maturity value.
- **Real-time Input Validation**: Provides immediate feedback to ensure user inputs (investment amount, age) are within the scheme's rules.
- **Tax Benefit Information**: Clearly explains the Exempt-Exempt-Exempt (EEE) tax benefits of the SSY scheme.
- **Download PDF Summary**: Generates a professional, print-friendly PDF summary of the investment, including summary cards, a year-by-year breakdown, and a "Postalguide" watermark.
- **Fully Responsive**: A clean and accessible UI that works seamlessly on desktops, tablets, and mobile devices.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PDF Generation**: jsPDF & jspdf-autotable
- **Setup**: No-build setup using ES Modules and an import map.

## 🏃‍♀️ How to Run Locally

This project is set up to run directly in the browser without any build steps (like Webpack or Vite).

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Start a local web server:**
    You need a simple HTTP server to serve the files. If you have Node.js installed, you can use `serve`.

    ```bash
    # Install serve globally if you haven't already
    npm install -g serve

    # Run the server
    serve .
    ```
    Alternatively, if you have Python installed:
    ```bash
    # Python 3
    python -m http.server

    # Python 2
    python -m SimpleHTTPServer
    ```

3.  **Open in browser:**
    Navigate to `http://localhost:3000` (or the port specified by your server) in your web browser.

## 📂 File Structure

The project is organized into logical components and files for clarity and maintainability.

```
.
├── index.html              # Main HTML file, sets up Tailwind CSS and import maps
├── index.tsx               # Entry point for the React application
├── App.tsx                 # Main application component, handles all state and logic
├── constants.ts            # Global constants for the SSY scheme (interest rate, limits)
├── types.ts                # TypeScript type definitions for data structures
├── metadata.json           # Project metadata
├── README.md               # You are here!
└── components/
    ├── CalculatorForm.tsx  # The user input form component
    └── ResultsDisplay.tsx  # The results component (summary cards, chart, table)
```

## 📄 License

This project is licensed under the MIT License.
