import { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  parseFraction,
  toDecimal,
  add,
  subtract,
  multiply,
  divide,
  reduce,
  type Fraction,
} from "../../../../src/modules/woodworking/calculators/fraction";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

// ─── types ───────────────────────────────────────────────────────────────────

type Operator = "+" | "-" | "×" | "÷";

interface TapeEntry {
  expression: string;
  fractionResult: string;
  decimalResult: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fractionToDisplay(f: Fraction): string {
  if (f.numerator === 0) return `${f.whole}`;
  if (f.whole === 0) return `${f.numerator}/${f.denominator}`;
  return `${f.whole} ${f.numerator}/${f.denominator}`;
}

function applyOp(a: Fraction, op: Operator, b: Fraction): Fraction {
  switch (op) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "×":
      return multiply(a, b);
    case "÷":
      return divide(a, b);
  }
}

// ─── keypad config ───────────────────────────────────────────────────────────

type KeyDef =
  | { label: string; value: string; type: "digit" | "fraction" | "space" }
  | { label: string; value: Operator; type: "operator" }
  | { label: string; type: "equals" | "clear" | "backspace" };

const KEYS: KeyDef[][] = [
  [
    { label: "7", value: "7", type: "digit" },
    { label: "8", value: "8", type: "digit" },
    { label: "9", value: "9", type: "digit" },
    { label: "÷", value: "÷", type: "operator" },
  ],
  [
    { label: "4", value: "4", type: "digit" },
    { label: "5", value: "5", type: "digit" },
    { label: "6", value: "6", type: "digit" },
    { label: "×", value: "×", type: "operator" },
  ],
  [
    { label: "1", value: "1", type: "digit" },
    { label: "2", value: "2", type: "digit" },
    { label: "3", value: "3", type: "digit" },
    { label: "-", value: "-", type: "operator" },
  ],
  [
    { label: "0", value: "0", type: "digit" },
    { label: "⎵", value: " ", type: "space" },
    { label: "/", value: "/", type: "fraction" },
    { label: "+", value: "+", type: "operator" },
  ],
  [
    { label: "C", type: "clear" },
    { label: "⌫", type: "backspace" },
    { label: "=", type: "equals" },
  ],
];

// ─── component ───────────────────────────────────────────────────────────────

