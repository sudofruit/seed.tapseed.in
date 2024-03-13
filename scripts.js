document.addEventListener("DOMContentLoaded", async function () {
  let userEmail; // Declare userEmail in the local scope within the event listener

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
          "https://tapseed.cloud/" +
          user.attributes.profile?.data?.attributes?.formats?.medium?.url;
        const coverUrl =
          "https://tapseed.cloud/" +
          user.attributes.cover_photo?.data?.attributes?.formats?.medium?.url;

        console.log("Medium Image URL:", imageUrl);
        console.log("Medium Image URL:", coverUrl);
        const urlHead = "https://tapseed.cloud/";
        const imageElement = document.getElementById("profileImg");
        if (imageElement && imageUrl) imageElement.src = imageUrl;
        const coverElement = document.getElementById("coverImg");
        if (coverElement && coverUrl) coverElement.src = coverUrl;
      } else {
        console.log("User image not found");
      }
    })
    .catch((error) => console.error("Error fetching image data:", error));

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
        container.appendChild(linkElement); // Append link element to the container
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
});

// Updated mapping for social media platforms including image path and link data
const iconMap = {
  facebook: {
    imagePath: "https://tapseed.cloud/uploads/facebook_icon_6b6420ab3b.png",
    link_data: "https://www.facebook.com/",
  },
  instagram: {
    imagePath: "https://tapseed.cloud/uploads/instagram_icon_b9e86a2bd2.png",
    link_data: "https://www.instagram.com/",
  },
  whatsapp: {
    imagePath: "https://tapseed.cloud/uploads/whatsapp_icon_2c1255c072.png",
    link_data: " https://wa.me/91",
  },
  email: {
    imagePath: "https://tapseed.cloud/uploads/email_icon_d6d4621dbb.png",
    link_data: "mailto:",
  },
  phone: {
    imagePath: "https://tapseed.cloud/uploads/phone_icon_275497ff7c.png",
    link_data: "tel:+91",
  },
  website: {
    imagePath: "https://tapseed.cloud/uploads/browser_icon_aadc966123.png",
    link_data: "https://",
  },
  gmb: {
    imagePath: "https://tapseed.cloud/uploads/gmb_icon_4bbf255130.png",
    link_data: "",
  },
  // Add more mappings for other social media platforms as needed
};

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
  // Prepend the link data associated with the social media platform to the link URL
  linkElement.href =
    iconMap[attributes.link_name.toLowerCase()].link_data + attributes.Link;
  console.log(linkElement);
  const imgElement = document.createElement("img");
  imgElement.className = "socialimages";
  imgElement.alt = attributes.link_name; // Set alt text to link name

  // Get the image path from the iconMap based on the social media platform
  const imagePath = iconMap[attributes.link_name.toLowerCase()].imagePath;
  if (imagePath) {
    imgElement.src = imagePath;
  } else {
    // Use a default icon if no specific icon is found for the link
    imgElement.src = "https://example.com/default-icon.png";
  }

  linkElement.appendChild(imgElement);
  linkDiv.appendChild(linkElement);

  return linkDiv;
}
