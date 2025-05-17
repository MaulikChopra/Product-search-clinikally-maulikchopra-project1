# Product Search

Product Search is a simple yet powerful autocomplete component built with Next.js and React that allows users to search for products using an external API. It features debounced API calls, pagination, loading and error states, and a clean, responsive UI inspired by modern search interfaces.

## Features

-   **Autocomplete Search:** Dynamically fetches and displays product suggestions as the user types.
-   **Optimized API Calls:**
    -   Debounces API requests to avoid excessive calls.
    -   Initiates search only when the input has at least 2 characters.
-   **Pagination:** Allows users to navigate through search results if multiple pages are available.
-   **Loading & Error States:** Provides clear visual feedback to the user during API calls and in case of errors.
-   **Responsive Design:** Adapts to various screen sizes for a seamless experience on desktop and mobile.
-   **Clean UI/UX:** Modern, minimalist interface inspired by Google's homepage, with subtle animations.
-   **TypeScript:** Built with TypeScript for robust and maintainable code.

## Tech Stack

-   **Next.js (App Router)**
-   **React**
-   **TypeScript**
-   **Tailwind CSS**
-   **ShadCN UI Components** (Input, Button, Card, Alert, etc.)
-   **Lucide React** (Icons)
-   **DummyJSON API** (for product data)

## Getting Started

### Prerequisites

-   Node.js (v18.x or later recommended)
-   npm or yarn

### Setup

1.  **Clone the repository (if applicable) or download the source files.**

2.  **Navigate to the project directory:**
    ```bash
    cd product-search-app
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application will typically be available at `http://localhost:9002` (or the port specified in your `package.json`).

### Building for Production

```bash
npm run build
npm run start
```

## Thought Process & Approach

1.  **Project Setup & Styling:**
    -   Initialized a Next.js project configured with TypeScript and Tailwind CSS.
    -   Leveraged the Next.js App Router for structure.
    -   Defined a custom color palette in `globals.css` to match the requested "muted blue," "light gray," and "soft green" theme, aiming for a professional and reliable feel. The UI is designed to be clean and centered, reminiscent of Google's homepage.
    -   Used Geist Sans font (provided by `next/font`) for clean readability.

2.  **Component Structure:**
    -   `HomePage` (`src/app/page.tsx`): The main landing page, responsible for the overall layout and centering the search functionality.
    -   `Product Search` (`src/components/product-search.tsx`): The core client component (`"use client"`) handling all aspects of the autocomplete functionality:
        -   Input field for user queries.
        -   State management for search term, suggestions, loading status, errors, pagination, and dropdown visibility using React Hooks (`useState`, `useRef`).
        -   Dropdown list to display product suggestions.
        -   Pagination controls.

3.  **API Interaction & Data Handling:**
    -   Defined TypeScript interfaces (`Product`, `ProductSearchResult`) in `src/types/product.ts` for type safety with the API response.
    -   Fetched data from `https://dummyjson.com/products/search`.
    -   Implemented pagination using `limit` and `skip` query parameters.

4.  **Optimizations:**
    -   **Debouncing:** API calls are debounced using `setTimeout` and `clearTimeout` within a `useEffect` hook. This prevents an API request on every keystroke, improving performance and reducing server load. The delay is set to 500ms.
    -   **Minimum Search Length:** API calls are only triggered if the search term is at least 2 characters long.

5.  **User Experience (UX):**
    -   **Loading State:** A loading indicator (`Loader2` icon) is displayed while fetching data.
    -   **Error Handling:** API errors or "no results" scenarios are gracefully handled and communicated to the user via alerts and toast notifications.
    -   **Dynamic Dropdown:** The suggestions dropdown appears dynamically as the user types and results are available. It can be closed by clicking outside.
    -   **Responsive Design:** Tailwind CSS is used to ensure the application is responsive and looks good on various screen sizes.
    -   **Animations:** Subtle fade-in and zoom animations are applied to the dropdown for a smoother experience using Tailwind's animation utilities.
    -   **Accessibility:** Basic ARIA attributes (e.g., `aria-label` on input) are included.

6.  **Code Quality & Maintainability:**
    -   Used functional components and React Hooks throughout.
    -   Modularized the search logic into the `Product Search` component.
    -   Leveraged ShadCN UI components for pre-built, accessible, and stylable UI elements, customizing them as needed.
    -   Included comments where necessary to explain logic.

## Future Enhancements (Potential)

-   More advanced keyboard navigation for dropdown suggestions.
-   Highlighting matching text within suggestions.
-   Caching API responses to further optimize performance.
-   Allowing users to select a product and view more details (e.g., navigate to a product page).
-   Saving recent searches.

This approach aims to meet all the requirements of the task description while creating a well-structured, performant, and user-friendly application.
