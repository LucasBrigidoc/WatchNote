import React from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  showHalf?: boolean;
  showStars?: boolean;
  inlineStars?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  editable = false,
  onRatingChange,
  showHalf = true,
  showStars = true,
  inlineStars = false,
}: StarRatingProps) {
  const { theme } = useTheme();

  const handlePanResponder = (event: any) => {
    if (editable && onRatingChange) {
      const { locationX } = event.nativeEvent;
      const starIndex = Math.floor(locationX / (size + Spacing.xs));
      const starPosition = locationX % (size + Spacing.xs);
      const isHalf = showHalf && starPosition < size / 2;
      
      let newRating = starIndex + (isHalf ? 0.5 : 1);
      newRating = Math.max(0, Math.min(maxRating, newRating));
      
      if (newRating !== rating) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onRatingChange(newRating);
      }
    }
  };

  const isMaxRating = rating === maxRating;
  const GOLD_COLOR = "#FFD700";

  const renderStar = (index: number) => {
    const filled = index + 1 <= Math.floor(rating);
    const halfFilled = showHalf && !filled && index < rating;

    let iconName: "star" | "star-half-full" | "star-o" = "star-o";
    if (filled) {
      iconName = "star";
    } else if (halfFilled) {
      iconName = "star-half-full";
    }

    const starColor = isMaxRating 
      ? GOLD_COLOR 
      : (filled || halfFilled ? theme.star : theme.textSecondary);

    return (
      <View key={index} style={styles.starWrapper}>
        <FontAwesome
          name={iconName}
          size={size}
          color={starColor}
          style={[
            styles.star,
            { opacity: filled || halfFilled ? 1 : 0.3 },
          ]}
        />
      </View>
    );
  };

  const formattedRating = (Math.round(rating * 2) / 2).toString();

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, inlineStars && styles.inlineContainer]}>
        <View style={[styles.topLabelContainer, inlineStars && styles.inlineLabelContainer]}>
          <FontAwesome 
            name="star" 
            size={size * 0.7} 
            color={isMaxRating ? GOLD_COLOR : theme.textSecondary} 
          />
          <Text style={[
            styles.ratingText, 
            { 
              color: isMaxRating ? GOLD_COLOR : theme.textSecondary, 
              fontSize: size * 0.8,
              marginLeft: 4
            }
          ]}>
            {formattedRating}/{maxRating}
          </Text>
        </View>
        {showStars && (
          <View 
            style={[styles.starsContainer, inlineStars && styles.inlineStarsContainer]}
            onStartShouldSetResponder={() => editable}
            onMoveShouldSetResponder={() => editable}
            onResponderGrant={handlePanResponder}
            onResponderMove={handlePanResponder}
          >
            {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: "flex-start",
  },
  container: {
    alignItems: "center",
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inlineStarsContainer: {
    marginLeft: Spacing.sm,
  },
  topLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  inlineLabelContainer: {
    marginBottom: 0,
  },
  ratingText: {
    ...Typography.body,
    fontWeight: "800",
  },
  starWrapper: {
    paddingHorizontal: 1,
  },
  star: {
  },
});
