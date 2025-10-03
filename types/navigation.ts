export type RootStackParamList = {
  Dashboard: undefined;
  Evenements: undefined;
  Partenaires: undefined;
  Recherche: undefined;
  GenerateReport: undefined;

  Profile: { chercheurId: number };
  ArticleDetail: { articleId: number };
  ActiviteDetail: { activiteId: number };
  
  CreatePublication: undefined;
  CreateChercheur: undefined;
  CreateActivite: undefined;
  CreateEvenement: undefined;
  CreatePartenaire: undefined;
  CreateArticle: undefined;
  CreateManifestation: undefined;
  
};