import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { TextInput } from "@/components/TextInput";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { authFetch } from "@/lib/api";

interface ListItem {
  id: string;
  listId: string;
  mediaId: string;
  mediaType: string;
  mediaTitle: string;
  mediaImage: string | null;
  addedAt: string;
}

interface ListData {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImage: string | null;
  createdAt: string;
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  film: "Filme",
  series: "Série",
  music: "Música",
  anime: "Anime",
  manga: "Mangá",
  book: "Livro",
};

export default function ListDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { listId } = route.params;

  const [list, setList] = useState<ListData | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchListDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/profile/lists/${listId}`);
      if (res.ok) {
        const data = await res.json();
        setList(data.list);
        setItems(data.items || []);
        setNoteText(data.list.description || "");
      }
    } catch (error) {
      console.error("Error loading list:", error);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchListDetail();
  }, [fetchListDetail]);

  const handleSaveNote = async () => {
    if (!list) return;
    setSavingNote(true);
    try {
      const res = await authFetch(`/api/profile/lists/${listId}`, {
        method: "PATCH",
        body: JSON.stringify({ description: noteText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setList(data.list);
        setEditingNote(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      Alert.alert("Erro", "Não foi possível salvar a nota.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleRemoveItem = (item: ListItem) => {
    Alert.alert(
      "Remover mídia",
      `Deseja remover "${item.mediaTitle}" desta lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setRemovingId(item.id);
            try {
              const res = await authFetch(`/api/profile/lists/${listId}/items/${item.id}`, {
                method: "DELETE",
              });
              if (res.ok) {
                setItems((prev) => prev.filter((i) => i.id !== item.id));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Erro", "Não foi possível remover o item.");
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteList = () => {
    Alert.alert(
      "Excluir lista",
      `Tem certeza que deseja excluir "${list?.name}"? Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await authFetch(`/api/profile/lists/${listId}`, {
                method: "DELETE",
              });
              if (res.ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                navigation.goBack();
              }
            } catch (error) {
              console.error("Error deleting list:", error);
              Alert.alert("Erro", "Não foi possível excluir a lista.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundDefault, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.accent} size="large" />
        </View>
      </View>
    );
  }

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundDefault, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>Lista não encontrada</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.backgroundDefault }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <Pressable onPress={handleDeleteList} hitSlop={10}>
            <Feather name="trash-2" size={20} color={theme.error || "#FF4444"} />
          </Pressable>
        </View>

        {list.coverImage ? (
          <Image source={{ uri: list.coverImage }} style={styles.coverImage} contentFit="cover" />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="list" size={48} color={theme.accent} />
          </View>
        )}

        <View style={styles.titleSection}>
          <ThemedText type="h3" style={{ fontWeight: "700" }}>{list.name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            {items.length} {items.length === 1 ? "item" : "itens"}
          </ThemedText>
        </View>

        <GlassCard style={styles.noteSection}>
          <View style={styles.noteSectionHeader}>
            <View style={styles.noteLabelRow}>
              <Feather name="file-text" size={16} color={theme.accent} />
              <ThemedText type="body" style={{ fontWeight: "600", marginLeft: Spacing.sm }}>
                Nota
              </ThemedText>
            </View>
            {!editingNote && (
              <Pressable onPress={() => setEditingNote(true)} hitSlop={10}>
                <Feather name="edit-2" size={16} color={theme.accent} />
              </Pressable>
            )}
          </View>

          {editingNote ? (
            <View style={styles.noteEditContainer}>
              <TextInput
                placeholder="Escreva uma nota sobre esta lista..."
                value={noteText}
                onChangeText={setNoteText}
                multiline
                style={{ minHeight: 80, textAlignVertical: "top" }}
                autoFocus
              />
              <View style={styles.noteActions}>
                <Pressable
                  onPress={() => {
                    setNoteText(list.description || "");
                    setEditingNote(false);
                  }}
                  style={[styles.noteActionButton, { borderColor: theme.border }]}
                >
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>Cancelar</ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleSaveNote}
                  disabled={savingNote}
                  style={[styles.noteActionButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}
                >
                  {savingNote ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>Salvar</ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <ThemedText type="body" style={{ color: list.description ? theme.text : theme.textSecondary, marginTop: Spacing.sm }}>
              {list.description || "Toque no ícone de editar para adicionar uma nota."}
            </ThemedText>
          )}
        </GlassCard>

        <View style={styles.itemsSection}>
          <ThemedText type="h4" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
            Mídias
          </ThemedText>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Feather name="inbox" size={40} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
                Nenhuma mídia nesta lista ainda.{"\n"}Adicione mídias a partir da tela de detalhes.
              </ThemedText>
            </View>
          ) : (
            items.map((item) => (
              <GlassCard key={item.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  {item.mediaImage ? (
                    <Image source={{ uri: item.mediaImage }} style={styles.itemImage} contentFit="cover" />
                  ) : (
                    <View style={[styles.itemImage, { backgroundColor: theme.backgroundSecondary, alignItems: "center", justifyContent: "center" }]}>
                      <Feather name="image" size={20} color={theme.textSecondary} />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <ThemedText type="body" style={{ fontWeight: "600" }} numberOfLines={2}>
                      {item.mediaTitle}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                      {MEDIA_TYPE_LABELS[item.mediaType] || item.mediaType}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveItem(item)}
                    disabled={removingId === item.id}
                    hitSlop={10}
                    style={styles.removeButton}
                  >
                    {removingId === item.id ? (
                      <ActivityIndicator color={theme.error || "#FF4444"} size="small" />
                    ) : (
                      <Feather name="x-circle" size={20} color={theme.error || "#FF4444"} />
                    )}
                  </Pressable>
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  coverImage: {
    width: "100%",
    height: 200,
    marginBottom: Spacing.lg,
  },
  coverPlaceholder: {
    width: "100%",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  titleSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  noteSection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  noteSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteEditContainer: {
    marginTop: Spacing.md,
  },
  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  noteActionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  itemsSection: {
    paddingHorizontal: Spacing.xl,
  },
  emptyItems: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  itemCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 70,
    borderRadius: BorderRadius.sm,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  removeButton: {
    padding: Spacing.sm,
  },
});
