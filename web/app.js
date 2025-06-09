// Global variables
let currentMode = 1 // 1: Queue, 2: Emotion, 3: Random
let isPlaying = false
let currentSongIndex = -1
let queue = []
let allSongs = []
const emotionDetectionInterval = null
let selectedEmotion = "happy"
let trainingImages = 0
let isTraining = false

// DOM Elements
const audioPlayer = document.getElementById("audioPlayer")
const playPauseBtn = document.getElementById("playPauseBtn")
const playIcon = document.getElementById("playIcon")
const pauseIcon = document.getElementById("pauseIcon")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const songTitle = document.getElementById("songTitle")
const songArtist = document.getElementById("songArtist")
const albumArt = document.getElementById("albumArt")
const songProgress = document.getElementById("songProgress")
const currentTime = document.getElementById("currentTime")
const totalTime = document.getElementById("totalTime")
const queueContainer = document.getElementById("queue")
const clearQueueBtn = document.getElementById("clearQueueBtn")
const searchBar = document.getElementById("searchBar")
const searchButton = document.getElementById("searchButton")
const libraryLink = document.getElementById("libraryLink")
const songLibrary = document.getElementById("songLibrary")
const closeLibraryBtn = document.getElementById("closeLibraryBtn")
const libraryContent = document.getElementById("libraryContent")
const trainingLink = document.getElementById("trainingLink")
const trainingPanel = document.getElementById("trainingPanel")
const closeTrainingBtn = document.getElementById("closeTrainingBtn")
const emotionBtns = document.querySelectorAll(".emotion-btn")
const captureBtn = document.getElementById("captureBtn")
const startTrainingBtn = document.getElementById("startTrainingBtn")
const trainingProgress = document.getElementById("trainingProgress")
const cameraFeed = document.getElementById("cameraFeed")
const cameraOverlay = document.getElementById("cameraOverlay")
const trainingCamera = document.getElementById("trainingCamera")
const trainingOverlay = document.getElementById("trainingOverlay")
const detectEmotionBtn = document.getElementById("detectEmotionBtn")
const detectedEmotion = document.getElementById("detectedEmotion")
const emotionIcon = document.getElementById("emotionIcon")
const modeRadios = document.querySelectorAll('input[name="mode"]')
const spotifylink = document.getElementById('spotifyLink')
// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Initialize the application
async function initializeApp() {
  // Load songs data
  await loadSongs()

  // Initialize camera
  initializeCamera()

  // Set up event listeners
  setupEventListeners()

  // Update UI
  updateUI()
}

// Load songs data
async function loadSongs() {
  // In a real application, this would fetch from a server or database
  // For now, we'll use the data from the original code
  allSongs = [
    {
      id: 1,
      title: "Jee Karda",
      artist: "Divya Kumar",
      album: "Badlapur",
      path: "songs/Jee Karda Badlapur 128 Kbps.mp3",
      art: "images/1.jpg",
      emotion: "angry",
    },
    {
      id: 2,
      title: "Aarambh",
      artist: "Piyush Mishra",
      album: "Gulaal",
      path: "songs/Aarambh Gulaal 320 Kbps.mp3",
      art: "images/2.jpg",
      emotion: "angry",
    },
    {
      id: 3,
      title: "Mila Toh Marega",
      artist: "Dharam-Sandeep, Sandeep Patil",
      album: "Rakht Charitra",
      path: "songs/Mila Toh Marega - Rakht Charitra 320 Kbps.mp3",
      art: "images/3.jpg",
      emotion: "angry",
    },
    {
      id: 4,
      title: "Haareya",
      artist: "Arijit Singh",
      album: "Meri Pyaari Bindu",
      path: "songs/haareya.mp3",
      art: "images/4.jpg",
      emotion: "happy",
    },
    {
      id: 5,
      title: "Ik Vari Aa",
      artist: "Arijit Singh",
      album: "Raabta",
      path: "songs/ik vari aa.mp3",
      art: "images/5.jpg",
      emotion: "happy",
    },
    {
      id: 6,
      title: "Main Jahaan Rahoon",
      artist: "Rahat Fateh Ali Khan, Krishna Beura",
      album: "Namastey London",
      path: "songs/Main Jahaan Rahoon Namastey London 128 Kbps.mp3",
      art: "images/6.jpg",
      emotion: "sad",
    },
    {
      id: 7,
      title: "Aayat",
      artist: "Arijit Singh",
      album: "Bajirao Mastani",
      path: "songs/Aayat Bajirao Mastani 320 Kbps.mp3",
      art: "images/7.jpg",
      emotion: "sad",
    },
    {
      id: 8,
      title: "Humdard",
      artist: "Arijit Singh",
      album: "Ek Villain",
      path: "songs/Humdard Ek Villain 320 Kbps.mp3",
      art: "images/8.jpg",
      emotion: "sad",
    },
    {
      id: 9,
      title: "O Saathi",
      artist: "Arijit Singh",
      album: "Shab",
      path: "songs/o sathi.mp3",
      art: "images/9.jpg",
      emotion: "neutral",
    },
    {
      id: 10,
      title: "Phir Bhi",
      artist: "Arijit Singh, Shashaa Tirupati",
      album: "Half Girlfriend",
      path: "songs/phir bhi.mp3",
      art: "images/10.jpg",
      emotion: "neutral",
    },
  ]

  // Populate library
  populateLibrary()
}

