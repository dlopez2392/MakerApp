import { useState, useCallback } from "react";
import React from "react";
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
import Svg, { Rect, Text as SvgText, Line, G } from "react-native-svg";
import { optimizeCutList1D } from "../../../../src/modules/woodworking/calculators/cutList1D";
import { optimizeCutList2D } from "../../../../src/modules/woodworking/calculators/cutList2D";
import type {
  StockSheet,
  CutPiece2D,
  SheetResult,
  PlacedPiece,
  EdgeBanding,
  CutList2DResult,
} from "../../../../src/modules/woodworking/calculators/cutList2D";
import type {
  StockPiece1D,
  CutList1DResult,
} from "../../../../src/modules/woodworking/calculators/cutList1D";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { ResultCard } from "../../../../src/design-system/components/ResultCard";
import { ActionBar } from "../../../../src/design-system/components/ActionBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import type { ThemeColors } from "../../../../src/design-system/tokens/colors";

// ─── Constants ────────────────────────────────────────────────────────────────

type Mode = "1d" | "2d";

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
  "#7fb8f7",
  "#f7b87f",
];

const MATERIAL_PRESETS = ["Plywood", "MDF", "Melamine", "Hardwood", "Particle Board", "OSB"];

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Row Types ────────────────────────────────────────────────────────────────

interface Stock1DRow {
  id: string;
  length: string;
  label: string;
  cost: string;
  quantity: string;
}

interface Stock2DRow {
  id: string;
  width: string;
  height: string;
  label: string;
  material: string;
  cost: string;
  quantity: string;
}

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
  material: string;
  ebTop: boolean;
  ebBottom: boolean;
  ebLeft: boolean;
  ebRight: boolean;
}

// ─── 2D Sheet Visualization ──────────────────────────────────────────────────

interface Sheet2DVizProps {
  sheet: SheetResult;
  svgWidth: number;
  colors: ThemeColors;
}

function Sheet2DViz({ sheet, svgWidth, colors }: Sheet2DVizProps) {
  const padding = 24;
  const innerWidth = svgWidth - padding * 2;
  const scale = innerWidth / sheet.sheetWidth;
  const innerHeight = sheet.sheetHeight * scale;
  const svgHeight = innerHeight + padding * 2;

  return (
    <Svg width={svgWidth} height={svgHeight}>
      {/* Sheet background */}
      <Rect
        x={padding}
        y={padding}
        width={innerWidth}
        height={innerHeight}
        fill={colors.surfaceElevated}
        stroke={colors.border}
        strokeWidth={1}
      />

      {/* Width dimension at top */}
      <Line
        x1={padding}
        y1={10}
        x2={padding + innerWidth}
        y2={10}
        stroke={colors.textMuted}
        strokeWidth={0.8}
      />
      <Line x1={padding} y1={6} x2={padding} y2={14} stroke={colors.textMuted} strokeWidth={0.8} />
      <Line
        x1={padding + innerWidth}
        y1={6}
        x2={padding + innerWidth}
        y2={14}
        stroke={colors.textMuted}
        strokeWidth={0.8}
      />
      <SvgText
        x={padding + innerWidth / 2}
        y={8}
        textAnchor="middle"
        fontSize={9}
        fill={colors.textMuted}
        fontFamily="JetBrainsMono_500Medium"
      >
        {sheet.sheetWidth}"
      </SvgText>

      {/* Height dimension on left */}
      <Line
        x1={10}
        y1={padding}
        x2={10}
        y2={padding + innerHeight}
        stroke={colors.textMuted}
        strokeWidth={0.8}
      />
      <Line x1={6} y1={padding} x2={14} y2={padding} stroke={colors.textMuted} strokeWidth={0.8} />
      <Line
        x1={6}
        y1={padding + innerHeight}
        x2={14}
        y2={padding + innerHeight}
        stroke={colors.textMuted}
        strokeWidth={0.8}
      />
      <SvgText
        x={10}
        y={padding + innerHeight / 2}
        textAnchor="middle"
        fontSize={9}
        fill={colors.textMuted}
        fontFamily="JetBrainsMono_500Medium"
        rotation={-90}
        originX={10}
        originY={padding + innerHeight / 2}
      >
        {sheet.sheetHeight}"
      </SvgText>

      {/* Placed pieces */}
      {sheet.placements.map((p, i) => {
        const x = padding + p.x * scale;
        const y = padding + p.y * scale;
        const w = p.width * scale;
        const h = p.height * scale;
        const fill = CUT_COLORS[i % CUT_COLORS.length];
        const cx = x + w / 2;
        const cy = y + h / 2;
        const minDim = Math.min(w, h);
        const labelSize = Math.max(7, Math.min(11, minDim / 4));
        const dimSize = Math.max(6, Math.min(9, minDim / 5));
        const showDims = minDim > 28;

        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={fill}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={0.8}
              opacity={0.85}
            />
            {/* Label */}
            <SvgText
              x={cx}
              y={showDims ? cy - dimSize * 0.4 : cy + labelSize * 0.35}
              textAnchor="middle"
              fontSize={labelSize}
              fontWeight="600"
              fill="#0f0f1a"
            >
              {p.label}
            </SvgText>
            {/* Dimensions */}
            {showDims && (
              <SvgText
                x={cx}
                y={cy + labelSize * 0.8}
                textAnchor="middle"
                fontSize={dimSize}
                fill="rgba(15,15,26,0.7)"
              >
                {p.originalWidth}" × {p.originalHeight}"
                {p.rotated ? " ↻" : ""}
              </SvgText>
            )}
            {/* Grain direction indicator */}
            {!p.rotated && p.edgeBanding && (
              <Line
                x1={x + 3}
                y1={y + h - 3}
                x2={x + 3}
                y2={y + 3}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            )}
          </G>
        );
      })}

      {/* Waste hatch pattern on unused area */}
      <Rect
        x={padding}
        y={padding}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={colors.border}
        strokeWidth={1.5}
        strokeDasharray="4 2"
        opacity={0.3}
      />
    </Svg>
  );
}

