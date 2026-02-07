import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather, FontAwesome } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { MediaTypeBadge, MediaType } from "@/components/MediaTypeBadge";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

export interface MediaCardFullProps {
  id: string;
  title: string;
  imageUrl: string;
  type: MediaType;
  year?: string;
  rating?: number;
  genre?: string;
  overview?: string;
  voteCount?: number;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MediaCardFull({
  id,
  title,
  imageUrl,
  type,
  year,
  rating,
  genre,
  overview,
  voteCount,
  onPress,
}: MediaCardFullProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const displayRating = rating ? (rating > 5 ? (rating / 2).toFixed(1) : rating.toFixed(1)) : null;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <GlassCard style={styles.card}>
        <View style={styles.mediaRow}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.mediaImage}
            contentFit="cover"
          />
          <View style={styles.mediaInfo}>
            <View style={styles.topRow}>
              <MediaTypeBadge type={type} />
              {year ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {year}
                </ThemedText>
              ) : null}
            </View>

            <ThemedText
              type="body"
              numberOfLines={2}
              style={[styles.mediaTitle, { color: theme.text, fontWeight: "600" }]}
            >
              {title}
            </ThemedText>

            {genre ? (
              <View style={styles.genreRow}>
                <Feather name="tag" size={12} color={theme.textSecondary} />
                <ThemedText
                  type="small"
                  numberOfLines={1}
                  style={[styles.genreText, { color: theme.textSecondary }]}
                >
                  {genre}
                </ThemedText>
              </View>
            ) : null}

            {displayRating ? (
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={14} color="#FFD700" />
                <ThemedText
                  type="small"
                  style={[styles.ratingText, { color: theme.text }]}
                >
                  {displayRating}/5
                </ThemedText>
                {voteCount ? (
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    ({voteCount})
                  </ThemedText>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {overview ? (
          <ThemedText
            type="small"
            numberOfLines={2}
            style={[styles.overview, { color: theme.textSecondary }]}
          >
            {overview}
          </ThemedText>
        ) : null}

        <View style={[styles.actions, { borderTopColor: theme.border }]}>
          <View style={styles.actionButton}>
            <Feather name="star" size={16} color={theme.textSecondary} />
            <ThemedText
              type="small"
              style={[styles.actionText, { color: theme.textSecondary }]}
            >
              Avaliar
            </ThemedText>
          </View>
          <View style={styles.actionButton}>
            <Feather name="bookmark" size={16} color={theme.textSecondary} />
            <ThemedText
              type="small"
              style={[styles.actionText, { color: theme.textSecondary }]}
            >
              Salvar
            </ThemedText>
          </View>
          <View style={styles.actionButton}>
            <Feather name="message-circle" size={16} color={theme.textSecondary} />
            <ThemedText
              type="small"
              style={[styles.actionText, { color: theme.textSecondary }]}
            >
              Posts
            </ThemedText>
          </View>
          <View style={styles.actionButton}>
            <Feather name="chevron-right" size={16} color={theme.textSecondary} />
            <ThemedText
              type="small"
              style={[styles.actionText, { color: theme.textSecondary }]}
            >
              Detalhes
            </ThemedText>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  mediaRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  mediaImage: {
    width: 100,
    height: 140,
    borderRadius: BorderRadius.sm,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  mediaTitle: {
    marginBottom: Spacing.xs,
  },
  genreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  genreText: {
    marginLeft: Spacing.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ratingText: {
    fontWeight: "700",
  },
  overview: {
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: Spacing.xs,
  },
});
