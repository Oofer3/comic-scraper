window.onload = async function() {
    try {
        // Fetch comic image URLs from the backend
        const response = await axios.get('/get-comic-images');
        
        // Get the images from the response
        const images = response.data.images;
        
        // Get the comic container where the images will be inserted
        const container = document.getElementById('comic-container');
        
        // Insert each image into the container
        images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            container.appendChild(img);
        });
        
        if (images.length === 0) {
            container.innerHTML = 'No images found.';
        }
    } catch (error) {
        console.error('Error loading comic images:', error);
    }
};