// Initialize camera
function initializeCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        cameraFeed.srcObject = stream
        trainingCamera.srcObject = stream

        // Set up canvas contexts
        setupCanvasContexts()
      })
      .catch((error) => {
        console.error("Error accessing camera:", error)
        alert("Could not access camera. Please check permissions.")
      })
  } else {
    alert("Your browser does not support camera access.")
  }
}

// Set up canvas contexts for face detection visualization
function setupCanvasContexts() {
  const cameraCtx = cameraOverlay.getContext("2d")
  const trainingCtx = trainingOverlay.getContext("2d")

  // Set canvas dimensions to match video
  cameraOverlay.width = cameraFeed.videoWidth
  cameraOverlay.height = cameraFeed.videoHeight
  trainingOverlay.width = trainingCamera.videoWidth
  trainingOverlay.height = trainingCamera.videoHeight

  // Draw face detection rectangles (this would be updated by the actual face detection)
  function drawFaceRect(ctx, x, y, width, height) {
    ctx.strokeStyle = "#6c5ce7"
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
  }

  // Example face detection visualization (in a real app, this would use actual face detection data)
  setTimeout(() => {
    drawFaceRect(cameraCtx, 100, 50, 200, 200)
    drawFaceRect(trainingCtx, 100, 50, 200, 200)
  }, 2000)
}

// Set up event listeners
function setupEventListeners() {
  // Audio player events
  audioPlayer.addEventListener("timeupdate", updateProgressBar)
  audioPlayer.addEventListener("ended", handleSongEnd)

  // Control buttons
  playPauseBtn.addEventListener("click", togglePlayPause)
  prevBtn.addEventListener("click", playPreviousSong)
  nextBtn.addEventListener("click", playNextSong)
  clearQueueBtn.addEventListener("click", clearQueue)

  // Mode selection
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentMode = Number.parseInt(e.target.value)
    })
  })

  // Search
  searchBar.addEventListener("input", handleSearch)
  searchButton.addEventListener("click", () => searchBar.focus())

  // Library
  libraryLink.addEventListener("click", toggleLibrary)
  closeLibraryBtn.addEventListener("click", toggleLibrary)

  // Training
  trainingLink.addEventListener("click", toggleTraining)
  closeTrainingBtn.addEventListener("click", toggleTraining)
  emotionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      emotionBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      selectedEmotion = btn.dataset.emotion
    })
  })
  captureBtn.addEventListener("click", captureTrainingImages)
  startTrainingBtn.addEventListener("click", startTraining)

  // Emotion detection
  detectEmotionBtn.addEventListener("click", detectEmotion)
}

// Update UI elements
function updateUI() {
  // Update song info if a song is selected
  if (currentSongIndex >= 0) {
    const song = allSongs[currentSongIndex]
    songTitle.textContent = song.title
    songArtist.textContent = song.artist
    albumArt.style.backgroundImage = `url(${song.art})`

    // Update emotion icon based on song's emotion
    updateEmotionIcon(song.emotion)
  }
  
  // Update play/pause button
  if (isPlaying) {
    playIcon.classList.add("hidden")
    pauseIcon.classList.remove("hidden")
  } else {
    playIcon.classList.remove("hidden")
    pauseIcon.classList.add("hidden")
  }

  // Update queue display
  updateQueueDisplay()
}

