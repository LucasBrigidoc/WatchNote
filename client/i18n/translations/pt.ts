export type Translations = {
  common: {
    cancel: string;
    save: string;
    delete: string;
    remove: string;
    error: string;
    success: string;
    loading: string;
    back: string;
    search: string;
    all: string;
    total: string;
    items: string;
    item: string;
    version: string;
    ok: string;
    continue: string;
  };
  categories: {
    film: string;
    series: string;
    music: string;
    anime: string;
    manga: string;
    book: string;
  };
  auth: {
    welcomeBack: string;
    email: string;
    password: string;
    forgotPassword: string;
    signIn: string;
    signingIn: string;
    signUp: string;
    createAccount: string;
    creatingAccount: string;
    joinApp: string;
    createYourProfile: string;
    fullName: string;
    confirmPassword: string;
    passwordMin: string;
    noAccount: string;
    hasAccount: string;
    termsAgree: string;
    termsOfService: string;
    privacyPolicy: string;
    loginError: string;
    signUpError: string;
    passwordsNoMatch: string;
    subtitle: string;
  };
  home: {
    popularThisWeek: string;
    timeline: string;
    popular: string;
    noPostsTitle: string;
    noPostsMessage: string;
  };
  discover: {
    searchPlaceholder: string;
    trending: string;
    exploreMedia: string;
  };
  search: {
    placeholder: string;
    profiles: string;
    lists: string;
    searchForAnything: string;
    searchMessage: string;
    noResults: string;
    noResultsMessage: string;
    by: string;
  };
  profile: {
    reviews: string;
    followers: string;
    following: string;
    noBioYet: string;
    bio: string;
    myFavorites: string;
    favorites: string;
    ratings: string;
    categoryCount: string;
    noPostsYet: string;
    shareOpinions: string;
    createNewList: string;
    organizeFavorites: string;
    noListsYet: string;
    createListsMessage: string;
    noUpdates: string;
    trackStatus: string;
    userNotFound: string;
    follow: string;
    unfollow: string;
    noBio: string;
  };
  settings: {
    account: string;
    editProfile: string;
    changePassword: string;
    connectedAccounts: string;
    none: string;
    preferences: string;
    notifications: string;
    language: string;
    portuguese: string;
    english: string;
    about: string;
    aboutApp: string;
    termsOfService: string;
    privacyPolicy: string;
    dangerZone: string;
    logOut: string;
    logOutConfirm: string;
    deleteAccount: string;
    deleteAccountWarning: string;
    confirmDeletion: string;
    enterPasswordToDelete: string;
    yourPassword: string;
    accountDeleted: string;
    selectLanguage: string;
  };
  editProfile: {
    title: string;
    name: string;
    emailLabel: string;
    bioLabel: string;
    changePhoto: string;
    saveChanges: string;
    nameRequired: string;
    emailRequired: string;
    profileUpdated: string;
    bioPlaceholder: string;
    permissionRequired: string;
    galleryPermission: string;
    saveError: string;
  };
  changePassword: {
    title: string;
    currentPassword: string;
    newPassword: string;
    confirmNew: string;
    changeButton: string;
    enterCurrent: string;
    enterNew: string;
    minChars: string;
    noMatch: string;
    changed: string;
    changeError: string;
  };
  createPost: {
    title: string;
    cancelLabel: string;
    searchMedia: string;
    whatType: string;
    selectedMedia: string;
    favorite: string;
    markFavorite: string;
    yourRating: string;
    firstTime: string;
    seenBefore: string;
    yourThoughts: string;
    sharePlaceholder: string;
    hasSpoilers: string;
    markSpoilers: string;
    publish: string;
    published: string;
    postShared: string;
    publishError: string;
  };
  mediaDetail: {
    synopsis: string;
    yourRating: string;
    saveToList: string;
    share: string;
    postsAbout: string;
    seeAll: string;
    votes: string;
  };
  listDetail: {
    note: string;
    notePlaceholder: string;
    noNoteYet: string;
    media: string;
    noMediaYet: string;
    addMediaMessage: string;
    deleteList: string;
    deleteListConfirm: string;
    removeMedia: string;
    removeMediaConfirm: string;
    listNotFound: string;
    saveNoteError: string;
    removeItemError: string;
    deleteListError: string;
  };
};

