import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { analytics, AnalyticsEvent } from "../services/analytics";
import { useAppTheme } from "../contexts/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AnalyticsModal({ visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (visible) {
      setEvents(analytics.getEvents());
    }

    const unsubscribe = analytics.subscribe((newEvent) => {
      setEvents(analytics.getEvents());
    });

    return () => unsubscribe();
  }, [visible]);

  const handleClear = () => {
    analytics.clearEvents();
    setEvents([]);
  };

  const getEventBadgeColor = (name: string) => {
    switch (name) {
      case "product_viewed":
        return "#007AFF";
      case "add_to_cart":
        return "#30D158";
      case "search_performed":
        return "#FF9500";
      case "app_backgrounded":
        return "#AF52DE";
      default:
        return "#8E8E93";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.titleRow}>
            <IconSymbol name="chart.bar.fill" size={22} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Analytics Log ({events.length})
            </Text>
          </View>

          <View style={styles.headerButtons}>
            {events.length > 0 && (
              <Pressable onPress={handleClear} style={styles.clearBtn}>
                <Text style={[styles.clearBtnText, { color: colors.error }]}>
                  Clear
                </Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <IconSymbol name="xmark.circle.fill" size={24} color={colors.subtext} />
            </Pressable>
          </View>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No events recorded yet. Perform searches, view products, add items to cart, or background the app to see events here!
            </Text>
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getEventBadgeColor(item.name) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.name}</Text>
                  </View>
                  <Text style={[styles.timestamp, { color: colors.subtext }]}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>

                <View style={styles.metadataBox}>
                  <Text style={[styles.metadataText, { color: colors.text }]}>
                    {JSON.stringify(item.metadata, null, 2)}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearBtn: {
    marginRight: 12,
  },
  clearBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },
  closeBtn: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  timestamp: {
    fontSize: 12,
  },
  metadataBox: {
    backgroundColor: "rgba(0,0,0,0.04)",
    padding: 8,
    borderRadius: 6,
  },
  metadataText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
});
