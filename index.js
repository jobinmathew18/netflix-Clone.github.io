// boots up the app

// https://api.themoviedb.org/3/genre/movie/list?api_key=202d3f6636e378b257286d175631a91d&language=en-US&page=1
const apiKey = "202d3f6636e378b257286d175631a91d"
const trailerApiKey = "AIzaSyBdk6q99KFN1OzMZ5IHlAqKrq-cOYIE8_s"
const apiEndpoint = "https://api.themoviedb.org/3"
const imgPath = "https://image.tmdb.org/t/p/original"

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apiKey}`,
    fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apiKey}&language=en-US`,
    searchOnYoutube: (query)=> `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${trailerApiKey}`
}

const openMenu = ()=>{
    document.querySelector('.nav-menu-cont').classList.toggle('active')
}

function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

async function fetchTrendingMovies(){
    try {
        const data = await fetchAndbuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
        // console.log(data)
        const randomIndex = parseInt(Math.random() * data.length)
        buildBannerSection(data[randomIndex])
    } catch (error) {
        console.error(error)
    } 
}

function buildBannerSection(movie){
    // console.log(movie);
    const bannerCont = document.getElementById('banner-section')
    bannerCont.style.backgroundImage =`linear-gradient(to right, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1)), url(${imgPath}${movie.backdrop_path})`
   
    const div = document.createElement('div');
    
    div.innerHTML = `
        <h2 class="banner-title">${movie.title}</h2>
        <h4 class="banner-info">Trending in ${movie.media_type}s | Released: ${movie.release_date}</h4>
        <p class="banner-overview">${movie.overview && movie.overview.length > 170 ? movie.overview.slice(0,200).trim()+ '...':movie.overview}</p>
        <div class="action-buttons-cont">
            <a href="#" class="primary action-button "> <i class="fa-solid fa-play"></i> Play </a>
            <a href="#" class="secondary action-button"><i class="fa-solid fa-angles-right"></i> More Info</a>
        </div>
        <div class="banner-fade-bottom"></div>
    `
    div.className = 'banner-content flex container';
    bannerCont.append(div);
}

async function fetchAndBuildAllSections() {
    try {
        let data = await fetch(apiPaths.fetchAllCategories)
        data = await data.json();
        const categories = data.genres
        // Array.isArray(categories) means "Is categories an array or not?"
        if (Array.isArray(categories) && categories.length) {
            // console.table(categories)
            categories.forEach((category) => {
                fetchAndbuildMovieSection(apiPaths.fetchMoviesList(category.id), category.name)
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function fetchAndbuildMovieSection(fetchUrl, categoryName) {
    try {
        // console.log(categoryName,fetchUrl)
        let data = await fetch(fetchUrl)
        data = await data.json()
        const movies = data.results;
        if (Array.isArray(movies) && movies.length) {
            // console.log(movies)
            buildMoviesSection(movies, categoryName)
            return movies;
        }
    } catch (error) {
        console.log(error)
    }
}

function buildMoviesSection(list, categoryName) {
    // console.log(list,categoryName)
    const movieCont = document.getElementById('movies-cont')
    const moviesListHtml = list.map((item) => {
        return ` <img class="movie-item" src="${imgPath}${item.backdrop_path}" alt="${item.title}" onclick="searchMovieTrailer('${item.title}')"> `
    }).join(' ')            //since movieListHtml is storing data in strings of array, that is why join() is used.

    // console.log(moviesListHtml)

    const moviesSectionHtml = `
        <div class="movies-section">
            <h3 class="movie-section-heading">${categoryName}<span class="explore-nudge">Explore All</span> </h3>
            <div class="movies-row flex">
                ${moviesListHtml}
            </div>
        </div>
    `
    // console.log(moviesSectionHtml)

    const div = document.createElement('div')
    div.className = 'movies-section'
    div.innerHTML = moviesSectionHtml

    movieCont.append(div)
}

async function searchMovieTrailer(movieName){
    console.log(movieName)
    if(!movieName) return;
    
    try {
        let data = await fetch(apiPaths.searchOnYoutube(movieName))
        data = await data.json()
        // console.log(data)

        // we have written data.items[0] because most probably first element will show us perfect trailer.
        // console.log(data.items[0])
        const bestResult = data.items[0].id.videoId;
        const youtubeUrl = `https://www.youtube.com/watch?v=${bestResult}`
        console.log(youtubeUrl)
        window.open(youtubeUrl,'_blank')

    } catch (error) {
        console.log(error)
    }
}

window.addEventListener('load', () => {
    init();
    window.addEventListener('scroll', ()=>{
        //header ui update
        const header = document.getElementById('header');
        if(window.scrollY > 50){
            header.classList.add('black-bg')
        }else{
            header.classList.remove('black-bg')
        }
    })
})