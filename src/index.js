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
    page++;
    getImages(searchQuery, page); // Calling the function to fetch more images for the current search query and page
});

// Function to clear the gallery container
function clearGallery() {
    gallery.innerHTML = '';
}

// Async function to fetch images from the Pixabay API
async function getImages(searchQuery, page) {
    const API_KEY = '37005405-aee23f10e1a9d709a8c5923f1';
    const BASE_URL = 'https://pixabay.com/api/'; 
    const perPage = 40; 

    try {
        const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`); // Making a GET request to the Pixabay API
        const data = response.data;

        if (data.hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.'); // Displaying a failure notification if no images were found
        } else {
            totalPages = Math.ceil(data.totalHits / perPage); // Calculating the total number of pages based on the total hits from the API response

            data.hits.forEach(async image => {
                // Looping through each image in the response data
                const imageURL = image.webformatURL; 
                const largeImageURL = image.largeImageURL;
                const altTxt = image.tags; 
                const likes = image.likes;
                const views = image.views; 
                const comments = image.comments;
                const downloads = image.downloads;

                await renderImageCard(imageURL, largeImageURL, altTxt, likes, views, comments, downloads); 
            });

            if (page >= totalPages) {
                loadMoreBtn.style.display = 'none'; 
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            } else {
                loadMoreBtn.style.display = 'block'; 
            }

            lightbox.refresh(); 
        }
    } catch (error) {
        Notiflix.Notify.failure('An error occurred while fetching images. Please try again.'); 
    }
}

// Function to render an image card with information
function renderImageCard(imageURL, largeImageURL, altTxt, likes, views, comments, downloads) {
    const photoCard = document.createElement('div'); 
    photoCard.classList.add('photo-card'); 

    const imageLink = document.createElement('a'); 
    imageLink.href = largeImageURL; 

    const image = document.createElement('img'); 
    image.src = imageURL;
    image.alt = altTxt;
    image.loading = 'lazy'; 

    imageLink.appendChild(image); 

    const infoDiv = document.createElement('div'); 
    infoDiv.classList.add('info'); 

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