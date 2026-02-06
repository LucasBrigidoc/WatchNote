import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { StarRating } from "@/components/StarRating";
import { MediaTypeBadge, MediaType } from "@/components/MediaTypeBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TextInput } from "@/components/TextInput";

type MediaTypeOption = "film" | "series" | "music" | "anime" | "manga" | "book";

const MEDIA_TYPES: { key: MediaTypeOption; label: string; icon: string }[] = [
  { key: "film", label: "Film", icon: "film" },
  { key: "series", label: "Series", icon: "tv" },
  { key: "music", label: "Music", icon: "music" },
  { key: "anime", label: "Anime", icon: "play-circle" },
  { key: "manga", label: "Manga", icon: "book-open" },
  { key: "book", label: "Book", icon: "book" },
];

const MOCK_SEARCH_RESULTS = [
  {
    id: "1",
    title: "Blonde",
    artist: "Frank Ocean",
    imageUrl: "https://picsum.photos/seed/searchblonde/400/400",
    year: "2016",
    type: "music" as const,
  },
  {
    id: "2",
    title: "Dune: Part Two",
    artist: "Denis Villeneuve",
    imageUrl: "https://picsum.photos/seed/searchdune/400/400",
    year: "2024",
    type: "film" as const,
  },
];

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [selectedType, setSelectedType] = useState<MediaTypeOption | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [hasSpoilers, setHasSpoilers] = useState(false);

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_DOMAIN 
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` 
        : "http://127.0.0.1:5000";
      
      const [movieRes, bookRes, musicRes, animeRes, mangaRes] = await Promise.all([
        fetch(`${baseUrl}/api/movies/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
        fetch(`${baseUrl}/api/books/search?q=${encodeURIComponent(query)}`).then(r => r.json().catch(() => ({ items: [] }))),
        fetch(`${baseUrl}/api/music/search?q=${encodeURIComponent(query)}`).then(r => r.json().catch(() => ({ data: [] }))),
        fetch(`${baseUrl}/api/anime/search?q=${encodeURIComponent(query)}`).then(r => r.json().catch(() => ({ data: [] }))),
        fetch(`${baseUrl}/api/manga/search?q=${encodeURIComponent(query)}`).then(r => r.json().catch(() => ({ data: [] })))
      ]);

      let allResults: any[] = [];

      if (movieRes.results) {
        allResults = [...allResults, ...movieRes.results.map((item: any) => ({
          id: `movie-${item.id}`,
          title: item.title || item.name,
          imageUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "https://via.placeholder.com/400x600?text=No+Image",
          type: item.media_type === "movie" ? "film" : "series",
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          artist: item.media_type === "movie" ? "Movie" : "Series"
        }))];
      }

      if (bookRes.items) {
        allResults = [...allResults, ...bookRes.items.map((item: any) => ({
          id: `book-${item.id}`,
          title: item.volumeInfo.title,
          imageUrl: item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || "https://via.placeholder.com/400x600?text=No+Image",
          type: "book",
          year: (item.volumeInfo.publishedDate || "").split("-")[0],
          artist: item.volumeInfo.authors?.join(", ") || "Unknown Author"
        }))];
      }

      if (musicRes.data) {
        allResults = [...allResults, ...musicRes.data.map((item: any) => ({
          id: `music-${item.id}`,
          title: item.title,
          imageUrl: item.album.cover_big || item.album.cover_medium || "https://via.placeholder.com/400x400?text=No+Image",
          type: "music",
          year: "",
          artist: item.artist.name
        }))];
      }

      if (animeRes.data) {
        allResults = [...allResults, ...animeRes.data.map((item: any) => ({
          id: `anime-${item.mal_id}`,
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url || "https://via.placeholder.com/400x600?text=No+Image",
          type: "anime",
          year: (item.aired?.from || "").split("-")[0],
          artist: "Anime"
        }))];
      }

      if (mangaRes.data) {
        allResults = [...allResults, ...mangaRes.data.map((item: any) => ({
          id: `manga-${item.mal_id}`,
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url || "https://via.placeholder.com/400x600?text=No+Image",
          type: "manga",
          year: (item.published?.from || "").split("-")[0],
          artist: "Manga"
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
      if (searchQuery.length > 2) {
        searchMovies(searchQuery);
      } else if (searchQuery.length === 0) {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredResults = results.filter((m) => !selectedType || m.type === selectedType);

  const handlePublish = () => {
    if (!canPublish) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Post Published!", "Your review has been shared.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const canPublish = selectedMedia && rating > 0 && comment.trim().length > 0;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </Pressable>
        <ThemedText type="h4">Create Post</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {!selectedMedia ? (
          <>
            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Search for media
            </ThemedText>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search..."
              icon={loading ? <ActivityIndicator size="small" color={theme.accent} /> : <Feather name="search" size={20} color={theme.textSecondary} />}
            />

            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              What type of media?
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typesList}
            >
              {MEDIA_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  onPress={() => {
                    setSelectedType(type.key === selectedType ? null : type.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor:
                        selectedType === type.key
                          ? theme.accent
                          : theme.backgroundDefault,
                      borderColor:
                        selectedType === type.key ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Feather
                    name={type.icon as any}
                    size={16}
                    color={
                      selectedType === type.key ? "#0D0D0D" : theme.textSecondary
                    }
                  />
                  <ThemedText
                    type="small"
                    style={{
                      color:
                        selectedType === type.key ? "#0D0D0D" : theme.textSecondary,
                      marginLeft: Spacing.xs,
                      fontWeight: selectedType === type.key ? "600" : "400",
                    }}
                  >
                    {type.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            {filteredResults.map((result) => (
              <Pressable
                key={result.id}
                onPress={() => {
                  setSelectedMedia(result);
                  setSearchQuery("");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <GlassCard style={styles.searchResult}>
                  <Image
                    source={{ uri: result.imageUrl }}
                    style={styles.resultImage}
                    contentFit="cover"
                  />
                  <View style={styles.resultInfo}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {result.title}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {result.artist} • {result.year}
                    </ThemedText>
                  </View>
                  <MediaTypeBadge type={result.type} />
                </GlassCard>
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Selected media
            </ThemedText>
            <GlassCard style={styles.selectedMedia}>
              <Image
                source={{ uri: selectedMedia.imageUrl }}
                style={styles.selectedImage}
                contentFit="cover"
              />
              <View style={styles.selectedInfo}>
                <MediaTypeBadge type={selectedMedia.type} />
                <ThemedText
                  type="body"
                  style={{ fontWeight: "600", marginTop: Spacing.xs }}
                >
                  {selectedMedia.title}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {selectedMedia.artist} • {selectedMedia.year}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setSelectedMedia(null)}
                style={styles.removeButton}
              >
                <Feather name="x" size={20} color={theme.textSecondary} />
              </Pressable>
            </GlassCard>

            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Favorito
            </ThemedText>
            <Pressable
              onPress={() => {
                setIsFavorite(!isFavorite);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.favoriteToggle,
                {
                  backgroundColor: isFavorite ? theme.accent + "20" : theme.backgroundDefault,
                  borderColor: isFavorite ? theme.accent : theme.border,
                },
              ]}
            >
              <Feather
                name="star"
                size={20}
                color={isFavorite ? theme.accent : theme.textSecondary}
              />
              <ThemedText
                style={{
                  marginLeft: Spacing.sm,
                  color: isFavorite ? theme.accent : theme.textSecondary,
                  fontWeight: isFavorite ? "600" : "400",
                }}
              >
                {isFavorite ? "Marcar como favorito da categoria" : "Marcar como favorito da categoria"}
              </ThemedText>
            </Pressable>

            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Your rating
            </ThemedText>
            <View style={styles.ratingContainer}>
              <StarRating
                rating={rating}
                size={32}
                editable
                onRatingChange={setRating}
              />
            </View>

            <Pressable
              onPress={() => {
                setFirstTime(!firstTime);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: firstTime ? theme.accent + "20" : theme.backgroundDefault,
                  borderColor: firstTime ? theme.accent : theme.border,
                },
              ]}
            >
              <Feather
                name={firstTime ? "eye" : "refresh-cw"}
                size={20}
                color={firstTime ? theme.accent : theme.textSecondary}
              />
              <ThemedText
                style={{
                  marginLeft: Spacing.sm,
                  color: firstTime ? theme.accent : theme.textSecondary,
                  fontWeight: firstTime ? "600" : "400",
                }}
              >
                {firstTime ? "Primeira vez que eu vi" : "Já tinha visto antes"}
              </ThemedText>
            </Pressable>

            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Your thoughts
            </ThemedText>
            <View
              style={[
                styles.commentContainer,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Share your thoughts..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.commentInput, { color: theme.text }]}
                multiline
                textAlignVertical="top"
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
            </View>

            <Pressable
              onPress={() => {
                setHasSpoilers(!hasSpoilers);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.toggleButton,
                {
                  marginTop: Spacing.md,
                  backgroundColor: hasSpoilers ? "#FF4B4B20" : theme.backgroundDefault,
                  borderColor: hasSpoilers ? "#FF4B4B" : theme.border,
                },
              ]}
            >
              <Feather
                name="alert-triangle"
                size={20}
                color={hasSpoilers ? "#FF4B4B" : theme.textSecondary}
              />
              <ThemedText
                style={{
                  marginLeft: Spacing.sm,
                  color: hasSpoilers ? "#FF4B4B" : theme.textSecondary,
                  fontWeight: hasSpoilers ? "600" : "400",
                }}
              >
                {hasSpoilers ? "Contém Spoilers" : "Indicar que tem spoilers"}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handlePublish}
              disabled={!canPublish}
              style={[
                styles.publishButton,
                {
                  backgroundColor: canPublish ? theme.accent : theme.border,
                  opacity: canPublish ? 1 : 0.6,
                },
              ]}
            >
              <ThemedText
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Publicar
              </ThemedText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  content: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  typesList: {
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
  },
  resultInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  selectedMedia: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  selectedInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  ratingContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  commentContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 250,
  },
  commentInput: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  publishButton: {
    marginTop: Spacing.xl,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
