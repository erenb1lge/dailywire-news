const DATA_URL = './data/articles.json';

let allArticles = [];
let activeCategory = 'home';
let searchQuery = '';

const categoryLabels = {
  home: 'Home',
  world: 'World',
  technology: 'Technology',
  business: 'Business',
  culture: 'Culture',
  science: 'Science',
};

function isMobileViewport() {
  return window.matchMedia('(max-width: 780px)').matches;
}

function setMobileMenuState(isOpen, options = {}) {
  const { focusFirst = false, returnFocus = false } = options;
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (!menuToggle || !mainNav) {
    return;
  }

  const shouldOpen = isOpen && isMobileViewport();

  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
  mainNav.classList.toggle('open', shouldOpen);
  mainNav.setAttribute('aria-hidden', String(!shouldOpen));
  document.body.classList.toggle('menu-open', shouldOpen);

  if (shouldOpen && focusFirst) {
    const firstLink = mainNav.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }

  if (!shouldOpen && returnFocus) {
    menuToggle.focus();
  }
}

function closeMobileMenu(options = {}) {
  setMobileMenuState(false, options);
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('dailywire-theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else if (
    savedTheme !== 'light' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.body.classList.add('dark');
  }

  if (!themeToggle) {
    return;
  }

  const syncThemePressedState = () => {
    themeToggle.setAttribute('aria-pressed', String(document.body.classList.contains('dark')));
  };

  syncThemePressedState();

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'dailywire-theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
    syncThemePressedState();
  });
}

function setupMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (!menuToggle || !mainNav) {
    return;
  }

  const syncForViewport = () => {
    if (isMobileViewport()) {
      const isOpen = mainNav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      mainNav.setAttribute('aria-hidden', String(!isOpen));
      document.body.classList.toggle('menu-open', isOpen);
      return;
    }

    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
    mainNav.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('menu-open');
  };

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    setMobileMenuState(!expanded, { focusFirst: !expanded });
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!isMobileViewport()) {
      return;
    }
    const clickedInsideNav = mainNav.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (event.key === 'Escape' && isOpen) {
      closeMobileMenu({ returnFocus: true });
    }
  });

  mainNav.addEventListener('keydown', (event) => {
    if (!isMobileViewport() || !mainNav.classList.contains('open')) {
      return;
    }

    const links = Array.from(mainNav.querySelectorAll('a'));
    if (!links.length) {
      return;
    }

    const firstLink = links[0];
    const lastLink = links[links.length - 1];
    const currentIndex = links.indexOf(document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % links.length;
      links[nextIndex].focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const previousIndex = currentIndex <= 0 ? links.length - 1 : currentIndex - 1;
      links[previousIndex].focus();
    }

    if (event.key === 'Tab' && event.shiftKey && document.activeElement === firstLink) {
      event.preventDefault();
      lastLink.focus();
    }

    if (event.key === 'Tab' && !event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      firstLink.focus();
    }
  });

  window.addEventListener('resize', syncForViewport);
  syncForViewport();
}

