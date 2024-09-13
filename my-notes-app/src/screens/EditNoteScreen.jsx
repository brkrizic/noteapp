import React, { useContext, useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { NoteContext } from '../context/NoteContext';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditNoteScreen = ({ route, navigation }) => {
  const { note } = route.params;
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [image, setImage] = useState(note.imageUri || '');
  const [recording, setRecording] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recordingUri, setRecordingUri] = useState(note.audioUri || '');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, setLocation] = useState(note.location || null);
  const [recordingDuration, setRecordingDuration] = useState(null);
  const { updateNote } = useContext(NoteContext);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setImage(note.imageUri || '');
      setRecordingUri(note.audioUri || '');
      setLocation(note.location || null);
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [note]);

  const handleUpdateNote = () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Please enter both title and content.');
      return;
    }
    updateNote({
      ...note,
      title,
      content,
      updatedAt: new Date().toISOString(),
      imageUri: image,
      audioUri: recordingUri,
      location,
    });
    navigation.navigate('Home');
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access microphone is required!');
        return;
      }
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const durationMillis = await recording.getStatusAsync().then(status => status.durationMillis);
      setRecording(null);
      setIsListening(false);
      setRecordingUri(uri);
      setRecordingDuration(durationMillis / 1000);
      Alert.alert('Recording Stopped', `Recording saved at ${uri}`);
      playSound(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playSound = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);

      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  };

  const togglePlaySound = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.stopAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        Alert.alert('Error', 'No audio available to play.');
      }
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location is required!');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ latitude: coords.latitude, longitude: coords.longitude });
    } catch (error) {
      console.error('Failed to get location', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Note</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
      />
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : null}
        {/* <TouchableOpacity
          style={styles.iconButton}
          onPress={handleTakePicture}
        >
          <Icon name="photo-camera" size={24} color="#FFF" />
          <Text style={styles.iconButtonText}>Take Picture</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.voiceControls}>
        <TouchableOpacity
          style={[styles.iconButton, isListening ? styles.iconButtonActive : styles.iconButtonInactive]}
          onPress={isListening ? stopRecording : startRecording}
        >
          <Icon name={isListening ? "stop" : "mic"} size={24} color="#FFF" />
          <Text style={styles.iconButtonText}>
            {isListening ? "Stop Recording" : "Start New Recording"}
          </Text>
        </TouchableOpacity>
        {/* {recordingUri ? (
          <>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={togglePlaySound}
            >
              <Icon name={isPlaying ? "pause" : "play-arrow"} size={24} color="#FFF" />
              <Text style={styles.iconButtonText}>
                {isPlaying ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.iconButtonDelete]}
              onPress={() => {
                setRecordingUri('');
                setRecordingDuration(null);
                setSound(null);
              }}
            >
              <Icon name="delete" size={24} color="#FFF" />
              <Text style={styles.iconButtonText}>Delete Audio</Text>
            </TouchableOpacity>
          </>
        ) : null} */}
      </View>
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>
          {location
            ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : 'No location set'}
        </Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={getLocation}
        >
          <Icon name="location-on" size={24} color="#FFF" />
          <Text style={styles.iconButtonText}>Get Current Location</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.addNoteItem}>
        <TouchableOpacity onPress={handleUpdateNote}>
          <Icon name="post-add" size={70} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    height: 60,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  voiceControls: {
    marginBottom: 16,
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    padding: 8, // Reduced padding
    borderRadius: 6, // Reduced border radius
    marginVertical: 4, // Reduced margin
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconButtonActive: {
    backgroundColor: '#F44336',
  },
  iconButtonInactive: {
    backgroundColor: '#4CAF50',
  },
  iconButtonDelete: {
    backgroundColor: '#D32F2F',
  },
  iconButtonText: {
    marginLeft: 6, // Reduced margin
    fontSize: 14, // Reduced font size
    color: '#FFF',
  },
  audioDuration: {
    fontSize: 14, // Adjust font size for consistency
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  addNoteItem: {
    alignItems: 'center'
  }
});

export default EditNoteScreen;
