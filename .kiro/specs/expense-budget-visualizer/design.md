# Design Document

## Overview

The Expense & Budget Visualizer is a client-side, single-page web application that allows users to record daily expenses, monitor total and monthly spending, visualize expense distribution by category, and manage a monthly budget with a warning system. The application is built with three files:

- `index.html` — defines the complete DOM structure and loads all dependencies.
- `css/style.css` — provides all visual styling, the light/dark theme system, and responsive layout rules.
- `js/script.js` — contains the entire application logic: state management, Local Storage persistence, DOM rendering, event handling, and Chart.js integration.

There is no build step, no package manager, and no backend. Chart.js is loaded from a CDN at runtime.

---

## Architecture

The application follows a plain-HTML architecture with no framework or module system.

```
index.html
├── <link> css/style.css          (loaded synchronously)
├── <script> cdn.jsdelivr.net/npm/chart.js   (loaded synchronously, before body)
└── <script> js/script.js defer   (executed after DOM is parsed)
```

All application state lives in module-level variables in `script.js`. There is no component abstraction — functions operate directly on DOM nodes obtained via `getElementById`. Persistence is handled exclusively through the browser `localStorage` API using three fixed keys.

**Dependencies:**
- Chart.js (CDN): `https://cdn.jsdelivr.net/npm/chart.js` — required for pie chart rendering. Guarded at runtime: `updateChart()` returns early if `typeof Chart === "undefined"`.

---

## HTML Structure and Page Layout

The page uses a single `<main class="container">` as the layout root. Sections appear in this top-to-bottom order:

| Element | Class / ID | Purpose |
|---|---|---|
| `<header>` | `.app-header` | App title and subtitle |
| `<section>` | `.balance-section` | Displays total balance (`#total-balance`) |
| `<section>` | `#budget-warning` `.budget-warning` | Budget exceeded alert; `hidden` attribute toggled by JS |
| `<section>` | `.form-section` | Transaction input form (`#transaction-form`) |
| `<div>` | `.dashboard-grid` | Two-column grid containing transaction list and chart |
| `<section>` | `.transaction-section` (inside grid) | Sort control + `#transaction-list` + `#empty-message` |
| `<section>` | `.chart-section` (inside grid) | `<canvas id="expense-chart">` inside `.chart-container` |
| `<section>` | `.budget-section` | Monthly budget input (`#budget-limit`) and save button |
| `<footer>` | `.app-footer` | Theme toggle button (`#theme-toggle`) and app name |

### Dashboard Grid

`.dashboard-grid` uses CSS Grid with two equal columns (`1fr 1fr`, `gap: 20px`). It collapses to a single column at viewport widths ≤ 768px.

---

## CSS Design System

### Color Palette

| Token | Light Mode | Dark Mode |
|---|---|---|
| Page background | `#f4f6f9` | `#121212` |
| Section background | `#ffffff` | `#252525` |
| Container background | — | `#1e1e1e` |
| Primary accent | `#2563eb` | `#2563eb` |
| Primary accent hover | `#1d4ed8` | — |
| Base text | `#263238` | `#f5f5f5` |
| Muted text | `#64748b` | — |
| Input background | `#ffffff` | `#333333` |
| Input border | `#cbd5e1` | `#555555` |
| Budget warning bg | `#fff7ed` | — |
| Budget warning border | `#fdba74` | — |
| Budget warning text | `#c2410c` | — |

### Category Colors (Pie Chart)

| Category | Color |
|---|---|
| Food | `#2563EB` |
| Transport | `#DC2626` |
| Fun | `#EC4899` |
| Bills | `#EAB308` |
| Finance | `#0D9488` |
| Health | `#8B5CF6` |
| Shopping | `#6B7280` |
| Education | `#F97316` |

### Typography

Base font: `Arial, sans-serif`. Line height: `1.6`. App title: `30px` (desktop), `24px` (mobile). Total balance: `36px bold` (desktop), `30px` (mobile). Section headings: `20px`.

### Breakpoints

| Breakpoint | Changes |
|---|---|
| `max-width: 768px` | `.dashboard-grid` collapses from 2 columns to 1 column |
| `max-width: 600px` | Container margin reduced; app title shrinks to 24px; total balance shrinks to 30px; transaction controls stack vertically; chart height reduced from 350px to 280px |

