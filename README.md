# Budget Tracker

A simple, fully functional budget tracking website built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools—just open `index.html` in your browser and start tracking expenses.

## Features

- **Add Expenses** – Log purchases with description, amount, category, and date
- **Expense List** – View all logged expenses in a sortable table with delete controls
- **Summary Dashboard** – See total spending and category-wise breakdown at a glance
- **Live Chart** – Interactive doughnut chart showing spending by category (updates instantly)
- **Local Storage** – Expenses persist across page refreshes; no server needed
- **Responsive Design** – Works seamlessly on mobile (single column) and desktop (multi-column layout)
- **Clean Modern UI** – Card-based design with smooth animations and gradients

## Quick Start

1. Clone or download this repository
2. Open `index.html` directly in your web browser
3. Fill in the form: Description, Amount, Category, Date
4. Click "Add Expense"
5. Watch the summary and chart update in real time
6. Delete entries with the "Delete" button in the table
7. Refresh the page—your data persists!

## File Structure

```
budget-tracker/
├── index.html       # Main HTML structure
├── style.css        # Responsive styling (no inline styles)
├── script.js        # Vanilla JavaScript logic
└── README.md        # This file
```

## How It Works

### Data Model

Expenses are stored as an array of objects in memory:

```javascript
{
  id: "unique-identifier",
  description: "Groceries",
  amount: 42.50,
  category: "Food",
  date: "2026-06-13"
}
```

### Storage & Persistence

- **In Memory:** On page load, expenses are read from localStorage into the `expenses` array
- **localStorage Key:** `budget-tracker-expenses` (JSON string)
- **Auto-Save:** Every add/delete operation updates localStorage before rendering
- **Fallback:** If localStorage is corrupted or missing, the app starts with an empty list

### Categories

Six predefined categories with distinct chart colors:

- **Food** – Meals, groceries, dining out
- **Transport** – Gas, public transit, car maintenance
- **Rent** – Housing payments
- **Entertainment** – Movies, games, hobbies
- **Utilities** – Electricity, water, internet
- **Other** – Miscellaneous expenses

### Chart Integration

Uses **Chart.js 4.4.3** via CDN. The doughnut chart:
- Updates live as you add/delete expenses
- Shows category totals with color-coded legend
- Displays a placeholder message when no expenses exist
- Fully responsive (resizes on mobile)

## Browser Compatibility

Works on all modern browsers that support:
- ES2015+ (const, arrow functions, template literals)
- localStorage API
- Chart.js 4.x
- CSS Grid & Flexbox

**Tested on:** Chrome, Firefox, Safari, Edge (latest versions)

## Usage Tips

### Adding Expenses

1. **Description** (required, max 80 chars) – e.g., "Grocery shopping," "Bus fare"
2. **Amount** (required, positive decimals) – e.g., 42.50
3. **Category** (required) – Select from the dropdown
4. **Date** (required) – Defaults to today; pick a different date if needed

The form auto-resets after submission and displays a confirmation message.

### Viewing Expenses

- **Table** shows all entries sorted by date (newest first)
- **Summary** displays total spending and per-category breakdown
- **Chart** visualizes category-wise spending as a doughnut
- All three update instantly when you add or delete

### Deleting Expenses

Click the "Delete" button in any table row. The expense is removed from storage and all views update immediately.


## Troubleshooting

### Data Not Persisting?

- Check if localStorage is enabled in your browser
- Try clearing cache and reloading
- Open DevTools console and run `localStorage.getItem('budget-tracker-expenses')` to check stored data

### Chart Not Showing?

- Ensure Chart.js CDN link is accessible (check network tab in DevTools)
- Verify `#category-chart` canvas element exists in HTML

### Form Not Working?

- Check console for JavaScript errors
- Verify all input fields are filled before submitting
- Amounts must be positive numbers

## License

Free to use, modify, and distribute. No attribution required.

## Contributing

Found a bug or have an idea? Feel free to fork, improve, and submit a pull request!

---

**Built with:** HTML5, CSS3, Vanilla JavaScript, Chart.js  
**No Dependencies:** Works offline, no build step needed
