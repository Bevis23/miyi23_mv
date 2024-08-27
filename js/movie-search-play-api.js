// movie-search-play-api.js

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
        const data = await response.json();
        console.log('API Response:', data); // 日志输出API响应
        return data.list || [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

function displayResults(results, container) {
    container.innerHTML = '';
    results.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie-item';
        movieElement.innerHTML = `
            <h3>${movie.vod_name}</h3>
            <img src="${movie.vod_pic}" alt="${movie.vod_name}" style="width: 100px;">
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
        <img src="${movie.vod_pic}" alt="${movie.vod_name}" style="width: 200px;">
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

    // 使用 Netlify 代理
    const proxyUrl = `/proxy/${encodeURIComponent(url)}`;

    const iframe = document.createElement('iframe');
    iframe.src = proxyUrl;
    iframe.width = '100%';
    iframe.height = '400px';
    iframe.allowFullscreen = true;

    videoPlayer.innerHTML = '';
    videoPlayer.appendChild(iframe);
}

// 创建视频播放器
function createVideoPlayer() {
    const videoPlayer = document.createElement('div');
    videoPlayer.id = 'videoPlayer';
    videoPlayer.style.display = 'none';

    document.getElementById('mainContent').appendChild(videoPlayer);
}

// 在模块初始化时创建视频播放器
createVideoPlayer();