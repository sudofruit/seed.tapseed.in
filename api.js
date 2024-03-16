// api.js

// Function to fetch user data from API using native fetch
async function fetchUserData(username) {
  try {
    const response = await fetch(
      `https://tapseed.cloud/api/people?filters[username][$eq]=${username}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);

    throw error; // Rethrow the error to handle it in the caller
  }
}

export { fetchUserData };

// Function to fetch image data from API
async function fetchImageData(username) {
  try {
    const response = await fetch("https://tapseed.cloud/api/images?populate=*");
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const imageData = await response.json();
    return imageData.data.find((item) => item.attributes.username === username);
  } catch (error) {
    throw new Error("Error fetching user data:", error);
  }
}

export { fetchImageData };

// function to fetch link data

async function fetchLinkData(username) {
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

export { fetchLinkData };
