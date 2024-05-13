import Notiflix from 'notiflix';
import axios from 'axios'; 
import SimpleLightbox from "simplelightbox"; 
import "simplelightbox/dist/simple-lightbox.min.css"; 

const searchForm = document.querySelector('.search-form'); 
const gallery = document.querySelector('.gallery'); 
const loadMoreBtn = document.querySelector('.load-more'); 

let searchQuery = '';
let page = 1;
let totalPages = 0;

const lightbox = new SimpleLightbox('.gallery a'); 

searchForm.addEventListener('submit', function (event) {
    event.preventDefault(); 

    searchQuery = searchForm.elements.searchQuery.value.trim(); 

    if (searchQuery === '') {
        Notiflix.Notify.warning('Please enter a search query.'); 
        return;
    }

    clearGallery(); 
    page = 1; 
    getImages(searchQuery, page);
});

// Event listener for the "Load more" button click
loadMoreBtn.addEventListener('click', function () {
    page++;
    getImages(searchQuery, page); 
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
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.'); 
        } else {
            totalPages = Math.ceil(data.totalHits / perPage);

            data.hits.forEach(async image => {
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


    infoDiv.appendChild(likesParagraph);
    infoDiv.appendChild(viewsParagraph);
    infoDiv.appendChild(commentsParagraph);
    infoDiv.appendChild(downloadsParagraph);


    photoCard.appendChild(imageLink);
    photoCard.appendChild(infoDiv);


    gallery.appendChild(photoCard);
}

// Function to create a paragraph for image information
function createInfoParagraph(label, value) {
    const paragraph = document.createElement('p');
    paragraph.classList.add('info-item'); 
    paragraph.innerHTML = `<b>${label}</b>: ${value}`;

    return paragraph; 
}