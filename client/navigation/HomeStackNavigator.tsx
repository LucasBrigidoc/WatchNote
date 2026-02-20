import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import MediaDetailScreen, { MediaDetailParams } from "@/screens/MediaDetailScreen";
import UserProfileScreen, { UserProfileParams } from "@/screens/UserProfileScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HomeStackParamList = {
  Home: undefined;
  MediaDetail: MediaDetailParams;
  UserProfile: UserProfileParams;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="WatchFile" />,
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