// Update the progress bar
function updateProgressBar() {
  const currentTimeValue = audioPlayer.currentTime
  const duration = audioPlayer.duration || 0

  // Update progress bar width
  const progressPercent = (currentTimeValue / duration) * 100
  songProgress.style.width = `${progressPercent}%`

  // Update time displays
  currentTime.textContent = formatTime(currentTimeValue)
  totalTime.textContent = formatTime(duration)
}

// Format time in MM:SS format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

// Toggle play/pause
function togglePlayPause() {
  if (currentSongIndex < 0 && allSongs.length > 0) {
    // If no song is selected, play the first one
    playSong(0)
    return
  }

  if (isPlaying) {
    audioPlayer.pause()
    isPlaying = false
  } else {
    audioPlayer.play()
    isPlaying = true
  }

  updateUI()
}


function playSong(index) {
  if (index >= 0 && index < allSongs.length) {
    currentSongIndex = index
    const song = allSongs[index]

    audioPlayer.src = song.path
    audioPlayer.load()
    audioPlayer.play()
    isPlaying = true

    updateUI()
  }
}

// Play the previous song
function playPreviousSong() {
  if (currentSongIndex > 0) {
    playSong(currentSongIndex - 1)
  } else if (allSongs.length > 0) {
    playSong(allSongs.length - 1)
  }
}

// Play the next song
function playNextSong() {
  if (currentMode === 1) {
    // Queue mode
    playNextInQueue()
  } else if (currentMode === 2) {
    // Emotion mode
    playByEmotion()
  } else {
    // Random mode
    playRandomSong()
  }
}

// Handle song end
function handleSongEnd() {
  playNextSong()
}

// Play next song in queue
function playNextInQueue() {
  if (queue.length > 0) {
    const nextSong = queue.shift()
    playSong(nextSong)
    updateQueueDisplay()
  } else if (currentSongIndex < allSongs.length - 1) {
    playSong(currentSongIndex + 1)
  } else if (allSongs.length > 0) {
    playSong(0)
  }
}

// Play a song based on detected emotion
function playByEmotion() {
  // Get current emotion
  const emotion = detectedEmotion.textContent.toLowerCase()

  // Filter songs by emotion
  const emotionSongs = allSongs.filter((song) => song.emotion === emotion)

  if (emotionSongs.length > 0) {
    // Play a random song from the emotion category
    const randomIndex = Math.floor(Math.random() * emotionSongs.length)
    const songIndex = allSongs.findIndex((song) => song.id === emotionSongs[randomIndex].id)
    playSong(songIndex)
  } else {
    // If no songs match the emotion, play a random song
    playRandomSong()
  }
}

// Play a random song
function playRandomSong() {
  if (allSongs.length > 0) {
    const randomIndex = Math.floor(Math.random() * allSongs.length)
    playSong(randomIndex)
  }
}

// Add a song to the queue
function addToQueue(index) {
  queue.push(index)
  updateQueueDisplay()

  // If no song is playing, start playing the first song in the queue
  if (currentSongIndex < 0) {
    playNextInQueue()
  }
}

// Clear the queue
function clearQueue() {
  queue = []
  updateQueueDisplay()
}

// Update the queue display
function updateQueueDisplay() {
  queueContainer.innerHTML = ""

  if (queue.length === 0) {
    const emptyMessage = document.createElement("p")
    emptyMessage.textContent = "Queue is empty"
    emptyMessage.className = "text-center text-muted-foreground py-4"
    queueContainer.appendChild(emptyMessage)
    return
  }

  queue.forEach((songIndex, i) => {
    const song = allSongs[songIndex]

    const queueItem = document.createElement("div")
    queueItem.className = "queue-item"

    queueItem.innerHTML = `
            <div class="queue-item-info">
                <div class="queue-item-title">${song.title}</div>
                <div class="queue-item-artist">${song.artist}</div>
            </div>
            <button class="queue-item-remove" data-index="${i}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `

    queueContainer.appendChild(queueItem)

    // Add event listener to remove button
    const removeBtn = queueItem.querySelector(".queue-item-remove")
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      removeFromQueue(Number.parseInt(removeBtn.dataset.index))
    })

    // Add event listener to play this song
    queueItem.addEventListener("click", () => {
      const songIndex = queue[i]
      queue.splice(0, i + 1)
      playSong(songIndex)
      updateQueueDisplay()
    })
  })
}

