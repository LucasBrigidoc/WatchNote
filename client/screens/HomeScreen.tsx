import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { PostCard } from "@/components/PostCard";
import { MediaCard } from "@/components/MediaCard";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

const MOCK_TRENDING = [
  {
    id: "1",
    title: "Hot New Releases",
    imageUrl: "https://picsum.photos/seed/release1/400/400",
    type: "music" as const,
  },
  {
    id: "2",
    title: "Popular This Week",
    imageUrl: "https://picsum.photos/seed/release2/400/400",
    type: "film" as const,
  },
  {
    id: "3",
    title: "Trending Anime",
    imageUrl: "https://picsum.photos/seed/release3/400/400",
    type: "anime" as const,
  },
];

const MOCK_POSTS = [
  {
    id: "1",
    user: { name: "Maria Santos", avatarUrl: undefined },
    media: {
      title: "Blonde",
      imageUrl: "https://picsum.photos/seed/blonde/400/400",
      type: "music" as const,
    },
    rating: 5,
    comment:
      "This album is a masterpiece. Frank Ocean really outdid himself with this one. The production is incredible and the lyrics hit different every time.",
    timestamp: "2h ago",
    likeCount: 42,
    commentCount: 8,
  },
  {
    id: "2",
    user: { name: "João Silva", avatarUrl: undefined },
    media: {
      title: "Dune: Part Two",
      imageUrl: "https://picsum.photos/seed/dune/400/400",
      type: "film" as const,
    },
    rating: 4.5,
    comment:
      "Visually stunning sequel that expands on the first film beautifully. Hans Zimmer's score is phenomenal.",
    timestamp: "5h ago",
    likeCount: 128,
    commentCount: 24,
  },
  {
    id: "3",
    user: { name: "Ana Costa", avatarUrl: undefined },
    media: {
      title: "Chainsaw Man",
      imageUrl: "https://picsum.photos/seed/chainsaw/400/400",
      type: "anime" as const,
    },
    rating: 4,
    comment:
      "Finally caught up with this series. The animation quality is insane and Denji is such a unique protagonist.",
    timestamp: "1d ago",
    likeCount: 87,
    commentCount: 15,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(MOCK_POSTS);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <SectionHeader title="Popular This Week" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingList}
      >
        {MOCK_TRENDING.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            type={item.type}
            variant="gradient"
          />
        ))}
      </ScrollView>

      <SectionHeader title="Timeline" rightLabel="Popular" />
    </View>
  );

  const renderPost = ({ item }: { item: (typeof MOCK_POSTS)[0] }) => (
    <PostCard
      id={item.id}
      user={item.user}
      media={item.media}
      rating={item.rating}
      comment={item.comment}
      timestamp={item.timestamp}
      likeCount={item.likeCount}
      commentCount={item.commentCount}
    />
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <EmptyState
          type="timeline"
          title="No posts yet"
          message="Start following users or create your first post to see content here."
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    marginBottom: Spacing.md,
  },
  postInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing["2xl"],
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 15,
  },
  trendingList: {
    paddingBottom: Spacing["2xl"],
  },
});
