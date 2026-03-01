import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { colors, spacing, typography } from "../constants/theme";
import { products } from "../constants/products";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero - Virtual Wallet $400 offer (from HTML hero) */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Checking & Savings. Together.</Text>
            <Text style={styles.heroHeadline}>Earn up to $400</Text>
            <Text style={styles.heroBody}>
              as a new checking customer when you set up qualifying direct deposit(s) to a Virtual Wallet® spend account.
            </Text>
            <Button
              title="Get Started"
              onPress={() => router.push('/(auth)/login')}
              style={styles.heroCta}
            />
          </View>
        </View>

        {/* Products & Services - from "Explore and apply online" */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products & Services</Text>
          <Text style={styles.sectionSubtitle}>Explore and apply online.</Text>
          <View style={styles.productGrid}>
            {products.map((p) => (
              <Card
                key={p.id}
                title={p.label}
                Icon={p.icon}
                onPress={() => router.push("/products")}
                style={styles.productCard}
              />
            ))}
          </View>
        </View>

        {/* Contact strip - from Contact Us */}
        <View style={styles.contactStrip}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactLabel}>Schedule an Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactLabel}>Find a Branch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactLabel}>Call 1-888-PNC-Bank</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>©2026 The PNC Financial Services Group, Inc. Member FDIC.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl * 2 },

  hero: {
    backgroundColor: colors.offWhite,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  heroContent: { maxWidth: 400, alignSelf: "center" },
  heroTitle: {
    ...typography.titleSmall,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroHeadline: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  heroBody: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  heroCta: { alignSelf: "center" },

  section: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  productCard: { width: "47%" },

  contactStrip: {
    backgroundColor: colors.navBg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  contactTitle: {
    ...typography.headline,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  contactRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
  contactItem: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  contactLabel: { ...typography.bodySmall, color: colors.primary },

  footer: {
    padding: spacing.lg,
    alignItems: "center",
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
});