// Remove a song from the queue
function removeFromQueue(index) {
  if (index >= 0 && index < queue.length) {
    queue.splice(index, 1)
    updateQueueDisplay()
  }
}

function handleSearch() {
  const searchTerm = searchBar.value.toLowerCase()

  if (searchTerm.trim() === "") {
    // If search is empty, show all songs
    populateLibrary()
    return
  }

  // Filter songs based on search term
  const filteredSongs = allSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm) ||
      song.artist.toLowerCase().includes(searchTerm) ||
      song.album.toLowerCase().includes(searchTerm),
  )

  // Update library with filtered songs
  populateLibrary(filteredSongs)

  // Show library if it's hidden
  if (songLibrary.classList.contains("hidden")) {
    toggleLibrary()
  }
}

// Populate the library with songs
function populateLibrary(songs = allSongs) {
  libraryContent.innerHTML = ""

  if (songs.length === 0) {
    const emptyMessage = document.createElement("p")
    emptyMessage.textContent = "No songs found"
    emptyMessage.className = "text-center text-muted-foreground py-4"
    libraryContent.appendChild(emptyMessage)
    return
  }

  songs.forEach((song, index) => {
    const songIndex = allSongs.findIndex((s) => s.id === song.id)

    const libraryItem = document.createElement("div")
    libraryItem.className = "library-item"

    libraryItem.innerHTML = `
            <div class="library-item-art" style="background-image: url(${song.art})"></div>
            <div class="library-item-info">
                <div class="library-item-title">${song.title}</div>
                <div class="library-item-artist">${song.artist} • ${song.album}</div>
                <div class="library-item-emotion">${song.emotion}</div>
            </div>
        `

    libraryContent.appendChild(libraryItem)

    // Add event listener to play this song
    libraryItem.addEventListener("click", () => {
      if (currentMode === 1) {
        // Queue mode - add to queue
        addToQueue(songIndex)
      } else {
        // Other modes - play immediately
        playSong(songIndex)
      }

      // Close library
      toggleLibrary()
    })
  })
}

// Toggle library visibility
function toggleLibrary() {
  songLibrary.classList.toggle("hidden")
}

// Toggle training panel visibility
function toggleTraining() {
  trainingPanel.classList.toggle("hidden")
}

// Capture training images
function captureTrainingImages() {
  if (isTraining) return

  trainingImages = 0
  isTraining = true
  captureBtn.textContent = "Capturing..."
  captureBtn.disabled = true

  // Countdown
  let countdown = 5
  const countdownInterval = setInterval(() => {
    captureBtn.textContent = `Starting in ${countdown}...`
    countdown--

    if (countdown < 0) {
      clearInterval(countdownInterval)
      startCapturing()
    }
  }, 1000)
}

// Start capturing training images
function startCapturing() {
  captureBtn.textContent = "Capturing images..."

  // Simulate capturing 16 images
  const captureInterval = setInterval(() => {
    trainingImages++

    // Update progress
    const progress = (trainingImages / 16) * 100
    trainingProgress.style.width = `${progress}%`
    trainingProgress.nextElementSibling.textContent = `${Math.round(progress)}%`

    if (trainingImages >= 16) {
      clearInterval(captureInterval)
      finishCapturing()
    }
  }, 500)
}

// Finish capturing training images
function finishCapturing() {
  captureBtn.textContent = "Capture (5 seconds)"
  captureBtn.disabled = false
  isTraining = false

  // Show success message
  alert(`Successfully captured 16 images for ${selectedEmotion} emotion!`)
}

