# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, single-page web application developed as part of the RevoU Software Engineering Fundamental Course. The application allows users to record daily expenses, monitor spending, visualize expense distribution by category using a pie chart, and manage a monthly budget with a configurable spending limit and warning system. All data is persisted client-side using the browser Local Storage API. The application supports a configurable currency symbol, dark and light themes, and requires no backend server or build tooling.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single expense record consisting of an item name, amount, category, currency, and timestamp.
- **Transaction List**: The on-screen list of all recorded Transactions.
- **Total Balance**: The sum of all Transaction amounts displayed in the App.
- **Category**: One of eight predefined spending labels — Food, Transport, Fun, Bills, Finance, Health, Shopping, or Education — assigned to each Transaction.
- **Monthly Budget**: The user-configured maximum spending limit applied to the current calendar month.
- **Monthly Spending**: The sum of Transaction amounts whose timestamps fall within the current calendar month.
- **Budget Warning**: A visible text alert and color change shown when Monthly Spending exceeds the Monthly Budget.
- **Currency Symbol**: The user-configured currency symbol or code displayed alongside monetary values.
- **Theme**: The active visual mode of the App, either Light or Dark.
- **Local Storage**: The browser-native client-side key-value storage API used to persist data between sessions.
- **Pie Chart**: A Chart.js-rendered circular chart showing the proportion of Monthly Spending contributed by each Category.
- **Transaction Input Form**: The on-screen form that accepts item name, amount, and category to create a new Transaction.

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to enter an expense with a name, amount, and category, so that I can record where my money is going.

#### Acceptance Criteria

1. THE Transaction Input Form SHALL provide a text input field for the item name.
2. THE Transaction Input Form SHALL provide a numeric input field for the amount.
3. THE Transaction Input Form SHALL provide a category selector containing exactly the following options: Food, Transport, Fun, Bills, Finance, Health, Shopping, and Education.
4. WHEN the user submits the Transaction Input Form, THE App SHALL validate that the item name field is not empty.
5. WHEN the user submits the Transaction Input Form, THE App SHALL validate that the amount field contains a numeric value greater than zero.
6. WHEN the user submits the Transaction Input Form, THE App SHALL validate that a category has been selected.
7. IF any required field is empty or invalid when the form is submitted, THEN THE App SHALL display an inline validation error message and SHALL NOT create a Transaction.
8. WHEN all required fields are valid and the form is submitted, THE App SHALL create a new Transaction record containing the item name, amount, category, Currency Symbol, and a timestamp representing the current date and time.
9. WHEN a new Transaction is successfully created, THE App SHALL clear all Transaction Input Form fields.

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded expenses in a list, so that I can review and manage them.

#### Acceptance Criteria

1. THE Transaction List SHALL display each Transaction's item name, amount, and category.
2. THE Transaction List SHALL display the Currency Symbol alongside each Transaction's amount.
3. WHEN the Transaction List is rendered, THE App SHALL display all stored Transactions.
4. THE Transaction List SHALL provide a delete control for each individual Transaction.
5. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from storage and re-render the Transaction List.
6. THE Transaction List SHALL provide a sort control that allows the user to sort Transactions by amount.
7. WHEN the sort control is activated, THE App SHALL re-render the Transaction List with Transactions ordered by amount in ascending order.
8. WHEN the sort control is activated a second time, THE App SHALL re-render the Transaction List with Transactions ordered by amount in descending order.

### Requirement 3: Total Balance

**User Story:** As a user, I want to see the total of all my expenses, so that I know how much I have spent overall.

#### Acceptance Criteria

1. THE App SHALL display a Total Balance value equal to the sum of all Transaction amounts across all recorded Transactions regardless of month.
2. WHEN a Transaction is added, THE App SHALL recalculate and update the displayed Total Balance.
3. WHEN a Transaction is deleted, THE App SHALL recalculate and update the displayed Total Balance.
4. THE App SHALL display the Currency Symbol alongside the Total Balance value.

### Requirement 4: Expense Distribution Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money goes.

#### Acceptance Criteria

1. THE App SHALL render a Pie Chart using the Chart.js library.
2. THE Pie Chart SHALL display one segment per Category that has at least one Transaction recorded in the current calendar month.
3. WHEN a Transaction is added, THE App SHALL update the Pie Chart to reflect the new Monthly Spending distribution.
4. WHEN a Transaction is deleted, THE App SHALL update the Pie Chart to reflect the updated Monthly Spending distribution.
5. THE Pie Chart SHALL assign a distinct color to each Category segment.
6. THE Pie Chart SHALL display a legend identifying each Category segment by name.

### Requirement 5: Monthly Budget

**User Story:** As a user, I want to set a monthly spending limit, so that I can be warned when I am overspending.

#### Acceptance Criteria

