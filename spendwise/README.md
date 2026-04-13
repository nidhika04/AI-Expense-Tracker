# 💸 SpendWise — AI Expense Tracker

**No server needed! Works directly in browser.**

---

## 📁 Folder Structure

```
spendwise/
├── index.html           ← Login / Signup page
├── css/
│   ├── auth.css         ← Login page styles
│   └── dashboard.css    ← Dashboard styles
├── js/
│   └── app.js           ← All app logic (charts, AI, export)
└── pages/
    └── dashboard.html   ← Main dashboard page
```

---

## 🚀 How to Run (Super Simple!)

### Method 1 — Just Double Click (Easiest)
1. Unzip the downloaded file
2. Open the `spendwise` folder
3. Double-click `index.html`
4. App opens in your browser ✅

### Method 2 — VS Code Live Server (Recommended)
1. Install VS Code → https://code.visualstudio.com/
2. Install extension: **Live Server** (by Ritwick Dey)
3. Open the `spendwise` folder in VS Code
4. Right-click `index.html` → **Open with Live Server**
5. App runs at `http://127.0.0.1:5500` ✅

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Signup/Login | Email + password stored in browser |
| 💰 Dashboard | Balance, Income, Expense summary |
| ➕ Add Transaction | Expense or income with category |
| ✏️ Edit/Delete | Full control over transactions |
| 🔍 Search & Filter | By type, category, date range |
| 🤖 AI Insights | Smart spending analysis |
| 📊 Charts | Pie + Bar + Line charts |
| 🌙 Dark Mode | Toggle light/dark theme |
| 📥 Export CSV | Download spreadsheet |
| 📄 Export PDF | Download formatted report |
| 📱 Responsive | Works on mobile + desktop |

---

## 💾 Data Storage

- All data is saved in your browser's **localStorage**
- Each user's data is separate (linked to their email)
- Data persists after closing/reopening the browser
- Clearing browser data will erase the app data

---

## ❓ Common Questions

**Q: Do I need internet?**
A: Only for loading fonts, icons, and Chart.js from CDN. Core app works offline.

**Q: Is my data safe?**
A: Data stays on your device. Nothing is sent to any server.

**Q: Can I use on mobile?**
A: Yes! Open `index.html` in mobile browser or use a local server app.

---

Made with ❤️ — SpendWise
