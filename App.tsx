// [AJOUTER ICI]
import ArticleScreen from './screens/ArticleScreen';
import ActiviteScreen from './screens/ActiviteScreen';
// [FIN AJOUT]

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importation de tous vos écrans existants
import DashboardScreen from './screens/DashboardScreen';
import RechercheScreen from './screens/RechercheScreen';
import ProfileScreen from './screens/ProfileScreen';
import EvenementsScreen from './screens/EvenementsScreen';
import GenerateReportScreen from './screens/GenerateReportScreen';
import PartenairesScreen from './screens/PartenairesScreen';


// Nouveaux écrans de création
import CreatePartenaireScreen from './screens/CreatePartenaireScreen';
import CreateChercheurScreen from './screens/CreateChercheurScreen';
// Importation de vos types de navigation
import { RootStackParamList } from './types/navigation';
import CreateArticleScreen from './screens/CreateArticleScreen';
import CreateActiviteScreen from './screens/CreateActiviteScreen';
import CreateManifestationScreen from './screens/CreateManifestationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Recherche" component={RechercheScreen} />
        
        {/* ÉCRANS DE DÉTAILS EXISTANTS ET NOUVEAUX */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ArticleDetail" component={ArticleScreen} />  
        <Stack.Screen name="ActiviteDetail" component={ActiviteScreen} /> 
        
        {/* AUTRES ÉCRANS */}
        <Stack.Screen name="Evenements" component={EvenementsScreen} />
        <Stack.Screen name="GenerateReport" component={GenerateReportScreen} />
        <Stack.Screen name="Partenaires" component={PartenairesScreen} />
        
        {/* ÉCRANS DE CRÉATION */}
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