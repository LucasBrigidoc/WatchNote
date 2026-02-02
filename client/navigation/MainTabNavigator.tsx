import React from "react";
import { StyleSheet, View, Platform, Pressable } from "react-native";
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
        <View style={styles.leftIcons}>
          {state.routes.slice(0, 2).map((route: any, index: number) => {
            const isFocused = state.index === index;
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

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
                <Feather
                  name={route.name === "HomeTab" ? "home" : "compass"}
                  size={26}
                  color={isFocused ? theme.accent : theme.tabIconDefault}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fabContainer}>
          <FloatingActionButton onPress={handleCreatePress} />
        </View>

        <View style={styles.profileTabWrapper}>
          {state.routes.slice(3).map((route: any, index: number) => {
            const actualIndex = index + 3;
            const isFocused = state.index === actualIndex;
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

            return (
              <React.Fragment key={route.key}>
                <Pressable onPress={onPress} style={styles.tabItem}>
                  <Feather
                    name="user"
                    size={26}
                    color={isFocused ? theme.accent : theme.tabIconDefault}
                  />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("Settings")}
                  style={[styles.tabItem, styles.settingsIcon]}
                >
                  <Feather
                    name="settings"
                    size={26}
                    color={theme.tabIconDefault}
                  />
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>
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
    justifyContent: "center",
    paddingHorizontal: 10,
    position: "relative",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  fabContainer: {
    position: "relative",
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  leftIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
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
