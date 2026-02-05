import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import { PostCard } from "@/components/PostCard";
import { MediaCard } from "@/components/MediaCard";
import { GlassCard } from "@/components/GlassCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

type ProfileTab = "posts" | "reviews" | "lists" | "republicados";

const TABS: { key: ProfileTab; icon: string }[] = [
  { key: "reviews", icon: "user" },
  { key: "posts", icon: "grid" },
  { key: "lists", icon: "list" },
  { key: "republicados", icon: "repeat" },
];

const MOCK_POSTS = [
  {
    id: "p1",
    user: { name: "You", avatarUrl: undefined },
    media: {
      title: "Blonde",
      imageUrl: "https://picsum.photos/seed/myblonde/400/400",
      type: "music" as const,
    },
    rating: 5,
    comment: "This album changed my life. Absolute masterpiece.",
    timestamp: "2d ago",
    likeCount: 24,
    commentCount: 3,
  },
];

const MOCK_REVIEWS = [
  {
    id: "r1",
    title: "Yeezus",
    imageUrl: "https://picsum.photos/seed/myyeezus/400/400",
    type: "music" as const,
    rating: 4,
  },
  {
    id: "r2",
    title: "Dune",
    imageUrl: "https://picsum.photos/seed/mydune/400/400",
    type: "film" as const,
    rating: 5,
  },
];

