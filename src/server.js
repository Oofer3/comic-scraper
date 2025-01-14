import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'https://tapas.io/series/The-Siren-Becoming-the-Villains-Family';  // Replace with your desired Tapas comic URL

// Serve static files (e.g., index.html) from the /public folder
app.use(express.static('public'));

// API endpoint to get comic images using Puppeteer
app.get('/get-comic-images', async (req, res) => {
    const images = [];

    try {
        // Launch a new headless browser instance using Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add these flags for better compatibility
        });
        const page = await browser.newPage();

        // Navigate to the Tapas comic page
        console.log("Navigating to page...");
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });  // Reduced timeout to 10 seconds

        // Simulate scrolling to trigger lazy loading
        console.log("Simulating scroll...");
        await page.evaluate(async () => {
            let totalHeight = 0;
            const distance = 2000; // Smaller scroll distance for better image loading behavior

            // Scroll until the page reaches the bottom
            while (totalHeight < document.body.scrollHeight) {
                window.scrollBy(0, distance);
                totalHeight += distance;
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait longer between scrolls to give images time to load
            }
        });

        // Wait for images to load after scrolling
        console.log("Waiting for images to load...");
        await page.waitForSelector('.viewer__body .content__img.js-lazy', { timeout: 15000 });  // Increased timeout to 15 seconds

        // Use Puppeteer to extract image URLs from the comic reader
        const imageUrls = await page.evaluate(() => {
            const comicImages = Array.from(document.querySelectorAll('.viewer__body .content__img.js-lazy'));
            console.log('Found images:', comicImages.length);  // Log the number of images found
            return comicImages
                .map(img => img.src)  // Get the 'src' attribute of each image
                .filter(src => src.startsWith('https://'));  // Filter for valid image URLs
        });

        console.log('Image URLs:', imageUrls);  // Log the image URLs before sending them to the client

        if (imageUrls.length > 0) {
            res.json({ images: imageUrls });
        } else {
            console.error("No images found.");
            res.json({ error: 'No comic images found' });
        }

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error scraping comic:', error);
        res.status(500).json({ error: 'Failed to scrape comic images' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