const pt: Translations = {
  common: {
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
    remove: "Remover",
    error: "Erro",
    success: "Sucesso",
    loading: "Carregando...",
    back: "Voltar",
    search: "Buscar",
    all: "Todos",
    total: "Total",
    items: "itens",
    item: "item",
    version: "Versão",
    ok: "OK",
    continue: "Continuar",
  },
  categories: {
    film: "Filme",
    series: "Série",
    music: "Música",
    anime: "Anime",
    manga: "Mangá",
    book: "Livro",
  },
  auth: {
    welcomeBack: "Bem-vindo de volta!",
    email: "E-mail",
    password: "Senha",
    forgotPassword: "Esqueceu a senha?",
    signIn: "Entrar",
    signingIn: "Entrando...",
    signUp: "Cadastrar",
    createAccount: "Criar conta",
    creatingAccount: "Criando conta...",
    joinApp: "Junte-se ao CultureHub",
    createYourProfile: "Crie seu perfil",
    fullName: "Nome completo",
    confirmPassword: "Confirmar senha",
    passwordMin: "Mínimo de 6 caracteres",
    noAccount: "Não tem uma conta?",
    hasAccount: "Já tem uma conta?",
    termsAgree: "Ao criar uma conta, você concorda com nossos",
    termsOfService: "Termos de Serviço",
    privacyPolicy: "Política de Privacidade",
    loginError: "Erro ao fazer login",
    signUpError: "Erro ao criar conta",
    passwordsNoMatch: "As senhas não coincidem",
    subtitle: "Descubra, avalie e compartilhe suas mídias favoritas",
  },
  home: {
    popularThisWeek: "Populares desta semana",
    timeline: "Timeline",
    popular: "Populares",
    noPostsTitle: "Nenhuma publicação ainda",
    noPostsMessage: "Siga pessoas ou crie uma publicação para ver conteúdo aqui",
  },
  discover: {
    searchPlaceholder: "Buscar filmes, séries, músicas...",
    trending: "Em alta",
    exploreMedia: "Explorar mídias",
  },
  search: {
    placeholder: "Buscar...",
    profiles: "Perfis",
    lists: "Listas",
    searchForAnything: "Busque por qualquer coisa",
    searchMessage: "Encontre perfis, listas e mídias",
    noResults: "Nenhum resultado encontrado",
    noResultsMessage: "Tente buscar com outros termos",
    by: "por",
  },
  profile: {
    reviews: "Avaliações",
    followers: "Seguidores",
    following: "Seguindo",
    noBioYet: "Nenhuma bio ainda",
    bio: "Bio",
    myFavorites: "Meus favoritos",
    favorites: "Favoritos",
    ratings: "Avaliações",
    categoryCount: "mídias",
    noPostsYet: "Nenhuma publicação ainda",
    shareOpinions: "Compartilhe suas opiniões sobre mídias",
    createNewList: "Criar nova lista",
    organizeFavorites: "Organize suas mídias favoritas",
    noListsYet: "Nenhuma lista ainda",
    createListsMessage: "Crie listas para organizar suas mídias favoritas",
    noUpdates: "Nenhuma atualização",
    trackStatus: "Acompanhe o status das suas mídias",
    userNotFound: "Usuário não encontrado",
    follow: "Seguir",
    unfollow: "Deixar de seguir",
    noBio: "Sem bio",
  },
  settings: {
    account: "Conta",
    editProfile: "Editar perfil",
    changePassword: "Alterar senha",
    connectedAccounts: "Contas conectadas",
    none: "Nenhuma",
    preferences: "Preferências",
    notifications: "Notificações",
    language: "Idioma",
    portuguese: "Português",
    english: "Inglês",
    about: "Sobre",
    aboutApp: "Sobre o CultureHub",
    termsOfService: "Termos de Serviço",
    privacyPolicy: "Política de Privacidade",
    dangerZone: "Zona de perigo",
    logOut: "Sair",
    logOutConfirm: "Tem certeza que deseja sair?",
    deleteAccount: "Excluir conta",
    deleteAccountWarning: "Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.",
    confirmDeletion: "Confirmar exclusão",
    enterPasswordToDelete: "Digite sua senha para confirmar a exclusão da conta",
    yourPassword: "Sua senha",
    accountDeleted: "Conta excluída com sucesso",
    selectLanguage: "Selecionar idioma",
  },
  editProfile: {
    title: "Editar perfil",
    name: "Nome",
    emailLabel: "E-mail",
    bioLabel: "Bio",
    changePhoto: "Alterar foto",
    saveChanges: "Salvar alterações",
    nameRequired: "Nome é obrigatório",
    emailRequired: "E-mail é obrigatório",
    profileUpdated: "Perfil atualizado com sucesso",
    bioPlaceholder: "Conte um pouco sobre você...",
    permissionRequired: "Permissão necessária",
    galleryPermission: "Precisamos de permissão para acessar sua galeria",
    saveError: "Erro ao salvar perfil",
  },
  changePassword: {
    title: "Alterar senha",
    currentPassword: "Senha atual",
    newPassword: "Nova senha",
    confirmNew: "Confirmar nova senha",
    changeButton: "Alterar senha",
    enterCurrent: "Digite sua senha atual",
    enterNew: "Digite sua nova senha",
    minChars: "Mínimo de 6 caracteres",
    noMatch: "As senhas não coincidem",
    changed: "Senha alterada com sucesso",
    changeError: "Erro ao alterar senha",
  },
  createPost: {
    title: "Nova publicação",
    cancelLabel: "Cancelar",
    searchMedia: "Buscar mídia",
    whatType: "Que tipo de mídia?",
    selectedMedia: "Mídia selecionada",
    favorite: "Favorito",
    markFavorite: "Marcar como favorito",
    yourRating: "Sua avaliação",
    firstTime: "Primeira vez",
    seenBefore: "Já visto antes",
    yourThoughts: "Seus pensamentos",
    sharePlaceholder: "Compartilhe o que achou...",
    hasSpoilers: "Contém spoilers",
    markSpoilers: "Marcar como spoiler",
    publish: "Publicar",
    published: "Publicado!",
    postShared: "Sua publicação foi compartilhada",
    publishError: "Erro ao publicar",
  },
  mediaDetail: {
    synopsis: "Sinopse",
    yourRating: "Sua avaliação",
    saveToList: "Salvar na lista",
    share: "Compartilhar",
    postsAbout: "Publicações sobre",
    seeAll: "Ver tudo",
    votes: "votos",
  },
  listDetail: {
    note: "Nota",
    notePlaceholder: "Adicione uma nota sobre esta lista...",
    noNoteYet: "Nenhuma nota ainda",
    media: "Mídias",
    noMediaYet: "Nenhuma mídia ainda",
    addMediaMessage: "Adicione mídias a esta lista",
    deleteList: "Excluir lista",
    deleteListConfirm: "Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.",
    removeMedia: "Remover mídia",
    removeMediaConfirm: "Tem certeza que deseja remover esta mídia da lista?",
    listNotFound: "Lista não encontrada",
    saveNoteError: "Erro ao salvar nota",
    removeItemError: "Erro ao remover item",
    deleteListError: "Erro ao excluir lista",
  },
};

export default pt;
