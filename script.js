// Last.fm API key
const API_KEY = "ed0b1677e581806e94cab4252f668bfe";

// HTML link
const artistInput = document.querySelector("#artistInput");
const searchBtn = document.querySelector("#searchBtn");
const albumsContainer = document.querySelector("#albums");
const message = document.querySelector("#message");

const likesLink = document.querySelector("#libraryLink");
const homeLink = document.querySelector("#homeLink");

const albumsTab = document.querySelector("#albumsTab");
const tracksTab = document.querySelector("#tracksTab");

let searchMode = "albums";

albumsTab.addEventListener("click", function() {
    searchMode = "albums";
    albumsTab.classList.add("active-tab");
    tracksTab.classList.remove("active-tab")

    message.textContent = "Album search selected";
});

tracksTab.addEventListener("click", function() {
    searchMode = "tracks";
    tracksTab.classList.add("active-tab");
    albumsTab.classList.remove("active-tab")

    message.textContent = "Track search selected";
});

searchBtn.addEventListener("click", searchMusic)

    function searchMusic() {
        if (searchMode === "albums") {
            searchAlbums();
        } else {
            searchTracks();
        }
    }

    function searchTracks() {
        const artistName = artistInput.value.trim()

        if (artistName === "") {
            message.textContent ="Write artist name...";
            return
        }
        
        albumsContainer.innerHTML = "";
        message.textContent = "Loading tracks...";

        const xhr = new XMLHttpRequest();

        const url = "https://ws.audioscrobbler.com/2.0/?" +
            "method=artist.gettoptracks" +
            "&artist=" + encodeURIComponent(artistName) +
            "&api_key=" + API_KEY +
            "&format=json";

        xhr.open("GET", url);

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                console.log(data);

                message.textContent = "Tracks loaded!"

                displayTracks(data.toptracks.track); 
            } else {
                message.textContent = "Error loading tracks.";
            }
        };

        xhr.onerror = function () {
            message.textContent = "Request failed.";
        };

        xhr.send()
    }

    function searchAlbums() {
        const artistName = artistInput.value.trim();
    
//
    if (artistName === "") {
        message.textContent = "Write artist name...";
        return;
        }
        albumsContainer.innerHTML = "";

        const xhr = new XMLHttpRequest();

        const url = "https://ws.audioscrobbler.com/2.0/?" +
            "method=artist.gettopalbums" +
            "&artist=" + encodeURIComponent(artistName) +
            "&api_key=" + API_KEY +
            "&format=json";

        xhr.open("GET", url);

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                console.log(data);

                message.textContent = "Albums loaded!";

                displayAlbums(data.topalbums.album);
                } else {
                message.textContent = "Error loading albums.";
                }
        };

        xhr.onerror = function () {
            message.textContent = "Request failed.";
        };

        xhr.send();
    }

    function displayAlbums(albums) {
        albumsContainer.innerHTML = "";

        albums.slice(0, 12).forEach(function (album) {
            const card = document.createElement("article");
            card.classList.add("album-card");

            const image =
                album.image[3]["#text"] ||
                "https://via.placeholder.com/300?text=No+Image";

            card.innerHTML = `
                <div class="album-row">
                    <img src="${image}" alt="${album.name}">
    
                    <div class="album-info">
                        <h2>${album.name}</h2>
                        <p>Artist: ${album.artist.name}</p>
                        <p>Playcount: ${album.playcount}</p>
                        <button class="like-btn">Add to Library</button>
                    </div>
                </div>
            `;

            card.querySelector(".like-btn").addEventListener("click", function (event) {
                event.stopPropagation();
                addToLibrary(album, "album");
            })

            function addToLibrary(item, type) {
                let library = JSON.parse(localStorage.getItem("library")) || [];

                const exists = library.some(function (savedItem) {
                    return savedItem.name === item.name && savedItem.type === type;
                });

                if (exists) {
                    message.textContent = "Already in Library.";
                    return;
                }

                item.type = type;
                library.push(item);

                localStorage.setItem("library", JSON.stringify(library));

                message.textContent = "Added to Library";
            }

            card.addEventListener("click", function () {
                showAlbumTracks(album.artist.name, album.name);
            });

            albumsContainer.appendChild(card);
        });
    }

    function showAlbumTracks(artistName, albumName) {
        albumsContainer.innerHTML = "";
        message.textContent = "Loading album tracks...";

        const xhr = new XMLHttpRequest();

        const url = "https://ws.audioscrobbler.com/2.0/?" +
        "method=album.getinfo" +
        "&artist=" + encodeURIComponent(artistName) +
        "&album=" + encodeURIComponent(albumName) +
        "&api_key=" + API_KEY +
        "&format=json";

        xhr.open("GET", url);

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);

                console.log(data);

                if (!data.album || !data.album.tracks || !data.album.tracks.track) {
                message.textContent = "No tracks found in this album.";
                return;
            }

            message.textContent = albumName;
            displayAlbumTrackList(data.album.tracks.track); 
        } else {
            message.textContent = "Error loading album tracks.";
        }
    };

        xhr.onerror = function () {
        message.textContent = "Request failed.";
        };

        xhr.send();
    }

    function displayAlbumTrackList(tracks) {
        albumsContainer.innerHTML = "";

        tracks.forEach(function (track, index) {
            const row = document.createElement("article");
            row.classList.add("album-card");

            row.innerHTML = `
                <div class="album-row">
                    <div class="track-number">${index + 1}</div>

                    <div class="album-info">
                        <h2>${track.name}</h2>
                        <p>Duration: ${track.duration || "Unknown"}</p>
                    </div>
                </div>
            `;

            albumsContainer.appendChild(row);
        });
    }


    function displayTracks(tracks) {
        albumsContainer.innerHTML = "";

        tracks.slice(0, 12).forEach(function (track) {
            const card = document.createElement("article");
            card.classList.add("album-card");

            const image =
                track.image[3]["#text"] ||
                "https://via.placeholder.com/300?text=No+Image";

            card.innerHTML = `
                <div class="album-row">
                    <img src="${image}" alt="${track.name}">
    
                    <div class="album-info">
                        <h2>${track.name}</h2>
                        <p>Artist: ${track.artist.name}</p>
                        <p>Listeners: ${track.listeners}</p>
                    </div>
                </div>
            `;

            albumsContainer.appendChild(card);
        });
    }

