import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/api";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useLanguage } from "@/i18n";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t.editProfile.permissionRequired, t.editProfile.galleryPermission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        const mimeType = asset.mimeType || "image/jpeg";
        const dataUri = `data:${mimeType};base64,${asset.base64}`;
        setAvatarUrl(dataUri);
      } else if (asset.uri) {
        setAvatarUrl(asset.uri);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t.common.error, t.editProfile.nameRequired);
      return;
    }
    if (!email.trim()) {
      Alert.alert(t.common.error, t.editProfile.emailRequired);
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch("/api/profile/update", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(t.common.error, data.message || t.editProfile.saveError);
        return;
      }

      updateUser(data.user);
      Alert.alert(t.common.success, t.editProfile.profileUpdated, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t.common.error, t.editProfile.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">{t.editProfile.title}</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.avatarSection}>
        <Pressable onPress={pickImage}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Avatar size={100} />
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.accent }]}>
            <Feather name="camera" size={16} color="#FFF" />
          </View>
        </Pressable>
        <Pressable onPress={pickImage}>
          <ThemedText type="small" style={{ color: theme.accent, marginTop: Spacing.sm }}>
            {t.editProfile.changePhoto}
          </ThemedText>
        </Pressable>
      </View>

      <GlassCard style={styles.formCard}>
        <View style={styles.field}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            {t.editProfile.name}
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={name}
            onChangeText={setName}
            placeholder={t.editProfile.name}
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            {t.editProfile.emailLabel}
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            {t.editProfile.bioLabel}
          </ThemedText>
          <TextInput
            style={[styles.input, styles.bioInput, { color: theme.text, borderColor: theme.border }]}
            value={bio}
            onChangeText={setBio}
            placeholder={t.editProfile.bioPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </GlassCard>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[styles.saveButton, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
            {t.editProfile.saveChanges}
          </ThemedText>
        )}
      </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: 4,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    paddingTop: Spacing.sm,
  },
  saveButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
