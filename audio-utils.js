function fadeIn(audio, duration = 250, targetVolume = 1) {
  audio.volume = 0;

  const stepTime = 20;
  const steps = Math.max(1, Math.floor(duration / stepTime));
  const volumeStep = targetVolume / steps;

  const interval = setInterval(() => {
    const nextVolume = Math.min(targetVolume, audio.volume + volumeStep);
    audio.volume = nextVolume;

    if (nextVolume >= targetVolume) {
      clearInterval(interval);
    }
  }, stepTime);
}

function fadeOut(audio, duration = 250) {
  return new Promise((resolve) => {
    if (!audio) {
      resolve();
      return;
    }

    const startVolume = audio.volume;
    const stepTime = 20;
    const steps = Math.max(1, Math.floor(duration / stepTime));
    const volumeStep = startVolume / steps;

    const interval = setInterval(() => {
      const nextVolume = Math.max(0, audio.volume - volumeStep);
      audio.volume = nextVolume;

      if (nextVolume <= 0.01) {
        clearInterval(interval);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = startVolume || 1;
        resolve();
      }
    }, stepTime);
  });
}

async function stopManagedAudio(key, duration = 200) {
  const audio = window[key];
  if (!audio) return;

  await fadeOut(audio, duration);
  window[key] = null;
}

async function playManagedAudio(key, file, options = {}) {
  const {
    volume = 1,
    fadeInDuration = 200,
    loop = false
  } = options;

  if (window[key]) {
    await fadeOut(window[key], 150);
  }

  const audio = new Audio(file);
  audio.preload = "auto";
  audio.loop = loop;

  window[key] = audio;

  await audio.play();
  fadeIn(audio, fadeInDuration, volume);

  return audio;
}

async function swapManagedAudio(key, file, options = {}) {
  return playManagedAudio(key, file, options);
}