homeLink.addEventListener("click", function (event) {
    event.preventDefault();
    showHome();
});

    function showHome() {
        albumsContainer.innerHTML = "";
        message.textContent = "Welcome to KiriNote. Choose an artist from the chart or search your own.";
        
        const chartArtists = [
            "The Weeknd",
            "Kendrick Lamar",
            "Drake",
            "Billie Eilish",
            "Taylor Swift",
            "Travis Scott"
        ];

        chartArtists.forEach(function (artist) {
            const card = document.createElement("article");
            card.classList.add("album-card");

            card.innerHTML = `
                <div class="album-row">
                    <div class="track-number">★</div>

                    <div class="album-info">
                        <h2>${artist}</h2>
                        <p>Popular artist</p>
                        <button class="like-btn">Show albums</button>
                    </div>
                </div>
            `;

            card.querySelector(".like-btn").addEventListener("click", function () {
                artistInput.value = artist;
                artistInput.value = artist;
                albumsTab.classList.add("active-tab");
                tracksTab.classList.remove("active-tab");
                searchAlbums();
            });

            albumsContainer.appendChild(card);
        });
    }

    function showLibrary() {
        const library = JSON.parse(localStorage.getItem("library")) || [];

        albumsContainer.innerHTML = "";
        message.textContent = "Your Library";
        
        if (library.length === 0) {
            message.textContent = "Library is empty.";
            return;
        }

        library.forEach(function (item, index) {
            const card = document.createElement("article");
            card.classList.add("album-card");

            const image =
                item.image && item.image[3]["#text"]
                ? item.image[3]["#text"]
                : "https://via.placeholder.com/300?text=No+Image";

            card.innerHTML = `
                <div class="album-row">
                    <img src="${image}" alt="${item.name}">

                    <div class="album-info">
                        <h2>${item.name}</h2>
                        <p>Type: ${item.type}</p>
                        <p>Artist: ${item.artist.name}</p>
                        <button class="remove-btn">Remove</button>
                    </div>
                </div>
            `;

            card.querySelector(".remove-btn").addEventListener("click", function () {
                removeFromLibrary(index);
            });

            albumsContainer.appendChild(card);
        });
    }

    function removeFromLibrary(index) {
        let library = JSON.parse(localStorage.getItem("library")) || [];

        library.splice(index, 1);

        localStorage.setItem("library", JSON.stringify(library));

        showLibrary();
    }

    likesLink.addEventListener("click", function (event) {
        event.preventDefault();
        showLibrary();
    });

    showHome();