1. THE App SHALL provide an input field for the user to enter a Monthly Budget amount.
2. WHEN the user saves a Monthly Budget value, THE App SHALL store the value in Local Storage.
3. THE App SHALL calculate Monthly Spending as the sum of Transaction amounts whose timestamps fall within the current calendar month.
4. WHILE Monthly Spending is less than or equal to the Monthly Budget, THE App SHALL display the current Monthly Spending value without a Budget Warning.
5. WHEN Monthly Spending exceeds the Monthly Budget, THE App SHALL display a Budget Warning as a visible text alert.
6. WHEN Monthly Spending exceeds the Monthly Budget, THE App SHALL apply a warning color change to the balance or budget display elements.
7. WHEN a Transaction is added or deleted, THE App SHALL recalculate Monthly Spending and re-evaluate the Budget Warning condition.
8. THE App SHALL display the Currency Symbol alongside the Monthly Budget and Monthly Spending values.

### Requirement 6: Dark and Light Theme

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a toggle control to switch between Light Theme and Dark Theme.
2. WHEN the user activates the theme toggle, THE App SHALL apply the selected Theme to all visible elements of the App.
3. THE App SHALL persist the active Theme in Local Storage.
4. WHEN the App is loaded, THE App SHALL restore the Theme last saved in Local Storage.

### Requirement 7: Currency Configuration

**User Story:** As a user, I want to configure my preferred currency symbol, so that all monetary values are displayed in my local currency.

#### Acceptance Criteria

1. THE App SHALL provide an input field for the user to enter a Currency Symbol or currency code.
2. WHEN the user saves a Currency Symbol, THE App SHALL store the Currency Symbol in Local Storage.
3. WHEN the Currency Symbol is updated, THE App SHALL apply the new Currency Symbol to all displayed monetary values, including Transaction amounts, Total Balance, Monthly Budget, and Monthly Spending.
4. WHEN the App is loaded, THE App SHALL restore the Currency Symbol last saved in Local Storage.
5. IF no Currency Symbol has been saved, THEN THE App SHALL use a default Currency Symbol of "Rp" (Indonesian Rupiah). No exchange-rate conversion SHALL be performed when the Currency Symbol is changed.

### Requirement 8: Data Persistence

**User Story:** As a user, I want my data to be saved automatically, so that my transactions and settings are still available after I close or refresh the app.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE App SHALL save all Transactions to Local Storage.
2. WHEN a Transaction is deleted, THE App SHALL save the updated Transaction collection to Local Storage.
3. WHEN the App is loaded, THE App SHALL retrieve all Transactions from Local Storage and render the Transaction List.
4. WHEN the App is loaded, THE App SHALL retrieve the Monthly Budget from Local Storage and display the saved value.
5. WHEN the App is loaded, THE App SHALL retrieve the Currency Symbol from Local Storage and apply it to all monetary displays.
6. WHEN the App is loaded, THE App SHALL retrieve the Theme from Local Storage and apply the saved Theme.
7. THE App SHALL store all data exclusively in the browser Local Storage without transmitting data to any external server.

### Requirement 9: Single-Page Layout and Responsiveness

**User Story:** As a user, I want all features visible on one page on any device, so that I can use the app conveniently on mobile and desktop.

#### Acceptance Criteria

1. THE App SHALL present all features — Transaction Input Form, Transaction List, Total Balance, Pie Chart, Monthly Budget, and theme toggle — on a single page without navigation between separate views.
2. THE App SHALL render correctly on viewport widths from 320px to 1920px.
3. THE App SHALL apply responsive layout adjustments so that all content remains readable and usable on mobile screen sizes.

### Requirement 10: Browser Compatibility

**User Story:** As a developer, I want the app to work in all major modern browsers, so that users are not restricted to a specific platform.

#### Acceptance Criteria

1. THE App SHALL function correctly in the current stable release of Google Chrome.
2. THE App SHALL function correctly in the current stable release of Mozilla Firefox.
3. THE App SHALL function correctly in the current stable release of Microsoft Edge.
4. THE App SHALL function correctly in the current stable release of Apple Safari.
5. THE App SHALL operate as a standalone web application requiring no server-side runtime, build step, or installation.

## Technical Constraints

### TC-1: Technology Stack

- THE App SHALL be implemented using HTML, CSS, and Vanilla JavaScript only.
- THE App SHALL NOT use frontend frameworks such as React, Vue, or similar libraries.
- No backend server is required.

### TC-2: Data Storage

- THE App SHALL use the browser Local Storage API for all client-side data persistence.
- All data SHALL be stored client-side only; no server-side storage is permitted.

### TC-3: Browser Compatibility

- THE App SHALL support the current stable releases of Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari.
- THE App SHALL operate as a standalone web application or browser extension without requiring a server-side runtime.

## Non-Functional Requirements

### NFR-1: Simplicity

- THE App SHALL maintain a clean, minimal, and easy-to-use interface.
- No complex setup or test setup SHALL be required to run the App.

### NFR-2: Performance

- THE App SHALL load quickly and provide responsive UI interactions.
- No noticeable lag SHALL occur when adding, deleting, or sorting Transactions or updating settings.

### NFR-3: Visual Design

- THE App SHALL maintain a user-friendly aesthetic with a clear visual hierarchy and readable typography.