// ─── 1D Visualization ─────────────────────────────────────────────────────────

interface Stock1DVizProps {
  stockLength: number;
  cuts: { length: number; label: string; position: number }[];
  wasteLength: number;
  colors: ThemeColors;
}

function Stock1DViz({ stockLength, cuts, wasteLength, colors }: Stock1DVizProps) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          height: 40,
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
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 8,
                  color: "#0f0f1a",
                }}
              >
                {cut.label}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 7,
                  color: "rgba(15,15,26,0.6)",
                }}
              >
                {cut.length}"
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
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 8, color: colors.textMuted }}>
              {wasteLength}" waste
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Row Editors ──────────────────────────────────────────────────────────────

function Stock1DRowEditor({
  row,
  index,
  onChange,
  onRemove,
  colors,
}: {
  row: Stock1DRow;
  index: number;
  onChange: (id: string, field: keyof Stock1DRow, value: string) => void;
  onRemove: (id: string) => void;
  colors: ThemeColors;
}) {
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
          Stock #{index + 1}
        </Text>
        <Pressable onPress={() => onRemove(row.id)}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#ef4444" }}>
            Remove
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <CalculatorInput
            label="Length"
            value={row.length}
            onChangeText={(v) => onChange(row.id, "length", v)}
            unit="in"
            placeholder="96"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Cost"
            value={row.cost}
            onChangeText={(v) => onChange(row.id, "cost", v)}
            unit="$"
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Qty"
            value={row.quantity}
            onChangeText={(v) => onChange(row.id, "quantity", v)}
            placeholder="∞"
          />
        </View>
      </View>
      <CalculatorInput
        label="Label"
        value={row.label}
        onChangeText={(v) => onChange(row.id, "label", v)}
        placeholder="8ft board"
      />
    </View>
  );
}

