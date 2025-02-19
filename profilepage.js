document.addEventListener('DOMContentLoaded', function () {
    // Select all article cards
    const articleCards = document.querySelectorAll('.activity-card');
  
    // Create the modal container (full-screen overlay)
    const modal = document.createElement('div');
    modal.id = 'article-modal';
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000'
    });
  
    // Create the modal content box with rounded corners
    const modalContent = document.createElement('div');
    modalContent.id = 'modal-content';
    Object.assign(modalContent.style, {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '20px', // fully rounded modal box
      maxWidth: '600px',
      maxHeight: '80%',
      overflowY: 'auto',
      position: 'relative'
    });
    modal.appendChild(modalContent);
  
    // Create a close button with rounded corners
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    Object.assign(closeButton.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      padding: '5px 10px',
      cursor: 'pointer',
      borderRadius: '20px',
      border: 'none',
      backgroundColor: '#f0c5a4'
    });
    modalContent.appendChild(closeButton);
  
    // Append the modal to the body
    document.body.appendChild(modal);
  
    // Add custom scrollbar styling via a style element
    const style = document.createElement('style');
    style.textContent = `
      /* Custom scrollbar styling for Webkit browsers */
      #modal-content::-webkit-scrollbar {
        width: 12px;
      }
      #modal-content::-webkit-scrollbar-track {
        background: #f3e5d8;
        border-radius: 20px;  /* Fully rounded track */
      }
      #modal-content::-webkit-scrollbar-thumb {
        background-color: #7d0c0e;
        border-radius: 20px;  /* Fully rounded thumb */
        border: 3px solid #f3e5d8;
      }
      
      /* Firefox scrollbar styling */
      #modal-content {
        scrollbar-width: thin;
        scrollbar-color: #7d0c0e #f3e5d8;
      }
    `;
    document.head.appendChild(style);
  
    // Function to close the modal
    function closeModal() {
      modal.style.display = 'none';
    }
  
    // Close modal when clicking the close button
    closeButton.addEventListener('click', closeModal);
  
    // Also close modal when clicking outside the content area
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  
    // Add click event to each article card
    articleCards.forEach(function (card) {
      card.addEventListener('click', function () {
        // Get the article title from the card (assuming it's inside an h3)
        const title = card.querySelector('h3') ? card.querySelector('h3').innerText : 'Article';
        // Get the image source from the card (if exists)
        const imageSrc = card.querySelector('img') ? card.querySelector('img').src : '';
        // Get the full article text from a data attribute (or use a default text)
        const fullText = card.getAttribute('data-fulltext') ||
          `This is the full article for "${title}".`;
  
        // Build the modal content with rounded elements and a custom rounded scrollbar
        modalContent.innerHTML = `
          <button id="modal-close" style="position:absolute;top:10px;right:10px;padding:5px 10px;cursor:pointer;border-radius:20px;border:none;background-color:#f0c5a4;">Close</button>
          <h2>${title}</h2>
          ${imageSrc ? `<img src="${imageSrc}" alt="${title}" style="width:100%;height:auto;margin-bottom:15px;border-radius:20px;">` : ''}
          <p>${fullText}</p>
        `;
  
        // Re-attach the close event to the newly created close button
        document.getElementById('modal-close').addEventListener('click', closeModal);
  
        // Display the modal
        modal.style.display = 'flex';
      });
    });
  });
  