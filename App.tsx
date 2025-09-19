// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';



import DashboardScreen from './screens/DashboardScreen';
import ChercheurListScreen from './screens/ChercheurList';
import { RootStackParamList } from './types/navigation';
import RechercheScreen from './screens/RechercheScreen';
import ProfileScreen from './screens/ProfileScreen';
import EvenementsScreen from './screens/EvenementsScreen';
import GenerateReportScreen from './screens/GenerateReportScreen';
import PartenairesScreen from './screens/PartenairesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>(); // LIEZ L'INTERFACE ICI

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Recherche" component={RechercheScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Evenements" component={EvenementsScreen} />
        <Stack.Screen name="GenerateReport" component={GenerateReportScreen} />
        <Stack.Screen name="Partenaires" component={PartenairesScreen} />
  
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;