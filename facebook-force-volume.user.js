// ==UserScript==
// @name         Unmute FB Video
// @namespace    https://github.com/MAAB-FW
// @version      2.1.1
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
    const DEFAULT_VOLUME = 0.3;
    const APPLY_LOCK_MS = 1200;
    const MANUAL_KEY_WINDOW_MS = 1200;
    const REEL_GUARD_MS = 5000;

    function getStoredVolume() {
        const rawValue = localStorage.getItem(STORAGE_KEY);
        const parsedValue = rawValue === null ? NaN : parseFloat(rawValue);

        if (
            Number.isFinite(parsedValue) &&
            parsedValue >= 0 &&
            parsedValue <= 1
        ) {
            return parsedValue;
        }

        return DEFAULT_VOLUME;
    }

    let preferredVolume = getStoredVolume();
    let isPointerDown = false;
    let lastManualKeyAt = 0;

    function markApplying(video, duration = APPLY_LOCK_MS) {
        video.dataset.fbVolumeApplyingUntil = String(Date.now() + duration);
    }

    function isApplying(video) {
        return Number(video.dataset.fbVolumeApplyingUntil || 0) > Date.now();
    }

    function markGuard(video, duration = REEL_GUARD_MS) {
        video.dataset.fbVolumeGuardUntil = String(Date.now() + duration);
    }

    function isGuarded(video) {
        return Number(video.dataset.fbVolumeGuardUntil || 0) > Date.now();
    }

    function hasManualIntent() {
        return (
            isPointerDown || Date.now() - lastManualKeyAt < MANUAL_KEY_WINDOW_MS
        );
    }

    function applyVolume(video) {
        try {
            preferredVolume = getStoredVolume();
            markGuard(video);
            markApplying(video);
            video.muted = false;
            video.defaultMuted = false;
            video.volume = preferredVolume;

            setTimeout(() => {
                markApplying(video);
                video.muted = false;
                video.volume = preferredVolume;
            }, 250);

            setTimeout(() => {
                markApplying(video);
                video.muted = false;
                video.volume = preferredVolume;
            }, 900);
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
            if (video.dataset.fbVolumeFixed) return;
            video.dataset.fbVolumeFixed = "1";
            applyVolume(video);

            video.addEventListener("volumechange", () => {
                try {
                    if (isApplying(video)) {
                        return;
                    }

                    if (video.muted) {
                        video.muted = false;
                    }

                    if (Math.abs(video.volume - preferredVolume) <= 0.01) {
                        return;
                    }

                    if (hasManualIntent()) {
                        saveVolume(video.volume);
                        return;
                    }

                    if (isGuarded(video) || !video.paused) {
                        applyVolume(video);
                    }
                } catch (e) {
                    console.error("[Unmute FB Video]", e);
                }
            });

            video.addEventListener("play", () => {
                applyVolume(video);
            });

            video.addEventListener("loadeddata", () => {
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

    document.addEventListener(
        "pointerdown",
        () => {
            isPointerDown = true;
        },
        true
    );

    document.addEventListener(
        "pointerup",
        () => {
            isPointerDown = false;
        },
        true
    );

    document.addEventListener(
        "pointercancel",
        () => {
            isPointerDown = false;
        },
        true
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                ].includes(event.key)
            ) {
                lastManualKeyAt = Date.now();
            }
        },
        true
    );

    setInterval(() => {
        document
            .querySelectorAll('video[data-fb-volume-fixed="1"]')
            .forEach((video) => {
                preferredVolume = getStoredVolume();

                if (
                    !isApplying(video) &&
                    !video.paused &&
                    Math.abs(video.volume - preferredVolume) > 0.01
                ) {
                    applyVolume(video);
                }
            });
    }, 2000);
})();
