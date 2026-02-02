import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import DiscoverStackNavigator from "@/navigation/DiscoverStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export type MainTabParamList = {
  HomeTab: undefined;
  DiscoverTab: undefined;
  CreateTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function EmptyScreen() {
  return null;
}

function TabBarWithFAB({
  state,
  descriptors,
  navigation: tabNavigation,
}: any) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<any>>();

  const handleCreatePress = () => {
    navigation.navigate("CreatePost");
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={100}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.backgroundRoot },
          ]}
        />
      )}
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (route.name === "CreateTab") {
            return (
              <View key={route.key} style={styles.fabContainer}>
                <FloatingActionButton onPress={handleCreatePress} />
              </View>
            );
          }

          const onPress = () => {
            const event = tabNavigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              tabNavigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof Feather.glyphMap = "home";
          if (route.name === "HomeTab") iconName = "home";
          else if (route.name === "DiscoverTab") iconName = "compass";
          else if (route.name === "ProfileTab") iconName = "user";

          const isProfile = route.name === "ProfileTab";

          return (
            <View key={route.key} style={styles.tabItem}>
              <View style={isProfile ? styles.profileTabWrapper : null}>
                <Feather
                  name={iconName}
                  size={24}
                  color={isFocused ? theme.accent : theme.tabIconDefault}
                  onPress={onPress}
                />
                {isProfile && (
                  <Feather
                    name="settings"
                    size={24}
                    color={theme.tabIconDefault}
                    style={styles.settingsIcon}
                    onPress={() => navigation.navigate("Settings")}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <TabBarWithFAB {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
        }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStackNavigator}
        options={{
          title: "Discover",
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={EmptyScreen}
        options={{
          title: "",
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
  },
  tabBar: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  profileTabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  settingsIcon: {
    // No extra margin needed with gap
  },
});
