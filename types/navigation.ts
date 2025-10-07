export type RootStackParamList = {
  Dashboard: undefined;
  Recherche: undefined;
  Evenements: undefined;
  GenerateReport: undefined;
  Partenaires: undefined;
  ArticleDetail: { articleId: string };
  ActiviteDetail: { activiteId: string };
  Profile: { chercheurId: number };

  CreatePartenaire: undefined;
  CreateChercheur: undefined;
  CreatePublication: undefined;
  CreateActivite: undefined;
  CreateEvenement: undefined;
};