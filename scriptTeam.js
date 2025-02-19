const teamMembers = [
    {
        name: "Lara Abdel Baki",
        image: "lara.png",
        quote: "quote"
    },
    {
        name: "Hussein Atoui",
        image: "hsen.png",
        quote: "quote"
    },
    {
        name: "Chu Zhang",
        image: "chu.png",
        quote: "quote"
    },
    {
        name: "Bouthaina Bazerbachi",
        image: "bouth.png",
        quote: "quote"
    },
    {
        name: "Bareaa Joudi",
        image: "bareaa.png",
        quote: "quote"
    },
];
const teamContainer = document.getElementById("team");
const imageGrid = document.createElement("div");
imageGrid.classList.add("image-grid");
teamMembers.forEach((member,index) =>{
    const memberDiv = document.createElement("div");
    memberDiv.classList.add("team-card");

    if (index >= 3) {
        memberDiv.classList.remove("team-card");
        memberDiv.classList.add("last-row");  // class for last two pics 
    }
    
    const memberImage = document.createElement("img");
    memberImage.src = member.image;
    memberImage.alt = `${member.name}`;
    memberImage.classList.add("team-images");

    const memberName = document.createElement("h3");
    memberName.textContent = member.name;
    memberName.classList.add("name");

    const memberQuote = document.createElement("p");
    memberQuote.textContent = member.quote;
    memberQuote.classList.add("quote");

    memberDiv.appendChild(memberImage);
    memberDiv.appendChild(memberName);
    memberDiv.appendChild(memberQuote);

    teamContainer.appendChild(memberDiv);
});