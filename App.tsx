import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importez vos écrans
import DashboardScreen from './screens/DashboardScreen';
import ChercheurListScreen from './screens/ChercheurList.tsx'; // Assurez-vous que ce fichier existe
// Importez d'autres écrans une fois qu'ils sont créés
// import ProfileScreen from './screens/ProfileScreen';
// import RechercheScreen from './screens/RechercheScreen';
// import EvenementsScreen from './screens/EvenementsScreen';
// import PartenairesScreen from './screens/PartenairesScreen';
// import GenerateReportScreen from './screens/GenerateReportScreen';


const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ChercheurList" component={ChercheurListScreen} />
        {/* Ajoutez d'autres écrans ici quand ils seront développés */}
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
        {/* <Stack.Screen name="Recherche" component={RechercheScreen} /> */}
        {/* <Stack.Screen name="Evenements" component={EvenementsScreen} /> */}
        {/* <Stack.Screen name="Partenaires" component={PartenairesScreen} /> */}
        {/* <Stack.Screen name="GenerateReport" component={GenerateReportScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;