### Theme System

Dark mode is implemented as a CSS class applied to `<body>`. When `body.dark-mode` is present, all dark-mode overrides activate via descendant selectors. Light mode is the default (no class).

---

## JavaScript Module Responsibilities

`script.js` is organized into 15 labeled sections:

| Section | Label | Responsibility |
|---|---|---|
| 1 | DOM Elements | Declares `const` references to all required DOM nodes via `getElementById` |
| 2 | Application Data | Declares storage key constants, initializes `transactions` array by calling `loadTransactions()`, defines `categories` array and `expenseChart` variable, creates the `currencyFormatter` |
| 3 | Save Transactions | `saveTransactions()` — serializes `transactions` to JSON and writes to `localStorage` |
| 4 | Update Total Balance | `updateTotal()` — sums all transaction amounts and writes to `#total-balance` |
| 5 | Calculate Monthly Expenses | `getMonthlyExpenses()` — filters transactions by current month/year and sums amounts |
| 6 | Update Budget Warning | `loadBudget()` + `updateBudgetWarning()` — loads budget from storage, evaluates spending vs. limit, shows/hides `#budget-warning` |
| 7 | Save Monthly Budget | `saveBudget()` — validates input, writes budget to `localStorage`, updates in-memory `monthlyBudget`, triggers warning update |
| 8 | Update Expense Chart | `updateChart()` — initializes or updates the Chart.js pie chart |
| 9 | Sort Transactions | `sortTransactions()` — reads sort select value, sorts a copy of `transactions`, calls `renderTransactions()` |
| 10 | Render Transactions | `renderTransactions(data)` — clears `#transaction-list`, builds and appends `<li>` elements for each transaction |
| 11 | Add Transaction | `addTransaction(event)` — handles form submission: validates, creates transaction object, updates state and display |
| 12 | Delete Transaction | `deleteTransaction(id)` — filters transaction from array, persists, updates display |
| 13 | Event Listeners | Binds `submit`, `click`, and `change` listeners to form, buttons, and sort select |
| 14 | Theme Toggle | `loadTheme()`, `applyTheme(theme)`, `toggleTheme()` — manages `body.dark-mode` class and localStorage persistence |
| 15 | Initialize Application | Top-level initialization calls executed on script load (after DOM is ready via `defer`) |

---

## Data Structures

### Transaction Object

Each transaction is stored as a plain JavaScript object with the following shape:

```javascript
{
  id:       string,  // UUID generated by crypto.randomUUID()
  name:     string,  // Item name entered by user (trimmed)
  amount:   number,  // Numeric expense amount, > 0
  category: string,  // One of the 8 predefined category strings
  date:     string   // Local date in "YYYY-MM-DD" format (no time component)
}
```

> **Implementation note:** The `date` field stores only a local calendar date string (`YYYY-MM-DD`), not a full timestamp with time. Requirement 1 AC-8 specifies "a timestamp representing the current date and time". The current implementation stores date only, which is sufficient for monthly budget calculation but does not capture time-of-day.

### Application State Variables

| Variable | Type | Purpose |
|---|---|---|
| `transactions` | `Transaction[]` | In-memory array of all transaction objects; source of truth for all display functions |
| `monthlyBudget` | `number` | Currently active budget limit; `0` when no budget is set |
| `expenseChart` | `Chart \| null` | Chart.js instance; `null` before first render, retained across updates |
| `categories` | `string[]` | Fixed array of 8 category names; order determines pie chart segment order and color assignment |
| `currencyFormatter` | `Intl.NumberFormat` | Fixed IDR formatter; used for all monetary display (see Currency Formatting section) |

---

## Local Storage Strategy

The application uses three fixed `localStorage` keys:

| Key | Value Type | Content |
|---|---|---|
| `expenseVisualizerTransactions` | JSON string | Array of Transaction objects; parsed with `JSON.parse()` on load |
| `expenseVisualizerBudget` | Numeric string | Monthly budget as a plain number string (e.g. `"500000"`); parsed with `Number()` on load |
| `expenseVisualizerTheme` | String | Either `"dark"` or `"light"`; defaults to `"light"` if key is absent |

### Error Handling