function setupSearchToggle() {
  const searchToggle = document.getElementById('searchToggle');
  const searchRow = document.getElementById('searchRow');
  const searchInput = document.getElementById('searchInput');

  if (searchToggle && searchRow) {
    searchToggle.addEventListener('click', () => {
      const willShow = !searchRow.classList.contains('show');
      searchRow.classList.toggle('show', willShow);
      searchToggle.setAttribute('aria-expanded', String(willShow));
      if (willShow && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      searchQuery = event.target.value.trim().toLowerCase();
      renderIndexContent();
    });
  }
}

async function fetchArticles() {
  if (allArticles.length) {
    return allArticles;
  }

  const response = await fetch(DATA_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load article data');
  }

  allArticles = await response.json();
  return allArticles;
}

function formatCategory(category) {
  return categoryLabels[category] || category;
}

function renderSkeletonCards(count = 6) {
  const newsGrid = document.getElementById('newsGrid');
  if (!newsGrid) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const skeleton = document.createElement('article');
    skeleton.className = 'news-card skeleton-card';
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="card-body">
        <div class="skeleton skeleton-tag"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-date"></div>
      </div>
    `;
    fragment.appendChild(skeleton);
  }

  newsGrid.replaceChildren(fragment);
}

function renderGridMessage(message) {
  const newsGrid = document.getElementById('newsGrid');
  if (!newsGrid) {
    return;
  }
  const p = document.createElement('p');
  p.className = 'date';
  p.setAttribute('role', 'status');
  p.textContent = message;
  newsGrid.replaceChildren(p);
}

function filterArticles() {
  return allArticles.filter((article) => {
    const categoryMatch = activeCategory === 'home' || article.category === activeCategory;
    const haystack = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    const searchMatch = !searchQuery || haystack.includes(searchQuery);
    return categoryMatch && searchMatch;
  });
}

function createNewsCard(article) {
  const card = document.createElement('article');
  card.className = 'news-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Open article: ${article.title}`);

  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" loading="lazy" decoding="async" />
    <div class="card-body">
      <p class="tag">${formatCategory(article.category)}</p>
      <h3>${article.title}</h3>
      <p>${article.description}</p>
      <span class="date">${article.date}</span>
    </div>
  `;

  const openArticle = () => {
    window.location.href = `article.html?id=${article.id}`;
  };

  card.addEventListener('click', openArticle);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openArticle();
    }
  });

  return card;
}

function renderHero(article) {
  const heroImage = document.getElementById('heroImage');
  const heroTag = document.getElementById('heroTag');
  const heroTitle = document.getElementById('heroTitle');
  const heroDescription = document.getElementById('heroDescription');
  const heroLink = document.getElementById('heroLink');

  if (!heroImage || !heroTag || !heroTitle || !heroDescription || !heroLink || !article) {
    return;
  }

  heroImage.src = article.image;
  heroImage.alt = article.title;
  heroTag.textContent = formatCategory(article.category);
  heroTitle.textContent = article.title;
  heroDescription.textContent = article.description;
  heroLink.href = `article.html?id=${article.id}`;
  heroLink.setAttribute('aria-label', `Read more: ${article.title}`);
}

function renderTrending(articles) {
  const trendingList = document.getElementById('trendingList');
  if (!trendingList) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const trendingItems = articles.slice(1, 6);

  trendingItems.forEach((article) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `article.html?id=${article.id}`;
    link.textContent = article.title;
    link.setAttribute('aria-label', `Read trending article: ${article.title}`);
    li.appendChild(link);
    fragment.appendChild(li);
  });

  trendingList.replaceChildren(fragment);
}

function renderNewsGrid(articles) {
  const newsGrid = document.getElementById('newsGrid');
  const resultsStatus = document.getElementById('resultsStatus');

  if (!newsGrid) {
    return;
  }

  const fragment = document.createDocumentFragment();

  articles.forEach((article) => {
    fragment.appendChild(createNewsCard(article));
  });

  newsGrid.replaceChildren(fragment);

  if (!articles.length) {
    renderGridMessage('No articles match your current filters.');
  }

  if (resultsStatus) {
    const count = articles.length;
    const categoryLabel = formatCategory(activeCategory);
    resultsStatus.textContent = `${count} article${count === 1 ? '' : 's'} shown for ${categoryLabel}.`;
  }
}

function updateActiveNav() {
  const navLinks = document.querySelectorAll('#mainNav a[data-category]');
  navLinks.forEach((link) => {
    const isActive = link.dataset.category === activeCategory;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function setupCategoryFiltering() {
  const navLinks = document.querySelectorAll('#mainNav a[data-category]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      activeCategory = link.dataset.category || 'home';
      updateActiveNav();
      renderIndexContent();
      closeMobileMenu();
    });
  });
}

function renderIndexContent() {
  const filteredArticles = filterArticles();
  renderNewsGrid(filteredArticles);
}

function renderArticlePage(article) {
  const categoryEl = document.getElementById('articleCategory');
  const titleEl = document.getElementById('articleTitle');
  const authorEl = document.getElementById('articleAuthor');
  const dateEl = document.getElementById('articleDate');
  const readingTimeEl = document.getElementById('articleReadingTime');
  const imageEl = document.getElementById('articleImage');
  const bodyEl = document.getElementById('articleBody');

  if (!categoryEl || !titleEl || !authorEl || !dateEl || !readingTimeEl || !imageEl || !bodyEl) {
    return;
  }

  if (!article) {
    categoryEl.textContent = 'News';
    titleEl.textContent = 'Article not found';
    authorEl.textContent = 'By DailyWire Staff';
    dateEl.textContent = '';
    readingTimeEl.textContent = '1 min read';
    imageEl.src = 'https://picsum.photos/1400/700?random=99';
    imageEl.alt = 'Fallback article image';
    bodyEl.innerHTML = '<p>The requested article does not exist. Return to the homepage to browse the latest stories.</p>';
    document.title = 'DailyWire | Article Not Found';
    return;
  }

  categoryEl.textContent = formatCategory(article.category);
  titleEl.textContent = article.title;
  authorEl.textContent = `By ${article.author || 'DailyWire Staff'}`;
  dateEl.textContent = article.date;
  imageEl.src = article.image;
  imageEl.alt = article.title;
  document.title = `DailyWire | ${article.title}`;

  const fragment = document.createDocumentFragment();
  article.content.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    fragment.appendChild(p);
  });

  bodyEl.replaceChildren(fragment);

  const words = article.content.join(' ').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  readingTimeEl.textContent = `${minutes} min read`;
}

function setupArticleProgressBar() {
  const progressBar = document.getElementById('scrollProgress');
  const articleContent = document.getElementById('articleContent');

  if (!progressBar || !articleContent) {
    return;
  }

  const updateProgress = () => {
    const rect = articleContent.getBoundingClientRect();
    const articleTop = rect.top + window.scrollY;
    const articleHeight = articleContent.offsetHeight;
    const viewportHeight = window.innerHeight;
    const maxScrollable = Math.max(1, articleHeight - viewportHeight);
    const scrolled = Math.min(Math.max(0, window.scrollY - articleTop), maxScrollable);
    const progress = (scrolled / maxScrollable) * 100;
    progressBar.style.transform = `scaleX(${progress / 100})`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

async function initIndexPage() {
  renderSkeletonCards(9);
  await fetchArticles();
  renderHero(allArticles[0]);
  renderTrending(allArticles);
  setupCategoryFiltering();
  updateActiveNav();
  renderIndexContent();

  const hashCategory = window.location.hash.replace('#', '').toLowerCase();
  if (categoryLabels[hashCategory] && hashCategory !== 'home') {
    activeCategory = hashCategory;
    updateActiveNav();
    renderIndexContent();
  }
}

async function initArticlePage() {
  await fetchArticles();
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const articleId = Number(idParam);
  let article = allArticles[0];

  if (idParam !== null) {
    article = allArticles.find((item) => item.id === articleId);
  }

  renderArticlePage(article);
  setupArticleProgressBar();
}

async function init() {
  document.body.classList.remove('menu-open');
  document.querySelectorAll('.main-nav').forEach((nav) => {
    nav.classList.remove('open');
  });
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  setupThemeToggle();
  setupMenuToggle();
  setupSearchToggle();

  try {
    if (document.getElementById('newsGrid')) {
      await initIndexPage();
    }

    if (document.getElementById('articleContent')) {
      await initArticlePage();
    }
  } catch (error) {
    if (document.getElementById('newsGrid')) {
      renderGridMessage('Failed to load articles. Please refresh the page.');
    }
    if (document.getElementById('articleBody')) {
      renderArticlePage(null);
    }
  }
}

init();
