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
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import { PostCard } from "@/components/PostCard";
import { GlassCard } from "@/components/GlassCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export type UserProfileParams = {
  userId: string;
  userName?: string;
};

type ProfileTab = "posts" | "reviews";

const TABS: { key: ProfileTab; icon: string }[] = [
  { key: "reviews", icon: "user" },
  { key: "posts", icon: "grid" },
];

const ALL_CATEGORIES = [
  { key: "film", label: "Filme", icon: "film" },
  { key: "series", label: "Série", icon: "tv" },
  { key: "music", label: "Música", icon: "music" },
  { key: "anime", label: "Anime", icon: "monitor" },
  { key: "manga", label: "Manga", icon: "book-open" },
  { key: "book", label: "Livro", icon: "book" },
];

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

export default function UserProfileScreen() {
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<{ UserProfile: UserProfileParams }, "UserProfile">>();
  const { userId } = route.params;

  const [activeTab, setActiveTab] = useState<ProfileTab>("reviews");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/users/${userId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        setFollowingCount(data.followingCount);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await authFetch(`/api/users/${userId}/follow`, { method: "DELETE" });
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await authFetch(`/api/users/${userId}/follow`, { method: "POST" });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.backButton}>
          <Pressable onPress={() => navigation.goBack()} style={{ padding: Spacing.sm }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.backButton}>
          <Pressable onPress={() => navigation.goBack()} style={{ padding: Spacing.sm }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        </View>
        <EmptyState type="search" title="Usuário não encontrado" message="" />
      </View>
    );
  }

  const { user: profileUser, favorites, stats, posts, listCount } = profileData;
  const totalRatings = stats.distribution.reduce((sum: number, item: any) => sum + item.count, 0);
  const maxCount = Math.max(...stats.distribution.map((d: any) => d.count), 1);
  const isOwnProfile = currentUser?.id === userId;

  const favCategories = ALL_CATEGORIES.map((cat) => {
    const fav = favorites.find((f: any) => f.category === cat.key);
    return { ...cat, title: fav?.title || "—" };
  });

  const categoryStatsDisplay = ALL_CATEGORIES.map((cat) => {
    const stat = stats.categoryStats.find((s: any) => s.category === cat.key);
    return { ...cat, count: stat?.count || 0 };
  });

  const totalCategoryCount = categoryStatsDisplay.reduce((sum, c) => sum + c.count, 0);

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <GlassCard style={styles.statsCard}>
        <ThemedText type="body" style={styles.statsTitle}>Bio</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {profileUser.bio || "Nenhuma bio"}
        </ThemedText>
      </GlassCard>

      <GlassCard style={styles.statsCard}>
        <ThemedText type="body" style={styles.statsTitle}>Favoritos</ThemedText>
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
        <ThemedText type="body" style={styles.statsTitle}>Avaliações</ThemedText>
        {stats.distribution.map((item: any) => (
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
                    width: `${totalRatings > 0 ? (item.count / maxCount) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
            <ThemedText type="small" style={styles.ratingCount}>{item.count}</ThemedText>
          </View>
        ))}
      </GlassCard>

      <GlassCard style={styles.statsCard}>
        <View style={{ marginBottom: Spacing.md }}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>Quantidade por Categoria</ThemedText>
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
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Total</ThemedText>
              <ThemedText type="body" style={styles.statCount}>{totalCategoryCount}</ThemedText>
            </View>
          </View>
        </View>
      </GlassCard>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        if (posts.length === 0) {
          return (
            <EmptyState type="posts" title="Nenhum post ainda" message="" />
          );
        }
        return (
          <View style={styles.tabContent}>
            {posts.map((post: any) => (
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
              />
            ))}
          </View>
        );

      case "reviews":
        return (
          <View style={styles.reviewsContainer}>
            {renderStatsSection()}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.backButton, { top: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: Spacing.sm }}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerContainer}>
          <View style={[styles.banner, { backgroundColor: theme.backgroundSecondary }]} />
        </View>

        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Avatar size={80} uri={profileUser.avatarUrl} />
          </View>
          <ThemedText type="h3" style={styles.name}>
            {profileUser.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
            @{profileUser.username}
          </ThemedText>

          {!isOwnProfile && (
            <Pressable
              onPress={handleFollow}
              disabled={followLoading}
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowing ? "transparent" : theme.accent,
                  borderColor: isFollowing ? theme.border : theme.accent,
                  borderWidth: 1,
                },
              ]}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? theme.text : "#0D0D0D"} />
              ) : (
                <ThemedText
                  type="body"
                  style={{
                    color: isFollowing ? theme.text : "#0D0D0D",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </ThemedText>
              )}
            </Pressable>
          )}

          <View style={styles.statsHeader}>
            <StatCard value={totalRatings} label="Reviews" />
            <StatCard value={followerCount} label="Seguidores" />
            <StatCard value={followingCount} label="Seguindo" />
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
  backButton: {
    position: "absolute",
    left: Spacing.md,
    top: Spacing.xl,
    zIndex: 10,
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
  contentContainer: {
    paddingBottom: Spacing["3xl"],
  },
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
  followButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 120,
    alignItems: "center",
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
});