All `localStorage` read and write operations are wrapped in `try/catch` blocks. On read failure, functions return safe defaults (`[]`, `0`, or `"light"`). On write failure, `console.error()` is called and an `alert()` is shown to the user.

---

## Transaction Flow

When the user submits the transaction form:

1. `addTransaction(event)` is called; `event.preventDefault()` stops page reload.
2. Validation: item name must be non-empty; amount must be a finite number > 0; category must be in the `categories` array.
3. If any validation fails, an `alert()` dialog is shown and focus is set to the invalid field. The transaction is not created.
4. A `localDate` string is built from `new Date()` using `getFullYear()`, `getMonth()+1`, `getDate()` — formatted as `YYYY-MM-DD`.
5. A new Transaction object is created with `crypto.randomUUID()` as `id`.
6. The object is pushed onto the `transactions` array.
7. `saveTransactions()` persists the updated array to `localStorage`.
8. `sortTransactions()` re-renders the list respecting the current sort selection.
9. `updateTotal()` recalculates and displays the total balance.
10. `updateChart()` updates or re-renders the pie chart.
11. `updateBudgetWarning()` recalculates monthly spending and evaluates the warning condition.
12. `transactionForm.reset()` clears all form fields.

---

## Delete Flow

When the user clicks a Delete button on a transaction:

1. `deleteTransaction(id)` is called with the transaction's UUID.
2. `transactions` is replaced with a filtered copy that excludes the matching `id`.
3. `saveTransactions()` persists the updated array.
4. `sortTransactions()` re-renders the list.
5. `updateChart()` updates the pie chart.
6. `updateTotal()` recalculates the total balance.
7. `updateBudgetWarning()` re-evaluates the budget warning.

---

## Monthly Budget Calculation

`getMonthlyExpenses()` computes Monthly Spending by:

1. Filtering `transactions` to those whose `date` field, when parsed as `new Date(date + "T00:00:00")`, has the same `getMonth()` and `getFullYear()` as `new Date()`.
2. Summing the `amount` values of the filtered transactions.

`updateBudgetWarning()` then evaluates the warning condition:

- If `monthlyBudget <= 0`, the warning is hidden regardless of spending (no budget has been set).
- **Required behavior (Requirement 5 AC-4 and AC-5):** The warning must be hidden when Monthly Spending is less than or equal to the Monthly Budget. The warning must be shown only when Monthly Spending **strictly exceeds** the budget — correct condition: `monthlyExpenses > monthlyBudget`.
- **Current implementation:** The source code uses `monthlyExpenses >= monthlyBudget`, which triggers the warning when spending exactly equals the budget. This diverges from Requirement 5 AC-4, which states the warning must NOT appear when spending equals the budget. This is a known gap — see Known Gaps section.

When the warning is shown, `budgetWarning.hidden` is set to `false` and `budgetWarningMessage.textContent` is set to a descriptive string including the formatted monthly expenses and budget values.

---

## Chart Rendering

`updateChart()` manages a single Chart.js pie chart instance stored in `expenseChart`.

**Initialization (first call, `expenseChart === null`):**
- A new `Chart` is created on `#expense-chart` canvas with type `"pie"`.
- `labels` is set to the full `categories` array (all 8 categories always present).
- `backgroundColor` is set to a fixed 8-color array matching category order.
- `borderColor` is `"#ffffff"`, `borderWidth` is `2`.
- `responsive: true`, `maintainAspectRatio: false`.
- Legend positioned at `"bottom"`.
- Tooltip callback formats values using `currencyFormatter`.

**Subsequent calls:**
- `expenseChart.data.datasets[0].data` is replaced with new totals.
- `expenseChart.update()` is called to re-render.

**Data scope:** `updateChart()` aggregates amounts across **all** transactions regardless of date. Requirement 4 AC-2 specifies that the pie chart should show only current-month transactions. This is a known gap — see Known Gaps section.

**Category totals:** Computed by mapping over `categories` and summing `amount` for all transactions matching that category string. Categories with no transactions contribute `0`; Chart.js renders zero-value segments invisibly.

---

## Currency Formatting

All monetary values are formatted using a single `Intl.NumberFormat` instance:

```javascript
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});
```

