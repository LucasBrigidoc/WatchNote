import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  showArrow?: boolean;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({
  icon,
  label,
  value,
  showArrow = true,
  onPress,
  danger = false,
}: SettingRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: danger
              ? "rgba(239,68,68,0.2)"
              : theme.backgroundSecondary,
          },
        ]}
      >
        <Feather
          name={icon as any}
          size={18}
          color={danger ? theme.error : theme.accent}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          type="body"
          style={{ color: danger ? theme.error : theme.text }}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {value}
          </ThemedText>
        ) : null}
      </View>
      {showArrow ? (
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
        />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              'Type "DELETE" to confirm account deletion.',
              [
                { text: "Cancel", style: "cancel" },
                { text: "I understand", style: "destructive", onPress: logout },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <GlassCard style={styles.profileCard}>
        <Avatar size={64} />
        <View style={styles.profileInfo}>
          <ThemedText type="h4">{user?.name || "User"}</ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary }}
          >
            {user?.email || "user@example.com"}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        ACCOUNT
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <SettingRow icon="user" label="Edit Profile" />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="lock" label="Change Password" />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="link" label="Connected Accounts" value="None" />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        PREFERENCES
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <View style={styles.settingRow}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="bell" size={18} color={theme.accent} />
          </View>
          <View style={styles.settingContent}>
            <ThemedText type="body">Notifications</ThemedText>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: theme.backgroundSecondary,
              true: theme.accent,
            }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="globe" label="Language" value="English" />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        ABOUT
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <SettingRow icon="info" label="About CultureHub" />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="file-text" label="Terms of Service" />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="shield" label="Privacy Policy" />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        DANGER ZONE
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <SettingRow
          icon="log-out"
          label="Log Out"
          showArrow={false}
          onPress={handleLogout}
          danger
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow
          icon="trash-2"
          label="Delete Account"
          showArrow={false}
          onPress={handleDeleteAccount}
          danger
        />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.version, { color: theme.textSecondary }]}
      >
        Version 1.0.0
      </ThemedText>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
    letterSpacing: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
