import React, { useState } from "react";
import {
  StyleSheet,
  View,
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
import { TextInput } from "@/components/TextInput";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { theme } = useTheme();
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSignUp =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSignUp = async () => {
    if (!canSignUp) return;

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signUp(name, email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    }
  };

  const handleLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h2" style={[styles.title, { color: theme.accent }]}>
          Join WatchFile
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Crie seu perfil cultural
        </ThemedText>
      </View>

      <GlassCard style={styles.formCard}>
        <ThemedText type="h3" style={styles.formTitle}>
          Create Account
        </ThemedText>

        <View style={styles.inputContainer}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            icon={<Feather name="user" size={20} color={theme.textSecondary} />}
            autoCapitalize="words"
            testID="input-name"
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            icon={<Feather name="mail" size={20} color={theme.textSecondary} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="input-email"
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6 characters)"
            icon={<Feather name="lock" size={20} color={theme.textSecondary} />}
            secureTextEntry={!showPassword}
            testID="input-password"
            rightElement={
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
            }
          />

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            icon={<Feather name="check-circle" size={20} color={theme.textSecondary} />}
            secureTextEntry={!showPassword}
            testID="input-confirm-password"
          />
        </View>

        <View style={styles.termsContainer}>
          <ThemedText
            type="small"
            style={[styles.termsText, { color: theme.textSecondary }]}
          >
            By signing up, you agree to our{" "}
            <ThemedText type="small" style={{ color: theme.accent }}>
              Terms of Service
            </ThemedText>{" "}
            and{" "}
            <ThemedText type="small" style={{ color: theme.accent }}>
              Privacy Policy
            </ThemedText>
          </ThemedText>
        </View>

        <Button
          onPress={handleSignUp}
          disabled={!canSignUp || isLoading}
          style={styles.signUpButton}
          textStyle={{ color: "#FFFFFF" }}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </GlassCard>

      <View style={styles.footer}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Already have an account?{" "}
        </ThemedText>
        <Pressable onPress={handleLogin}>
          <ThemedText type="body" style={{ color: theme.accent, fontWeight: "600" }}>
            Sign In
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
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.md,
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
  termsContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  termsText: {
    textAlign: "center",
    lineHeight: 20,
  },
  signUpButton: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
