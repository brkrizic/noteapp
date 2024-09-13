import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';
import NoteDetailsScreen from './src/screens/NoteDetailsScreen'; 
import EditNoteScreen from './src/screens/EditNoteScreen'; 
import { NoteProvider } from './src/context/NoteContext';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NoteProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} />
            <Stack.Screen name="AddNote" component={AddNoteScreen} />
            <Stack.Screen name="EditNote" component={EditNoteScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NoteProvider>
  );
}
