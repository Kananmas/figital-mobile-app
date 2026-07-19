/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Input from './_components/Input';
import FigitalButton from './_components/Button';
import AuthForm from './_components/AuthForm';
import Snackbar from './_components/Snackbar';
import EventsProvider from './context/Events';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {

  return (
    <EventsProvider>
      <View style={styles.container}>
        <Snackbar />
        <AuthForm />
      </View>
    </EventsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: "Farhang2-Regular.ttf",
    paddingTop: 24,
    paddingBottom: 24,
  },
});

export default App;
