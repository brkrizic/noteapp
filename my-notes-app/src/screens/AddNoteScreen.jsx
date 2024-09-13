import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { NoteContext } from '../context/NoteContext';
import { generateUUID } from '../utils/uuidUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddNoteScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recording, setRecording] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recordingUri, setRecordingUri] = useState('');
  const [sound, setSound] = useState();
  const [image, setImage] = useState('');
  const { addNote } = useContext(NoteContext);
  const [location, setLocation] = useState(null);

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
      setRecording(null);
      setIsListening(false);
      setRecordingUri(uri);
      Alert.alert('Recording Stopped', `Recording saved at ${uri}`);
      playSound(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playSound = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    await sound.playAsync();
  };

  const handleTakePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera permissions to use this feature.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const requestLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permissions are required to use this feature.');
      return false;
    }
    return true;
  };

  const handleTakeLocation = async () => {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return;

    try {
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      Alert.alert('Location Saved', `Latitude: ${coords.latitude}\nLongitude: ${coords.longitude}`);
    } catch (error) {
      console.error('Error getting location', error);
    }
  };

  const handleAddNote = () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Please enter both title and content.');
      return;
    }
    addNote({
      id: generateUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      audioUri: recordingUri,
      imageUri: image,
      location, // Add location data if available
    });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add a New Note</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.contentInput}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
      />
      <View style={styles.controlsContainer}>
        <View style={styles.voiceControls}>
          <TouchableOpacity
            style={[styles.iconButton, isListening ? styles.iconButtonActive : styles.iconButtonInactive]}
            onPress={isListening ? stopRecording : startRecording}
          >
            <Icon name={isListening ? "stop" : "mic"} size={30} color="#FFF" />
          </TouchableOpacity>
          {recordingUri ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => playSound(recordingUri)}
            >
              <Icon name="play-arrow" size={30} color="#FFF" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleTakeLocation}
          >
            <Icon name="location-on" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.iconButtonContainer}>
          
          {/* <TouchableOpacity
            style={styles.iconButton}
            onPress={handleTakePicture}
          >
            <Icon name="photo-camera" size={30} color="#FFF" />
            <Text style={styles.iconButtonText}>Camera</Text>
          </TouchableOpacity> */}
        </View>
        <View style={styles.addNoteItem}>
            <TouchableOpacity
                onPress={handleAddNote} 
                >
                <Icon name="post-add" size={70} color="#4CAF50"></Icon>
            </TouchableOpacity>
        </View>
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
  titleInput: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  controlsContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    marginTop: 10
  },
  voiceControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconButtonActive: {
    backgroundColor: '#F44336', // Red for active recording
  },
  iconButtonInactive: {
    backgroundColor: '#4CAF50', // Green for ready to record
  },
  iconButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFF',
  },
  image: {
    marginTop: 20,
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  addNoteItem: {
    alignItems: 'left'
  }
});

export default AddNoteScreen;