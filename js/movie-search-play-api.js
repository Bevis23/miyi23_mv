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

    const videoPlayer = document.getElementById('videoPlayer');
    const iframe = document.getElementById('videoIframe');

    if (!videoPlayer || !iframe) {
        console.error('Video player elements not found');
        return;
    }

    // 检查URL是否是有效的
    if (!url || typeof url !== 'string') {
        console.error('Invalid video URL:', url);
        return;
    }

    // 尝试将 HTTP 链接转换为 HTTPS
    url = url.replace('http://', 'https://');

    // 使用代理服务器处理请求
    const proxyUrl = `/video-proxy/${encodeURIComponent(url)}`;

    // 更新 iframe 的 src
    iframe.src = proxyUrl;

    // 显示视频播放器
    videoPlayer.style.display = 'block';
}

// 创建视频播放器容器
function createVideoPlayer() {
    const videoPlayer = document.createElement('div');
    videoPlayer.id = 'videoPlayer';
    videoPlayer.style.display = 'none';

    // 创建一个 iframe 元素
    const iframe = document.createElement('iframe');
    iframe.id = 'videoIframe';
    iframe.width = '100%';
    iframe.height = '400px';
    iframe.allowFullscreen = true;

    // 将 iframe 添加到 videoPlayer 容器中
    videoPlayer.appendChild(iframe);

    // 将整个 videoPlayer 容器添加到 mainContent
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.appendChild(videoPlayer);
    } else {
        console.error('mainContent element not found');
    }
}

// 在模块初始化时创建视频播放器
createVideoPlayer();