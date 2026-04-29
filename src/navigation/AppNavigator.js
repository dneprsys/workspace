import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { COLORS } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TemplatesScreen from "../screens/TemplatesScreen";

const Tab = createBottomTabNavigator();

const tabIcon = (name) => {
  const icons = {
    Home: "⚙️",
    History: "🧾",
    Templates: "📋",
    Settings: "⚡",
  };
  return icons[name] || "•";
};

export default function AppNavigator(props) {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,
          background: COLORS.bg,
          card: "#1a1a1a",
          text: COLORS.text,
          border: "#2a2a2a",
          notification: COLORS.accent,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>{tabIcon(route.name)}</Text>
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: "#666",
          tabBarStyle: {
            backgroundColor: "#1a1a1a",
            borderTopColor: "#2a2a2a",
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
        })}
      >
        <Tab.Screen
          name="Home"
          options={{ tabBarLabel: "Станки" }}
        >
          {() => <HomeScreen {...props} />}
        </Tab.Screen>
        <Tab.Screen
          name="Templates"
          options={{ tabBarLabel: "Шаблоны" }}
        >
          {() => <TemplatesScreen {...props} />}
        </Tab.Screen>
        <Tab.Screen
          name="History"
          options={{ tabBarLabel: "История" }}
        >
          {() => <HistoryScreen {...props} />}
        </Tab.Screen>
        <Tab.Screen
          name="Settings"
          options={{ tabBarLabel: "Настройки" }}
        >
          {() => <SettingsScreen {...props} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
