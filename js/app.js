// js/app.js
import { handleMovieSearch } from './movie-search-play-api.js';
import Hls from 'https://cdn.jsdelivr.net/npm/hls.js@latest';

const HOT_VIDEOS_API = 'https://baobab.kaiyanapp.com/api/v4/discovery/hot';
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
            const response = await fetch(`${HOT_VIDEOS_API}?num=10`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            currentVideoList = data.itemList.filter(item => item.type === 'video').map(item => item.data);
            currentVideoIndex = 0;
            if (currentVideoList.length > 0) {
                playVideo(currentVideoList[currentVideoIndex]);
            } else {
                throw new Error('No videos found in the response');
            }
        } catch (error) {
            console.error('Error loading hot videos:', error);
            videoPlayer.innerHTML = `<p>加载视频时出错：${error.message}。请稍后再试。</p>`;
        }
    }

    function playVideo(video) {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(video.playUrl);
            hls.attachMedia(mainPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                mainPlayer.play().catch(e => {
                    console.error('Autoplay failed:', e);
                    // 显示播放按钮，让用户手动触发播放
                    showPlayButton(video);
                });
            });
        }
        // 对于原生支持 HLS 的浏览器（如 Safari）
        else if (mainPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            mainPlayer.src = video.playUrl;
            mainPlayer.addEventListener('loadedmetadata', function() {
                mainPlayer.play().catch(e => {
                    console.error('Autoplay failed:', e);
                    showPlayButton(video);
                });
            });
        } else {
            console.error('This browser does not support HLS');
            videoPlayer.innerHTML = '<p>您的浏览器不支持播放此视频。请尝试使用其他浏览器。</p>';
        }

        document.getElementById('videoTitle').textContent = video.title;
        document.getElementById('videoDescription').textContent = video.description;
    }

    function showPlayButton(video) {
        const playButton = document.createElement('button');
        playButton.textContent = '播放视频';
        playButton.addEventListener('click', () => {
            mainPlayer.play();
            playButton.remove();
        });
        videoPlayer.insertBefore(playButton, mainPlayer);
    }

    function playNextVideo() {
        currentVideoIndex = (currentVideoIndex + 1) % currentVideoList.length;
        playVideo(currentVideoList[currentVideoIndex]);
    }
});