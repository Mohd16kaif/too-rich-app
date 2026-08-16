import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { MemberProvider } from './src/context/MemberContext';
import RootNavigator from './src/navigation/RootNavigator';

function App() {
  return (
    <MemberProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </MemberProvider>
  );
}

export default App;