const RATINGS_DISTRIBUTION = [
  { stars: 5, count: 12 },
  { stars: 4, count: 8 },
  { stars: 3, count: 3 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
];

const CATEGORY_STATS = [
  { label: "Filme", count: 12, icon: "film" },
  { label: "Série", count: 8, icon: "tv" },
  { label: "Música", count: 45, icon: "music" },
  { label: "Anime", count: 15, icon: "monitor" },
  { label: "Livro", count: 3, icon: "book" },
];

const FAVORITES = [
  { label: "Filme", title: "Interstellar", icon: "film" },
  { label: "Série", title: "Breaking Bad", icon: "tv" },
  { label: "Música", title: "Blonde", icon: "music" },
  { label: "Anime", title: "Attack on Titan", icon: "monitor" },
  { label: "Livro", title: "1984", icon: "book" },
];

const MOCK_LISTS = [
  {
    id: "l1",
    name: "Favorite Albums",
    itemCount: 12,
    thumbnail: "https://picsum.photos/seed/list1/400/400",
  },
  {
    id: "l2",
    name: "Watch Later",
    itemCount: 8,
    thumbnail: "https://picsum.photos/seed/list2/400/400",
  },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");

  const name = user?.name || "User";
  const bio = user?.bio || "No bio yet";
  const avatarUrl = user?.avatarUrl;

  const renderStatsSection = () => {
    const totalReviews = CATEGORY_STATS.reduce((sum, item) => sum + item.count, 0);

    return (
      <View style={styles.statsSection}>
        <GlassCard style={styles.statsCard}>
          <ThemedText type="body" style={styles.statsTitle}>Bio</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {bio}
          </ThemedText>
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <ThemedText type="body" style={styles.statsTitle}>Meus Favoritos</ThemedText>
          {FAVORITES.map((item) => (
            <View key={item.label} style={styles.favoriteRow}>
              <View style={styles.favoriteLabel}>
                <Feather name={item.icon as any} size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ marginLeft: 8, color: theme.textSecondary }}>{item.label}</ThemedText>
              </View>
              <ThemedText type="body" style={styles.favoriteTitle}>{item.title}</ThemedText>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <ThemedText type="body" style={styles.statsTitle}>Avaliações</ThemedText>
          {RATINGS_DISTRIBUTION.map((item) => (
            <View key={item.stars} style={styles.ratingRow}>
              <View style={styles.starsLabel}>
                <ThemedText type="small">{item.stars}</ThemedText>
                <Feather name="star" size={12} color={theme.star} style={{ marginLeft: 4 }} />
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: theme.accent, 
                      width: `${(item.count / 24) * 100}%` 
                    }
                  ]} 
                />
              </View>
              <ThemedText type="small" style={styles.ratingCount}>{item.count}</ThemedText>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md }}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>Quantidade por Categoria</ThemedText>
            <View style={{ backgroundColor: theme.backgroundSecondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
              <ThemedText type="small" style={{ fontWeight: "700", color: theme.accent }}>Total: {totalReviews}</ThemedText>
            </View>
          </View>
          <View style={styles.hoursGrid}>
            {CATEGORY_STATS.map((item) => (
              <View key={item.label} style={styles.hourItem}>
                <Feather name={item.icon as any} size={20} color={theme.accent} />
                <ThemedText type="h3" style={styles.hourValue}>{item.count}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.label}</ThemedText>
              </View>
            ))}
          </View>
        </GlassCard>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return MOCK_POSTS.length > 0 ? (
          <View style={styles.tabContent}>
            {MOCK_POSTS.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                user={{ name: name, avatarUrl: avatarUrl }}
                media={post.media}
                rating={post.rating}
                comment={post.comment}
                timestamp={post.timestamp}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            type="posts"
            title="No posts yet"
            message="Share your thoughts on what you've been consuming."
          />
        );

      case "reviews":
        return (
          <View style={styles.reviewsContainer}>
            {renderStatsSection()}
            {MOCK_REVIEWS.length > 0 ? (
              <View style={styles.reviewsGrid}>
                {MOCK_REVIEWS.map((item) => (
                  <MediaCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    imageUrl={item.imageUrl}
                    type={item.type}
                    rating={item.rating}
                    variant="compact"
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                type="reviews"
                title="No reviews yet"
                message="Rate and review media to build your collection."
              />
            )}
          </View>
        );

      case "lists":
        return MOCK_LISTS.length > 0 ? (
          <View style={styles.tabContent}>
            <Pressable style={styles.createListButton}>
              <View
                style={[
                  styles.createListIcon,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="plus" size={24} color={theme.accent} />
              </View>
              <View style={styles.createListText}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Create New List
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Organize your favorite media
                </ThemedText>
              </View>
            </Pressable>
            {MOCK_LISTS.map((list) => (
              <GlassCard key={list.id} style={styles.listCard}>
                <View style={styles.listContent}>
                  <View
                    style={[
                      styles.listThumbnail,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name="list" size={24} color={theme.accent} />
                  </View>
                  <View style={styles.listInfo}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {list.name}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {list.itemCount} items
                    </ThemedText>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
              </GlassCard>
            ))}
          </View>
        ) : (
          <EmptyState
            type="lists"
            title="No lists yet"
            message="Create custom lists to organize your media."
          />
        );

      case "republicados":
        return (
          <EmptyState
            type="status"
            title="No status updates"
            message="Mark media as 'Want', 'Consuming', or 'Completed' to track here."
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerContainer}>
          <Image
            source={require("../../assets/images/profile-banner.jpg")}
            style={styles.banner}
            contentFit="cover"
          />
        </View>

        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Avatar size={80} uri={avatarUrl} />
          </View>
          <ThemedText type="h3" style={styles.name}>
            {name}
          </ThemedText>

          <View style={styles.stats}>
            <StatCard value={0} label="Reviews" />
            <StatCard value={0} label="Ratings" />
            <StatCard value={0} label="Followers" />
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                activeTab === tab.key && {
                  borderBottomColor: theme.accent,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Feather
                name={tab.icon as any}
                size={22}
                color={activeTab === tab.key ? theme.accent : theme.textSecondary}
              />
            </Pressable>
          ))}
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    height: 160,
    width: "100%",
  },
  banner: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    // No paddingHorizontal here as banner is full width
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginTop: -40, // Pull up to overlap banner
    marginBottom: Spacing["2xl"],
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: "#0D0D0D",
    borderRadius: 50,
  },
  name: {
    marginTop: Spacing.sm,
  },
  bio: {
    marginTop: Spacing.xs,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  reviewsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  reviewsContainer: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    padding: Spacing.md,
  },
  statsTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  starsLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 35,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 4,
    marginHorizontal: Spacing.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  ratingCount: {
    width: 20,
    textAlign: "right",
  },
  hoursGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    justifyContent: "space-between",
  },
  hourItem: {
    alignItems: "center",
    minWidth: "30%",
  },
  hourValue: {
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  favoriteLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteTitle: {
    fontWeight: "500",
  },
  createListButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  createListIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  createListText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  listCard: {
    marginBottom: Spacing.md,
  },
  listContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  listThumbnail: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  listInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
});
