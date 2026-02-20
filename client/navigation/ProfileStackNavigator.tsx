import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import ProfileScreen from "@/screens/ProfileScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ListDetailScreen from "@/screens/ListDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  ListDetail: { listId: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function SettingsButton() {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  return (
    <Pressable
      onPress={() => navigation.navigate("Settings")}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Feather name="settings" size={22} color={theme.text} />
    </Pressable>
  );
}

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "",
          headerShown: false,
          animation: "none",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
          headerLeft: () => null,
          animation: "none",
        }}
      />
      <Stack.Screen
        name="ListDetail"
        component={ListDetailScreen}
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}
