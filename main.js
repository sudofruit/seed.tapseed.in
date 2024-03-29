import { fetchUserData, fetchImageData, fetchLinkData } from "./api.js";
import iconMap from "./iconMap.js";

let user; // Declare user variable outside the DOMContentLoaded event handler
let imageurlForvcard;
let phoneLinks;
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split("#");
    const username = urlParts[urlParts.length - 1];
    console.log("Username:", username);

    // Fetch user data using fetchUserData function from api.js
    const userData = await fetchUserData(username);

    // Log the received user data
    console.log("Received user data:", userData);

    user = userData.data[0]; // Assign user data to the user variable

    document.getElementById("name").innerText = user.attributes.name;
    document.getElementById("bio").innerText = user.attributes.bio;
    document.getElementById("designation").innerText =
      user.attributes.designation;

    // Fetch image data using fetchImageData function from api.js
    try {
      const imageData = await fetchImageData(username);

      if (imageData) {
        const imageUrl =
          "https://tapseed.cloud/" +
          imageData.attributes.profile?.data?.attributes?.formats?.small?.url;
        const coverUrl =
          "https://tapseed.cloud/" +
          imageData.attributes.cover_photo?.data?.attributes?.formats?.medium
            ?.url;

        console.log("Medium Image URL:", imageUrl);
        console.log("Medium Image URL:", coverUrl);
        imageurlForvcard = imageUrl;
        fetchAndStoreImage(imageurlForvcard);

        const imageElement = document.getElementById("profileImg");
        if (imageElement && imageUrl) imageElement.src = imageUrl;

        const coverElement = document.getElementById("coverImg");
        if (coverElement && coverUrl) coverElement.src = coverUrl;
      } else {
        console.log("User image not found");
      }
    } catch (error) {
      console.error("Error fetching image data:", error);
    }

    // Fetch link data using fetchLinkData function from api.js
    try {
      const linkData = await fetchLinkData(username);

      // Log the received link data
      console.log("Received link data:", linkData);

      // Clear the links container before rendering new links
      const linksContainer = document.getElementById("linksContainer");
      if (linksContainer) {
        linksContainer.innerHTML = ""; // Clear existing contents
      } else {
        console.error("Error: linksContainer not found");
      }

      phoneLinks = {};

      // Populate phoneLinks object with phone numbers
      linkData.forEach((entry) => {
        const linkName = entry.attributes.link_name;
        const linkValue = entry.attributes.link;
        const linkOn = entry.attributes.link_on;

        if (linkName === "phone" && linkOn) {
          if (!phoneLinks[linkName]) {
            phoneLinks[linkName] = [];
          }
          phoneLinks[linkName].push(linkValue);
        }
      });
      console.log("phone link ", phoneLinks);

      // Loop through each link data and create link elements
      linkData.forEach((link) => {
        const linkElement = createLinkElement(link);
        if (linkElement) {
          // Append the link element to the links container
          if (linksContainer) {
            linksContainer.appendChild(linkElement);
          } else {
            console.error("Error: linksContainer not found");
          }
        }
      });

      // After fetching all necessary data, add event listener to the "saveContact" button
      const saveContactButton = document.getElementById("saveContact");
      saveContactButton.addEventListener("click", handleSaveContactClick);
    } catch (error) {
      console.error("Error fetching link data:", error);
    }
  } catch (error) {
    console.error("Error in main logic:", error);
  }
});

// Function to create HTML elements for each link
function createLinkElement(linkData) {
  const { id, attributes } = linkData;

  // Check if link is enabled, if not, return null
  if (!attributes.link_on) {
    return null;
  }

  console.log("Link data:", attributes);

  const linkDiv = document.createElement("div");
  linkDiv.className = "socialimagecont";

  const linkElement = document.createElement("a");
  // Prepend the link data associated with the social media platform to the link URL
  const platform = attributes.link_name.toLowerCase();
  const platformData = iconMap[platform];

  if (platformData) {
    console.log("Platform data:", platformData);
    const linkUrl = platformData.link_data + attributes.link; // <-- Confirming the property name
    console.log("Link URL:", linkUrl);
    linkElement.href = linkUrl;
  } else {
    // If the platform is not found in the iconMap, set href to the original link
    linkElement.href = attributes.link;
  }

  const imgElement = document.createElement("img");
  imgElement.className = "socialimages";
  imgElement.alt = attributes.link_name; // Set alt text to link name

  // Select image path based on the platform from the mapping object
  imgElement.src = platformData
    ? platformData.imagePath
    : "https://example.com/default-icon.png";

  // Create a <p> tag with text content based on attributes.link_text
  const paragraphElement = document.createElement("p");
  paragraphElement.style.color = "#e9dfdf";
  paragraphElement.textContent = attributes.link_text;

  linkElement.appendChild(imgElement);
  linkDiv.appendChild(linkElement);
  linkDiv.appendChild(paragraphElement); // Append the <p> tag to the link container

  return linkDiv;
}

// image link to encoded ..
// function to encode image

async function encodeImageToBase64(imageurlForvcard) {
  try {
    // Fetch the image data
    const response = await fetch(imageurlForvcard);
    const blob = await response.blob();

    // Convert the blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64Data = reader.result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
    });
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

let image64 = ""; // Declare `image` without assigning a value initially

async function fetchAndStoreImage(imageurlForvcard) {
  try {
    const base64Data = await encodeImageToBase64(imageurlForvcard);
    console.log("Base64 encoded image:", base64Data);
    image64 = base64Data; // Now, `image` stores the Base64 data
    // You can use the `image` variable here as needed
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the function with your image URL

// Function to handle the click event of the "saveContact" button
async function handleSaveContactClick() {
  try {
    // Generate vCard content using existing user data
    const vCardContent = generateVCard(
      user.attributes.name,
      user.attributes.designation,
      user.attributes.email,
      user.attributes.organization_name,
      phoneLinks,
      image64
    );

    // Create a Blob containing the vCard content
    const blob = new Blob([vCardContent], { type: "text/vcard" });

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${user.attributes.name}.vcf`; // Set the file name as the user's name with .vcf extension

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by revoking the object URL
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error generating vCard:", error);
  }
}

// Function to generate a vCard from user data
function generateVCard(
  name,
  designation,
  email,
  organization,
  phoneLinks,
  image
) {
  // Validate phone number format

  // Trim and convert data to strings
  name = name ? String(name).trim() : "";
  designation = designation ? String(designation).trim() : "";

  email = email ? String(email).trim() : "";
  organization = organization ? String(organization).trim() : "";

  let phoneNumbers = "";
  if (phoneLinks && phoneLinks["phone"]) {
    phoneNumbers = phoneLinks["phone"]
      .map((number) => `TEL;TYPE=CELL:${number}`)
      .join("\n");
  }

  const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nN:${name};;;\nTITLE:${designation}\nORG:${organization}\nEMAIL:${email}\n${phoneNumbers}\nPHOTO;ENCODING=b;TYPE=JPEG:${image}\nEND:VCARD`;

  return vCardContent.trim();
}
