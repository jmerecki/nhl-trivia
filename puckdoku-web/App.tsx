import React from 'react';
import { NavigationContainer, } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserRegistrationScreen from './screens/UserRegistration';
import StatsScreen from './screens/StatsScreen';
import PlayerGrid from './screens/PlayerGrid';
import LoginScreen from './screens/LoginScreen';

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  Game: { username: string };
  Stats: { username: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={() => (
            <LoginScreen />
          )} />
        <Stack.Screen
          name="Registration"
          component={() => (
            <UserRegistrationScreen />
          )}
        />
        <Stack.Screen name="Stats">
          {(props) => <StatsScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name="Game">
          {(props) => <PlayerGrid {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}