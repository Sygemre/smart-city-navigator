import React from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "styled-components/native";
import { PlanOlusturScreen } from "./src/screens/PlanOlusturScreen";
import { theme } from "./src/theme/theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" />
      <PlanOlusturScreen />
    </ThemeProvider>
  );
}
