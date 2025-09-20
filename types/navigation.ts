// src/types/navigation.ts
export type RootStackParamList = {
  // Vos écrans existants
  Dashboard: undefined;
  Profile: undefined;
  Evenements: undefined;
  Partenaires: undefined;
  Recherche: undefined; // Ajouté Recherche car vous l'utilisez
  GenerateReport: undefined; // Ajouté GenerateReport car vous l'utilisez

  // Si vous avez des écrans de détail (exemple)
  // ChercheurDetail: { chercheurId: number };
  // ArticleDetail: { articleId: number };
  // ActiviteDetail: { activiteId: number };
  // EvenementDetail: { evenementId: number };

  // Nouveaux écrans de création pour la modale
  CreatePublication: undefined; // Pas de paramètres pour l'instant
  CreateChercheur: undefined;
  CreateActivite: undefined;
  CreateEvenement: undefined;
  CreatePartenaire: undefined;
};