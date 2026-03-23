// Video Autoplay Module
// Handles video autoplay configuration, fallback UI, and error handling

class VideoAutoplay {
  constructor(config) {
    this.config = config;
    this.videos = new Map();
  }

  init() {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => this.configureVideo(video));
  }

  configureVideo(video) {
    // Set required attributes for autoplay compliance
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('loop', '');
    video.setAttribute('preload', 'metadata');
    video.setAttribute('controls', '');
    video.setAttribute('data-video-enhanced', 'true');

    // Attempt autoplay
    this.attemptAutoplay(video);
  }

  attemptAutoplay(video) {
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay successful
          this.videos.set(video, { canAutoplay: true, hasPlayed: true });
        })
        .catch(error => {
          // Autoplay blocked by browser
          console.warn('Video autoplay blocked:', error);
          this.showPlayButton(video);
          this.videos.set(video, { canAutoplay: false, hasPlayed: false });
        });
    }
  }

  showPlayButton(video) {
    const container = video.parentElement;
    
    const overlay = document.createElement('div');
    overlay.className = 'video-play-overlay';
    overlay.innerHTML = `
      <button class="video-play-button" aria-label="Play video">
        <span class="material-symbols-outlined">play_arrow</span>
      </button>
    `;

    container.style.position = 'relative';
    container.appendChild(overlay);

    const button = overlay.querySelector('.video-play-button');
    button.addEventListener('click', () => {
      video.play();
      overlay.remove();
    });
  }

  destroy() {
    this.videos.clear();
  }
}

export default VideoAutoplay;
