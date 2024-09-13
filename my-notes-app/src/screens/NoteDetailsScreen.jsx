import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity, Linking, Share } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NoteDetailsScreen = ({ route, navigation }) => {
  const { note } = route.params;
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  useEffect(() => {
    if (note.audioUri) {
      loadSound(note.audioUri);
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [note.audioUri]);

  const loadSound = async (uri) => {
    try {
      const { sound, status } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      setAudioDuration(status.durationMillis);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          setPlaybackPosition(status.positionMillis);
        }
      });
    } catch (error) {
      console.error('Failed to load sound', error);
    }
  };

  const playSound = async () => {
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

  const openMap = () => {
    if (note.location) {
      const { latitude, longitude } = note.location;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No location data available.');
    }
  };

  const shareNote = async () => {
    try {
      await Share.share({
        message: `${note.title}\n\n${note.content}`,
      });
    } catch (error) {
      console.error('Failed to share note', error);
    }
  };

  const confirmDeleteNote = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Add your delete logic here
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDuration = (durationMillis) => {
    const minutes = Math.floor(durationMillis / 60000);
    const seconds = Math.floor((durationMillis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>{new Date(note.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.contentLabel}>Content:</Text>
        <Text style={styles.content}>{note.content}</Text>
      </View>

      {note.imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: note.imageUri }} style={styles.image} />
        </View>
      )}

      {note.audioUri && (
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={styles.audioButton}
            onPress={playSound}
          >
            <Icon name={isPlaying ? 'stop' : 'play-arrow'} size={30} color="#FFF" />
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'Stop Recording' : 'Play Recording'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.audioDuration}>{formatDuration(audioDuration)}</Text>
          <Text style={styles.audioPosition}>
            {formatDuration(playbackPosition)} / {formatDuration(audioDuration)}
          </Text>
        </View>
      )}

      {note.location && (
        <TouchableOpacity
          style={styles.locationButton}
          onPress={openMap}
        >
          <Icon name="location-on" size={30} color="#FFF" />
          <Text style={styles.locationButtonText}>View on Map</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditNote', { note })}
        >
          <Icon name='border-color' size={30} color="#FFF"></Icon>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareNote}
        >
          <Icon name="share" size={30} color="#FFF" />
          <Text style={styles.shareButtonText}></Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.deleteButton}
          onPress={confirmDeleteNote}
        >
          <Icon name="delete" size={30} color="#FFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity> */}
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
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  content: {
    fontSize: 18,
    color: '#555',
    lineHeight: 24,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  audioControls: {
    marginBottom: 20,
    alignItems: 'center',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  audioButtonText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FFF',
  },
  audioDuration: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  audioPosition: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FFF',
  },
  actions: {
    marginTop: 20,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  editButtonText: {
    fontSize: 18,
    color: '#FFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#FFF',
  },
});

export default NoteDetailsScreen;
