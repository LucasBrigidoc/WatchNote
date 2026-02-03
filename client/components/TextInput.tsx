import React, { useState, forwardRef } from "react";
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  TextInputProps,
  Animated,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface CustomTextInputProps extends TextInputProps {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: any;
}

export const TextInput = forwardRef<RNTextInput, CustomTextInputProps>(
  ({ icon, rightElement, style, onFocus, onBlur, containerStyle, ...props }, ref) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [focusAnim] = useState(new Animated.Value(0));

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      onBlur?.(e);
    };

    const underlineWidth = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.inputWrapper}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              { color: theme.text },
              style,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={theme.textSecondary}
            {...props}
          />
          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </View>
        <View style={[styles.underlineBase, { backgroundColor: theme.border }]} />
        <Animated.View
          style={[
            styles.underlineActive,
            {
              backgroundColor: theme.accent,
              width: underlineWidth,
            },
          ]}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: "relative",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
    fontFamily: "Poppins_400Regular",
    // @ts-ignore - web only property to remove focus outline
    outlineStyle: "none",
  },
  rightElement: {
    marginLeft: Spacing.sm,
  },
  underlineBase: {
    height: 1,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  underlineActive: {
    height: 2,
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
});
