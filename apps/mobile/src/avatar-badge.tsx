import { Image, StyleSheet, Text, View } from "react-native";
import { mobileTheme, presenceColor } from "./mobile-theme";

type AvatarBadgeProps = {
  label: string;
  imageUrl?: string | null;
  size?: 24 | 32 | 40 | 48 | 80;
  status?: "online" | "offline" | "away";
};

export function AvatarBadge({
  imageUrl,
  label,
  size = 40,
  status
}: AvatarBadgeProps) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        ) : (
          <Text
            style={[
              styles.initials,
              size >= 48 ? styles.initialsXl : size >= 40 ? styles.initialsLg : styles.initialsMd
            ]}
          >
            {initials}
          </Text>
        )}
      </View>
      {status ? (
        <View
          style={[
            styles.presence,
            { backgroundColor: presenceColor(status) }
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTheme.colors.blueLight
  },
  initials: {
    color: mobileTheme.colors.blueDark,
    fontWeight: "600"
  },
  initialsMd: { fontSize: 12 },
  initialsLg: { fontSize: 14 },
  initialsXl: { fontSize: 16 },
  presence: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: mobileTheme.colors.white
  }
});
