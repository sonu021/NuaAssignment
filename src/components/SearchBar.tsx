import React from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useAppTheme } from "@/src/contexts/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

function SearchBar({ value, onChangeText, onClear }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <IconSymbol
          name="magnifyingglass"
          size={18}
          color={colors.subtext}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search products..."
          placeholderTextColor={colors.subtext}
          style={[styles.input, { color: colors.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => {
              onChangeText("");
              if (onClear) onClear();
            }}
            style={styles.clearButton}
            hitSlop={8}
            accessibilityLabel="Clear search"
          >
            <IconSymbol name="xmark.circle.fill" size={18} color={colors.subtext} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
});
