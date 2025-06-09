import os
import json
import numpy as np
from collections import defaultdict

# Define emotion categories and their related attributes
emotion_attributes = {
    "happy": {
        "tempo": "fast",
        "mode": "major",
        "energy": "high",
        "valence": "positive",
        "related_emotions": ["excited", "joyful", "cheerful", "content"]
    },
    "sad": {
        "tempo": "slow",
        "mode": "minor",
        "energy": "low",
        "valence": "negative",
        "related_emotions": ["melancholic", "depressed", "gloomy", "heartbroken"]
    },
    "angry": {
        "tempo": "fast",
        "mode": "minor",
        "energy": "high",
        "valence": "negative",
        "related_emotions": ["frustrated", "irritated", "enraged", "annoyed"]
    },
    "neutral": {
        "tempo": "medium",
        "mode": "both",
        "energy": "medium",
        "valence": "neutral",
        "related_emotions": ["calm", "relaxed", "peaceful", "balanced"]
    }
}

# Song features (to be extracted or manually defined)
class SongFeatures:
    def __init__(self, song_path, metadata=None):
        self.song_path = song_path
        self.metadata = metadata or {}
        self.features = self._extract_features()
        
    def _extract_features(self):
        # In a real implementation, this would use a library like librosa
        # to extract audio features. For now, we'll use dummy values or
        # manually defined features.
        
        # Check if we have predefined features
        if "features" in self.metadata:
            return self.metadata["features"]
        
        # Otherwise, return dummy features based on the filename
        # This is just for demonstration
        features = {
            "tempo": None,
            "mode": None,
            "energy": None,
            "valence": None
        }
        
        filename = os.path.basename(self.song_path).lower()
        
        # Dummy logic to assign features based on filename
        if any(term in filename for term in ["happy", "joy", "cheer"]):
            features["tempo"] = "fast"
            features["mode"] = "major"
            features["energy"] = "high"
            features["valence"] = "positive"
        elif any(term in filename for term in ["sad", "melancholy", "blue"]):
            features["tempo"] = "slow"
            features["mode"] = "minor"
            features["energy"] = "low"
            features["valence"] = "negative"
        elif any(term in filename for term in ["angry", "rage", "fury"]):
            features["tempo"] = "fast"
            features["mode"] = "minor"
            features["energy"] = "high"
            features["valence"] = "negative"
        else:
            # Default to neutral
            features["tempo"] = "medium"
            features["mode"] = "major"
            features["energy"] = "medium"
            features["valence"] = "neutral"
            
        return features

# Emotion-to-Song Mapper
class EmotionSongMapper:
    def __init__(self, songs_directory="songs", metadata_file="song_metadata.json"):
        self.songs_directory = songs_directory
        self.metadata_file = metadata_file
        self.songs = []
        self.emotion_map = defaultdict(list)
        self.load_songs()
        self.map_emotions()
        
    def load_songs(self):
        # Load song metadata if available
        metadata = {}
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                metadata = json.load(f)
        
        # Scan songs directory
        if os.path.exists(self.songs_directory):
            for file in os.listdir(self.songs_directory):
                if file.endswith(('.mp3', '.wav', '.ogg')):
                    song_path = os.path.join(self.songs_directory, file)
                    song_id = os.path.splitext(file)[0]
                    
                    # Get metadata for this song if available
                    song_metadata = metadata.get(song_id, {})
                    
                    # Create song object with features
                    song = {
                        "id": song_id,
                        "path": song_path,
                        "title": song_metadata.get("title", song_id),
                        "artist": song_metadata.get("artist", "Unknown"),
                        "album": song_metadata.get("album", "Unknown"),
                        "features": SongFeatures(song_path, song_metadata).features,
                        "emotion": song_metadata.get("emotion", "neutral")
                    }
                    
                    self.songs.append(song)
    
    def map_emotions(self):
        # Clear existing mappings
        self.emotion_map = defaultdict(list)
        
        # Map songs to emotions based on features
        for song in self.songs:
            # If emotion is explicitly defined, use that
            if "emotion" in song:
                self.emotion_map[song["emotion"]].append(song)
                continue
                
            # Otherwise, calculate emotion based on features
            features = song["features"]
            scores = {}
            
            for emotion, attributes in emotion_attributes.items():
                score = 0
                
                # Compare features to emotion attributes
                if features["tempo"] == attributes["tempo"]:
                    score += 1
                if features["mode"] == attributes["mode"]:
                    score += 1
                if features["energy"] == attributes["energy"]:
                    score += 1
                if features["valence"] == attributes["valence"]:
                    score += 1
                
                scores[emotion] = score
            
            # Assign song to emotion with highest score
            best_emotion = max(scores, key=scores.get)
            self.emotion_map[best_emotion].append(song)
            
            # Also update the song's emotion
            song["emotion"] = best_emotion
    
    def get_songs_for_emotion(self, emotion, limit=5):
        """Get songs that match the given emotion"""
        if emotion in self.emotion_map:
            songs = self.emotion_map[emotion]
            
            # If we have enough songs, return a random selection
            if len(songs) > limit:
                return np.random.choice(songs, limit, replace=False).tolist()
            
            return songs
        
        # If no songs for this emotion, return songs for a related emotion
        for e, attrs in emotion_attributes.items():
            if emotion in attrs["related_emotions"] and e in self.emotion_map:
                return self.get_songs_for_emotion(e, limit)
        
        # If still no matches, return random songs
        if self.songs:
            return np.random.choice(self.songs, min(limit, len(self.songs)), replace=False).tolist()
        
        return []
    
    def save_metadata(self):
        """Save song metadata including emotions to file"""
        metadata = {}
        
        for song in self.songs:
            metadata[song["id"]] = {
                "title": song["title"],
                "artist": song["artist"],
                "album": song["album"],
                "emotion": song["emotion"],
                "features": song["features"]
            }
        
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return True

# Example usage
if __name__ == "__main__":
    mapper = EmotionSongMapper()
    
    # Get songs for each emotion
    for emotion in ["happy", "sad", "angry", "neutral"]:
        songs = mapper.get_songs_for_emotion(emotion)
        print(f"Songs for {emotion}: {len(songs)}")
        for song in songs:
            print(f"  - {song['title']} by {song['artist']}")
    
    # Save metadata
    mapper.save_metadata()
