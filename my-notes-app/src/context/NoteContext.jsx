import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('notes');
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
      } catch (error) {
        console.error('Failed to load notes', error);
      }
    };

    loadNotes();
  }, []);

  const saveNotes = async (notes) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes', error);
    }
  };

  const addNote = (note) => {
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const updateNote = (updatedNote) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const removeNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, removeNote }}>
      {children}
    </NoteContext.Provider>
  );
};