function Stock2DRowEditor({
  row,
  index,
  onChange,
  onRemove,
  colors,
}: {
  row: Stock2DRow;
  index: number;
  onChange: (id: string, field: keyof Stock2DRow, value: string) => void;
  onRemove: (id: string) => void;
  colors: ThemeColors;
}) {
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
          Stock #{index + 1}
        </Text>
        <Pressable onPress={() => onRemove(row.id)}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#ef4444" }}>
            Remove
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Width"
            value={row.width}
            onChangeText={(v) => onChange(row.id, "width", v)}
            unit="in"
            placeholder="48"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Height"
            value={row.height}
            onChangeText={(v) => onChange(row.id, "height", v)}
            unit="in"
            placeholder="96"
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Material"
            value={row.material}
            onChangeText={(v) => onChange(row.id, "material", v)}
            placeholder="Any"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Cost"
            value={row.cost}
            onChangeText={(v) => onChange(row.id, "cost", v)}
            unit="$/sheet"
            placeholder="0"
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <CalculatorInput
            label="Label"
            value={row.label}
            onChangeText={(v) => onChange(row.id, "label", v)}
            placeholder="4x8 Plywood"
          />
        </View>
        <View style={{ flex: 1 }}>
          <CalculatorInput
            label="Qty"
            value={row.quantity}
            onChangeText={(v) => onChange(row.id, "quantity", v)}
            placeholder="∞"
          />
        </View>
      </View>
    </View>
  );
}

function Cut1DRowEditor({
  row,
  index,
  onChange,
  onRemove,
  colors,
}: {
  row: Cut1DRow;
  index: number;
  onChange: (id: string, field: keyof Cut1DRow, value: string) => void;
  onRemove: (id: string) => void;
  colors: ThemeColors;
}) {
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
          Cut #{index + 1}
        </Text>
        <Pressable onPress={() => onRemove(row.id)}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#ef4444" }}>
            Remove
          </Text>
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
          />
        </View>
      </View>
      <CalculatorInput
        label="Label"
        value={row.label}
        onChangeText={(v) => onChange(row.id, "label", v)}
        placeholder="Shelf"
      />
    </View>
  );
}

