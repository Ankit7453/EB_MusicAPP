import eel
import os
import threading
import time
from emotion_recognition import getEmotion, captureTrainingImages, trainModel
from song_mapping import EmotionSongMapper

# Initialize eel
eel.init('web')

# Global variables
mapper = EmotionSongMapper()
current_emotion = "neutral"
emotion_detection_active = False
emotion_detection_thread = None

# Exposed functions for the frontend
@eel.expose
def get_all_songs():
    """Get all songs with metadata"""
    return mapper.songs

@eel.expose
def get_songs_by_emotion(emotion, limit=5):
    """Get songs for a specific emotion"""
    return mapper.get_songs_for_emotion(emotion, limit)

@eel.expose
def start_emotion_detection():
    """Start continuous emotion detection"""
    global emotion_detection_active, emotion_detection_thread

    if emotion_detection_active:
        return {"success": False, "message": "Emotion detection already running"}

    emotion_detection_active = True
    emotion_detection_thread = threading.Thread(target=emotion_detection_loop)
    emotion_detection_thread.daemon = True
    emotion_detection_thread.start()

    return {"success": True, "message": "Emotion detection started"}

@eel.expose
def stop_emotion_detection():
    """Stop continuous emotion detection"""
    global emotion_detection_active

    if not emotion_detection_active:
        return {"success": False, "message": "Emotion detection not running"}

    emotion_detection_active = False

    return {"success": True, "message": "Emotion detection stopped"}

@eel.expose
def update_song_emotion(song_id, emotion):
    """Update a song's emotion mapping"""
    for song in mapper.songs:
        if song["id"] == song_id:
            song["emotion"] = emotion
            mapper.map_emotions()
            mapper.save_metadata()
            return {"success": True, "message": f"Updated {song['title']} to {emotion}"}

    return {"success": False, "message": "Song not found"}

def emotion_detection_loop():
    global current_emotion

    while emotion_detection_active:
        try:
            emotion = getEmotion()

            # If returned emotion is "neutral" but could be due to no face, skip update
            if emotion == "neutral" and current_emotion == "neutral":
                time.sleep(2)
                continue

            if emotion != current_emotion:
                current_emotion = emotion
                eel.updateDetectedEmotion(emotion)

            time.sleep(3)  # Slight delay to reduce load

        except Exception as e:
            print(f"[ERROR] Emotion detection: {str(e)}")
            time.sleep(5)

# Start the application
if __name__ == "__main__":
    eel.start('main.html', mode='chrome')
