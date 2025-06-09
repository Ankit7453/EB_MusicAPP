Emotion-Based Music Player 🤖
A real-time music recommendation system that detects user's emotion through webcam and play songs using deep learning.

## Features
- Real-time facial emotion detection (Happy 😊, Sad 😢, Angry 😠, Neutral 😐)
- Dynamic song recommendations and playing based on mood
- Web-based GUI with live emotion display
- Easy song management and emotion tagging
- Custom CNN model for emotion recognition

## Project Structure
|EB_music
├── web/ # Frontend files
│ ├── main.html # Main interface
│ ├── styles.css # Styling
│ └── scripts.js # Frontend logic
├── songs/ # Music library (MP3/WAV)
├── dataset/ # Training images
├── app.py # Main application
├── setup.py # First-run setup script
├── emotion_recognition.py # Emotion detection CNN
├── song_mapping.py # Song recommendation engine


## Requirements
- Python 3.6+
- Webcam
- Chrome/Firefox browser
- opencv
- eel
- numpy
- tensorflow 

## Installation & Setup

### 1. Clone Repository
cd EB_music

### 2. Run Setup Script
python setup.py
This will:
1. Check Python version
2. Install required packages:
   - TensorFlow
   - OpenCV
   - NumPy
   - Eel
3. Create necessary directories
4. Verify songs directory setup


## Running the Application
python app.py
The web interface will automatically open in your default browser.


**Enjoy your personalized music experience!** 