export default function FractionCalcScreen() {
  const { colors } = useTheme();
  const tapeRef = useRef<ScrollView>(null);

  // Current input token being built
  const [currentInput, setCurrentInput] = useState<string>("");
  // Pending left operand (already validated fraction string)
  const [leftOperand, setLeftOperand] = useState<string | null>(null);
  // Pending operator
  const [pendingOp, setPendingOp] = useState<Operator | null>(null);
  // Last computed result (fraction string) to chain operations
  const [lastResult, setLastResult] = useState<Fraction | null>(null);
  // Tape history
  const [tape, setTape] = useState<TapeEntry[]>([]);
  // Whether display is showing a result (next digit starts fresh)
  const [justComputed, setJustComputed] = useState(false);

  // Build display expression
  const displayExpression = (() => {
    const parts: string[] = [];
    if (leftOperand !== null) {
      parts.push(leftOperand);
    }
    if (pendingOp !== null) {
      parts.push(pendingOp);
    }
    if (currentInput !== "") {
      parts.push(currentInput);
    }
    return parts.join(" ") || "0";
  })();

  function handleDigit(digit: string) {
    if (justComputed) {
      // Start fresh after a result
      setCurrentInput(digit);
      setLastResult(null);
      setJustComputed(false);
      return;
    }
    setCurrentInput((prev) => prev + digit);
  }

  function handleSpace() {
    if (justComputed) return;
    // Only allow one space — for mixed number: whole SPACE num/den
    if (currentInput.includes(" ")) return;
    if (currentInput === "") return;
    setCurrentInput((prev) => prev + " ");
  }

  function handleSlash() {
    if (justComputed) return;
    // Only allow one slash
    if (currentInput.includes("/")) return;
    if (currentInput === "") return;
    setCurrentInput((prev) => prev + "/");
  }

  function handleOperator(op: Operator) {
    setJustComputed(false);

    // If we have a current input, commit it as leftOperand (or compute chain)
    if (currentInput !== "") {
      if (leftOperand !== null && pendingOp !== null) {
        // Chain: evaluate first
        try {
          const a = parseFraction(leftOperand);
          const b = parseFraction(currentInput);
          const result = reduce(applyOp(a, pendingOp, b));
          const resultStr = fractionToDisplay(result);
          setLeftOperand(resultStr);
          setLastResult(result);
        } catch {
          Alert.alert("Error", "Invalid fraction input.");
          handleClear();
          return;
        }
      } else {
        setLeftOperand(currentInput);
      }
      setCurrentInput("");
    } else if (lastResult !== null && leftOperand === null) {
      // Continue from last result
      setLeftOperand(fractionToDisplay(lastResult));
    } else if (leftOperand === null) {
      // Nothing to operate on
      return;
    }

    setPendingOp(op);
  }

  function handleEquals() {
    if (pendingOp === null || leftOperand === null) return;

    const rightStr = currentInput !== "" ? currentInput : leftOperand;

    let a: Fraction;
    let b: Fraction;
    try {
      a = parseFraction(leftOperand);
      b = parseFraction(rightStr);
    } catch {
      Alert.alert("Error", "Invalid fraction input.");
      handleClear();
      return;
    }

    let result: Fraction;
    try {
      result = reduce(applyOp(a, pendingOp, b));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Calculation error";
      Alert.alert("Error", msg);
      return;
    }

    const fractionStr = fractionToDisplay(result);
    const decimalStr = toDecimal(result).toFixed(4).replace(/\.?0+$/, "");
    const expression = `${leftOperand} ${pendingOp} ${rightStr}`;

    const entry: TapeEntry = {
      expression,
      fractionResult: fractionStr,
      decimalResult: decimalStr,
    };

    setTape((prev) => [...prev, entry]);
    setLastResult(result);

    // Reset for chaining: left = result, no op, no current input
    setLeftOperand(fractionStr);
    setPendingOp(null);
    setCurrentInput("");
    setJustComputed(true);

    // Scroll tape to bottom
    setTimeout(() => {
      tapeRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }

  function handleBackspace() {
    if (justComputed) {
      handleClear();
      return;
    }
    setCurrentInput((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    setCurrentInput("");
    setLeftOperand(null);
    setPendingOp(null);
    setLastResult(null);
    setJustComputed(false);
  }

  function handleKeyPress(key: KeyDef) {
    if (key.type === "digit" || key.type === "fraction" || key.type === "space") {
      if (key.type === "digit") handleDigit((key as { value: string }).value);
      else if (key.type === "space") handleSpace();
      else handleSlash();
    } else if (key.type === "operator") {
      handleOperator((key as { value: Operator }).value);
    } else if (key.type === "equals") {
      handleEquals();
    } else if (key.type === "clear") {
      handleClear();
    } else if (key.type === "backspace") {
      handleBackspace();
    }
  }

  function handleSave() {
    if (tape.length === 0) {
      Alert.alert("Nothing to Save", "Perform a calculation first.");
      return;
    }
    const last = tape[tape.length - 1];
    try {
      CalculatorService.save({
        module: "woodworking",
        calculatorType: "fraction",
        inputsJson: { expression: last.expression },
        outputsJson: {
          fraction: last.fractionResult,
          decimal: last.decimalResult,
        },
        label: `${last.expression} = ${last.fractionResult}`,
      });
      Alert.alert("Saved", "Last result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  }

  // ─── key color logic ────────────────────────────────────────────────────────

  function getKeyStyle(key: KeyDef): {
    bg: string;
    fg: string;
    flex?: number;
  } {
    if (key.type === "equals")
      return { bg: colors.primary, fg: "#fff", flex: 2 };
    if (key.type === "operator") return { bg: colors.primaryMuted, fg: colors.primary };
    if (key.type === "clear") return { bg: colors.danger, fg: "#fff" };
    if (key.type === "backspace") return { bg: colors.surface, fg: colors.textSecondary };
    if (key.type === "space" || key.type === "fraction")
      return { bg: colors.surfaceElevated, fg: colors.textPrimary };
    // digit
    return { bg: colors.surfaceElevated, fg: colors.textPrimary };
  }

  // ─── render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View className="px-4 pt-3 pb-1">
        <Text
          className="text-[22px]"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Fraction Calculator
        </Text>
        <Text
          className="text-[13px] mt-0.5"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Add, subtract, multiply, and divide fractions
        </Text>
      </View>

      {/* ── Tape (scrollable history) ── */}
      <View
        className="mx-4 mt-3 rounded-xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          maxHeight: 180,
          minHeight: 60,
        }}
      >
        <ScrollView
          ref={tapeRef}
          className="flex-1 px-3 py-2"
          showsVerticalScrollIndicator={false}
        >
          {tape.length === 0 ? (
            <Text
              className="text-[12px] text-center py-3"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              Tape — calculations will appear here
            </Text>
          ) : (
            tape.map((entry, i) => (
              <View
                key={i}
                className="mb-2 pb-2"
                style={
                  i < tape.length - 1
                    ? { borderBottomWidth: 1, borderColor: colors.border }
                    : undefined
                }
              >
                <Text
                  className="text-[11px] mb-0.5"
                  style={{
                    fontFamily: "JetBrainsMono_500Medium",
                    color: colors.textMuted,
                  }}
                >
                  {entry.expression}
                </Text>
                <View className="flex-row items-baseline gap-x-3">
                  <Text
                    className="text-[16px]"
                    style={{
                      fontFamily: "JetBrainsMono_700Bold",
                      color: colors.textPrimary,
                    }}
                  >
                    = {entry.fractionResult}
                  </Text>
                  <Text
                    className="text-[12px]"
                    style={{
                      fontFamily: "JetBrainsMono_500Medium",
                      color: colors.textSecondary,
                    }}
                  >
                    ({entry.decimalResult})
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* ── Expression display ── */}
      <View
        className="mx-4 mt-3 rounded-xl px-4 py-3"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: justComputed ? colors.success : colors.border,
          minHeight: 56,
          justifyContent: "center",
        }}
      >
        <Text
          className="text-[20px] text-right"
          style={{
            fontFamily: "JetBrainsMono_700Bold",
            color: justComputed ? colors.success : colors.textPrimary,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayExpression}
        </Text>
      </View>

      {/* ── Keypad ── */}
      <View className="mx-4 mt-3 flex-1 pb-2">
        {KEYS.map((row, ri) => (
          <View key={ri} className="flex-row gap-x-2 mb-2">
            {row.map((key, ki) => {
              const style = getKeyStyle(key);
              return (
                <TouchableOpacity
                  key={ki}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.7}
                  style={{
                    flex: style.flex ?? 1,
                    backgroundColor: style.bg,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: key.type === "equals" ? 22 : 18,
                      color: style.fg,
                    }}
                  >
                    {key.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* ── Save button ── */}
      <View className="px-4 pb-3">
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          style={{
            backgroundColor: tape.length > 0 ? colors.primary : colors.surface,
            borderRadius: 12,
            paddingVertical: 13,
            alignItems: "center",
            borderWidth: 1,
            borderColor: tape.length > 0 ? colors.primary : colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              color: tape.length > 0 ? "#fff" : colors.textMuted,
            }}
          >
            Save to History
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
