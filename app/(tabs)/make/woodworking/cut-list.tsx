import { useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  Switch,
  Alert,
  useWindowDimensions,
} from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { optimizeCutList1D } from "../../../../src/modules/woodworking/calculators/cutList1D";
import { optimizeCutList2D } from "../../../../src/modules/woodworking/calculators/cutList2D";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "1d" | "2d";

interface Cut1DRow {
  id: string;
  length: string;
  label: string;
  quantity: string;
}

interface Cut2DRow {
  id: string;
  width: string;
  height: string;
  label: string;
  quantity: string;
  grainLocked: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_OPTIONS = [
  { label: "1D — Linear", value: "1d" },
  { label: "2D — Sheet", value: "2d" },
];

const CUT_COLORS = [
  "#4f8ef7",
  "#f7924f",
  "#4fd17c",
  "#f7d14f",
  "#c44ff7",
  "#f74f7e",
  "#4ff7e8",
  "#f7a84f",
  "#7ef74f",
  "#f74fc4",
];

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── 1D Visualization ─────────────────────────────────────────────────────────

interface Stock1DVizProps {
  stockLength: number;
  cuts: { length: number; label: string; position: number }[];
  wasteLength: number;
  colors: ReturnType<typeof useTheme>["colors"];
}

function Stock1DViz({ stockLength, cuts, wasteLength, colors }: Stock1DVizProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 36,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: colors.surfaceElevated,
        marginBottom: 4,
      }}
    >
      {cuts.map((cut, i) => {
        const widthPct = (cut.length / stockLength) * 100;
        return (
          <View
            key={i}
            style={{
              width: `${widthPct}%`,
              backgroundColor: CUT_COLORS[i % CUT_COLORS.length],
              justifyContent: "center",
              alignItems: "center",
              borderRightWidth: 1,
              borderRightColor: "rgba(0,0,0,0.2)",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 9,
                color: "#0f0f1a",
                paddingHorizontal: 2,
              }}
            >
              {cut.label}
            </Text>
          </View>
        );
      })}
      {wasteLength > 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 9, color: colors.textMuted }}>
            waste
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── 2D Sheet SVG ─────────────────────────────────────────────────────────────

interface Sheet2DVizProps {
  sheetWidth: number;
  sheetHeight: number;
  placements: { width: number; height: number; x: number; y: number; label: string; rotated: boolean }[];
  svgWidth: number;
  colors: ReturnType<typeof useTheme>["colors"];
}

