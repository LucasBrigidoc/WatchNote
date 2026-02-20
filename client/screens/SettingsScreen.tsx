import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/api";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useLanguage } from "@/i18n";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

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
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert(t.settings.logOut, t.settings.logOutConfirm, [
      { text: t.common.cancel, style: "cancel" },
      { text: t.settings.logOut, style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.settings.deleteAccount,
      t.settings.deleteAccountWarning,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.continue,
          style: "destructive",
          onPress: () => {
            setDeletePassword("");
            setShowDeleteModal(true);
          },
        },
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(t.settings.selectLanguage, "", [
      { text: t.settings.portuguese, onPress: () => setLanguage("pt") },
      { text: t.settings.english, onPress: () => setLanguage("en") },
      { text: t.common.cancel, style: "cancel" },
    ]);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert(t.common.error, t.settings.enterPasswordToDelete);
      return;
    }

    setDeleting(true);
    try {
      const res = await authFetch("/api/profile/account", {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(t.common.error, data.message || t.settings.deleteAccount);
        return;
      }

      setShowDeleteModal(false);
      await logout();
    } catch (error) {
      Alert.alert(t.common.error, t.settings.deleteAccount);
    } finally {
      setDeleting(false);
    }
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
      <Pressable onPress={() => navigation.navigate("EditProfile")}>
        <GlassCard style={styles.profileCard}>
          <Avatar size={64} uri={user?.avatarUrl} />
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
      </Pressable>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        {t.settings.account}
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <SettingRow icon="user" label={t.settings.editProfile} onPress={() => navigation.navigate("EditProfile")} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="lock" label={t.settings.changePassword} onPress={() => navigation.navigate("ChangePassword")} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="link" label={t.settings.connectedAccounts} value={t.settings.none} />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        {t.settings.preferences}
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
            <ThemedText type="body">{t.settings.notifications}</ThemedText>
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
        <SettingRow icon="globe" label={t.settings.language} value={language === "pt" ? t.settings.portuguese : t.settings.english} onPress={handleLanguage} />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        {t.settings.about}
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <SettingRow icon="info" label={t.settings.aboutApp} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="file-text" label={t.settings.termsOfService} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow icon="shield" label={t.settings.privacyPolicy} />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        {t.settings.dangerZone}
      </ThemedText>
      <GlassCard noPadding style={styles.section}>
        <SettingRow
          icon="log-out"
          label={t.settings.logOut}
          showArrow={false}
          onPress={handleLogout}
          danger
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow
          icon="trash-2"
          label={t.settings.deleteAccount}
          showArrow={false}
          onPress={handleDeleteAccount}
          danger
        />
      </GlassCard>

      <ThemedText
        type="small"
        style={[styles.version, { color: theme.textSecondary }]}
      >
        {`${t.common.version} 1.0.0`}
      </ThemedText>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
              {t.settings.confirmDeletion}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              {t.settings.enterPasswordToDelete}
            </ThemedText>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder={t.settings.yourPassword}
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                style={[styles.modalButton, { borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText type="body">{t.common.cancel}</ThemedText>
              </Pressable>
              <Pressable
                onPress={confirmDeleteAccount}
                disabled={deleting}
                style={[styles.modalButton, { backgroundColor: theme.error, opacity: deleting ? 0.6 : 1 }]}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
                    {t.common.delete}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </GlassCard>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    width: "100%",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
