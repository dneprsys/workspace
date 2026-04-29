import React from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CalcModal({ styles, calcOpen, calcExpr, setCalcExpr, calcInsert, setCalcOpen }) {
  return (
    <Modal visible={calcOpen} transparent animationType="fade">
      <View style={styles.modalWrap}>
        <View style={styles.modalBody}>
          <TextInput style={styles.calcDisplay} value={calcExpr} onChangeText={setCalcExpr} placeholder="0" placeholderTextColor="#666" />
          <View style={styles.calcGrid}>
            {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "%", "+"].map((c) => (
              <TouchableOpacity key={c} style={styles.cbtn} onPress={() => setCalcExpr((p) => p + c)}>
                <Text style={styles.btnText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <TouchableOpacity style={[styles.btn, styles.btnMuted]} onPress={() => setCalcExpr("")}><Text style={styles.btnText}>C</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnAccent]} onPress={() => setCalcExpr((p) => p.slice(0, -1))}><Text style={styles.btnTextDark}>⌫</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={calcInsert}><Text style={styles.btnText}>Вставить</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#4a1a1a" }]} onPress={() => setCalcOpen(false)}><Text style={{ color: "#e03131", fontWeight: "700" }}>✕</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