function Cut2DRowEditor({
  row,
  index,
  onChange,
  onRemove,
  colors,
  showEdgeBanding,
}: {
  row: Cut2DRow;
  index: number;
  onChange: (id: string, field: keyof Cut2DRow, value: string | boolean) => void;
  onRemove: (id: string) => void;
  colors: ThemeColors;
  showEdgeBanding: boolean;
}) {
  const hasEB = row.ebTop || row.ebBottom || row.ebLeft || row.ebRight;

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
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
          Cut #{index + 1}
        </Text>
        <Pressable onPress={() => onRemove(row.id)}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#ef4444" }}>
            Remove
          </Text>
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
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <CalculatorInput
            label="Label"
            value={row.label}
            onChangeText={(v) => onChange(row.id, "label", v)}
            placeholder="Panel"
          />
        </View>
        <View style={{ flex: 2 }}>
          <CalculatorInput
            label="Material"
            value={row.material}
            onChangeText={(v) => onChange(row.id, "material", v)}
            placeholder="Any"
          />
        </View>
      </View>
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
      {showEdgeBanding && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
            Edge Banding
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {(["ebTop", "ebRight", "ebBottom", "ebLeft"] as const).map((edge) => {
              const labels = { ebTop: "T", ebRight: "R", ebBottom: "B", ebLeft: "L" };
              const active = row[edge];
              return (
                <Pressable
                  key={edge}
                  onPress={() => onChange(row.id, edge, !active)}
                  style={{
                    width: 32,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? colors.primary : colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 11,
                      color: active ? "#0f0f1a" : colors.textMuted,
                    }}
                  >
                    {labels[edge]}
                  </Text>
                </Pressable>
              );
            })}
            {hasEB && (
              <View style={{ justifyContent: "center", marginLeft: 4 }}>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: colors.textMuted }}>
                  banded
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CutListScreen() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const svgWidth = screenWidth - 64;

  const [mode, setMode] = useState<Mode>("2d");

  // ── 1D State ──
  const [stocks1D, setStocks1D] = useState<Stock1DRow[]>([
    { id: makeId(), length: "96", label: "", cost: "", quantity: "" },
  ]);
  const [kerfWidth1D, setKerfWidth1D] = useState("0.125");
  const [cuts1D, setCuts1D] = useState<Cut1DRow[]>([
    { id: makeId(), length: "", label: "", quantity: "1" },
  ]);
  const [result1D, setResult1D] = useState<CutList1DResult | null>(null);

  // ── 2D State ──
  const [stocks2D, setStocks2D] = useState<Stock2DRow[]>([
    { id: makeId(), width: "48", height: "96", label: "", material: "", cost: "", quantity: "" },
  ]);
  const [kerfWidth2D, setKerfWidth2D] = useState("0.125");
  const [ebThickness, setEbThickness] = useState("0.02");
  const [showEdgeBanding, setShowEdgeBanding] = useState(false);
  const [cuts2D, setCuts2D] = useState<Cut2DRow[]>([
    {
      id: makeId(),
      width: "",
      height: "",
      label: "",
      quantity: "1",
      grainLocked: false,
      material: "",
      ebTop: false,
      ebBottom: false,
      ebLeft: false,
      ebRight: false,
    },
  ]);
  const [result2D, setResult2D] = useState<CutList2DResult | null>(null);

  // ── 1D Handlers ──

  const updateStock1D = useCallback((id: string, field: keyof Stock1DRow, value: string) => {
    setStocks1D((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const removeStock1D = useCallback((id: string) => {
    setStocks1D((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const update1DRow = useCallback((id: string, field: keyof Cut1DRow, value: string) => {
    setCuts1D((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const remove1DRow = useCallback((id: string) => {
    setCuts1D((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const optimize1D = () => {
    const stocks: StockPiece1D[] = stocks1D
      .map((r) => ({
        length: parseFloat(r.length),
        label: r.label || undefined,
        cost: parseFloat(r.cost) || undefined,
        quantity: parseInt(r.quantity) || undefined,
      }))
      .filter((s) => s.length > 0);

    if (stocks.length === 0) {
      Alert.alert("Invalid Input", "Add at least one valid stock length.");
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

    try {
      const res = optimizeCutList1D({ cuts: validCuts, stocks, kerfWidth: kerf });
      setResult1D(res);
      if (res.unplacedPieces.length > 0) {
        Alert.alert(
          "Warning",
          `${res.unplacedPieces.length} piece(s) could not be placed: ${res.unplacedPieces.join(", ")}`,
        );
      }
    } catch {
      Alert.alert("Error", "Optimization failed. Check your inputs.");
    }
  };

  // ── 2D Handlers ──

  const updateStock2D = useCallback((id: string, field: keyof Stock2DRow, value: string) => {
    setStocks2D((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const removeStock2D = useCallback((id: string) => {
    setStocks2D((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const update2DRow = useCallback((id: string, field: keyof Cut2DRow, value: string | boolean) => {
    setCuts2D((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const remove2DRow = useCallback((id: string) => {
    setCuts2D((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const optimize2D = () => {
    const stocks: StockSheet[] = stocks2D
      .map((r) => ({
        width: parseFloat(r.width),
        height: parseFloat(r.height),
        label: r.label || undefined,
        material: r.material || undefined,
        cost: parseFloat(r.cost) || undefined,
        quantity: parseInt(r.quantity) || undefined,
      }))
      .filter((s) => s.width > 0 && s.height > 0);

    if (stocks.length === 0) {
      Alert.alert("Invalid Input", "Add at least one valid stock sheet.");
      return;
    }

    const validCuts: CutPiece2D[] = cuts2D
      .map((r) => {
        const hasEB = r.ebTop || r.ebBottom || r.ebLeft || r.ebRight;
        return {
          width: parseFloat(r.width),
          height: parseFloat(r.height),
          label: r.label || undefined,
          quantity: parseInt(r.quantity) || 1,
          grainLocked: r.grainLocked,
          material: r.material || undefined,
          edgeBanding: hasEB
            ? { top: r.ebTop, bottom: r.ebBottom, left: r.ebLeft, right: r.ebRight }
            : undefined,
        };
      })
      .filter((c) => c.width > 0 && c.height > 0);

    if (validCuts.length === 0) {
      Alert.alert("Invalid Input", "Add at least one cut with valid dimensions.");
      return;
    }

    const kerf = parseFloat(kerfWidth2D) || 0;
    const ebT = showEdgeBanding ? parseFloat(ebThickness) || 0 : 0;

    try {
      const res = optimizeCutList2D({
        cuts: validCuts,
        stocks,
        kerfWidth: kerf,
        edgeBandingThickness: ebT,
      });
      setResult2D(res);
      if (res.unplacedPieces.length > 0) {
        Alert.alert(
          "Warning",
          `${res.unplacedPieces.length} piece(s) could not be placed: ${res.unplacedPieces.join(", ")}`,
        );
      }
    } catch {
      Alert.alert("Error", "Optimization failed. Check your inputs.");
    }
  };

  // ── Save ──

  const handleSave = () => {
    if (mode === "1d" && !result1D) return Alert.alert("No Results", "Run optimize first.");
    if (mode === "2d" && !result2D) return Alert.alert("No Results", "Run optimize first.");
    try {
      CalculatorService.save({
        module: "woodworking",
        calculatorType: "cut-list",
        inputsJson: mode === "1d" ? { mode, stocks1D, cuts: cuts1D } : { mode, stocks2D, cuts: cuts2D },
        outputsJson: (mode === "1d" ? result1D : result2D)!,
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

  // ── Render ──

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

        <FilterBar options={MODE_OPTIONS} selected={mode} onSelect={(v) => setMode(v as Mode)} />

        {/* ═══════════════ 1D MODE ═══════════════ */}
        {mode === "1d" && (
          <>
            <SectionLabel text="Available Stock" colors={colors} />
            {stocks1D.map((row, i) => (
              <Stock1DRowEditor
                key={row.id}
                row={row}
                index={i}
                onChange={updateStock1D}
                onRemove={removeStock1D}
                colors={colors}
              />
            ))}
            <AddButton
              label="+ Add Stock Size"
              onPress={() =>
                setStocks1D((prev) => [
                  ...prev,
                  { id: makeId(), length: "", label: "", cost: "", quantity: "" },
                ])
              }
              colors={colors}
            />

            <CalculatorInput
              label="Kerf Width"
              value={kerfWidth1D}
              onChangeText={setKerfWidth1D}
              unit="in"
              placeholder="0.125"
            />

            <SectionLabel text="Cut Pieces" colors={colors} />
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
            <AddButton
              label="+ Add Cut"
              onPress={() =>
                setCuts1D((prev) => [
                  ...prev,
                  { id: makeId(), length: "", label: "", quantity: "1" },
                ])
              }
              colors={colors}
            />

            <OptimizeButton onPress={optimize1D} colors={colors} />

            {result1D && (
              <>
                <ResultCard
                  title="Summary"
                  results={[
                    { label: "Stock pieces needed", value: `${result1D.totalStockNeeded}`, unit: "pcs", highlight: true },
                    { label: "Total waste", value: `${result1D.wastePercent}%` },
                    { label: "Waste length", value: `${result1D.totalWaste}`, unit: "in" },
                    { label: "Total cuts", value: `${result1D.totalCutCount}` },
                    ...(result1D.totalCost !== null ? [{ label: "Total cost", value: `$${result1D.totalCost}` }] : []),
                  ]}
                />

                <SectionLabel text={`Layout (${result1D.stockPieces.length} pieces)`} colors={colors} />

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
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary }}>
                        {sp.stockLabel}
                      </Text>
                      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>
                        {sp.wasteLength}" waste
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
                        <View key={j} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: CUT_COLORS[j % CUT_COLORS.length] }} />
                          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textSecondary }}>
                            {cut.label} ({cut.length}")
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

        {/* ═══════════════ 2D MODE ═══════════════ */}
        {mode === "2d" && (
          <>
            <SectionLabel text="Available Stock Sheets" colors={colors} />
            {stocks2D.map((row, i) => (
              <Stock2DRowEditor
                key={row.id}
                row={row}
                index={i}
                onChange={updateStock2D}
                onRemove={removeStock2D}
                colors={colors}
              />
            ))}
            <AddButton
              label="+ Add Stock Sheet"
              onPress={() =>
                setStocks2D((prev) => [
                  ...prev,
                  { id: makeId(), width: "", height: "", label: "", material: "", cost: "", quantity: "" },
                ])
              }
              colors={colors}
            />

            <SectionLabel text="Settings" colors={colors} />
            <CalculatorInput
              label="Kerf Width (blade thickness)"
              value={kerfWidth2D}
              onChangeText={setKerfWidth2D}
              unit="in"
              placeholder="0.125"
            />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 8 }}>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textPrimary }}>
                Edge Banding
              </Text>
              <Switch
                value={showEdgeBanding}
                onValueChange={setShowEdgeBanding}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            {showEdgeBanding && (
              <CalculatorInput
                label="Banding Thickness"
                value={ebThickness}
                onChangeText={setEbThickness}
                unit="in"
                placeholder="0.02"
              />
            )}

            <SectionLabel text="Cut Pieces" colors={colors} />
            {cuts2D.map((row, i) => (
              <Cut2DRowEditor
                key={row.id}
                row={row}
                index={i}
                onChange={update2DRow}
                onRemove={remove2DRow}
                colors={colors}
                showEdgeBanding={showEdgeBanding}
              />
            ))}
            <AddButton
              label="+ Add Cut"
              onPress={() =>
                setCuts2D((prev) => [
                  ...prev,
                  {
                    id: makeId(),
                    width: "",
                    height: "",
                    label: "",
                    quantity: "1",
                    grainLocked: false,
                    material: "",
                    ebTop: false,
                    ebBottom: false,
                    ebLeft: false,
                    ebRight: false,
                  },
                ])
              }
              colors={colors}
            />

            <OptimizeButton onPress={optimize2D} colors={colors} />

            {result2D && (
              <>
                <ResultCard
                  title="Summary"
                  results={[
                    { label: "Sheets needed", value: `${result2D.totalSheetsNeeded}`, unit: "sheets", highlight: true },
                    { label: "Total waste", value: `${result2D.totalWastePercent}%` },
                    { label: "Total cuts", value: `${result2D.totalCutCount}` },
                    { label: "Total cut length", value: `${result2D.totalCutLength}`, unit: "in" },
                    ...(result2D.totalCost !== null ? [{ label: "Total cost", value: `$${result2D.totalCost}` }] : []),
                  ]}
                />

                <SectionLabel text={`Sheet Layouts (${result2D.sheets.length})`} colors={colors} />

                {result2D.sheets.map((sheet, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.textPrimary }}>
                        Sheet #{i + 1}
                      </Text>
                      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textMuted }}>
                        {sheet.wastePercent}% waste
                      </Text>
                    </View>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textSecondary, marginBottom: 8 }}>
                      {sheet.stockLabel}
                      {sheet.stockMaterial ? ` • ${sheet.stockMaterial}` : ""}
                      {sheet.cost !== null ? ` • $${sheet.cost}` : ""}
                    </Text>

                    <Sheet2DViz sheet={sheet} svgWidth={svgWidth} colors={colors} />

                    {/* Legend */}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {sheet.placements.map((p, j) => (
                        <View key={j} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: CUT_COLORS[j % CUT_COLORS.length] }} />
                          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: colors.textSecondary }}>
                            {p.label} ({p.originalWidth}"×{p.originalHeight}")
                            {p.rotated ? " ↻" : ""}
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
          onAddToQuote={() => Alert.alert("Coming Soon", "Quote feature coming soon.")}
          onLogToProject={() => Alert.alert("Coming Soon", "Project logging coming soon.")}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function SectionLabel({ text, colors }: { text: string; colors: ThemeColors }) {
  return (
    <Text
      className="text-[12px] uppercase tracking-wider mb-2 mt-4"
      style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
    >
      {text}
    </Text>
  );
}

function AddButton({ label, onPress, colors }: { label: string; onPress: () => void; colors: ThemeColors }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: "dashed",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

function OptimizeButton({ onPress, colors }: { onPress: () => void; colors: ThemeColors }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 4,
        marginBottom: 16,
      }}
    >
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#0f0f1a" }}>
        Optimize
      </Text>
    </Pressable>
  );
}
