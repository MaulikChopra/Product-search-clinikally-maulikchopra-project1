# **App Name**: OmniSearch

## Core Features:

- Search Input: Displays an input field where the user can type a product name to search for.
- Optimized Search: Debounces the search request until the user stops typing to save network bandwidth. Only searches when the input is more than 2 characters
- Loading Indicator: Displays a loading indicator while fetching search results from the API.
- Dynamic Results Dropdown: Shows a dropdown list of product results below the search input, updating dynamically with each keystroke. Implements pagination controls.
- Error Handling: Handles errors gracefully, displaying user-friendly messages if the API fails or returns unexpected data.

## Style Guidelines:

- Primary color: A muted blue (#6699CC) reminiscent of classic search interfaces, conveying reliability.
- Background color: Light gray (#F0F0F0), providing a clean and unobtrusive backdrop.
- Accent color: Soft green (#8FBC8F), used for highlighting active states and interactive elements.
- Clean, sans-serif font for readability, such as Open Sans or similar.
- Simple, outlined icons for loading and error states.
- Mobile-responsive design that adapts to different screen sizes, with a focus on a centered search bar.
- Subtle animations for loading and dropdown transitions, providing a smooth user experience.