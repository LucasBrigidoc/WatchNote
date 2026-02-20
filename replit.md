# Projeto: My App (CultureHub)

## Arquitetura e Decisões
- **Integração Spotify**: O usuário optou por não usar o conector nativo do Replit. A integração será feita manualmente via segredos (`SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET`) utilizando a API oficial do Spotify.
- **React Native / Expo**: App mobile com React Navigation (bottom tabs + stacks)
- **Backend**: Express.js com TypeScript (tsx), rodando na porta 5000
- **Database**: PostgreSQL (Neon-backed) com Drizzle ORM
- **APIs Externas**: TMDB (filmes/séries), Deezer (música), Jikan/MyAnimeList (anime/mangá), Google Books (livros)

## Componentes Principais
- **MediaCardFull**: Card de mídia em largura total com imagem, avaliação, categoria, data, gênero, sinopse e botões de ação
- **MediaDetailScreen**: Tela de detalhes da mídia com imagem hero, poster, sinopse, avaliação por estrelas, salvar na lista, compartilhar e posts relacionados
- **PostCard**: Card de post de usuário com avaliação e comentário sobre uma mídia
- **GlassCard**: Card estilizado com efeito glass usado como base em vários componentes

## Navegação
- **RootStack**: Auth / Main / CreatePost
- **HomeStack**: Home / MediaDetail
- **DiscoverStack**: Discover / Search / MediaDetail
- **ProfileStack**: Profile / Settings

## Progresso da Migração
- [x] Instalar pacotes iniciais
- [x] Verificar workflows
- [x] Configurar credenciais do Spotify
- [x] Configurar chave da API do TMDB
- [ ] Implementar serviço de busca de músicas (Spotify)
- [x] Implementar rota de filmes (TMDB)
- [x] Integrar busca de filmes e séries no frontend
- [x] Integrar API de Livros (Google Books)
- [x] Integrar busca de músicas (Deezer)
- [x] Integrar busca de animes (Jikan/MyAnimeList)
- [x] Integrar busca de mangás (Jikan/MyAnimeList)

## Autenticação
- **Schema**: Tabela `users` com id (UUID), username, email, password (bcrypt hash), name, bio, avatarUrl, createdAt
- **Backend**: Rotas `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` com bcryptjs e tokens
- **Frontend**: AuthContext com chamadas reais à API, persistência de token via AsyncStorage, auto-login no startup
- **Storage**: DatabaseStorage com Drizzle ORM + pg Pool (server/db.ts, server/storage.ts)

## Listas de Mídia
- **Schema**: Tabela `user_lists` com id, userId, name, coverImage, createdAt; `user_list_items` com id, listId, mediaId, mediaType, mediaTitle, mediaImage, addedAt
- **Componentes**: CreateListModal (criar lista com nome e capa), SaveToListModal (salvar mídia em lista existente), ListDetailScreen (ver itens, nota, remover mídias)
- **Fluxo**: Perfil > Listas > Criar Nova Lista (modal com nome + imagem de capa); MediaDetail > Salvar na Lista > escolher lista ou criar nova; Perfil > Listas > Tocar na lista > ListDetailScreen com nota editável e remoção de itens
- **Schema**: Tabela `user_lists` agora inclui campo `description` para notas

## Posts
- **Schema**: Tabela `posts` com id, userId, mediaId, mediaType, mediaTitle, mediaImage, rating, comment, isFavorite, firstTime, hasSpoilers, likeCount, commentCount, createdAt
- **Rotas**: POST /api/posts (criar), GET /api/posts (todos), GET /api/posts/user (do usuário autenticado)
- **CreatePostScreen**: Busca real de mídias, publica post via API, salva no banco de dados
- **ProfileScreen**: Aba "Posts" exibe posts reais do usuário com PostCard

## Mudanças Recentes (2026-02-20)
- Implementada funcionalidade completa de listas: criar listas com nome e capa, salvar mídias em listas
- Criado CreateListModal com seletor de imagem de capa (expo-image-picker)
- Criado SaveToListModal para salvar mídias em listas existentes ou criar nova lista
- Adicionado campo coverImage na tabela user_lists
- Implementado sistema de autenticação completo (registro, login, perfil) com banco de dados real
- Expandida tabela de usuários com email, nome, bio, avatarUrl, createdAt
- Criado DatabaseStorage substituindo MemStorage por PostgreSQL real via Drizzle ORM
- Criado componente MediaCardFull para exibição de mídias em cards de largura total
- Criada tela MediaDetailScreen com detalhes da mídia, avaliação, salvar e posts relacionados
- Atualizada navegação para incluir rota MediaDetail nos stacks Home e Discover
- Atualizada DiscoverScreen com cards de largura total e filtros por categoria
- Atualizada SearchScreen para usar MediaCardFull nos resultados de busca com navegação para detalhes
- Adicionado mapeamento de gêneros TMDB (IDs para nomes em português)
