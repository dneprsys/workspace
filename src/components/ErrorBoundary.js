import React from "react";
import { Text, View } from "react-native";
import { COLORS } from "../theme";

/**
 * ErrorBoundary — перехватывает ошибки рендера дочерних компонентов.
 * Вместо белого экрана показывает сообщение об ошибке.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[CNC] Ошибка в компоненте:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.bg,
            alignItems: "center",
            justifyContent: "center",
            padding: 30,
          }}
        >
          <Text style={{ color: COLORS.danger, fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" }}>
            Произошла ошибка
          </Text>
          <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            {this.state.error?.message || "Неизвестная ошибка"}
          </Text>
          <Text style={{ color: "#555", fontSize: 11, marginTop: 20, textAlign: "center" }}>
            Перезапустите приложение
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}
