// ==UserScript==
// @name         Unmute FB Video
// @namespace    https://github.com/MAAB-FW
// @version      2.0.0
// @description  Automatically unmutes Facebook videos/reels and forces volume to 30%
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

    const TARGET_VOLUME = 0.3;

    function applyVolume(video) {
        try {
            video.muted = false;
            video.defaultMuted = false;
            video.volume = TARGET_VOLUME;

            // Facebook sometimes changes the volume later
            setTimeout(() => {
                video.muted = false;
                video.volume = TARGET_VOLUME;
            }, 300);
        } catch (e) {
            console.error("[Unmute FB Video]", e);
        }
    }

    function processVideos() {
        document.querySelectorAll("video").forEach((video) => {
            // Apply immediately
            applyVolume(video);

            // Prevent duplicate listeners
            if (video.dataset.fbVolumeFixed) return;
            video.dataset.fbVolumeFixed = "1";

            // Re-apply when Facebook changes volume
            video.addEventListener("volumechange", () => {
                if (
                    video.muted ||
                    Math.abs(video.volume - TARGET_VOLUME) > 0.01
                ) {
                    applyVolume(video);
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
