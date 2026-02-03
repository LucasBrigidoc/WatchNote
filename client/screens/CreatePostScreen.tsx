import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Alert,
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
  const [selectedMedia, setSelectedMedia] = useState<
    (typeof MOCK_SEARCH_RESULTS)[0] | null
  >(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const canPublish = selectedMedia && rating > 0 && comment.trim().length > 0;

  const handlePublish = () => {
    if (!canPublish) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Post Published!", "Your review has been shared.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const searchResults =
    searchQuery.length > 0
      ? MOCK_SEARCH_RESULTS.filter(
          (m) => !selectedType || m.type === selectedType
        )
      : [];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </Pressable>
        <ThemedText type="h4">Create Post</ThemedText>
        <Pressable onPress={handlePublish} disabled={!canPublish}>
          <ThemedText
            style={{
              color: canPublish ? theme.accent : theme.textSecondary,
              fontWeight: "600",
            }}
          >
            Publish
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
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
              icon={<Feather name="search" size={20} color={theme.textSecondary} />}
            />

            {searchResults.map((result) => (
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
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
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
});
