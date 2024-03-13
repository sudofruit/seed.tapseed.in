document.addEventListener("DOMContentLoaded", async function () {
  // Get the current URL
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split("#");
  const username = urlParts[urlParts.length - 1]; // Declare and assign value to username within the event listener
  console.log(username);

  try {
    await fetchName(username); // Wait for fetchName to complete
  } catch (error) {
    console.error("Error fetching name:", error);
  }

  axios
    .get("https://tapseed.cloud/api/images?populate=*")
    .then((response) => {
      const user = response.data.data.find(
        (item) => item.attributes.username === username
      );
      if (user) {
        console.log(username);
        const imageUrl =
          user.attributes.profile?.data?.attributes?.formats?.medium?.url;
        const coverUrl =
          user.attributes.cover_photo?.data?.attributes?.formats?.medium?.url;
        console.log("Medium Image URL:", imageUrl);
        console.log("Medium Image URL:", coverUrl);

        const imageElement = document.getElementById("profileImg");
        if (imageElement && imageUrl) imageElement.src = imageUrl;
        const coverElement = document.getElementById("coverImg");
        if (coverElement && coverUrl) coverElement.src = coverUrl;
      } else {
        console.log("User image not found");
      }
    })
    .catch((error) => console.error("Error fetching image data:", error));

  let userEmail; // Declare userEmail in the local scope within the event listener

  async function fetchName(username) {
    const url = `https://tapseed.cloud/api/people?filters[username][$eq]=${username}`;

    try {
      // Fetch data from the endpoint
      const response = await fetch(url);
      const responseData = await response.json();

      // Check if response contains data
      if (responseData && responseData.data && responseData.data.length > 0) {
        // Extract the first item from the data array
        const userData = responseData.data[0];
        // Extract name from userData
        document.querySelector(".headername").textContent =
          userData.attributes.name;
        document.querySelector(".description").textContent =
          userData.attributes.bio;
        document.querySelector(".profession").textContent =
          userData.attributes.designation; // added the class selector here
        userEmail = userData.attributes.email; // Assign email to the local variable

        // Call renderLinks function to initially render data
        renderLinks();
      } else {
        console.log("User data not found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Function to fetch data from the API
  async function fetchData() {
    const url = `https://tapseed.cloud/api/links?filters[username][$eq]=${username}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  // Function to render links
  async function renderLinks() {
    const container = document.getElementById("links-container");
    if (!container) return; // Check if container exists

    container.innerHTML = ""; // Clear previous content
    const newData = await fetchData();
    newData.forEach((linkData) => {
      const linkElement = createLinkElement(linkData);
      if (linkElement) {
        container.appendChild(linkElement);
      }
    });
  }

  function downloadVCard() {
    // Get the name from the header
    const vcardName = document.querySelector(".headername").textContent;

    // Use the userEmail variable directly
    const vcardEmail = userEmail;

    // Create VCard content
    const vcardContent = `BEGIN:VCARD
    VERSION:3.0
    FN:${vcardName}
    ORG:${document.querySelector(".profession").textContent}
    EMAIL:${vcardEmail}
    END:VCARD`;

    // Create a Blob from the VCard content
    const blob = new Blob([vcardContent], { type: "text/vcard" });

    // Create a link element
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${vcardName}.vcf`; // Set the file name for the VCard

    // Append the link to the document body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
  }

  // Add event listener to the button for downloading VCard
  const vcardBtn = document.getElementById("vcardBtn");
  if (vcardBtn) {
    vcardBtn.addEventListener("click", downloadVCard);
  } else {
    console.error("vcardBtn not found in the DOM");
  }

  // Function to create HTML elements
  function createLinkElement(linkData) {
    const { id, attributes } = linkData;

    // Check if link_on is true, if not, return null
    if (!attributes.link_on) {
      return null;
    }

    const linkDiv = document.createElement("div");
    linkDiv.className = "socialimagecont";

    const linkElement = document.createElement("a");
    linkElement.href = attributes.Link;

    const imgElement = document.createElement("img");
    imgElement.className = "socialimages";
    imgElement.alt = attributes.link_name; // Set alt text to link name

    // Map between link names and icon URLs
    const iconMap = {
      google: "https://www.google.com/favicon.ico",
      facebook: "https://www.facebook.com/favicon.ico",
      instagram:
        "https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-shapes-2-free/128/social-instagram-new-circle-512.png",
      // Add more mappings for other links as needed
    };

    // Check if the link name has a corresponding icon URL in the map
    const iconUrl = iconMap[attributes.link_name.toLowerCase()];
    if (iconUrl) {
      imgElement.src = iconUrl;
    } else {
      // Use a default icon if no specific icon is found for the link
      imgElement.src = "https://example.com/default-icon.png";
    }

    linkElement.appendChild(imgElement);
    linkDiv.appendChild(linkElement);

    return linkDiv;
  }
});
