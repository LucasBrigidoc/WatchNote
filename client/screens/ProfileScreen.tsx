import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import { PostCard } from "@/components/PostCard";
import { MediaCard } from "@/components/MediaCard";
import { GlassCard } from "@/components/GlassCard";
import { EmptyState } from "@/components/EmptyState";
import { CreateListModal } from "@/components/CreateListModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/api";
import { useLanguage } from "@/i18n";

type ProfileTab = "posts" | "reviews" | "lists" | "republicados";

const TABS: { key: ProfileTab; icon: string }[] = [
  { key: "reviews", icon: "user" },
  { key: "posts", icon: "grid" },
  { key: "lists", icon: "list" },
  { key: "republicados", icon: "repeat" },
];

const CATEGORY_ICONS: Record<string, string> = {
  film: "film",
  series: "tv",
  music: "music",
  anime: "monitor",
  manga: "book-open",
  book: "book",
};

interface Favorite {
  id: string;
  category: string;
  title: string;
}

interface RatingStats {
  distribution: { stars: number; count: number }[];
  categoryStats: { category: string; count: number }[];
}

interface UserList {
  id: string;
  name: string;
  itemCount: number;
}

interface UserRating {
  id: string;
  mediaId: string;
  mediaType: string;
  mediaTitle: string;
  mediaImage: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    distribution: [5, 4, 3, 2, 1].map(s => ({ stars: s, count: 0 })),
    categoryStats: [],
  });
  const [lists, setLists] = useState<UserList[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateList, setShowCreateList] = useState(false);

  const name = user?.name || "User";
  const bio = user?.bio || t.profile.noBioYet;
  const avatarUrl = user?.avatarUrl;

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const [favRes, statsRes, listsRes, ratingsRes, postsRes, followRes] = await Promise.all([
        authFetch("/api/profile/favorites"),
        authFetch("/api/profile/stats"),
        authFetch("/api/profile/lists"),
        authFetch("/api/profile/ratings"),
        authFetch("/api/posts/user"),
        authFetch("/api/profile/follow-counts"),
      ]);

      if (favRes.ok) {
        const data = await favRes.json();
        setFavorites(data.favorites || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (listsRes.ok) {
        const data = await listsRes.json();
        setLists(data.lists || []);
      }
      if (ratingsRes.ok) {
        const data = await ratingsRes.json();
        setRatings(data.ratings || []);
      }
      if (postsRes.ok) {
        const data = await postsRes.json();
        setUserPosts(data.posts || []);
      }
      if (followRes.ok) {
        const data = await followRes.json();
        setFollowerCount(data.followerCount || 0);
        setFollowingCount(data.followingCount || 0);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  const totalRatings = stats.distribution.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...stats.distribution.map(d => d.count), 1);

  const allCategories = [
    { key: "film", label: t.categories.film, icon: "film" },
    { key: "series", label: t.categories.series, icon: "tv" },
    { key: "music", label: t.categories.music, icon: "music" },
    { key: "anime", label: t.categories.anime, icon: "monitor" },
    { key: "book", label: t.categories.book, icon: "book" },
  ];

  const favCategories = allCategories.map(cat => {
    const fav = favorites.find(f => f.category === cat.key);
    return { ...cat, title: fav?.title || "—" };
  });

  const categoryStatsDisplay = allCategories.map(cat => {
    const stat = stats.categoryStats.find(s => s.category === cat.key);
    return { ...cat, count: stat?.count || 0 };
  });

  const totalCategoryCount = categoryStatsDisplay.reduce((sum, c) => sum + c.count, 0);

  const renderStatsSection = () => {
    return (
      <View style={styles.statsSection}>
        <GlassCard style={styles.statsCard}>
          <ThemedText type="body" style={styles.statsTitle}>{t.profile.bio}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {bio}
          </ThemedText>
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <ThemedText type="body" style={styles.statsTitle}>{t.profile.myFavorites}</ThemedText>
          {favCategories.map((item) => (
            <View key={item.key} style={styles.favoriteRow}>
              <View style={styles.favoriteLabel}>
                <Feather name={item.icon as any} size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ marginLeft: 8, color: theme.textSecondary }}>{item.label}</ThemedText>
              </View>
              <ThemedText type="body" style={[styles.favoriteTitle, item.title === "—" && { color: theme.textSecondary }]}>{item.title}</ThemedText>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <ThemedText type="body" style={styles.statsTitle}>{t.profile.ratings}</ThemedText>
          {stats.distribution.map((item) => (
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
                      width: `${totalRatings > 0 ? (item.count / maxCount) * 100 : 0}%`
                    }
                  ]}
                />
              </View>
              <ThemedText type="small" style={styles.ratingCount}>{item.count}</ThemedText>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <View style={{ marginBottom: Spacing.md }}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>{t.profile.categoryCount}</ThemedText>
          </View>
          <View style={styles.statsGrid}>
            {categoryStatsDisplay.map((item) => (
              <View key={item.key} style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name={item.icon as any} size={16} color={theme.accent} />
                </View>
                <View style={styles.statInfo}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.label}</ThemedText>
                  <ThemedText type="body" style={styles.statCount}>{item.count}</ThemedText>
                </View>
              </View>
            ))}
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="bar-chart-2" size={16} color={theme.accent} />
              </View>
              <View style={styles.statInfo}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{t.common.total}</ThemedText>
                <ThemedText type="body" style={styles.statCount}>{totalCategoryCount}</ThemedText>
              </View>
            </View>
          </View>
        </GlassCard>
      </View>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={{ padding: Spacing["2xl"], alignItems: "center" }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      );
    }

    switch (activeTab) {
      case "posts":
        if (userPosts.length === 0) {
          return (
            <EmptyState
              type="posts"
              title={t.profile.noPostsYet}
              message={t.profile.shareOpinions}
            />
          );
        }
        return (
          <View style={styles.tabContent}>
            {userPosts.map((post: any) => (
              <PostCard
                key={post.id}
                id={post.id}
                user={{ name: post.userName, avatarUrl: post.userAvatar || undefined }}
                media={{
                  title: post.mediaTitle,
                  imageUrl: post.mediaImage || "https://via.placeholder.com/150x220?text=No+Image",
                  type: post.mediaType as any,
                }}
                rating={post.rating}
                comment={post.comment}
                timestamp={formatTimeAgo(post.createdAt)}
                likeCount={post.likeCount || 0}
                commentCount={post.commentCount || 0}
                onMediaPress={() => navigation.navigate("MediaDetail", {
                  id: post.mediaId,
                  title: post.mediaTitle,
                  imageUrl: post.mediaImage || "",
                  type: post.mediaType,
                })}
                onUserPress={() => {
                  if (post.userId !== user?.id) {
                    navigation.navigate("UserProfile", { userId: post.userId });
                  }
                }}
              />
            ))}
          </View>
        );

      case "reviews":
        return (
          <View style={styles.reviewsContainer}>
            {renderStatsSection()}
            {ratings.length > 0 && (
              <View style={styles.reviewsGrid}>
                {ratings.map((item) => (
                  <MediaCard
                    key={item.id}
                    id={item.mediaId}
                    title={item.mediaTitle}
                    imageUrl={item.mediaImage || "https://via.placeholder.com/150x220?text=No+Image"}
                    type={item.mediaType as any}
                    rating={item.rating}
                    variant="compact"
                  />
                ))}
              </View>
            )}
          </View>
        );

      case "lists":
        return (
          <View style={styles.tabContent}>
            <Pressable style={styles.createListButton} onPress={() => setShowCreateList(true)}>
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
                  {t.profile.createNewList}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {t.profile.organizeFavorites}
                </ThemedText>
              </View>
            </Pressable>
            {lists.length > 0 ? (
              lists.map((list: any) => (
                <Pressable key={list.id} onPress={() => navigation.navigate("ListDetail", { listId: list.id })}>
                  <GlassCard style={styles.listCard}>
                    <View style={styles.listContent}>
                      {list.coverImage ? (
                        <Image
                          source={{ uri: list.coverImage }}
                          style={styles.listThumbnail}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.listThumbnail,
                            { backgroundColor: theme.backgroundSecondary, alignItems: "center", justifyContent: "center" },
                          ]}
                        >
                          <Feather name="list" size={24} color={theme.accent} />
                        </View>
                      )}
                      <View style={styles.listInfo}>
                        <ThemedText type="body" style={{ fontWeight: "600" }}>
                          {list.name}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={{ color: theme.textSecondary }}
                        >
                          {list.itemCount} {t.common.items}
                        </ThemedText>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={20}
                        color={theme.textSecondary}
                      />
                    </View>
                  </GlassCard>
                </Pressable>
              ))
            ) : (
              <EmptyState
                type="lists"
                title={t.profile.noListsYet}
                message={t.profile.createListsMessage}
              />
            )}
          </View>
        );

      case "republicados":
        return (
          <EmptyState
            type="status"
            title={t.profile.noUpdates}
            message={t.profile.trackStatus}
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

          <View style={styles.statsHeader}>
            <StatCard value={totalRatings} label={t.profile.reviews} />
            <StatCard value={followerCount} label={t.profile.followers} />
            <StatCard value={followingCount} label={t.profile.following} />
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

      <CreateListModal
        visible={showCreateList}
        onClose={() => setShowCreateList(false)}
        onCreated={fetchProfileData}
      />
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
  content: {},
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginTop: -40,
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
  statsHeader: {
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    flex: 1,
    minWidth: "45%",
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  statInfo: {
    flex: 1,
  },
  statCount: {
    fontWeight: "700",
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
