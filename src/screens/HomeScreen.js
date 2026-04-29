import React from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import MachineCard from "../components/MachineCard";
import StatsPanel from "../components/StatsPanel";
import CalcModal from "../components/CalcModal";
import { styles } from "../theme";

/**
 * Главный экран — отображает карточки станков, сводку и калькулятор.
 */
export default function HomeScreen({
  machines,
  history,
  updateMachine,
  openCalc,
  startMachine,
  togglePause,
  resetMachine,
  deleteMachine,
  addMachine,
  copyShift,
  copyBillet,
  calcOpen,
  calcExpr,
  setCalcExpr,
  calcInsert,
  setCalcOpen,
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.root}>
        <View style={styles.centerWrap}>
          <Text style={styles.h1}>⚙️ CNC Мониторинг Pro</Text>
          <Text style={styles.sub}>Управление станками · Расчёт смен · Заготовки</Text>

          <StatsPanel styles={styles} machines={machines} history={history} />

          {machines.map((m) => (
            <MachineCard
              key={m.id}
              m={m}
              styles={styles}
              updateMachine={updateMachine}
              openCalc={openCalc}
              startMachine={startMachine}
              togglePause={togglePause}
              resetMachine={resetMachine}
              deleteMachine={deleteMachine}
              copyShift={copyShift}
              copyBillet={copyBillet}
            />
          ))}

          <Text style={styles.versionText}>CNC Мониторинг Pro v1.1.0</Text>
        </View>

        <TouchableOpacity style={styles.fab} onPress={addMachine}>
          <Text style={{ color: "#000", fontSize: 28, fontWeight: "700" }}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      <CalcModal
        styles={styles}
        calcOpen={calcOpen}
        calcExpr={calcExpr}
        setCalcExpr={setCalcExpr}
        calcInsert={calcInsert}
        setCalcOpen={setCalcOpen}
      />
    </SafeAreaView>
  );
}
