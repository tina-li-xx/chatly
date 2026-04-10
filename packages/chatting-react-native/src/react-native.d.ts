declare module "react-native" {
  import * as React from "react";

  export const ActivityIndicator: React.ComponentType<Record<string, unknown>>;
  export const ScrollView: React.ComponentType<Record<string, unknown>>;
  export const Text: React.ComponentType<Record<string, unknown>>;
  export const TextInput: React.ComponentType<Record<string, unknown>>;
  export const TouchableOpacity: React.ComponentType<Record<string, unknown>>;
  export const View: React.ComponentType<Record<string, unknown>>;
  export const StyleSheet: {
    create<T extends Record<string, unknown>>(styles: T): T;
  };
}
