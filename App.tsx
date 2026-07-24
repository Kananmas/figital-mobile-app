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
import AuthForm from './_components/AuthForm';
import Snackbar from './_components/Snackbar';
import EventsProvider from './context/Events';
import AuthProvider from './context/Auth';
import { PageProvider, Path } from './context/Pages';
import Rooms from './pages/Rooms';

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
      <AuthProvider>
        <View style={styles.container}>
          <Snackbar />
          <PageProvider>
            <Path path='/'  element={<AuthForm />} />
            <Path path='/rooms' element={<Rooms />} />
          </PageProvider>
        </View>
      </AuthProvider>
    </EventsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: "Farhang2FaNum-Regular.ttf",
    paddingTop: 24,
    paddingBottom: 24,
    display:'flex',
    justifyContent:"center",
  },
});

export default App;
