# BookMySlot - Chetan's Submission for WizCommerce Fullstack Hiring Challenge!

This is a simple full-stack application for booking events. Users can create events with specific time slots, and other users can view these events and book a slot.

## 🚀 Live Demo

*   **Frontend:** [https://chetansubmission.up.railway.app/](https://chetansubmission.up.railway.app/)
*   **Backend:** [https://chetan-backend.up.railway.app/](https://chetan-backend.up.railway.app/)
*   **API Docs:** [https://chetan-backend.up.railway.app/docs](https://chetan-backend.up.railway.app/docs)

## ✨ Features

*   **Create Events:** Add new events with titles, descriptions, and available time slots.
*   **List Events:** View all created events on the homepage.
*   **Book a Slot:** Book an available time slot for an event by providing your name and email.
*   **View My Bookings:** Check all your bookings by searching with your email.
*   **Time Zone Aware:** All event times are displayed in your local time zone.

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, TailwindCSS
*   **Backend:** FastAPI, Pydantic (for data validation)
*   **Database:** Supabase (Hosted PostgreSQL)
*   **Deployment:** Railway

## 📂 Project Structure

The project is divided into two main folders:

*   `frontend/`: Contains the React application.
*   `backend/`: Contains the FastAPI application.

## ⚙️ Local Setup

To run this project on your local machine, follow these steps.

### Prerequisites

*   Node.js and npm (for frontend)
*   Python 3.11+ and pip (for backend)
*   A Supabase account for the database.

### Backend Setup

1.  **Navigate to the backend folder:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    python -m venv venv
    source venv/bin/activate 
    # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up the database:**
    *   Go to your Supabase project.
    *   Use the SQL Editor to run the queries from `setup_database.sql`. This will create the necessary tables.

5.  **Create a `.env` file** in the `backend` directory and add your Supabase credentials:
    ```env
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_KEY="YOUR_SUPABASE_API_KEY"
    ```

6.  **Run the backend server:**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The backend will be running at `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the frontend folder:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `frontend` directory. Add the URL of your local backend server:
    ```env
    VITE_API_URL="http://localhost:8000"
    ```

4.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:3000` (or another port if 3000 is busy).
