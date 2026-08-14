import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutScreen from '../screens/AboutScreen';
import ClubHomeScreen from '../screens/ClubHomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MeScreen from '../screens/MeScreen';
import MembersScreen from '../screens/MembersScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ShareMembershipScreen from '../screens/ShareMembershipScreen';
import SignInScreen from '../screens/SignInScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingConfirmationScreen from '../screens/onboarding/OnboardingConfirmationScreen';
import OnboardingInstagramScreen from '../screens/onboarding/OnboardingInstagramScreen';
import OnboardingMessageScreen from '../screens/onboarding/OnboardingMessageScreen';
import OnboardingPhotoScreen from '../screens/onboarding/OnboardingPhotoScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingPhotoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnboardingMessage"
        component={OnboardingMessageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnboardingInstagram"
        component={OnboardingInstagramScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnboardingConfirmation"
        component={OnboardingConfirmationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClubHome"
        component={ClubHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Members"
        component={MembersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Me"
        component={MeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShareMembership"
        component={ShareMembershipScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default RootNavigator;
