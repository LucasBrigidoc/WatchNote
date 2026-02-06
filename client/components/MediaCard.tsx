import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { MediaTypeBadge, MediaType } from "@/components/MediaTypeBadge";
import { StarRating } from "@/components/StarRating";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, Gradients } from "@/constants/theme";

interface MediaCardProps {
  id: string;
  title: string;
  imageUrl: string;
  type: MediaType;
  year?: string;
  rating?: number;
  duration?: string;
  onPress?: () => void;
  variant?: "compact" | "full" | "gradient";
  showFullStars?: boolean;
  inlineStars?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MediaCard({
  id,
  title,
  imageUrl,
  type,
  year,
  rating,
  duration,
  onPress,
  variant = "compact",
  showFullStars = true,
  inlineStars = false,
}: MediaCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  if (variant === "gradient") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.gradientCard, animatedStyle]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.gradientImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradientOverlay}
        />
        <View style={styles.gradientContent}>
          <MediaTypeBadge type={type} />
          <ThemedText type="body" style={styles.gradientTitle} numberOfLines={2}>
            {title}
          </ThemedText>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.compactCard, animatedStyle]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.compactImage}
        contentFit="cover"
      />
      <ThemedText
        type="body"
        weight="semibold"
        numberOfLines={1}
        style={[styles.compactTitle, { color: theme.textPrimary }]}
      >
        {title}
      </ThemedText>
      <View style={styles.compactInfo}>
        <MediaTypeBadge type={type} />
        {year ? (
          <>
            <View style={styles.infoDot} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {year}
            </ThemedText>
          </>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    width: 120,
    marginRight: Spacing.md,
  },
  compactImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  compactTitle: {
    marginBottom: 2,
  },
  compactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  fullImage: {
    width: 100,
    height: 140,
  },
  fullContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  fullHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  fullTitle: {
    marginBottom: 4,
  },
  fullInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: Spacing.xs,
  },
  gradientCard: {
    width: 160,
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginRight: Spacing.md,
    ...Shadows.soft,
  },
  gradientImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  gradientTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: Spacing.xs,
    color: "#FFFFFF",
  },
});