This produces Indonesian Rupiah formatting (e.g. `Rp150.000`). The formatter is a module-level constant and is used by `updateTotal()`, `renderTransactions()`, `updateBudgetWarning()`, and the Chart.js tooltip callback.

**Currency configuration is not implemented.** There is no UI input for changing the currency symbol, no `localStorage` key for currency, and no function that reads or applies a user-defined currency symbol. Requirement 7 (Currency Configuration) is entirely unimplemented. See Known Gaps section.

---

## Theme Management

| Function | Behavior |
|---|---|
| `loadTheme()` | Reads `expenseVisualizerTheme` from `localStorage`; returns `"dark"` if value equals `"dark"`, otherwise returns `"light"` |
| `applyTheme(theme)` | Adds `dark-mode` class to `document.body` if `theme === "dark"`; removes it otherwise |
| `toggleTheme()` | Reads current theme from `document.body.classList`; computes the opposite; calls `applyTheme()`; saves new value to `localStorage` |

The theme toggle button (`#theme-toggle`) is in the footer. It has no visible label change — the button text is always "Toggle Dark / Light Mode".

---

## Initialization Sequence

On page load, `script.js` executes top-to-bottom after the DOM is ready (via the `defer` attribute). The initialization sequence in Section 15 is:

1. `renderTransactions()` — renders stored transactions (uses default `transactions` array).
2. `updateTotal()` — displays total balance from stored transactions.
3. `updateChart()` — initializes the Chart.js pie chart.
4. `applyTheme(loadTheme())` — restores saved theme.
5. `updateBudgetWarning()` — evaluates budget warning with stored data.
6. Conditional: if `monthlyBudget > 0`, populates `#budget-limit` input with the saved budget value.

Application state variables are initialized at module level before Section 15:
- `transactions` is populated by `loadTransactions()` (Section 2).
- `monthlyBudget` is populated by `loadBudget()` (Section 6).

---

## Responsiveness

The application is responsive through CSS only, with no JavaScript viewport logic.

| Breakpoint | Affected Elements | Change |
|---|---|---|
| `max-width: 768px` | `.dashboard-grid` | Collapses from 2-column to 1-column layout |
| `max-width: 600px` | `.container` | Width increases to 94%, top/bottom margin reduced to 20px |
| `max-width: 600px` | `.app-header h1` | Font size reduced from 30px to 24px |
| `max-width: 600px` | `#total-balance` | Font size reduced from 36px to 30px |
| `max-width: 600px` | `section` | Padding reduced from 25px to 18px |
| `max-width: 600px` | `.transaction-controls` | Stacks vertically (`flex-direction: column`), sort select expands to full width |
| `max-width: 600px` | `.chart-container` | Height reduced from 350px to 280px |

---

## Components and Interfaces

The application has no component abstraction layer. All logic is implemented as plain JavaScript functions in `script.js` that operate directly on DOM nodes. The key functional interfaces are:

| Function | Signature | Description |
|---|---|---|
| `loadTransactions()` | `() → Transaction[]` | Reads and parses transactions from `localStorage`; returns `[]` on failure |
| `saveTransactions()` | `() → void` | Serializes `transactions` array to `localStorage` |
| `addTransaction(event)` | `(Event) → void` | Form submit handler; validates input, creates and stores a new Transaction |
| `deleteTransaction(id)` | `(string) → void` | Removes a transaction by UUID, persists, and refreshes display |
| `renderTransactions(data)` | `(Transaction[]) → void` | Rebuilds `#transaction-list` from provided array |
| `sortTransactions()` | `() → void` | Reads sort select, sorts a copy of `transactions`, calls `renderTransactions()` |
| `updateTotal()` | `() → void` | Sums all transaction amounts and writes to `#total-balance` |
| `getMonthlyExpenses()` | `() → number` | Returns sum of current-month transaction amounts |
| `updateBudgetWarning()` | `() → void` | Shows or hides `#budget-warning` based on spending vs. budget |
| `saveBudget()` | `() → void` | Validates and persists budget input, updates `monthlyBudget`, triggers warning update |
| `loadBudget()` | `() → number` | Reads budget from `localStorage`; returns `0` on failure |
| `updateChart()` | `() → void` | Initializes or updates the Chart.js pie chart instance |
| `loadTheme()` | `() → string` | Returns `"dark"` or `"light"` from `localStorage` |
| `applyTheme(theme)` | `(string) → void` | Adds or removes `dark-mode` class on `document.body` |
| `toggleTheme()` | `() → void` | Flips the current theme and persists it |

