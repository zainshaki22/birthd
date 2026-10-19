
"use strict";

// PROJECT SHAHYAAN.EXE — BIRTHDAY PROTOCOL 2.1

const $ = (id) => document.getElementById(id);

let soundEnabled = true;
let audioContext = null;
let currentQuestion = 0;
let answered = false;
let candlesRemaining = 21;
let micStream = null;
let micContext = null;
let analyser = null;
let micSource = null;
let micFrame = null;
let lastBlow = 0;
let sustainedBlow = 0;
let completed = false;

const questions = [
  {
    question: "What happens when Shahyaan enters a room?",
    answers: [
      "The Wi-Fi gets stronger",
      "Chaos levels increase by 9000%",
      "Everyone starts studying",
      "The room becomes peaceful"
    ],
    correct: 1,
    response: "CORRECT! Scientists are still investigating."
  },
  {
    question: "What is Shahyaan's greatest superpower?",
    answers: [
      "Teleportation",
      "Reading minds",
      "Annoying his brother professionally",
      "Controlling the weather"
    ],
    correct: 2,
    response: "EXACTLY! A rare and dangerous talent."
  },
  {
    question: "What is the correct birthday protocol?",
    answers: [
      "Eat cake and become legendary",
      "Do homework for 21 hours",
      "Restart the entire year",
      "Uninstall your birthday"
    ],
    correct: 0,
    response: "ACCESS GRANTED! Legendary status confirmed."
  }
];

// RETRO SOUND EFFECTS
function beep(frequency = 500, duration = 0.12, type = "square") {
  if (!soundEnabled) return;
  try {
    audioContext ??= new (window.AudioContext ||
      window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001, audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Audio unavailable:", error);
  }
}

function successSound() {
  [440, 554, 659, 880].forEach((note, index) => {
    setTimeout(() => beep(note, 0.18, "sine"), index * 115);
  });
}

function errorSound() {
  beep(180, 0.25, "sawtooth");
}

// SCREEN NAVIGATION
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  beep(680, 0.09);
}

// THEME AND SOUND
$("themeBtn").addEventListener("click", () => {
  const light = document.body.dataset.theme === "light";
  document.body.dataset.theme = light ? "dark" : "light";
  $("themeBtn").textContent = light ? "☀" : "☾";
  beep();
});

$("soundBtn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  $("soundBtn").textContent = soundEnabled ? "♫ ON" : "♫ OFF";
  if (soundEnabled) beep(750);
});

// PASSWORD
$("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if ($("password").value.trim() === "2006") {
    $("loginError").textContent = "ACCESS GRANTED. WELCOME, LEGEND.";
    successSound();
    setTimeout(() => {
      showScreen("quiz");
      renderQuestion();
    }, 750);
  } else {
    $("loginError").textContent =
      "ACCESS DENIED! BRO, YOU FORGOT YOUR OWN BIRTH YEAR? 💀";
    errorSound();
  }
});

// BIRTHDAY QUIZ
function renderQuestion() {
  answered = false;
  const q = questions[currentQuestion];

  $("questionCount").textContent =
    `CHALLENGE ${currentQuestion + 1} OF ${questions.length}`;
  $("questionText").textContent = q.question;
  $("quizProgress").style.width =
    `${(currentQuestion / questions.length) * 100}%`;
  $("quizFeedback").textContent = "";
  $("nextQuestion").classList.add("hidden");
  $("answers").replaceChildren();

  q.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    button.addEventListener("click", () => checkAnswer(index));
    $("answers").appendChild(button);
  });
}

function checkAnswer(index) {
  if (answered) return;

  const q = questions[currentQuestion];
  const buttons = [...$("answers").children];

  if (index !== q.correct) {
    buttons[index].classList.add("wrong");
    $("quizFeedback").textContent =
      "WRONG ANSWER! YOUR BRAIN.EXE HAS STOPPED WORKING. TRY AGAIN 😂";
    errorSound();
    return;
  }

  answered = true;
  buttons[index].classList.add("correct");
  buttons.forEach((button) => button.disabled = true);

  $("quizFeedback").textContent = q.response;
  $("quizProgress").style.width =
    `${((currentQuestion + 1) / questions.length) * 100}%`;
  $("nextQuestion").classList.remove("hidden");
  $("nextQuestion").textContent =
    currentQuestion === questions.length - 1
      ? "CLAIM ACHIEVEMENTS →"
      : "NEXT CHALLENGE →";

  successSound();
}

$("nextQuestion").addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    renderQuestion();
  } else {
    showScreen("achievements");
  }
});

$("toGallery").addEventListener("click", () => showScreen("gallery"));

$("toCake").addEventListener("click", () => {
  showScreen("cake");
  createCandles();
});

