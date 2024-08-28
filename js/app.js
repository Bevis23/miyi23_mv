import { handleMovieSearch } from './movie-search-play-api.js';

const HOT_VIDEOS_API = '/.netlify/functions/proxy?url=https://baobab.kaiyanapp.com/api/v4/discovery/hot';

let currentVideoList = [];
let currentVideoIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const hotVideosBtn = document.getElementById('hotVideosBtn');
    const movieSearchBtn = document.getElementById('movieSearchBtn');
    const videoPlayer = document.getElementById('videoPlayer');
    const mainPlayer = document.getElementById('mainPlayer');
    const nextVideoBtn = document.getElementById('nextVideoBtn');
    const searchSection = document.getElementById('searchSection');


    hotVideosBtn.addEventListener('click', () => {
        videoPlayer.style.display = 'block';
        searchSection.style.display = 'none';
        loadHotVideos();
    });

    movieSearchBtn.addEventListener('click', () => {
        videoPlayer.style.display = 'none';
        searchSection.style.display = 'block';
        handleMovieSearch(searchSection);
    });

    nextVideoBtn.addEventListener('click', playNextVideo);

    // 初始加载热门视频
    loadHotVideos();

    async function loadHotVideos() {
        try {
            const response = await fetch(`${HOT_VIDEOS_API}&num=10`);
            const data = await response.json();
            currentVideoList = data.itemList.filter(item => item.type === 'video').map(item => item.data);
            currentVideoIndex = 0;
            if (currentVideoList.length > 0) {
                playVideo(currentVideoList[currentVideoIndex]);
            } else {
                console.error('No videos found in the response');
            }
        } catch (error) {
            console.error('Error loading hot videos:', error);
        }
    }

    function playVideo(video) {
        mainPlayer.src = video.playUrl;
        mainPlayer.play();
        document.getElementById('videoTitle').textContent = video.title;
        document.getElementById('videoDescription').textContent = video.description;
    }

    function playNextVideo() {
        currentVideoIndex = (currentVideoIndex + 1) % currentVideoList.length;
        playVideo(currentVideoList[currentVideoIndex]);
    }
});
    