import os
import subprocess
import sys

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 6):
        print("Error: Python 3.6 or higher is required")
        sys.exit(1)

def install_requirements():
    """Install required packages"""
    requirements = [
        "tensorflow",
        "opencv-python",
        "numpy",
        "eel",
    ]
    
    print("Installing required packages...")
    for package in requirements:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def create_directories():
    """Create necessary directories"""
    directories = ["songs", "dataset", "web"]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")

def setup_sample_songs():
    """Set up sample songs if songs directory is empty"""
    if not os.listdir("songs"):
        print("Songs directory is empty. Please add your music files to the 'songs' directory.")
        print("Supported formats: .mp3, .wav, .ogg")

def main():
    """Main setup function"""
    print("Setting up Emodify - Emotion Based Music Player")
    print("==============================================")
    
    check_python_version()
    install_requirements()
    create_directories()
    setup_sample_songs()
    
    print("\nSetup complete!")
    print("To start the application, run: python app.py")

if __name__ == "__main__":
    main()
