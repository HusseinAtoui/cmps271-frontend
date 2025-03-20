
function makeProfile(profiles) {
    const allProfiles = document.getElementById("profile-contain"); 

    allProfiles.innerHTML = '';

    profiles.forEach(profile => {
        const profileElement = document.createElement('div');
        profileElement.classList.add('profile');
        profileElement.classList.add('other');
        profileElement.classList.add('feedback');

        const profilePicDiv = document.createElement('div');
        profilePicDiv.classList.add('profile-pic');

        const profileImg = document.createElement('img');
        profileImg.src = profile.image; 
        profileImg.alt = profile.name;
        profilePicDiv.appendChild(profileImg);

        const nameElement = document.createElement('h2');
        nameElement.textContent = profile.name;
        profilePicDiv.appendChild(nameElement);

        const profileCommentDiv = document.createElement('div');
        profileCommentDiv.classList.add('profile-comment');

        const textDiv = document.createElement('div');
        textDiv.classList.add('text');

        const paragraph = document.createElement('p');
        paragraph.textContent = profile.comment;
        textDiv.appendChild(paragraph);

        profileCommentDiv.appendChild(textDiv);

        profileElement.appendChild(profilePicDiv);
        profileElement.appendChild(profileCommentDiv);

        allProfiles.appendChild(profileElement);
    });
}

// Example usage:
const profiles = [
    {
        name: "bouthy",
        image: "kisses.jpg", 
        comment: "This poem was great, very inspiring..."
    },
    {
        name: "john",
        image: "john_image.jpg", 
        comment: "I didn't really enjoy the poem that much..."
    }
];
window.addEventListener("load", async () => {makeProfile(profiles);});
// Call the function with the profiles array

