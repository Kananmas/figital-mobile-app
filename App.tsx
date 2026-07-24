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
import { PAGE_TYPES } from './constants/page-type.constants';
import ChatProvider from './context/Chat';
import ChatRoom from './pages/ChatRoom';

const APP_ROUTES = ['/', '/rooms', '/chatroom'] as const;

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
      <PageProvider routes={APP_ROUTES}>
        <AuthProvider>
          <ChatProvider>
            <View style={styles.container}>
              <Snackbar />
              <Path path='/' type={PAGE_TYPES.UNKNOWN} element={<AuthForm />} />
              <Path path='/rooms' type={PAGE_TYPES.PRIVATE} element={<Rooms />} />
              <Path path="/chatroom" type={PAGE_TYPES.PRIVATE} element={<ChatRoom />} />
            </View>
          </ChatProvider>
        </AuthProvider>
      </PageProvider>
    </EventsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    display: 'flex',
    justifyContent: "center",
  },
});

export default App;
