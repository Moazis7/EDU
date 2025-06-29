import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, poster, title, onReady, onError }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoUrl) return;

    // Initialize Plyr
    const player = new Plyr(videoRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: ['captions', 'quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      quality: {
        default: 720,
        options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
      },
      captions: { active: false, language: 'auto', update: false },
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      keyboard: { focused: true, global: false },
      tooltips: { controls: true, seek: true },
      autoplay: false,
      muted: false,
      loop: { active: false },
      clickToPlay: true,
      hideControls: true,
      resetOnEnd: false,
      disableContextMenu: false,
      loadSprite: true,
      iconPrefix: 'plyr',
      iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
      blankVideo: 'https://cdn.plyr.io/static/blank.mp4'
    });

    playerRef.current = player;

    // Event listeners
    player.on('ready', () => {
      console.log('Video player ready');
      if (onReady) onReady(player);
    });

    player.on('error', (error) => {
      console.error('Video player error:', error);
      if (onError) onError(error);
    });

    player.on('play', () => {
      console.log('Video started playing');
    });

    player.on('pause', () => {
      console.log('Video paused');
    });

    player.on('ended', () => {
      console.log('Video ended');
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoUrl, onReady, onError]);

  if (!videoUrl) {
    return (
      <div className="video-player-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">🎥</div>
          <p>No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        crossOrigin="anonymous"
        controls
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        <p>
          Your browser doesn't support HTML5 video. Here's a{' '}
          <a href={videoUrl}>link to the video</a> instead.
        </p>
      </video>
    </div>
  );
};

export default VideoPlayer;
