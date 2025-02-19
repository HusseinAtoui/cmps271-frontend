document.addEventListener('DOMContentLoaded', function () {
  // Ensure this script runs only once using a flag
  if (window.articleScriptRun) return;
  window.articleScriptRun = true; // Set a flag to prevent multiple executions

  // Fetch articles from the XML file
  fetch('1.xml') // Ensure file path is correct
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => {
          const articles = data.getElementsByTagName("article");
          const activitySection = document.querySelector('.recent-activity');

          // Clear existing content to avoid duplicates
          activitySection.innerHTML = '';

          Array.from(articles).forEach(article => {
              const title = article.getElementsByTagName("title")[0].textContent;
              const content = article.getElementsByTagName("content")[0].textContent.trim();
              const imageTag = article.getElementsByTagName("image")[0]; 
              const imageSrc = imageTag ? imageTag.textContent.trim() : "default.jpg"; // Default image if missing
              
              const preview = content.split("\n").slice(0, 3).join("<br>"); // Extract first 3 lines
              const wordCount = content.split(/\s+/).length;
              const readingTime = Math.ceil(wordCount / 225);
              
              
              let articleCard = document.createElement("div");
              articleCard.classList.add("activity-card");
              articleCard.innerHTML = `
                  <img class="images" src="${imageSrc}" alt="${title}">
                  <div class="activity-info">
                      <h3>${title}</h3>
                      <p>${preview}</p>
                      <span>${readingTime} minute${readingTime === 1 ? '' : 's'}</span>
                  </div>
              `;

              // Add event listener to open modal on click
              articleCard.addEventListener("click", function () {
                  openModal(title, content, imageSrc);
              });

              activitySection.appendChild(articleCard);
          });
      })
      .catch(error => console.error('Error loading XML:', error));

  // Create the modal
  const modal = document.createElement('div');
  modal.id = 'article-modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  // Modal content with scroll styling
  const modalContent = document.createElement('div');
  modalContent.id = 'modal-content';
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '20px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.maxHeight = '80%';
  modalContent.style.overflowY = 'auto';
  modalContent.style.position = 'relative';

  // Custom Scrollbar
  const style = document.createElement('style');
  style.innerHTML = `
      #modal-content::-webkit-scrollbar {
          width: 8px;
      }
      #modal-content::-webkit-scrollbar-track {
          background:#7d0c0;
          border-radius: 10px;
      }
      #modal-content::-webkit-scrollbar-thumb {
          background: #7d0c0;
          border-radius: 10px;
      }
  `;
  document.head.appendChild(style);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Open modal function
  function openModal(title, content, imageSrc) {
      modalContent.innerHTML = `
          <button id="modal-close" style="position:absolute;top:10px;right:10px;padding:5px 10px;cursor:pointer;border-radius:20px;border:none;background-color:#f0c5a4;">Close</button>
          <img src="${imageSrc}" alt="${title}" style="width:100%; border-radius:10px; margin-bottom:10px;">
          <h2>${title}</h2>
          <p>${content}</p>
      `;
      modal.style.display = 'flex';

      // Close modal when clicking the close button
      document.getElementById('modal-close').addEventListener('click', function () {
          modal.style.display = 'none';
      });
  }

  // Close modal when clicking outside the content area
  modal.addEventListener('click', function (e) {
      if (e.target === modal) {
          modal.style.display = 'none';
      }
  });
});
