import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  TextInput as RNTextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { MediaCardFull } from "@/components/MediaCardFull";
import { Avatar } from "@/components/Avatar";
import { GlassCard } from "@/components/GlassCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TextInput } from "@/components/TextInput";
import { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";
import { authFetch } from "@/lib/api";
import { getApiUrl } from "@/lib/query-client";
import { useLanguage } from "@/i18n";

type FilterType = "all" | "film" | "series" | "music" | "anime" | "manga" | "book" | "profiles" | "lists";

const TMDB_GENRES: Record<number, string> = {
  28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 80: "Crime",
  99: "Documentário", 18: "Drama", 10751: "Família", 14: "Fantasia",
  36: "História", 27: "Terror", 10402: "Música", 9648: "Mistério",
  10749: "Romance", 878: "Ficção Científica", 10770: "Cinema TV",
  53: "Thriller", 10752: "Guerra", 37: "Faroeste",
  10759: "Ação & Aventura", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasia", 10766: "Novela",
  10767: "Talk", 10768: "War & Politics",
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<DiscoverStackParamList>>();
  const inputRef = useRef<RNTextInput>(null);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [listResults, setListResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const FILTERS_TRANSLATED = [
    { key: "all" as FilterType, label: t.common.all },
    { key: "film" as FilterType, label: t.categories.film },
    { key: "series" as FilterType, label: t.categories.series },
    { key: "music" as FilterType, label: t.categories.music },
    { key: "anime" as FilterType, label: t.categories.anime },
    { key: "manga" as FilterType, label: t.categories.manga },
    { key: "book" as FilterType, label: t.categories.book },
    { key: "profiles" as FilterType, label: t.search.profiles },
    { key: "lists" as FilterType, label: t.search.lists },
  ];

  const searchAll = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setUserResults([]);
      setListResults([]);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiUrl();

      const [movieResponse, bookResponse, musicResponse, animeResponse, mangaResponse, usersResponse, listsResponse] = await Promise.all([
        fetch(`${baseUrl}/api/movies/search?q=${encodeURIComponent(searchQuery)}`),
        fetch(`${baseUrl}/api/books/search?q=${encodeURIComponent(searchQuery)}`),
        fetch(`${baseUrl}/api/music/search?q=${encodeURIComponent(searchQuery)}`),
        fetch(`${baseUrl}/api/anime/search?q=${encodeURIComponent(searchQuery)}`),
        fetch(`${baseUrl}/api/manga/search?q=${encodeURIComponent(searchQuery)}`),
        authFetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`),
        authFetch(`/api/search/lists?q=${encodeURIComponent(searchQuery)}`),
      ]);

      const movieData = await movieResponse.json().catch(() => ({ results: [] }));
      const bookData = await bookResponse.json().catch(() => ({ items: [] }));
      const musicData = await musicResponse.json().catch(() => ({ data: [] }));
      const animeData = await animeResponse.json().catch(() => ({ data: [] }));
      const mangaData = await mangaResponse.json().catch(() => ({ data: [] }));
      const usersData = await usersResponse.json().catch(() => ({ users: [] }));
      const listsData = await listsResponse.json().catch(() => ({ lists: [] }));

      let allResults: any[] = [];

      if (movieData.results) {
        allResults = [...allResults, ...movieData.results.map((item: any) => ({
          id: `movie-${item.id}`,
          title: item.title || item.name,
          imageUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "https://via.placeholder.com/400x600?text=No+Image",
          type: item.media_type === "movie" ? "film" : "series",
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          rating: item.vote_average,
          genre: (item.genre_ids || []).map((id: number) => TMDB_GENRES[id]).filter(Boolean).join(", ") || undefined,
          overview: item.overview || "",
          voteCount: item.vote_count || 0,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : undefined,
        }))];
      }

      if (bookData.items) {
        allResults = [...allResults, ...bookData.items.map((item: any) => ({
          id: `book-${item.id}`,
          title: item.volumeInfo.title,
          imageUrl: item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || "https://via.placeholder.com/400x600?text=No+Image",
          type: "book",
          year: (item.volumeInfo.publishedDate || "").split("-")[0],
          rating: item.volumeInfo.averageRating ? item.volumeInfo.averageRating * 2 : 0,
          genre: (item.volumeInfo.categories || []).join(", ") || undefined,
          overview: item.volumeInfo.description || "",
          voteCount: item.volumeInfo.ratingsCount || 0,
        }))];
      }

      if (musicData.data) {
        allResults = [...allResults, ...musicData.data.map((item: any) => ({
          id: `music-${item.id}`,
          title: `${item.title} - ${item.artist.name}`,
          imageUrl: item.album.cover_big || item.album.cover_medium || "https://via.placeholder.com/400x400?text=No+Image",
          type: "music",
          year: "",
          rating: 0,
          genre: item.artist.name || undefined,
          overview: `Álbum: ${item.album.title || "Desconhecido"}`,
          voteCount: 0,
        }))];
      }

      if (animeData.data) {
        allResults = [...allResults, ...animeData.data.map((item: any) => ({
          id: `anime-${item.mal_id}`,
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url || "https://via.placeholder.com/400x600?text=No+Image",
          type: "anime",
          year: (item.aired?.from || "").split("-")[0],
          rating: item.score || 0,
          genre: (item.genres || []).map((g: any) => g.name).join(", ") || undefined,
          overview: item.synopsis || "",
          voteCount: item.scored_by || 0,
        }))];
      }

      if (mangaData.data) {
        allResults = [...allResults, ...mangaData.data.map((item: any) => ({
          id: `manga-${item.mal_id}`,
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url || "https://via.placeholder.com/400x600?text=No+Image",
          type: "manga",
          year: (item.published?.from || "").split("-")[0],
          rating: item.score || 0,
          genre: (item.genres || []).map((g: any) => g.name).join(", ") || undefined,
          overview: item.synopsis || "",
          voteCount: item.scored_by || 0,
        }))];
      }

      setResults(allResults);
      setUserResults(usersData.users || []);
      setListResults(listsData.lists || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchAll(query);
      } else if (query.length === 0) {
        setResults([]);
        setUserResults([]);
        setListResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      searchAll(query);
    }
  };

  const handleMediaPress = (item: any) => {
    navigation.navigate("MediaDetail", {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      type: item.type,
      year: item.year,
      rating: item.rating,
      genre: item.genre,
      overview: item.overview,
      voteCount: item.voteCount,
      backdrop: item.backdrop,
    });
  };

  const renderResult = ({ item }: { item: any }) => (
    <MediaCardFull
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      type={item.type}
      year={item.year}
      rating={item.rating}
      genre={item.genre}
      overview={item.overview}
      voteCount={item.voteCount}
      onPress={() => handleMediaPress(item)}
    />
  );

  const handleUserPress = (userId: string) => {
    navigation.navigate("UserProfile", { userId });
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleUserPress(item.id)}>
      <GlassCard style={styles.userCard}>
        <View style={styles.userCardContent}>
          <Avatar size={48} uri={item.avatarUrl} />
          <View style={styles.userCardInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>{item.name}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>@{item.username}</ThemedText>
            {item.bio ? (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }} numberOfLines={1}>{item.bio}</ThemedText>
            ) : null}
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      </GlassCard>
    </Pressable>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleUserPress(item.userId)}>
      <GlassCard style={styles.userCard}>
        <View style={styles.userCardContent}>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.listThumb} contentFit="cover" />
          ) : (
            <View style={[styles.listThumb, { backgroundColor: theme.backgroundSecondary, alignItems: "center", justifyContent: "center" }]}>
              <Feather name="list" size={20} color={theme.accent} />
            </View>
          )}
          <View style={styles.userCardInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>{item.name}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.search.by} {item.userName} · {item.itemCount} {t.common.items}</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      </GlassCard>
    </Pressable>
  );

  const isProfilesOrLists = selectedFilter === "profiles" || selectedFilter === "lists";

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      );
    }

    if (!hasSearched && !query) {
      return (
        <EmptyState
          type="search"
          title={t.search.searchForAnything}
          message={t.search.searchMessage}
        />
      );
    }

    const currentData = selectedFilter === "profiles" ? userResults : selectedFilter === "lists" ? listResults : filteredResults;
    if (query && currentData.length === 0 && !loading) {
      return (
        <EmptyState
          type="search"
          title={t.search.noResults}
          message={`We couldn't find anything matching "${query}". Try different keywords.`}
        />
      );
    }
    return null;
  };

  const filteredResults = results.filter((item) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "profiles" || selectedFilter === "lists") return false;
    if (selectedFilter === "film") return item.type === "film";
    if (selectedFilter === "series") return item.type === "series";
    if (selectedFilter === "music") return item.type === "music";
    if (selectedFilter === "book") return item.type === "book";
    if (selectedFilter === "anime") return item.type === "anime";
    if (selectedFilter === "manga") return item.type === "manga";
    return item.type === selectedFilter;
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <View
        style={[
          styles.searchContainer,
          {
            paddingTop: headerHeight + Spacing.xl + Spacing.md,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder={t.search.placeholder}
          icon={<Feather name="search" size={20} color={theme.textSecondary} />}
          autoFocus
          returnKeyType="search"
          rightElement={
            query.length > 0 ? (
              <Pressable onPress={() => setQuery("")}>
                <Feather name="x" size={20} color={theme.textSecondary} />
              </Pressable>
            ) : undefined
          }
        />

        <View style={styles.filters}>
          {FILTERS_TRANSLATED.map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === filter.key
                      ? theme.accent
                      : theme.backgroundDefault,
                  borderColor:
                    selectedFilter === filter.key ? theme.accent : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color:
                    selectedFilter === filter.key
                      ? "#0D0D0D"
                      : theme.textSecondary,
                  fontWeight: selectedFilter === filter.key ? "600" : "400",
                }}
              >
                {filter.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {selectedFilter === "profiles" ? (
        <FlatList
          data={userResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.content,
            userResults.length === 0 && styles.emptyContent,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListEmptyComponent={renderEmptyState}
        />
      ) : selectedFilter === "lists" ? (
        <FlatList
          data={listResults}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.content,
            listResults.length === 0 && styles.emptyContent,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.content,
            filteredResults.length === 0 && styles.emptyContent,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  emptyContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  userCard: {
    marginBottom: Spacing.sm,
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  userCardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
  },
});