---

## Data Models

### Transaction

```javascript
{
  id:       string,  // UUID — crypto.randomUUID()
  name:     string,  // Item name (non-empty, trimmed)
  amount:   number,  // Expense amount > 0
  category: string,  // One of: Food, Transport, Fun, Bills, Finance, Health, Shopping, Education
  date:     string   // "YYYY-MM-DD" local date string
}
```

### localStorage Schema

| Key | Type | Default |
|---|---|---|
| `expenseVisualizerTransactions` | JSON `Transaction[]` | `[]` |
| `expenseVisualizerBudget` | Numeric string | `"0"` (absent) |
| `expenseVisualizerTheme` | `"dark"` \| `"light"` | `"light"` (absent) |

### In-Memory State

| Variable | Type | Initial Value |
|---|---|---|
| `transactions` | `Transaction[]` | Result of `loadTransactions()` |
| `monthlyBudget` | `number` | Result of `loadBudget()` |
| `expenseChart` | `Chart \| null` | `null` |
| `categories` | `string[]` | Fixed 8-element array |
| `currencyFormatter` | `Intl.NumberFormat` | IDR formatter |

---

## Known Gaps vs. Requirements

The following requirements are not fully satisfied by the current implementation. These are documented as gaps to guide future implementation tasks.

### Gap 1 — Budget Warning Trigger Condition (Requirement 5 AC-4 and AC-5)

- **Required:** Warning is hidden when Monthly Spending is less than or equal to the Monthly Budget (Req 5 AC-4). Warning is shown when Monthly Spending **strictly exceeds** the Monthly Budget (Req 5 AC-5). The correct comparison is `monthlyExpenses > monthlyBudget`.
- **Current implementation:** `updateBudgetWarning()` uses `monthlyExpenses >= monthlyBudget`, triggering the warning when spending exactly equals the budget.
- **Impact:** A user who spends exactly their budget amount will incorrectly see the warning.

### Gap 2 — Currency Configuration UI (Requirement 7)

- **Required:** An input field allowing the user to set their preferred currency symbol or code, with the value persisted in `localStorage` and applied to all monetary displays. Default must be `"Rp"`.
- **Current implementation:** Currency is hardcoded as IDR via `Intl.NumberFormat("id-ID", { currency: "IDR" })`. There is no `localStorage` key for currency, no input field, and no function that reads or applies a configurable symbol. The IDR formatter does display `"Rp"` as a prefix, satisfying the visual default, but users cannot change it.
- **Impact:** Requirements 7 AC-1 through AC-3 and AC-5 are unimplemented.

### Gap 3 — Pie Chart Monthly Scope (Requirement 4 AC-2)

- **Required:** The pie chart displays only transactions from the current calendar month.
- **Current implementation:** `updateChart()` aggregates all transactions regardless of date.
- **Impact:** The chart overstates spending for categories that have transactions from previous months.

### Gap 4 — Sort Mechanism (Requirement 2 AC-7 and AC-8)

- **Required:** A sort control that toggles between ascending and descending on successive activations.
- **Current implementation:** The current implementation provides the same sorting options but uses a dropdown selection rather than the required two-state toggle interaction.
- **Impact:** The sort options are present, but the interaction model does not match the specified toggle behavior.

### Gap 5 — Inline Form Validation (Requirement 1 AC-7)

- **Required:** Inline validation error messages displayed within the form when required fields are invalid.
- **Current implementation:** Validation errors are shown via `alert()` dialogs, which block the UI and are not inline.
- **Impact:** Requirement 1 AC-7 is not satisfied; validation feedback is functional but diverges from the specified UX pattern.

### Gap 6 — Transaction Timestamp (Requirement 1 AC-8)

- **Required:** Each transaction record includes "a timestamp representing the current date and time".
- **Current implementation:** The `date` field stores a `YYYY-MM-DD` string (date only, no time component). Time-of-day is not captured.
- **Impact:** Partial satisfaction — the date is recorded correctly for monthly filtering, but the time portion is absent.
