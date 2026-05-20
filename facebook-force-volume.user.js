// ==UserScript==
// @name         Unmute FB Video
// @namespace    https://github.com/MAAB-FW
// @version      2.1.0
// @description  Automatically unmutes Facebook videos/reels and remembers your preferred volume
// @author       MAAB-FW
// @homepageURL  https://github.com/MAAB-FW/unmute-fb-video
// @supportURL   https://github.com/MAAB-FW/unmute-fb-video/issues
// @downloadURL  https://raw.githubusercontent.com/MAAB-FW/unmute-fb-video/main/facebook-force-volume.user.js
// @updateURL    https://raw.githubusercontent.com/MAAB-FW/unmute-fb-video/main/facebook-force-volume.user.js
// @license      MIT
// @match        https://www.facebook.com/*
// @match        https://web.facebook.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const STORAGE_KEY = "fb-video-volume";

    // Default volume = 30%
    let preferredVolume = parseFloat(
        localStorage.getItem(STORAGE_KEY) || "0.3"
    );

    function applyVolume(video) {
        try {
            video.muted = false;
            video.defaultMuted = false;

            // Apply saved/preferred volume
            video.volume = preferredVolume;

            // Facebook sometimes changes volume later
            setTimeout(() => {
                video.muted = false;
                video.volume = preferredVolume;
            }, 300);
        } catch (e) {
            console.error("[Unmute FB Video]", e);
        }
    }

    function saveVolume(volume) {
        preferredVolume = volume;
        localStorage.setItem(STORAGE_KEY, volume.toString());
    }

    function processVideos() {
        document.querySelectorAll("video").forEach((video) => {
            // Apply immediately
            applyVolume(video);

            // Prevent duplicate listeners
            if (video.dataset.fbVolumeFixed) return;
            video.dataset.fbVolumeFixed = "1";

            // Detect manual volume changes
            video.addEventListener("volumechange", () => {
                try {
                    // If muted, just unmute
                    if (video.muted) {
                        video.muted = false;
                    }

                    // Save user-changed volume
                    if (Math.abs(video.volume - preferredVolume) > 0.01) {
                        saveVolume(video.volume);
                    }
                } catch (e) {
                    console.error("[Unmute FB Video]", e);
                }
            });

            // Re-apply when video starts
            video.addEventListener("play", () => {
                applyVolume(video);
            });
        });
    }

    // Initial run
    processVideos();

    // Observe dynamically loaded videos
    const observer = new MutationObserver(() => {
        processVideos();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // Backup loop
    setInterval(processVideos, 1500);
})();
