document.addEventListener("DOMContentLoaded", () => {
    // Set up event listeners for static navigation buttons
    setupStaticEventListeners();
  
    // Load dynamic content for events (slideshow) and articles (cards)
    loadDynamicContent();
  });
  
  /* =============================
     Setup Static Button Listeners
     ============================= */
  function setupStaticEventListeners() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        console.log("Login button clicked");
        // TODO: Implement login modal or redirect here.
      });
    }
  
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        console.log("Submit button clicked");
        // TODO: Implement submission logic here.
      });
    }
  
    const heroSubmitBtn = document.querySelector('.hero-submit');
    if (heroSubmitBtn) {
      heroSubmitBtn.addEventListener('click', () => {
        console.log("Hero submit button clicked");
        // TODO: Redirect to a submission page or open a form.
      });
    }
  
    const joinBtn = document.querySelector('.join-btn');
    if (joinBtn) {
      joinBtn.addEventListener('click', () => {
        console.log("Join membership button clicked");
        // TODO: Implement membership join logic here.
      });
    }
  }
  
  /* =============================
     Load Dynamic Content
     ============================= */
  async function loadDynamicContent() {
    await loadEvents();    // Load events into the slideshow
    await loadArticles();  // Load article cards into the grid
  
    // Initialize slideshow if any slides were loaded
    if (document.getElementsByClassName("mySlides").length > 0) {
      showSlide(0);
    }
  }
  
  /* =============================
     Load Events (Slideshow)
     ============================= */
  async function loadEvents() {
    const slideshowContainer = document.querySelector('.slideshow-container');
    // Clear out any existing content
    slideshowContainer.innerHTML = "";
  
    try {
      // Fetch events from your backend API
      const response = await fetch('/api/events');
      const eventsData = await response.json();
  
      // For each event, create a slide element dynamically
      eventsData.forEach((event, index) => {
        // Create slide container
        const slide = document.createElement('div');
        slide.classList.add('mySlides', 'fade');
  
        // Build image container
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('imagecontainer');
        const img = document.createElement('img');
        img.src = event.image; // e.g., "image.png"
        img.alt = event.title;
        imageContainer.appendChild(img);
  
        // Build text section
        const textSection = document.createElement('div');
        textSection.classList.add('text-section');
  
        const detailsP = document.createElement('p');
        detailsP.classList.add('details');
        detailsP.textContent = event.details; // e.g., "February 5, 2025 | 3 min read"
  
        const titleP = document.createElement('p');
        titleP.classList.add('title');
        titleP.textContent = event.title;
  
        const descriptionP = document.createElement('p');
        descriptionP.classList.add('description');
        descriptionP.textContent = event.description;
  
        // Create "continue reading" button with its event listener
        const continueBtn = document.createElement('button');
        continueBtn.classList.add('continue-reading');
        continueBtn.textContent = "continue reading";
        continueBtn.addEventListener('click', () => {
          console.log(`Continue reading event ${event.id}`);
          // TODO: Redirect to event details page, for example:
          // window.location.href = `/events/${event.id}`;
        });
  
        // Append all text elements to the text section
        textSection.append(detailsP, titleP, descriptionP, continueBtn);
  
        // Append image and text to the slide container
        slide.append(imageContainer, textSection);
  
        // Append slide to the slideshow container
        slideshowContainer.appendChild(slide);
      });
  
      // Once slides are created, add slideshow controls (prev/next buttons and dots)
      createSlideshowControls();
    } catch (error) {
      console.error("Error loading events:", error);
      // Optionally: load fallback/dummy events here.
    }
  }
  
  /* =============================
     Load Articles (Cards)
     ============================= */
  async function loadArticles() {
    const gridContainer = document.querySelector('.grid-container');
    // Clear existing cards
    gridContainer.innerHTML = "";
  
    try {
      // Fetch articles from your backend API
      const response = await fetch('/api/articles');
      const articlesData = await response.json();
  
      articlesData.forEach(article => {
        // Create card container
        const card = document.createElement('div');
        card.classList.add('card');
  
        // Create image container (if an image is provided)
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('imagecontainer');
        if (article.image) {
          const img = document.createElement('img');
          img.src = article.image;
          img.alt = article.title;
          imageContainer.appendChild(img);
        }
  
        // Create text section
        const textSection = document.createElement('div');
        textSection.classList.add('text-section');
  
        const detailsP = document.createElement('p');
        detailsP.classList.add('details');
        detailsP.textContent = article.details;
  
        const titleP = document.createElement('p');
        titleP.classList.add('title');
        titleP.textContent = article.title;
  
        const descriptionP = document.createElement('p');
        descriptionP.classList.add('description');
        descriptionP.textContent = article.description;
  
        // Create "continue reading" button with event listener
        const continueBtn = document.createElement('button');
        continueBtn.classList.add('continue-reading');
        continueBtn.textContent = "continue reading";
        continueBtn.addEventListener('click', () => {
          console.log(`Continue reading article ${article.id}`);
          // TODO: Redirect to article details page, e.g.:
          // window.location.href = `/articles/${article.id}`;
        });
  
        // Create author info section
        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');
  
        const authorImg = document.createElement('img');
        authorImg.classList.add('profile');
        if (article.authorProfile) {
          authorImg.src = article.authorProfile;
          authorImg.alt = article.author;
        }
  
        const authorName = document.createElement('p');
        authorName.classList.add('authorname');
        authorName.textContent = article.author;
  
        buttonsDiv.append(continueBtn, authorImg, authorName);
  
        // Assemble the text section
        textSection.append(detailsP, titleP, descriptionP, buttonsDiv);
  
        // Assemble the card
        card.append(imageContainer, textSection);
        gridContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading articles:", error);
      // Optionally: load fallback/dummy articles here.
    }
  }
  
  /* =============================
     Slideshow Functionality
     ============================= */
  let slideIndex = 0;
  
  function showSlide(index) {
    const slides = document.getElementsByClassName("mySlides");
    if (slides.length === 0) return;
  
    // Wrap-around index if needed
    if (index >= slides.length) {
      slideIndex = 0;
    } else if (index < 0) {
      slideIndex = slides.length - 1;
    } else {
      slideIndex = index;
    }
  
    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    // Display the current slide using flex layout
    slides[slideIndex].style.display = "flex";
  
    // Update the dot indicators
    updateDots(slideIndex);
  }
  
  function nextSlide() {
    showSlide(slideIndex + 1);
  }
  
  function prevSlide() {
    showSlide(slideIndex - 1);
  }
  
  /* =============================
     Create and Update Controls
     ============================= */
  function createSlideshowControls() {
    const slideshowContainer = document.querySelector('.slideshow-container');
  
    // Remove any existing controls to avoid duplicates
    const existingPrev = slideshowContainer.querySelector('.prev');
    const existingNext = slideshowContainer.querySelector('.next');
    if (existingPrev) existingPrev.remove();
    if (existingNext) existingNext.remove();
  
    // Create previous button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('prev');
    prevBtn.innerHTML = '&#10094;'; // Left arrow
    prevBtn.addEventListener('click', prevSlide);
    slideshowContainer.appendChild(prevBtn);
  
    // Create next button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('next');
    nextBtn.innerHTML = '&#10095;'; // Right arrow
    nextBtn.addEventListener('click', nextSlide);
    slideshowContainer.appendChild(nextBtn);
  
    // Create dot navigation container (if not already present)
    let dotContainer = document.querySelector('.dot-container');
    if (!dotContainer) {
      dotContainer = document.createElement('div');
      dotContainer.classList.add('dot-container');
      dotContainer.style.textAlign = "center";
      // Insert dot container after the slideshow container
      slideshowContainer.parentNode.insertBefore(dotContainer, slideshowContainer.nextSibling);
    } else {
      dotContainer.innerHTML = "";
    }
  
    // Create one dot for each slide
    const slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      dot.addEventListener('click', () => {
        showSlide(i);
      });
      dotContainer.appendChild(dot);
    }
  }
  
  function updateDots(activeIndex) {
    const dots = document.getElementsByClassName("dot");
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("active");
    }
    if (dots[activeIndex]) {
      dots[activeIndex].classList.add("active");
    }
  }
  