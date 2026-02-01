import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
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

const MOCK_RESULTS = [
  {
    id: "s1",
    title: "Dune: Part Two",
    imageUrl: "https://picsum.photos/seed/dune2/400/600",
    type: "film" as const,
    year: "2024",
    rating: 4.5,
  },
  {
    id: "s2",
    title: "Blonde - Frank Ocean",
    imageUrl: "https://picsum.photos/seed/blonde3/400/400",
    type: "music" as const,
    year: "2016",
    rating: 5,
  },
  {
    id: "s3",
    title: "Attack on Titan: Final Season",
    imageUrl: "https://picsum.photos/seed/aot2/400/600",
    type: "anime" as const,
    year: "2023",
    rating: 4.8,
  },
  {
    id: "s4",
    title: "One Piece",
    imageUrl: "https://picsum.photos/seed/onepiece/400/600",
    type: "manga" as const,
    year: "1997",
    rating: 4.9,
  },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const inputRef = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<MediaType>("all");
  const [hasSearched, setHasSearched] = useState(false);

  const results = query.length > 0 ? MOCK_RESULTS : [];

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
    }
  };

  const renderResult = ({ item }: { item: (typeof MOCK_RESULTS)[0] }) => (
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
    if (!hasSearched && !query) {
      return (
        <EmptyState
          type="search"
          title="Search for anything"
          message="Find films, series, music, anime, manga, and books across all platforms."
        />
      );
    }
    if (query && results.length === 0) {
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
});
