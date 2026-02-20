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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { MediaCard } from "@/components/MediaCard";
import { MediaCardFull } from "@/components/MediaCardFull";
import { SectionHeader } from "@/components/SectionHeader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";
import { MediaType } from "@/components/MediaTypeBadge";
import { useLanguage } from "@/i18n";

type CategoryFilter = "all" | "film" | "series" | "music" | "anime" | "manga" | "book";

const MOCK_TRENDING = [
  {
    id: "t1",
    title: "Lançamentos Quentes",
    imageUrl: "https://picsum.photos/seed/hot1/400/400",
    type: "film" as const,
    icon: "flame" as const,
    color: "#007AFF",
  },
  {
    id: "t2",
    title: "Popular Esta Semana",
    imageUrl: "https://picsum.photos/seed/pop1/400/400",
    type: "music" as const,
    icon: "trending-up" as const,
    color: "#007AFF",
  },
  {
    id: "t3",
    title: "Em Alta",
    imageUrl: "https://picsum.photos/seed/rise1/400/400",
    type: "anime" as const,
    icon: "star" as const,
    color: "#007AFF",
  },
];

const MOCK_MEDIA_LIST: {
  id: string;
  title: string;
  imageUrl: string;
  type: MediaType;
  year: string;
  rating: number;
  genre: string;
  overview: string;
  voteCount: number;
}[] = [
  {
    id: "m1",
    title: "Harry Potter e a Pedra Filosofal",
    imageUrl: "https://picsum.photos/seed/hp1/300/450",
    type: "film",
    year: "2001",
    rating: 7.6,
    genre: "Aventura, Fantasia",
    overview: "Harry Potter, um garoto órfão, descobre que é um bruxo ao ser aceito na Escola de Magia e Bruxaria de Hogwarts.",
    voteCount: 24500,
  },
  {
    id: "m2",
    title: "Attack on Titan",
    imageUrl: "https://picsum.photos/seed/aot2/300/450",
    type: "anime",
    year: "2013",
    rating: 8.5,
    genre: "Ação, Drama, Fantasia",
    overview: "Em um mundo dominado por Titãs gigantes que devoram humanos, Eren Yeager jura eliminá-los após perder sua mãe.",
    voteCount: 18200,
  },
  {
    id: "m3",
    title: "Blonde",
    imageUrl: "https://picsum.photos/seed/blonde3/300/450",
    type: "music",
    year: "2016",
    rating: 9.0,
    genre: "R&B, Art Pop",
    overview: "Segundo álbum de estúdio de Frank Ocean, aclamado pela crítica como uma obra-prima do R&B contemporâneo.",
    voteCount: 12800,
  },
  {
    id: "m4",
    title: "Breaking Bad",
    imageUrl: "https://picsum.photos/seed/bb1/300/450",
    type: "series",
    year: "2008",
    rating: 9.5,
    genre: "Crime, Drama, Thriller",
    overview: "Um professor de química do ensino médio diagnosticado com câncer se volta para a fabricação de metanfetamina.",
    voteCount: 32100,
  },
  {
    id: "m5",
    title: "One Piece",
    imageUrl: "https://picsum.photos/seed/op1/300/450",
    type: "manga",
    year: "1997",
    rating: 9.2,
    genre: "Aventura, Ação, Comédia",
    overview: "Monkey D. Luffy e sua tripulação buscam o tesouro One Piece para se tornarem o Rei dos Piratas.",
    voteCount: 28500,
  },
  {
    id: "m6",
    title: "Duna",
    imageUrl: "https://picsum.photos/seed/dune2/300/450",
    type: "book",
    year: "1965",
    rating: 8.8,
    genre: "Ficção Científica",
    overview: "No planeta desértico Arrakis, Paul Atreides enfrenta intrigas políticas e descobre seu destino épico.",
    voteCount: 15600,
  },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<DiscoverStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const CATEGORIES_TRANSLATED: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: t.common.all },
    { key: "film", label: t.categories.film },
    { key: "series", label: t.categories.series },
    { key: "music", label: t.categories.music },
    { key: "anime", label: t.categories.anime },
    { key: "manga", label: t.categories.manga },
    { key: "book", label: t.categories.book },
  ];

  const handleSearch = () => {
    navigation.navigate("Search");
  };

  const handleMediaPress = (item: typeof MOCK_MEDIA_LIST[0]) => {
    navigation.navigate("MediaDetail", {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      type: item.type,
      year: item.year,
      rating: item.rating,
      genre: item.genre,
      overview: item.overview,
      voteCount: item.voteCount,
    });
  };

  const filteredMedia = selectedCategory === "all"
    ? MOCK_MEDIA_LIST
    : MOCK_MEDIA_LIST.filter((item) => item.type === selectedCategory);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={handleSearch}
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
          },
        ]}
      >
        <Feather name="search" size={20} color={theme.textSecondary} />
        <ThemedText
          type="body"
          style={[styles.searchPlaceholder, { color: theme.textSecondary }]}
        >
          {t.search.placeholder}
        </ThemedText>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES_TRANSLATED.map((cat) => (
          <Pressable
            key={cat.key}
            onPress={() => setSelectedCategory(cat.key)}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === cat.key
                    ? theme.accent
                    : theme.backgroundDefault,
                borderColor:
                  selectedCategory === cat.key ? theme.accent : theme.border,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color:
                  selectedCategory === cat.key ? "#0D0D0D" : theme.textSecondary,
                fontWeight: selectedCategory === cat.key ? "600" : "400",
              }}
            >
              {cat.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title={t.discover.trending} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {MOCK_TRENDING.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            type={item.type}
            variant="minimal"
            icon={item.icon}
            accentColor={item.color}
          />
        ))}
      </ScrollView>

      <SectionHeader title={t.discover.exploreMedia} />
      {filteredMedia.map((item) => (
        <MediaCardFull
          key={item.id}
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
          type={item.type}
          year={item.year}
          rating={item.rating}
          genre={item.genre}
          overview={item.overview}
          voteCount={item.voteCount}
          onPress={() => handleMediaPress(item)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  searchPlaceholder: {
    marginLeft: Spacing.md,
  },
  categories: {
    paddingBottom: Spacing["2xl"],
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  horizontalList: {
    paddingBottom: Spacing["2xl"],
  },
});
