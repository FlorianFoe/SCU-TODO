# SCU-TODO

A simple web application to manage todos.

## Features

- Add, edit, and delete tasks
- Set due dates
- Import tasks

## Project Structure

```
SCU-TODO/
│
├── index.html                # Main entry point (links Vue, Tailwind, and components)
│
├── assets/                   # Static resources
│   ├── style.css              # Custom CSS (in addition to Tailwind)
│   └── logo.png               # (Optional) logo or icons
│
├── components/               # Vue components
│   ├── App.js                 # Root Vue component
│   ├── TaskForm.js            # Component for adding/editing tasks
│   ├── DueDateForm.js         # Component for setting/changing due dates
│   └── ImportForm.js          # Component for importing tasks from JSON
│
└── utils/                     # Utility scripts
└── TaskUtils.js           # Functions for task management (add, edit, export, etc.)
```

## Getting Started

1. **Prerequisites:**
    - A modern web browser (Chrome, Firefox, Edge, etc.)
    - WebStorm or any code editor

2. **Run the App:**
    - Open `index.html` directly in your browser (double-click or right-click and choose "Open with...").

3. **Development:**
    - Edit the JS, HTML, or CSS files as needed.
    - Reload the browser to see your changes.

## Notes

- No npm, build tools, or local server required.
- All scripts are loaded via `<script>` tags in `index.html`.
- No `import`/`export` statements are used; all components are attached to the global `window` object.

## License

MIT
