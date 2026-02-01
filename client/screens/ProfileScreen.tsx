import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from "react-native";
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

type ProfileTab = "posts" | "reviews" | "lists" | "status";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "posts", label: "Posts" },
  { key: "reviews", label: "Reviews" },
  { key: "lists", label: "Lists" },
  { key: "status", label: "Status" },
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
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const name = user?.name || "User";
  const bio = user?.bio || "No bio yet";
  const avatarUrl = user?.avatarUrl;

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return MOCK_POSTS.length > 0 ? (
          <View style={styles.tabContent}>
            {MOCK_POSTS.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                user={{ ...post.user, name: "You" }}
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
        return MOCK_REVIEWS.length > 0 ? (
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

      case "status":
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
      <View style={[styles.settingsButtonWrapper, { top: insets.top + Spacing.md }]}>
        <Pressable
          style={[
            styles.iconButton,
            { backgroundColor: "rgba(255,255,255,0.05)" },
          ]}
        >
          <Feather name="settings" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Avatar size={80} src={avatarUrl} />
          <ThemedText type="h3" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.bio, { color: theme.textSecondary }]}
          >
            {bio}
          </ThemedText>

          <View style={styles.stats}>
            <StatCard value={0} label="Reviews" />
            <StatCard value={0} label="Ratings" />
            <StatCard value={0} label="Followers" />
          </View>

          <Pressable
            style={[
              styles.editButton,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Edit Profile
            </ThemedText>
          </Pressable>
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
              <ThemedText
                type="body"
                style={{
                  color:
                    activeTab === tab.key ? theme.text : theme.textSecondary,
                  fontWeight: activeTab === tab.key ? "600" : "400",
                }}
              >
                {tab.label}
              </ThemedText>
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
  settingsButtonWrapper: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  name: {
    marginTop: Spacing.md,
  },
  bio: {
    marginTop: Spacing.xs,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  editButton: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  tabs: {
    flexDirection: "row",
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
  },
  reviewsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
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
