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
      const domain = process.env.EXPO_PUBLIC_DOMAIN || window.location.host;
      const protocol = window.location.protocol;
      const baseUrl = `${protocol}//${domain}`;
      const response = await fetch(`${baseUrl}/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.results) {
        const mappedResults = data.results.map((item: any) => ({
          id: item.id.toString(),
          title: item.title || item.name,
          imageUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "https://via.placeholder.com/400x600?text=No+Image",
          type: item.media_type === "movie" ? "film" : "series",
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          rating: item.vote_average / 2, // TMDB is 0-10, we use 0-5
        }));
        setResults(mappedResults);
      }
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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <View
        style={[
          styles.searchContainer,
          {
            paddingTop: headerHeight + Spacing.md,
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
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          results.length === 0 && styles.emptyContent,
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
