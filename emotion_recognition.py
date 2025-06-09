import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Dropout, Flatten
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import glob
import eel
import time
import random

# Initialize eel
eel.init('web')

# Define emotions
emotions = ["angry", "happy", "sad", "neutral"]

# Face detection cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Video capture
video_capture = cv2.VideoCapture(0)

# CNN Model Architecture
def create_model():
    model = Sequential()
    
    # First Convolutional Layer
    model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(48, 48, 1)))
    model.add(Conv2D(64, kernel_size=(3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    
    # Second Convolutional Layer
    model.add(Conv2D(128, kernel_size=(3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Conv2D(128, kernel_size=(3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    
    # Flatten and Dense Layers
    model.add(Flatten())
    model.add(Dense(1024, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(len(emotions), activation='softmax'))
    
    # Compile the model
    model.compile(
        loss='categorical_crossentropy',
        optimizer=Adam(learning_rate=0.0001),
        metrics=['accuracy']
    )
    
    return model

# Load or create model
def get_model():
    model_path = 'emotion_model.h5'
    if os.path.exists(model_path):
        print("Loading existing model...")
        return load_model(model_path)
    else:
        print("Creating new model...")
        return create_model()

# Preprocess image for prediction
def preprocess_image(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    # If no face detected, return None
    if len(faces) == 0:
        return None
    
    # Process the first face found
    x, y, w, h = faces[0]
    
    # Extract face ROI
    face_roi = gray[y:y+h, x:x+w]
    
    # Resize to 48x48 (model input size)
    face_roi = cv2.resize(face_roi, (48, 48))
    
    # Normalize pixel values
    face_roi = face_roi / 255.0
    
    # Reshape for model input
    face_roi = np.reshape(face_roi, (1, 48, 48, 1))
    
    return face_roi, (x, y, w, h)

# Predict emotion
def predict_emotion(model, image):
    result = preprocess_image(image)
    
    if result is None:
        return "No face detected", None
    
    face_roi, face_coords = result
    
    # Make prediction
    prediction = model.predict(face_roi)[0]
    
    # Get the emotion with highest probability
    emotion_idx = np.argmax(prediction)
    emotion = emotions[emotion_idx]
    
    return emotion, face_coords

# Capture image from webcam
def capture_image():
    ret, frame = video_capture.read()
    if not ret:
        return None
    return frame

# Exposed function to get emotion
@eel.expose
def getEmotion():
    model = get_model()
    
    # Capture 5 frames and use majority voting
    emotion_votes = []
    for _ in range(5):
        frame = capture_image()
        if frame is not None:
            emotion, _ = predict_emotion(model, frame)
            if emotion != "No face detected":
                emotion_votes.append(emotion)
        time.sleep(0.1)
    
    if not emotion_votes:
        return "neutral"  # Default if no valid detections
    
    # Return the most common emotion
    from collections import Counter
    most_common = Counter(emotion_votes).most_common(1)[0][0]
    return most_common

# Exposed function to capture training images
@eel.expose
def captureTrainingImages(emotion):
    if emotion not in emotions:
        return {"success": False, "message": "Invalid emotion"}
    
    # Create directory if it doesn't exist
    os.makedirs(f"dataset/{emotion}", exist_ok=True)
    
    # Count existing files
    existing_files = glob.glob(f"dataset/{emotion}/*.jpg")
    file_count = len(existing_files)
    
    # Capture 16 images
    captured_count = 0
    while captured_count < 16:
        frame = capture_image()
        if frame is None:
            continue
        
        # Process image
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 1:  # Only save if exactly one face is detected
            x, y, w, h = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            face_roi = cv2.resize(face_roi, (48, 48))
            
            # Save image
            filename = f"dataset/{emotion}/{file_count + captured_count + 1}.jpg"
            cv2.imwrite(filename, face_roi)
            captured_count += 1
            
            # Send progress update to frontend
            eel.updateCaptureProgress(captured_count / 16 * 100)
            
            time.sleep(0.2)  # Small delay between captures
    
    return {"success": True, "message": f"Captured {captured_count} images for {emotion}"}

# Exposed function to train the model
@eel.expose
def trainModel():
    # Create data generators
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        validation_split=0.2
    )
    
    # Check if we have enough training data
    total_images = 0
    for emotion in emotions:
        image_count = len(glob.glob(f"dataset/{emotion}/*.jpg"))
        total_images += image_count
    
    if total_images < 40:  # Minimum threshold
        return {"success": False, "message": "Not enough training data. Capture more images."}
    
    # Create or load model
    model = get_model()
    
    # Create training and validation generators
    try:
        train_generator = train_datagen.flow_from_directory(
            'dataset',
            target_size=(48, 48),
            color_mode='grayscale',
            batch_size=32,
            class_mode='categorical',
            subset='training'
        )
        
        validation_generator = train_datagen.flow_from_directory(
            'dataset',
            target_size=(48, 48),
            color_mode='grayscale',
            batch_size=32,
            class_mode='categorical',
            subset='validation'
        )
        
        # Train the model
        history = model.fit(
            train_generator,
            steps_per_epoch=train_generator.samples // 32,
            epochs=20,
            validation_data=validation_generator,
            validation_steps=validation_generator.samples // 32,
            callbacks=[
                tf.keras.callbacks.LambdaCallback(
                    on_epoch_end=lambda epoch, logs: eel.updateTrainingProgress((epoch + 1) / 20 * 100)
                )
            ]
        )
        
        # Save the model
        model.save('emotion_model.h5')
        
        return {
            "success": True, 
            "message": "Model trained successfully",
            "accuracy": float(history.history['val_accuracy'][-1])
        }
        
    except Exception as e:
        return {"success": False, "message": f"Error training model: {str(e)}"}

# Start eel
if __name__ == "__main__":
    eel.start('main.html', mode='chrome')
