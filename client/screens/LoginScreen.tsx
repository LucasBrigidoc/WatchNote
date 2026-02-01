import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canLogin = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async () => {
    if (!canLogin) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to sign in. Please try again.");
    }
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h2" style={[styles.title, { color: theme.accent }]}>
          CultureHub
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Your cultural identity, unified
        </ThemedText>
      </View>

      <GlassCard style={styles.formCard}>
        <ThemedText type="h3" style={styles.formTitle}>
          Welcome Back
        </ThemedText>

        <View style={styles.inputContainer}>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather name="mail" size={20} color={theme.textSecondary} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="input-email"
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather name="lock" size={20} color={theme.textSecondary} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              secureTextEntry={!showPassword}
              testID="input-password"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.forgotPassword}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            Forgot password?
          </ThemedText>
        </Pressable>

        <Button
          onPress={handleLogin}
          disabled={!canLogin || isLoading}
          style={styles.loginButton}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </GlassCard>

      <View style={styles.footer}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Don't have an account?{" "}
        </ThemedText>
        <Pressable onPress={handleSignUp}>
          <ThemedText type="body" style={{ color: theme.accent, fontWeight: "600" }}>
            Sign Up
          </ThemedText>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  formCard: {
    marginBottom: Spacing["2xl"],
  },
  formTitle: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
