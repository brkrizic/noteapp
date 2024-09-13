import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { NoteContext } from '../context/NoteContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  const { notes, removeNote } = useContext(NoteContext);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter notes based on the search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => startDeleteAnimation(id),
        },
      ],
      { cancelable: false }
    );
  };

  const startDeleteAnimation = (id) => {
    const index = notes.findIndex(note => note.id === id);
    if (index > -1) {
      Animated.timing(opacityAnims[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        removeNote(id); // Remove the note after the animation completes
      });
    }
  };

  // Create an array of Animated.Value for each note
  const opacityAnims = filteredNotes.map(() => new Animated.Value(1));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Notes</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View style={{ ...styles.noteContainer, opacity: opacityAnims[index] }}>
            <TouchableOpacity
              style={styles.noteContent}
              onPress={() => navigation.navigate('NoteDetails', { note: item })}
            >
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteDate}>
                Created: {new Date(item.createdAt).toLocaleDateString()} | Last Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
      <View style={styles.circleAdd}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddNote')}
        >
          <Icon name="add-circle-outline" size={60} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    marginLeft: 10
  },
  searchInput: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  noteContainer: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    color: '#333',
  },
  noteDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  circleAdd: {
    position: 'relative',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