// Start training the model
function startTraining() {
  if (isTraining) return

  isTraining = true
  startTrainingBtn.textContent = "Training..."
  startTrainingBtn.disabled = true

  // Simulate training progress
  let progress = 0
  const trainingInterval = setInterval(() => {
    progress += 5
    trainingProgress.style.width = `${progress}%`
    trainingProgress.nextElementSibling.textContent = `${progress}%`

    if (progress >= 100) {
      clearInterval(trainingInterval)
      finishTraining()
    }
  }, 300)
}

// Finish training the model
function finishTraining() {
  startTrainingBtn.textContent = "Start Training Model"
  startTrainingBtn.disabled = false
  isTraining = false

  // Show success message
  alert("Model training completed successfully!")
}

// Detect emotion
function detectEmotion() {
  detectEmotionBtn.textContent = "Detecting..."
  detectEmotionBtn.disabled = true

  // Simulate emotion detection (in a real app, this would call the Python backend)
  setTimeout(() => {
    const emotions = ["happy", "sad", "angry", "neutral"]
    const detectedEmotionValue = emotions[Math.floor(Math.random() * emotions.length)]

    // Update UI
    detectedEmotion.textContent = detectedEmotionValue.charAt(0).toUpperCase() + detectedEmotionValue.slice(1)
    updateEmotionIcon(detectedEmotionValue)

    // If in emotion mode, play a song based on the detected emotion
    if (currentMode === 2) {
      playByEmotion()
    }

    detectEmotionBtn.textContent = "Detect Emotion"
    detectEmotionBtn.disabled = false
  }, 2000)
}

// Update emotion icon
function updateEmotionIcon(emotion) {
  const emotionIcons = {
    happy: "images/2.png",
    sad: "images/3.png",
    angry: "images/1.png",
    neutral: "images/4.png",
  }

  emotionIcon.style.backgroundImage = `url(${emotionIcons[emotion] || "images/1.png"})`
}

// Eel.js exposed functions (these would be implemented in the Python backend)
// For demonstration purposes, we're mocking these functions
if (typeof eel === "undefined") {
  window.eel = {
    getEmotion: async () => {
      const emotions = ["happy", "sad", "angry", "neutral"]
      return emotions[Math.floor(Math.random() * emotions.length)]
    },
    expose: () => {},
  }
}

// ========== Spotify API Integration ==========

// Your Spotify credentials
const SPOTIFY_CLIENT_ID = 'f3163d6bc7304036bd9763325010cfde';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:8888/callback'; // Ensure it's added in Spotify Dashboard

let spotifyAccessToken = null;
let spotifyTokenExpiry = 0;

// Handle access token from URL
function getSpotifyAccessTokenFromUrl() {
  const hash = window.location.hash;
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (token) {
      spotifyAccessToken = token;
      spotifyTokenExpiry = Date.now() + parseInt(expiresIn) * 1000;
      localStorage.setItem('spotifyAccessToken', token);
      localStorage.setItem('spotifyTokenExpiry', spotifyTokenExpiry);
      window.location.hash = ''; // Remove token from URL
    }
  }
}

// Load token from local storage if valid
function loadSpotifyToken() {
  const token = localStorage.getItem('spotifyAccessToken');
  const expiry = parseInt(localStorage.getItem('spotifyTokenExpiry'));
  if (token && expiry && Date.now() < expiry) {
    spotifyAccessToken = token;
    spotifyTokenExpiry = expiry;
  }
}

// Redirect user to Spotify login
function redirectToSpotifyLogin() {
  const scopes = 'user-read-private user-read-email';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
  window.location.href = authUrl;
}

// Call on page load
getSpotifyAccessTokenFromUrl();
loadSpotifyToken();

// Search function
async function searchSpotifyTracks(query) {
  if (!spotifyAccessToken || Date.now() > spotifyTokenExpiry) {
    alert('Spotify session expired. Redirecting to login...');
    redirectToSpotifyLogin();
    return [];
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        redirectToSpotifyLogin();
      }
      return [];
    }

    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Spotify API error:', error);
    return [];
  }
}

// OPTIONAL: Connect to search bar
document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchBar').value.trim();
  if (query) {
    const tracks = await searchSpotifyTracks(query);
    console.log(tracks); // You can display tracks in UI as needed
  }
});
