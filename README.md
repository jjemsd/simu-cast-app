# SimuCast

**A Predictive Modeling and What-If Analysis Platform with AI Integration**

Developed as a Capstone Project for BSIT Major in Data Analytics  
Pangasinan State University – Urdaneta City Campus

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Analytics | pandas, scipy, scikit-learn, statsmodels |
| AI | Anthropic Claude API |
| Charts | Recharts |

---

## Features

- 📁 CSV / Excel file upload with column type detection
- 👁️ Full dataset preview modal (paginated)
- 🧹 Data cleaning — missing values, outliers, duplicates
- 🗒️ Cleaning action log
- ⬇️ Export cleaned data as CSV
- 📊 Descriptive statistics (mean, median, SD, skewness, kurtosis, etc.)
- 📈 Normality tests (Shapiro-Wilk / Kolmogorov-Smirnov) + Q-Q plot
- 🤖 Model training and comparison (Linear Regression, Logistic Regression, Decision Tree)
- 🔮 What-If scenario simulation with baseline comparison
- 💬 AI chat assistant (powered by Claude)
- 💡 Contextual hints at every step

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/simu-cast-app.git
cd simu-cast-app
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file inside `/backend`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the backend:
```bash
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Project Structure

```
simu-cast-app/
├── frontend/          # React app
│   └── src/
│       ├── components/
│       └── pages/
└── backend/           # FastAPI app
    ├── routers/       # API endpoints
    ├── services/      # Business logic
    └── models/        # Pydantic schemas
```

---

## Usage Flow

1. **Upload** your CSV or Excel dataset
2. **Clean** your data — handle missing values, outliers, duplicates
3. **View Stats** — descriptive statistics table
4. **Test Normality** — Shapiro-Wilk or KS test with Q-Q plot
5. **Train Models** — compare Linear Regression, Logistic Regression, Decision Tree
6. **Simulate** — run what-if scenarios and compare predictions
7. **Ask AI** — use the chat assistant at any step

---

## Team

- Agaoid, Jemima Victoria P.
- Bautista, Shaila Jane V.
- Dacanay, Ethelyn Joy P.
- Guinto, Vangie M.
- Mosada, Jerome D.

Adviser: Kathleen D. De Guzman, MIT
