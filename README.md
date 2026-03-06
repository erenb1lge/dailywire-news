# DailyWire — Modern News Website

DailyWire is a modern, responsive news website built with HTML, CSS, and Vanilla JavaScript. It renders content dynamically from a JSON data source and includes category filtering, search, and a polished reading experience.

## Live Demo

https://username.github.io/dailywire-news/

## Screenshots

![Homepage](screenshots/home.png)
![Mobile View](screenshots/mobile.png)
![Article Page](screenshots/article.png)
![Dark Mode](screenshots/dark-mode.png)

## Features

- Responsive layout for desktop, tablet, and mobile
- Dynamic news rendering from JSON
- Category filtering (Home, World, Technology, Business, Culture, Science)
- Article detail pages with URL query parameters
- Search functionality with live filtering
- Dark mode toggle with saved preference
- Reading time estimation on article pages
- Scroll progress bar on article pages
- Loading skeleton UI while fetching data
- Accessibility improvements (ARIA states, keyboard support, visible focus states)

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- JSON data source

## Project Structure

```text
dailywire-news/
├── index.html
├── article.html
├── 404.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── data/
│   └── articles.json
├── assets/
│   └── images/
├── screenshots/
├── LICENSE
└── README.md
```

## How to Run Locally

1. Open a terminal in the project root:

```bash
cd dailywire-news
```

2. Start a local server:

```bash
python3 -m http.server 8000
```

3. Open the app in your browser:

```text
http://localhost:8000/
```

## Deployment

Deploy on GitHub Pages:

1. Push this repository to GitHub.
2. Open `Settings` -> `Pages`.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your branch (for example, `main`) and root (`/root`).
5. Save and wait for deployment.

Your site will be available at:

```text
https://<username>.github.io/dailywire-news/
```
