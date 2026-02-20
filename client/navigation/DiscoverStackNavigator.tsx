import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "@/screens/DiscoverScreen";
import SearchScreen from "@/screens/SearchScreen";
import MediaDetailScreen, { MediaDetailParams } from "@/screens/MediaDetailScreen";
import UserProfileScreen, { UserProfileParams } from "@/screens/UserProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type DiscoverStackParamList = {
  Discover: undefined;
  Search: undefined;
  MediaDetail: MediaDetailParams;
  UserProfile: UserProfileParams;
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          headerTitle: "Discover",
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MediaDetail"
        component={MediaDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}
