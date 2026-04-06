const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="'

const main = document.getElementById('main')
const form = document.getElementById('form')
const search = document.getElementById('search')

getMovies(API_URL)

async function getMovies(url) {
    const res = await fetch(url)
    const data = await res.json()

    showMovies(data.results)
}

function showMovies(movies){
    main.innerHTML = '';

    if (!movies || movies.length === 0) {
        main.innerHTML = '<h2 style="color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); text-align: center; margin-top: 50px; width: 100%;">Tidak ada film ditemukan</h2>';
        return;
    }

    movies.forEach((movie) => {
        const { id, title, poster_path, vote_average, overview } = movie;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
        <img src="${poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/1080x1580'}" alt="${title}">
        <div class="movie-info">
            <h3>${title}</h3>
            <span class="${getClassByRate(vote_average)}">${vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
        </div>
        <div class="overview">
            <h3>Overview</h3>
            <p>${overview}</p>
            <button class="list-btn" style="margin-top: 15px; width: 100%; padding: 10px; background: var(--glossy-yellow); color: black; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);">
                ➕ Add to My List
            </button>
        </div>
        `;

        main.appendChild(movieEl);

        // Fitur Simpan / Hapus dari My List
        const listBtn = movieEl.querySelector('.list-btn');
        let mySavedList = JSON.parse(localStorage.getItem('myList')) || [];
        
        // Cek apakah film sudah ada di list
        const isSaved = mySavedList.find(item => item.id === id);
        if (isSaved) {
            listBtn.innerHTML = '➖ Remove from List';
            listBtn.style.background = 'var(--accent-red)';
            listBtn.style.color = 'white';
            listBtn.style.boxShadow = '0 0 10px rgba(230, 0, 0, 0.6)';
        }

        listBtn.addEventListener('click', () => {
            let currentList = JSON.parse(localStorage.getItem('myList')) || [];
            const exists = currentList.find(item => item.id === id);

            if (exists) {
                // Hapus
                currentList = currentList.filter(item => item.id !== id);
                localStorage.setItem('myList', JSON.stringify(currentList));
                listBtn.innerHTML = '➕ Add to My List';
                listBtn.style.background = 'var(--glossy-yellow)';
                listBtn.style.color = 'black';
                listBtn.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.4)';
            } else {
                // Simpan
                currentList.push(movie);
                localStorage.setItem('myList', JSON.stringify(currentList));
                listBtn.innerHTML = '➖ Remove from List';
                listBtn.style.background = 'var(--accent-red)';
                listBtn.style.color = 'white';
                listBtn.style.boxShadow = '0 0 10px rgba(230, 0, 0, 0.6)';
            }

            // Jika sedang berada di tab My List, refresh tampilannya
            const activeLink = document.querySelector('.nav-links a.active');
            if (activeLink && activeLink.innerText === 'My List') {
                if (currentList.length === 0) {
                    main.innerHTML = '<h2 style="color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); text-align: center; margin-top: 50px; width: 100%;">Daftar Simpanan Anda Kosong</h2>';
                } else {
                    showMovies(currentList);
                }
            }
        });
    });
}

function getClassByRate(vote){
    if(vote >= 8){
        return 'green'
    }else if(vote >= 5){
        return 'orange'
    }else {
        return 'red'
    }
}

form.addEventListener('submit', (e)=>{
e.preventDefault()

const searchTerm = search.value

if(searchTerm && searchTerm !== ''){
    getMovies(SEARCH_API + searchTerm)

    search.value = ''
}else {
    window.location.reload()
}
})

// Fungsi simple untuk navigasi menu klik
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Pindahkan garis bawah kuning ke menu yang diklik
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Ganti konten film secara simple berdasarkan menu
        const menuText = link.innerText;
        
        if (menuText === 'Home') {
            getMovies(API_URL);
        } else if (menuText === 'Movies') {
            getMovies(SEARCH_API + 'Action');
        } else if (menuText === 'TV Shows') {
            getMovies(SEARCH_API + 'Drama');
        } else if (menuText === 'New & Popular') {
            getMovies(SEARCH_API + 'Avengers');
        } else if (menuText === 'My List') {
            const savedList = JSON.parse(localStorage.getItem('myList')) || [];
            if (savedList.length === 0) {
                main.innerHTML = '<h2 style="color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); text-align: center; margin-top: 50px; width: 100%;">Daftar Simpanan Anda Kosong</h2>';
            } else {
                showMovies(savedList);
            }
        }
    });
});