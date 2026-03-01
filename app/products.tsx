import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "../components/Header";
import { products } from "../constants/products";
import { colors as themeColors, spacing, typography as themeTypo } from "../constants/theme";

export default function ProductsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Products & Services</Text>
        <Text style={styles.subtitle}>Explore and apply online.</Text>
        {products.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.row}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>{p.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themeColors.gray },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 48,
  },
  title: {
    ...themeTypo.title,
    color: themeColors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...themeTypo.body,
    color: themeColors.textMuted,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  rowLabel: {
    ...themeTypo.headline,
    color: themeColors.text,
  },
  chevron: {
    fontSize: 24,
    color: themeColors.textMuted,
  },
});
