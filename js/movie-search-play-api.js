// movie-search-play-api.js

import Hls from 'https://cdn.jsdelivr.net/npm/hls.js@latest';

const API_URL = 'https://api.ffzyapi.com/api.php/provide/vod/';

export async function handleMovieSearch(searchSection) {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '输入影视名称';

    const searchButton = document.createElement('button');
    searchButton.textContent = '搜索';

    const resultsContainer = document.createElement('div');

    searchSection.innerHTML = '';
    searchSection.appendChild(searchInput);
    searchSection.appendChild(searchButton);
    searchSection.appendChild(resultsContainer);

    searchButton.addEventListener('click', async () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            const results = await searchMovies(searchTerm);
            displayResults(results, resultsContainer);
        }
    });
}

async function searchMovies(searchTerm) {
    try {
        const response = await fetch(`${API_URL}?ac=detail&wd=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        return data.list || [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

function displayResults(results, container) {
    container.innerHTML = '';
    if (results.length === 0) {
        container.innerHTML = '<p>没有找到相关影视，请尝试其他关键词。</p>';
        return;
    }
    results.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie-item';
        movieElement.innerHTML = `
            <h3>${movie.vod_name}</h3>
            <img src="${movie.vod_pic}" alt="${movie.vod_name}" style="width: 100px; height: auto;">
            <p>${movie.vod_remarks}</p>
        `;
        movieElement.addEventListener('click', () => showMovieDetails(movie));
        container.appendChild(movieElement);
    });
}

function showMovieDetails(movie) {
    console.log('Movie details:', movie);
    const detailsElement = document.createElement('div');
    detailsElement.innerHTML = `
        <h2>${movie.vod_name}</h2>
        <img src="${movie.vod_pic}" alt="${movie.vod_name}" style="width: 200px; height: auto;">
        <p>${movie.vod_content}</p>
        <h3>播放列表</h3>
    `;

    const selectElement = document.createElement('select');
    selectElement.id = 'episodeSelect';
    selectElement.innerHTML = '<option value="">选择剧集</option>';

    const playUrls = movie.vod_play_url.split('#');
    playUrls.forEach((url, index) => {
        const [name, playUrl] = url.split('$');
        const option = document.createElement('option');
        option.value = playUrl;
        option.textContent = name || `第${index + 1}集`;
        selectElement.appendChild(option);
    });

    selectElement.addEventListener('change', (e) => {
        const selectedUrl = e.target.value;
        if (selectedUrl) {
            playVideo(selectedUrl);
        }
    });

    detailsElement.appendChild(selectElement);

    document.getElementById('mainContent').innerHTML = '';
    document.getElementById('mainContent').appendChild(detailsElement);
}

function playVideo(url) {
    console.log('Attempting to play URL:', url);

    let videoPlayer = document.getElementById('videoPlayer');
    if (!videoPlayer) {
        videoPlayer = document.createElement('div');
        videoPlayer.id = 'videoPlayer';
        document.getElementById('mainContent').appendChild(videoPlayer);
    }
    videoPlayer.style.display = 'block';

    let mainPlayer = document.getElementById('mainPlayer');
    if (!mainPlayer) {
        mainPlayer = document.createElement('video');
        mainPlayer.id = 'mainPlayer';
        mainPlayer.controls = true;
        mainPlayer.style.width = '100%';
        mainPlayer.style.maxWidth = '640px';
        videoPlayer.appendChild(mainPlayer);
    }

    if (!url || typeof url !== 'string') {
        console.error('Invalid video URL:', url);
        videoPlayer.innerHTML = '<p>无效的视频地址。</p>';
        return;
    }

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(mainPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            mainPlayer.play().catch(e => {
                console.error('Autoplay failed:', e);
                showPlayButton(mainPlayer);
            });
        });
    } else if (mainPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        mainPlayer.src = url;
        mainPlayer.addEventListener('loadedmetadata', function() {
            mainPlayer.play().catch(e => {
                console.error('Autoplay failed:', e);
                showPlayButton(mainPlayer);
            });
        });
    } else {
        console.error('This browser does not support HLS');
        videoPlayer.innerHTML = '<p>您的浏览器不支持播放此视频。请尝试使用其他浏览器。</p>';
    }
}

function showPlayButton(player) {
    const playButton = document.createElement('button');
    playButton.textContent = '播放视频';
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.addEventListener('click', () => {
        player.play();
        playButton.remove();
    });
    player.parentNode.insertBefore(playButton, player.nextSibling);
}

function createVideoPlayer() {
    const videoPlayer = document.createElement('div');
    videoPlayer.id = 'videoPlayer';
    videoPlayer.style.display = 'none';
    videoPlayer.style.position = 'relative';
    document.getElementById('mainContent').appendChild(videoPlayer);
}

createVideoPlayer();