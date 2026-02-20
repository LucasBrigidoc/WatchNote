import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { authFetch } from "@/lib/api";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    if (!currentPassword) {
      Alert.alert("Erro", "Digite sua senha atual.");
      return;
    }
    if (!newPassword) {
      Alert.alert("Erro", "Digite a nova senha.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Erro", data.message || "Erro ao alterar senha");
        return;
      }

      Alert.alert("Sucesso", "Senha alterada com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Erro ao alterar senha. Tente novamente.");
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
        <ThemedText type="h3">Alterar Senha</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <GlassCard style={styles.formCard}>
        <View style={styles.field}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Senha Atual
          </ThemedText>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: theme.text, borderColor: theme.border }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showCurrent}
            />
            <Pressable onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeButton}>
              <Feather name={showCurrent ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Nova Senha
          </ThemedText>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: theme.text, borderColor: theme.border }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showNew}
            />
            <Pressable onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
              <Feather name={showNew ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Confirmar Nova Senha
          </ThemedText>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: theme.text, borderColor: theme.border }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a nova senha"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showConfirm}
            />
            <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
              <Feather name={showConfirm ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
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
            Alterar Senha
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
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  saveButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
