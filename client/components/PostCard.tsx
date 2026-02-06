import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { MediaTypeBadge, MediaType } from "@/components/MediaTypeBadge";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface PostCardProps {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  media: {
    title: string;
    imageUrl: string;
    type: MediaType;
  };
  rating: number;
  comment: string;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PostCard({
  id,
  user,
  media,
  rating,
  comment,
  timestamp,
  likeCount,
  commentCount,
  onPress,
  onLike,
  onComment,
}: PostCardProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Avatar uri={user.avatarUrl} size={40} />
          <View style={styles.userInfo}>
            <ThemedText type="body" style={styles.userName}>
              {user.name}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.timestamp, { color: theme.textSecondary }]}
            >
              {timestamp}
            </ThemedText>
          </View>
        </View>

        <View style={styles.mediaRow}>
          <Image
            source={{ uri: media.imageUrl }}
            style={styles.mediaImage}
            contentFit="cover"
          />
          <View style={styles.mediaInfo}>
            <MediaTypeBadge type={media.type} />
            <ThemedText type="body" style={styles.mediaTitle} numberOfLines={2}>
              {media.title}
            </ThemedText>
            <StarRating rating={rating} size={16} inlineStars={true} />
          </View>
        </View>

        <ThemedText
          type="body"
          style={[styles.comment, { color: theme.text }]}
          numberOfLines={3}
        >
          {comment}
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            onPress={onLike}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="heart" size={18} color={theme.textSecondary} />
            <ThemedText
              type="small"
              style={[styles.actionText, { color: theme.textSecondary }]}
            >
              {likeCount}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={onComment}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name="message-circle"
              size={18}
              color={theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={[styles.actionText, { color: theme.textSecondary }]}
            >
              {commentCount}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="repeat" size={18} color={theme.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="share" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  userInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  userName: {
    fontWeight: "600",
  },
  timestamp: {
    marginTop: 2,
  },
  mediaRow: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  mediaImage: {
    width: 110,
    height: 110,
    borderRadius: BorderRadius.sm,
  },
  mediaInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "space-between",
  },
  mediaTitle: {
    fontWeight: "600",
    marginVertical: Spacing.xs,
  },
  comment: {
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing["2xl"],
  },
  actionText: {
    marginLeft: Spacing.xs,
  },
});
