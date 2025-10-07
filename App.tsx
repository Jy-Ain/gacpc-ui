import ArticleScreen from './screens/ArticleScreen';
import ActiviteScreen from './screens/ActiviteScreen';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './screens/DashboardScreen';
import RechercheScreen from './screens/RechercheScreen';
import ProfileScreen from './screens/ProfileScreen';
import EvenementsScreen from './screens/EvenementsScreen';
import GenerateReportScreen from './screens/ExportationCsvScreen';
import PartenairesScreen from './screens/PartenairesScreen';


import CreatePartenaireScreen from './screens/CreatePartenaireScreen';
import CreateChercheurScreen from './screens/CreateChercheurScreen';
import { RootStackParamList } from './types/navigation';
import CreateArticleScreen from './screens/CreateArticleScreen';
import CreateActiviteScreen from './screens/CreateActiviteScreen';
import CreateManifestationScreen from './screens/CreateManifestationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.ReactElement | null {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Dashboard" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Recherche" component={RechercheScreen} />

        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ArticleDetail" component={ArticleScreen} />
        <Stack.Screen name="ActiviteDetail" component={ActiviteScreen} />

        <Stack.Screen name="Evenements" component={EvenementsScreen} />
        <Stack.Screen name="GenerateReport" component={GenerateReportScreen} />
        <Stack.Screen name="Partenaires" component={PartenairesScreen} />

        <Stack.Screen name="CreatePartenaire" component={CreatePartenaireScreen} />
        <Stack.Screen name="CreateChercheur" component={CreateChercheurScreen} />
        <Stack.Screen name="CreatePublication" component={CreateArticleScreen} />
        <Stack.Screen name="CreateActivite" component={CreateActiviteScreen} />
        <Stack.Screen name="CreateEvenement" component={CreateManifestationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;