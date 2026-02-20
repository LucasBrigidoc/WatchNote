import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { MediaTypeBadge, MediaType } from "@/components/MediaTypeBadge";
import { StarRating } from "@/components/StarRating";
import { GlassCard } from "@/components/GlassCard";
import { PostCard } from "@/components/PostCard";
import { SaveToListModal } from "@/components/SaveToListModal";
import { CreateListModal } from "@/components/CreateListModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export type MediaDetailParams = {
  id: string;
  title: string;
  imageUrl: string;
  type: MediaType;
  year?: string;
  rating?: number;
  genre?: string;
  overview?: string;
  voteCount?: number;
  backdrop?: string;
};

const MOCK_RELATED_POSTS = [
  {
    id: "rp1",
    user: { name: "Carlos Mendes", avatarUrl: undefined },
    media: {
      title: "",
      imageUrl: "",
      type: "film" as const,
    },
    rating: 4.5,
    comment: "Acabei de assistir e preciso falar sobre! A cinematografia é incrível e a história prende do começo ao fim.",
    timestamp: "3h atrás",
    likeCount: 24,
    commentCount: 6,
  },
  {
    id: "rp2",
    user: { name: "Juliana Rocha", avatarUrl: undefined },
    media: {
      title: "",
      imageUrl: "",
      type: "film" as const,
    },
    rating: 5,
    comment: "Uma obra-prima! Não consigo parar de pensar nisso. Recomendo demais para todos.",
    timestamp: "1d atrás",
    likeCount: 58,
    commentCount: 12,
  },
];

export default function MediaDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ MediaDetail: MediaDetailParams }, "MediaDetail">>();
  const params = route.params;

  const [userRating, setUserRating] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);

  const displayRating = params.rating
    ? params.rating > 5
      ? (params.rating / 2).toFixed(1)
      : params.rating.toFixed(1)
    : null;

  const handleRate = (newRating: number) => {
    setUserRating(newRating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSaveModal(true);
  };

  const relatedPosts = MOCK_RELATED_POSTS.map((post) => ({
    ...post,
    media: {
      ...post.media,
      title: params.title,
      imageUrl: params.imageUrl,
      type: params.type,
    },
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: params.backdrop || params.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(13,13,13,0.6)", theme.backgroundRoot]}
            style={styles.heroGradient}
          />
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + Spacing.sm }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backButtonInner}>
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.posterRow}>
            <Image
              source={{ uri: params.imageUrl }}
              style={styles.posterImage}
              contentFit="cover"
            />
            <View style={styles.titleSection}>
              <MediaTypeBadge type={params.type} size="medium" />
              <ThemedText
                type="h4"
                numberOfLines={3}
                style={[styles.title, { color: theme.text }]}
              >
                {params.title}
              </ThemedText>
              <View style={styles.metaRow}>
                {params.year ? (
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={14} color={theme.textSecondary} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                      {params.year}
                    </ThemedText>
                  </View>
                ) : null}
                {params.genre ? (
                  <View style={styles.metaItem}>
                    <Feather name="tag" size={14} color={theme.textSecondary} />
                    <ThemedText
                      type="small"
                      numberOfLines={1}
                      style={{ color: theme.textSecondary, marginLeft: 4, flex: 1 }}
                    >
                      {params.genre}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              {displayRating ? (
                <View style={styles.ratingDisplay}>
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <ThemedText
                    type="body"
                    style={[styles.ratingValue, { color: theme.text }]}
                  >
                    {displayRating}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    /5
                  </ThemedText>
                  {params.voteCount ? (
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                      ({params.voteCount} votos)
                    </ThemedText>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>

          {params.overview ? (
            <GlassCard style={styles.section}>
              <ThemedText type="body" style={[styles.sectionTitle, { color: theme.text }]}>
                Sinopse
              </ThemedText>
              <ThemedText type="small" style={[styles.overviewText, { color: theme.textSecondary }]}>
                {params.overview}
              </ThemedText>
            </GlassCard>
          ) : null}

          <GlassCard style={styles.section}>
            <ThemedText type="body" style={[styles.sectionTitle, { color: theme.text }]}>
              Sua Avaliação
            </ThemedText>
            <StarRating
              rating={userRating}
              size={28}
              editable={true}
              onRatingChange={handleRate}
              showStars={true}
              inlineStars={false}
            />
          </GlassCard>

          <View style={styles.actionButtons}>
            <Pressable
              onPress={handleSave}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather
                name="bookmark"
                size={18}
                color={theme.text}
              />
              <ThemedText
                type="small"
                style={{
                  color: theme.text,
                  marginLeft: Spacing.sm,
                  fontWeight: "600",
                }}
              >
                Salvar na Lista
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtn,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather name="share-2" size={18} color={theme.text} />
              <ThemedText
                type="small"
                style={{
                  color: theme.text,
                  marginLeft: Spacing.sm,
                  fontWeight: "600",
                }}
              >
                Compartilhar
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.postsSection}>
            <View style={styles.postsSectionHeader}>
              <ThemedText type="body" style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
                Posts sobre esta mídia
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.accent }}>
                Ver todos
              </ThemedText>
            </View>
            {relatedPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                user={post.user}
                media={post.media}
                rating={post.rating}
                comment={post.comment}
                timestamp={post.timestamp}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <SaveToListModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        media={{
          id: params.id,
          title: params.title,
          type: params.type,
          imageUrl: params.imageUrl,
        }}
        onCreateList={() => setShowCreateListModal(true)}
      />

      <CreateListModal
        visible={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreated={() => {
          setShowCreateListModal(false);
          setTimeout(() => setShowSaveModal(true), 300);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 250,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    left: Spacing.lg,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing["3xl"],
  },
  posterRow: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },
  posterImage: {
    width: 120,
    height: 170,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  },
  titleSection: {
    flex: 1,
    marginLeft: Spacing.lg,
    justifyContent: "center",
  },
  title: {
    marginTop: Spacing.sm,
    fontWeight: "700",
  },
  metaRow: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  ratingValue: {
    fontWeight: "800",
    marginLeft: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  overviewText: {
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  postsSection: {
    marginBottom: Spacing.xl,
  },
  postsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
});