// PHOTO FALLBACK
document.querySelectorAll(".memory-image img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.display = "none";
    const placeholder = document.createElement("span");
    placeholder.textContent = "📷 ADD YOUR MEMORY";
    placeholder.style.color = "#ffffff";
    placeholder.style.fontWeight = "bold";
    img.parentElement.appendChild(placeholder);
  });
});

// CREATE 21 CANDLES
function createCandles() {
  candlesRemaining = 21;
  completed = false;
  $("candles").replaceChildren();

  for (let i = 0; i < 21; i++) {
    const candle = document.createElement("div");
    candle.className = "candle";

    const flame = document.createElement("span");
    flame.className = "flame";
    candle.appendChild(flame);

    $("candles").appendChild(candle);
  }
  updateCandles();
}

function updateCandles() {
  $("candleCount").textContent =
    `${candlesRemaining} / 21 candles burning`;
  $("candleProgress").style.width =
    `${((21 - candlesRemaining) / 21) * 100}%`;
}

// MICROPHONE CANDLE BLOWING
$("micBtn").addEventListener("click", startMicrophone);

async function startMicrophone() {
  if (micStream || completed) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    $("micStatus").textContent =
      "Microphone unavailable. Open this website using HTTPS or localhost.";
    return;
  }

  $("micBtn").disabled = true;
  $("micStatus").textContent = "Requesting microphone access...";

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      video: false
    });

    micContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    await micContext.resume();

    analyser = micContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.25;

    micSource = micContext.createMediaStreamSource(micStream);
    micSource.connect(analyser);

    $("micBtn").textContent = "🎤 MICROPHONE ACTIVE";
    $("micStatus").textContent =
      "MIC ONLINE! Blow steadily toward the microphone!";

    lastBlow = 0;
    sustainedBlow = 0;
    detectBlowing();

  } catch (error) {
    console.error(error);
    $("micStatus").textContent =
      "Microphone access failed. Allow microphone permission and retry.";
    $("micBtn").disabled = false;
    $("micBtn").textContent = "🎤 RETRY MICROPHONE";
    stopMicrophone();
  }
}

function detectBlowing() {
  if (!analyser || completed) return;

  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);

  // Measure signal strength (RMS).
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sum / buffer.length);

  // Microphone airflow creates sustained broadband noise.
  // Threshold may need adjustment for different devices.
  const threshold = 0.075;

  if (rms > threshold) {
    sustainedBlow++;
  } else {
    sustainedBlow = Math.max(0, sustainedBlow - 2);
  }

  const now = performance.now();

  if (sustainedBlow >= 7 && now - lastBlow > 230) {
    lastBlow = now;
    extinguishCandle();
  }

  micFrame = requestAnimationFrame(detectBlowing);
}

function extinguishCandle() {
  if (candlesRemaining <= 0 || completed) return;

  const candles = [...document.querySelectorAll(".candle:not(.out)")];

  if (candles.length) {
    const random = Math.floor(Math.random() * candles.length);
    candles[random].classList.add("out");
  }

  candlesRemaining--;
  updateCandles();

  if (candlesRemaining > 0) {
    $("micStatus").textContent =
      `KEEP BLOWING! ${21 - candlesRemaining} CANDLES EXTINGUISHED!`;
  } else {
    completed = true;
    $("micStatus").textContent =
      "ALL CANDLES OUT! BIRTHDAY PROTOCOL UNLOCKED!";
    stopMicrophone();

    setTimeout(() => {
      showScreen("final");
      successSound();
      launchConfetti();
    }, 1200);
  }
}

function stopMicrophone() {
  if (micFrame !== null) {
    cancelAnimationFrame(micFrame);
    micFrame = null;
  }

  if (micSource) {
    micSource.disconnect();
    micSource = null;
  }

  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }

  if (micContext) {
    micContext.close().catch(() => {});
    micContext = null;
  }

  analyser = null;
}

// CONFETTI EXPLOSION
const canvas = $("confetti");
const ctx = canvas.getContext("2d");
let particles = [];
let confettiFrame = null;
let confettiStart = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function launchConfetti() {
  if (confettiFrame !== null) {
    cancelAnimationFrame(confettiFrame);
  }

  const colors = [
    "#00e5ff", "#a66cff", "#ffcc43",
    "#ff5e9c", "#27e9a5", "#ffffff"
  ];

  particles = Array.from({ length: 240 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * canvas.height,
    size: Math.random() * 7 + 3,
    speed: Math.random() * 3.5 + 2,
    drift: Math.random() * 4 - 2,
    rotation: Math.random() * Math.PI,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  confettiStart = performance.now();
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.y += p.speed;
    p.x += p.drift;
    p.rotation += 0.035;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }

  if (performance.now() - confettiStart < 6500) {
    confettiFrame = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiFrame = null;
  }
}

$("replayConfetti").addEventListener("click", () => {
  successSound();
  launchConfetti();
});

window.addEventListener("pagehide", stopMicrophone);