function Sheet2DViz({ sheetWidth, sheetHeight, placements, svgWidth, colors }: Sheet2DVizProps) {
  const scale = svgWidth / sheetWidth;
  const svgHeight = sheetHeight * scale;

  return (
    <Svg width={svgWidth} height={svgHeight} style={{ borderRadius: 6, overflow: "hidden" }}>
      {/* Sheet background */}
      <Rect x={0} y={0} width={svgWidth} height={svgHeight} fill={colors.surfaceElevated} />
      {placements.map((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        const w = p.width * scale;
        const h = p.height * scale;
        const fill = CUT_COLORS[i % CUT_COLORS.length];
        const cx = x + w / 2;
        const cy = y + h / 2;
        const fontSize = Math.max(7, Math.min(11, Math.min(w, h) / 4));

        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={fill}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={0.8}
              opacity={0.9}
            />
            <SvgText
              x={cx}
              y={cy + fontSize * 0.35}
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily="Inter_500Medium"
              fill="#0f0f1a"
            >
              {p.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── Cut Row Editors ──────────────────────────────────────────────────────────

interface Cut1DRowEditorProps {
  row: Cut1DRow;
  index: number;
  onChange: (id: string, field: keyof Cut1DRow, value: string) => void;
  onRemove: (id: string) => void;
  colors: ReturnType<typeof useTheme>["colors"];
}

function Cut1DRowEditor({ row, index, onChange, onRemove, colors }: Cut1DRowEditorProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
          Cut #{index + 1}
        </Text>
        <Pressable onPress={() => onRemove(row.id)} accessibilityLabel="Remove cut">
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.danger }}>Remove</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <CalculatorInput
            label="Length"
            value={row.length}
            onChangeText={(v) => onChange(row.id, "length", v)}
            unit="in"
            placeholder="24"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Qty"
            value={row.quantity}
            onChangeText={(v) => onChange(row.id, "quantity", v)}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>
      </View>
      <CalculatorInput
        label="Label (optional)"
        value={row.label}
        onChangeText={(v) => onChange(row.id, "label", v)}
        placeholder="Shelf"
      />
    </View>
  );
}

interface Cut2DRowEditorProps {
  row: Cut2DRow;
  index: number;
  onChange: (id: string, field: keyof Cut2DRow, value: string | boolean) => void;
  onRemove: (id: string) => void;
  colors: ReturnType<typeof useTheme>["colors"];
}

function Cut2DRowEditor({ row, index, onChange, onRemove, colors }: Cut2DRowEditorProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
          Cut #{index + 1}
        </Text>
        <Pressable onPress={() => onRemove(row.id)} accessibilityLabel="Remove cut">
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.danger }}>Remove</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Width"
            value={row.width}
            onChangeText={(v) => onChange(row.id, "width", v)}
            unit="in"
            placeholder="12"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Height"
            value={row.height}
            onChangeText={(v) => onChange(row.id, "height", v)}
            unit="in"
            placeholder="24"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Qty"
            value={row.quantity}
            onChangeText={(v) => onChange(row.id, "quantity", v)}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>
      </View>
      <CalculatorInput
        label="Label (optional)"
        value={row.label}
        onChangeText={(v) => onChange(row.id, "label", v)}
        placeholder="Panel"
      />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary }}>
          Lock grain direction
        </Text>
        <Switch
          value={row.grainLocked}
          onValueChange={(v) => onChange(row.id, "grainLocked", v)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

import React from "react";

export default function CutListScreen() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const svgWidth = screenWidth - 32 - 32; // screen padding - card padding

  const [mode, setMode] = useState<Mode>("1d");

  // 1D state
  const [stockLength, setStockLength] = useState("");
  const [kerfWidth1D, setKerfWidth1D] = useState("0.125");
  const [stockCost, setStockCost] = useState("");
  const [cuts1D, setCuts1D] = useState<Cut1DRow[]>([
    { id: makeId(), length: "", label: "", quantity: "1" },
  ]);
  const [result1D, setResult1D] = useState<ReturnType<typeof optimizeCutList1D> | null>(null);

  // 2D state
  const [sheetWidth, setSheetWidth] = useState("");
  const [sheetHeight, setSheetHeight] = useState("");
  const [kerfWidth2D, setKerfWidth2D] = useState("0.125");
  const [cuts2D, setCuts2D] = useState<Cut2DRow[]>([
    { id: makeId(), width: "", height: "", label: "", quantity: "1", grainLocked: false },
  ]);
  const [result2D, setResult2D] = useState<ReturnType<typeof optimizeCutList2D> | null>(null);

  // ── 1D handlers ──────────────────────────────────────────────────────────

  const update1DRow = useCallback((id: string, field: keyof Cut1DRow, value: string) => {
    setCuts1D((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const remove1DRow = useCallback((id: string) => {
    setCuts1D((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const addCut1D = () => {
    setCuts1D((prev) => [...prev, { id: makeId(), length: "", label: "", quantity: "1" }]);
  };

  const optimize1D = () => {
    const sl = parseFloat(stockLength);
    if (!sl || sl <= 0) {
      Alert.alert("Invalid Input", "Enter a valid stock length.");
      return;
    }
    const validCuts = cuts1D
      .map((r) => ({
        length: parseFloat(r.length),
        label: r.label || undefined,
        quantity: parseInt(r.quantity) || 1,
      }))
      .filter((c) => c.length > 0);

    if (validCuts.length === 0) {
      Alert.alert("Invalid Input", "Add at least one cut with a valid length.");
      return;
    }

    const kerf = parseFloat(kerfWidth1D) || 0;
    const cost = parseFloat(stockCost);

    try {
      const res = optimizeCutList1D({
        cuts: validCuts,
        stockLength: sl,
        kerfWidth: kerf,
        stockCost: cost > 0 ? cost : undefined,
      });
      setResult1D(res);
    } catch {
      Alert.alert("Error", "Optimization failed. Check your inputs.");
    }
  };

  // ── 2D handlers ──────────────────────────────────────────────────────────

  const update2DRow = useCallback(
    (id: string, field: keyof Cut2DRow, value: string | boolean) => {
      setCuts2D((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    },
    []
  );

  const remove2DRow = useCallback((id: string) => {
    setCuts2D((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const addCut2D = () => {
    setCuts2D((prev) => [
      ...prev,
      { id: makeId(), width: "", height: "", label: "", quantity: "1", grainLocked: false },
    ]);
  };

  const optimize2D = () => {
    const sw = parseFloat(sheetWidth);
    const sh = parseFloat(sheetHeight);
    if (!sw || sw <= 0 || !sh || sh <= 0) {
      Alert.alert("Invalid Input", "Enter valid sheet dimensions.");
      return;
    }
    const validCuts = cuts2D
      .map((r) => ({
        width: parseFloat(r.width),
        height: parseFloat(r.height),
        label: r.label || undefined,
        quantity: parseInt(r.quantity) || 1,
        grainLocked: r.grainLocked,
      }))
      .filter((c) => c.width > 0 && c.height > 0);

    if (validCuts.length === 0) {
      Alert.alert("Invalid Input", "Add at least one cut with valid dimensions.");
      return;
    }

    const kerf = parseFloat(kerfWidth2D) || 0;

    try {
      const res = optimizeCutList2D({
        cuts: validCuts,
        sheetWidth: sw,
        sheetHeight: sh,
        kerfWidth: kerf,
      });
      setResult2D(res);
    } catch {
      Alert.alert("Error", "Optimization failed. Check your inputs.");
    }
  };

  // ── Save handler ─────────────────────────────────────────────────────────

  const handleSave = () => {
    if (mode === "1d" && !result1D) {
      Alert.alert("No Results", "Run optimize first.");
      return;
    }
    if (mode === "2d" && !result2D) {
      Alert.alert("No Results", "Run optimize first.");
      return;
    }
    try {
      CalculatorService.save({
        module: "woodworking",
        calculatorType: "cut-list",
        inputsJson:
          mode === "1d"
            ? { mode, stockLength, kerfWidth: kerfWidth1D, stockCost, cuts: cuts1D }
            : { mode, sheetWidth, sheetHeight, kerfWidth: kerfWidth2D, cuts: cuts2D },
        outputsJson: mode === "1d" ? result1D : result2D,
        label:
          mode === "1d"
            ? `Cut List 1D — ${result1D!.totalStockNeeded} pcs, ${result1D!.wastePercent}% waste`
            : `Cut List 2D — ${result2D!.totalSheetsNeeded} sheets, ${result2D!.totalWastePercent}% waste`,
      });
      Alert.alert("Saved", "Result saved to history.");
    } catch {
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const handleAddToQuote = () => Alert.alert("Coming Soon", "Quote feature coming soon.");
  const handleLogToProject = () => Alert.alert("Coming Soon", "Project logging coming soon.");

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          Cut List Optimizer
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          Minimize waste with optimal cut placement
        </Text>

        <Text
          className="text-[12px] uppercase tracking-wider mb-2"
          style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
        >
          Mode
        </Text>
        <FilterBar options={MODE_OPTIONS} selected={mode} onSelect={(v) => setMode(v as Mode)} />

        {/* ── 1D Mode ── */}
        {mode === "1d" && (
          <>
            <Text
              className="text-[12px] uppercase tracking-wider mb-2 mt-2"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              Stock Settings
            </Text>

            <CalculatorInput
              label="Stock Length"
              value={stockLength}
              onChangeText={setStockLength}
              unit="in"
              placeholder="96"
            />
            <CalculatorInput
              label="Kerf Width"
              value={kerfWidth1D}
              onChangeText={setKerfWidth1D}
              unit="in"
              placeholder="0.125"
            />
            <CalculatorInput
              label="Stock Cost (optional)"
              value={stockCost}
              onChangeText={setStockCost}
              unit="$/pc"
              placeholder="0.00"
            />

            <Text
              className="text-[12px] uppercase tracking-wider mb-2 mt-2"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              Cut Pieces
            </Text>

            {cuts1D.map((row, i) => (
              <Cut1DRowEditor
                key={row.id}
                row={row}
                index={i}
                onChange={update1DRow}
                onRemove={remove1DRow}
                colors={colors}
              />
            ))}

            <Pressable
              onPress={addCut1D}
              style={{
                borderWidth: 1,
                borderColor: colors.primary,
                borderStyle: "dashed",
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
              accessibilityLabel="Add Cut"
            >
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.primary }}>
                + Add Cut
              </Text>
            </Pressable>

            <Pressable
              onPress={optimize1D}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
              accessibilityLabel="Optimize"
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#0f0f1a" }}>
                Optimize
              </Text>
            </Pressable>

            {result1D && (
              <>
                <ResultCard
                  title="Summary"
                  results={[
                    {
                      label: "Stock pieces needed",
                      value: result1D.totalStockNeeded.toString(),
                      unit: "pcs",
                      highlight: true,
                    },
                    {
                      label: "Total waste",
                      value: `${result1D.wastePercent}%`,
                    },
                    {
                      label: "Waste length",
                      value: result1D.totalWaste.toString(),
                      unit: "in",
                    },
                    ...(result1D.totalCost !== null
                      ? [{ label: "Total cost", value: `$${result1D.totalCost.toFixed(2)}` }]
                      : []),
                  ]}
                />

                <Text
                  className="text-[12px] uppercase tracking-wider mt-4 mb-2"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                >
                  Layout ({result1D.stockPieces.length} pieces)
                </Text>

                {result1D.stockPieces.map((sp, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        Stock #{i + 1} — {sp.stockLength}&quot;
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textMuted,
                        }}
                      >
                        {sp.wasteLength}&quot; waste
                      </Text>
                    </View>
                    <Stock1DViz
                      stockLength={sp.stockLength}
                      cuts={sp.cuts}
                      wasteLength={sp.wasteLength}
                      colors={colors}
                    />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {sp.cuts.map((cut, j) => (
                        <View
                          key={j}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              backgroundColor: CUT_COLORS[j % CUT_COLORS.length],
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: "Inter_400Regular",
                              fontSize: 11,
                              color: colors.textSecondary,
                            }}
                          >
                            {cut.label} ({cut.length}&quot;)
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── 2D Mode ── */}
        {mode === "2d" && (
          <>
            <Text
              className="text-[12px] uppercase tracking-wider mb-2 mt-2"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              Sheet Settings
            </Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <CalculatorInput
                  label="Sheet Width"
                  value={sheetWidth}
                  onChangeText={setSheetWidth}
                  unit="in"
                  placeholder="48"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CalculatorInput
                  label="Sheet Height"
                  value={sheetHeight}
                  onChangeText={setSheetHeight}
                  unit="in"
                  placeholder="96"
                />
              </View>
            </View>
            <CalculatorInput
              label="Kerf Width"
              value={kerfWidth2D}
              onChangeText={setKerfWidth2D}
              unit="in"
              placeholder="0.125"
            />

            <Text
              className="text-[12px] uppercase tracking-wider mb-2 mt-2"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              Cut Pieces
            </Text>

            {cuts2D.map((row, i) => (
              <Cut2DRowEditor
                key={row.id}
                row={row}
                index={i}
                onChange={update2DRow}
                onRemove={remove2DRow}
                colors={colors}
              />
            ))}

            <Pressable
              onPress={addCut2D}
              style={{
                borderWidth: 1,
                borderColor: colors.primary,
                borderStyle: "dashed",
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
              accessibilityLabel="Add Cut"
            >
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.primary }}>
                + Add Cut
              </Text>
            </Pressable>

            <Pressable
              onPress={optimize2D}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
              accessibilityLabel="Optimize"
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#0f0f1a" }}>
                Optimize
              </Text>
            </Pressable>

            {result2D && (
              <>
                <ResultCard
                  title="Summary"
                  results={[
                    {
                      label: "Sheets needed",
                      value: result2D.totalSheetsNeeded.toString(),
                      unit: "sheets",
                      highlight: true,
                    },
                    {
                      label: "Total waste",
                      value: `${result2D.totalWastePercent}%`,
                    },
                  ]}
                />

                <Text
                  className="text-[12px] uppercase tracking-wider mt-4 mb-2"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                >
                  Sheet Layouts ({result2D.sheets.length})
                </Text>

                {result2D.sheets.map((sheet, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: colors.textSecondary,
                        }}
                      >
                        Sheet #{i + 1} — {sheet.sheetWidth}&quot; × {sheet.sheetHeight}&quot;
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: colors.textMuted,
                        }}
                      >
                        {sheet.wastePercent}% waste
                      </Text>
                    </View>

                    <Sheet2DViz
                      sheetWidth={sheet.sheetWidth}
                      sheetHeight={sheet.sheetHeight}
                      placements={sheet.placements}
                      svgWidth={svgWidth}
                      colors={colors}
                    />

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      {sheet.placements.map((p, j) => (
                        <View key={j} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              backgroundColor: CUT_COLORS[j % CUT_COLORS.length],
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: "Inter_400Regular",
                              fontSize: 11,
                              color: colors.textSecondary,
                            }}
                          >
                            {p.label} {p.width}&quot;×{p.height}&quot;
                            {p.rotated ? " (R)" : ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        <ActionBar
          onSaveToHistory={handleSave}
          onAddToQuote={handleAddToQuote}
          onLogToProject={handleLogToProject}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
