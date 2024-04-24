import Notiflix from 'notiflix';
import axios from 'axios'; 
import SimpleLightbox from "simplelightbox"; 
import "simplelightbox/dist/simple-lightbox.min.css"; 

const searchForm = document.querySelector('.search-form'); // Selecting the search form element
const gallery = document.querySelector('.gallery'); // Selecting the gallery container element
const loadMoreBtn = document.querySelector('.load-more'); // Selecting the "Load more" button element

let searchQuery = '';
let page = 1;
let totalPages = 0;

const lightbox = new SimpleLightbox('.gallery a'); // Initializing SimpleLightbox for the gallery images

// Event listener for the search form submission
searchForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Preventing the default form submission behavior

    searchQuery = searchForm.elements.searchQuery.value.trim(); // Getting the search query from the form input

    if (searchQuery === '') {
        Notiflix.Notify.warning('Please enter a search query.'); // Displaying a warning notification if the search query is empty
        return;
    }

    clearGallery(); // Clearing the gallery before fetching new images
    page = 1; // Resetting the page number to 1
    getImages(searchQuery, page); // Calling the function to fetch images with the provided search query
});

// Event listener for the "Load more" button click
loadMoreBtn.addEventListener('click', function () {
    page++; // Incrementing the page number
    getImages(searchQuery, page); // Calling the function to fetch more images for the current search query and page
});

// Function to clear the gallery container
function clearGallery() {
    gallery.innerHTML = ''; // Removing all child elements from the gallery container
}

// Async function to fetch images from the Pixabay API
async function getImages(searchQuery, page) {
    const API_KEY = '37005405-aee23f10e1a9d709a8c5923f1'; // Pixabay API key
    const BASE_URL = 'https://pixabay.com/api/'; // Pixabay API base URL
    const perPage = 40; // Number of images per page

    try {
        const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`); // Making a GET request to the Pixabay API
        const data = response.data; // Getting the response data

        if (data.hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.'); // Displaying a failure notification if no images were found
        } else {
            totalPages = Math.ceil(data.totalHits / perPage); // Calculating the total number of pages based on the total hits from the API response

            data.hits.forEach(async image => {
                // Looping through each image in the response data
                const imageURL = image.webformatURL; // Getting the URL of the image
                const largeImageURL = image.largeImageURL; // Getting the URL of the large image
                const altTxt = image.tags; // Getting the alt text for the image (tags)
                const likes = image.likes; // Getting the number of likes for the image
                const views = image.views; // Getting the number of views for the image
                const comments = image.comments; // Getting the number of comments for the image
                const downloads = image.downloads; // Getting the number of downloads for the image

                await renderImageCard(imageURL, largeImageURL, altTxt, likes, views, comments, downloads); // Rendering the image card for each image
            });

            if (page >= totalPages) {
                loadMoreBtn.style.display = 'none'; // Hiding the "Load more" button if all pages have been loaded
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results."); // Displaying an info notification when reaching the end of search results
            } else {
                loadMoreBtn.style.display = 'block'; // Showing the "Load more" button if there are more pages to load
            }

            lightbox.refresh(); // Refreshing the SimpleLightbox instance to include newly added images
        }
    } catch (error) {
        Notiflix.Notify.failure('An error occurred while fetching images. Please try again.'); // Displaying a failure notification if an error occurred during image fetching
    }
}

// Function to render an image card with information
function renderImageCard(imageURL, largeImageURL, altTxt, likes, views, comments, downloads) {
    const photoCard = document.createElement('div'); // Creating a div element for the photo card
    photoCard.classList.add('photo-card'); // Adding the 'photo-card' class to the div element

    const imageLink = document.createElement('a'); // Creating an anchor element for the image
    imageLink.href = largeImageURL; // Setting the href attribute to the URL of the large image

    const image = document.createElement('img'); // Creating an image element
    image.src = imageURL; // Setting the src attribute to the URL of the image
    image.alt = altTxt; // Setting the alt attribute to the alt text of the image
    image.loading = 'lazy'; // Setting the loading attribute to 'lazy' for lazy loading images

    imageLink.appendChild(image); // Appending the image to the anchor element

    const infoDiv = document.createElement('div'); // Creating a div element for image information
    infoDiv.classList.add('info'); // Adding the 'info' class to the div element

    // Creating paragraphs for different image information
    const likesParagraph = createInfoParagraph('Likes', likes);
    const viewsParagraph = createInfoParagraph('Views', views);
    const commentsParagraph = createInfoParagraph('Comments', comments);
    const downloadsParagraph = createInfoParagraph('Downloads', downloads);

    // Appending paragraphs to the info div
    infoDiv.appendChild(likesParagraph);
    infoDiv.appendChild(viewsParagraph);
    infoDiv.appendChild(commentsParagraph);
    infoDiv.appendChild(downloadsParagraph);

    // Appending image link and info div to the photo card
    photoCard.appendChild(imageLink);
    photoCard.appendChild(infoDiv);

    // Appending the photo card to the gallery container
    gallery.appendChild(photoCard);
}

// Function to create a paragraph for image information
function createInfoParagraph(label, value) {
    const paragraph = document.createElement('p'); // Creating a paragraph element
    paragraph.classList.add('info-item'); // Adding the 'info-item' class to the paragraph element
    paragraph.innerHTML = `<b>${label}</b>: ${value}`; // Setting the inner HTML of the paragraph with label and value

    return paragraph; // Returning the created paragraph element
}

//Created with love to coding