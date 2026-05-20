# Unmute FB Video

🔊 Automatically unmutes Facebook videos/reels and remembers your preferred volume.

Perfect for avoiding manual unmute clicks every time a video plays.

## ✨ Features

- Automatically unmutes Facebook videos
- Works with Feed videos and Reels
- Remembers your preferred volume
- Automatically applies saved volume to new videos
- Prevents Facebook from muting videos again
- Lightweight and fast

## 📦 Installation

1. Install [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).

2. Click here to install the script:
    - [Install Script](https://raw.githubusercontent.com/MAAB-FW/unmute-fb-video/main/facebook-force-volume.user.js)

3. Done! The script will run automatically on Facebook.

## ⚙️ How It Works

- Default volume is `30%`
- When you change the volume manually, the script remembers it
- New Facebook videos/reels automatically use your saved volume
- Videos are automatically unmuted

## 🛠️ Default Volume

Edit this line inside the script:

```js
localStorage.getItem(STORAGE_KEY) || "0.3";
```

Examples:

- `0.1` → 10%
- `0.3` → 30%
- `0.5` → 50%
- `1.0` → 100%

## 🪪 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
