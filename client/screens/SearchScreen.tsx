import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  TextInput as RNTextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { MediaCard } from "@/components/MediaCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TextInput } from "@/components/TextInput";

type MediaType = "all" | "film" | "series" | "music" | "anime" | "manga" | "book";

const FILTERS: { key: MediaType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "film", label: "Films" },
  { key: "series", label: "Series" },
  { key: "music", label: "Music" },
  { key: "anime", label: "Anime" },
  { key: "manga", label: "Manga" },
  { key: "book", label: "Books" },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const inputRef = useRef<RNTextInput>(null);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<MediaType>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_DOMAIN 
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` 
        : "http://127.0.0.1:5000";
      
      // Busca Filmes e Séries (TMDB)
      const movieResponse = await fetch(`${baseUrl}/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
      const movieData = await movieResponse.json();
      
      // Busca Livros (Google Books)
      const bookResponse = await fetch(`${baseUrl}/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      const bookData = await bookResponse.json().catch(() => ({ items: [] }));

      // Busca Músicas (Deezer)
      const musicResponse = await fetch(`${baseUrl}/api/music/search?q=${encodeURIComponent(searchQuery)}`);
      const musicData = await musicResponse.json().catch(() => ({ data: [] }));

      // Busca Animes (Jikan)
      const animeResponse = await fetch(`${baseUrl}/api/anime/search?q=${encodeURIComponent(searchQuery)}`);
      const animeData = await animeResponse.json().catch(() => ({ data: [] }));

      // Busca Mangás (Jikan)
      const mangaResponse = await fetch(`${baseUrl}/api/manga/search?q=${encodeURIComponent(searchQuery)}`);
      const mangaData = await mangaResponse.json().catch(() => ({ data: [] }));

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
          rating: item.vote_average / 2,
        }))];
      }

      if (bookData.items) {
        allResults = [...allResults, ...bookData.items.map((item: any) => ({
          id: `book-${item.id}`,
          title: item.volumeInfo.title,
          imageUrl: item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || "https://via.placeholder.com/400x600?text=No+Image",
          type: "book",
          year: (item.volumeInfo.publishedDate || "").split("-")[0],
          rating: item.volumeInfo.averageRating || 0,
        }))];
      }

      if (musicData.data) {
        allResults = [...allResults, ...musicData.data.map((item: any) => ({
          id: `music-${item.id}`,
          title: `${item.title} - ${item.artist.name}`,
          imageUrl: item.album.cover_big || item.album.cover_medium || "https://via.placeholder.com/400x400?text=No+Image",
          type: "music",
          year: "", // Deezer search doesn't provide year directly in top results usually
          rating: 0,
        }))];
      }

      if (animeData.data) {
        allResults = [...allResults, ...animeData.data.map((item: any) => ({
          id: `anime-${item.mal_id}`,
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url || "https://via.placeholder.com/400x600?text=No+Image",
          type: "anime",
          year: (item.aired?.from || "").split("-")[0],
          rating: item.score ? item.score / 2 : 0,
        }))];
      }

      if (mangaData.data) {
        allResults = [...allResults, ...mangaData.data.map((item: any) => ({
          id: `manga-${item.mal_id}`,
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url || "https://via.placeholder.com/400x600?text=No+Image",
          type: "manga",
          year: (item.published?.from || "").split("-")[0],
          rating: item.score ? item.score / 2 : 0,
        }))];
      }

      setResults(allResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchMovies(query);
      } else if (query.length === 0) {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      searchMovies(query);
    }
  };

  const renderResult = ({ item }: { item: any }) => (
    <MediaCard
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      type={item.type}
      year={item.year}
      rating={item.rating}
      variant="full"
      showFullStars={false}
    />
  );

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
          title="Search for anything"
          message="Find films, series, music, anime, manga, and books across all platforms."
        />
      );
    }
    if (query && results.length === 0 && !loading) {
      return (
        <EmptyState
          type="search"
          title="No results found"
          message={`We couldn't find anything matching "${query}". Try different keywords.`}
        />
      );
    }
    return null;
  };

  const filteredResults = results.filter((item) => {
    if (selectedFilter === "all") return true;
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
          placeholder="Search..."
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
          {FILTERS.map((filter) => (
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
});
