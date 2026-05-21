import { useState, useEffect, useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useProjects } from "../../../../src/core/hooks/useProjects";
import { useClients } from "../../../../src/core/hooks/useClients";
import { StatusBadge } from "../../../../src/design-system/components/StatusBadge";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";
import { CalculatorService } from "../../../../src/core/services/CalculatorService";
import { JournalService } from "../../../../src/core/services/JournalService";
import { InventoryService } from "../../../../src/core/services/InventoryService";
import { QuoteService } from "../../../../src/core/services/QuoteService";
import { InvoiceService } from "../../../../src/core/services/InvoiceService";
import type {
  CalculatorResult,
  JournalEntry,
  InventoryDeduction,
  Quote,
  Invoice,
  ProjectStatus,
} from "../../../../src/core/types";

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Materials", value: "materials" },
  { label: "Calcs", value: "calculators" },
  { label: "Journal", value: "journal" },
  { label: "Financials", value: "financials" },
];

const STATUS_FLOW: ProjectStatus[] = [
  "idea",
  "design",
  "in-progress",
  "finishing",
  "complete",
  "delivered",
  "archived",
];

const MOOD_MAP: Record<string, string> = {
  great: "\u{1F525}",
  good: "\u{1F44D}",
  okay: "\u{1F610}",
  rough: "\u{1F613}",
};

const CALC_LABELS: Record<string, string> = {
  board_foot: "Board Foot",
  power_speed: "Power/Speed",
  kerf_adjust: "Kerf Adjust",
  stepover: "Stepover",
  feed_speed: "Feed & Speed",
  layer_height: "Layer Height",
  print_cost: "Print Cost",
  resin_ratio: "Resin Ratio",
  mold_volume: "Mold Volume",
  colorant_mix: "Colorant Mix",
  heat_treat: "Heat Treat",
  grind_angle: "Grind Angle",
  handle_scale: "Handle Scale",
  leather_area: "Leather Area",
  thread_stitch: "Thread/Stitch",
  wax_volume: "Wax Volume",
  fragrance_load: "Fragrance Load",
  wick_sizing: "Wick Sizing",
  lye_calculator: "Lye Calculator",
  batch_scaler: "Batch Scaler",
};

export default function ProjectDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { projects, update, remove } = useProjects();
  const { clients } = useClients();
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);

  const project = projects.find((p) => p.id === id);

  const [editName, setEditName] = useState(project?.name ?? "");
  const [editBudget, setEditBudget] = useState(project?.budget?.toString() ?? "");
  const [editEstHours, setEditEstHours] = useState(project?.estimatedHours?.toString() ?? "");
  const [editNotes, setEditNotes] = useState(project?.notes ?? "");

  const [calcs, setCalcs] = useState<CalculatorResult[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [deductions, setDeductions] = useState<InventoryDeduction[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!id) return;
    try { setCalcs(CalculatorService.getByProject(id)); } catch {}
    try { setJournalEntries(JournalService.getByProject(id)); } catch {}
    try { setDeductions(InventoryService.getConsumptionByProject(id)); } catch {}
    try {
      const allQuotes = QuoteService.getAll().filter((q) => q.projectId === id);
      setQuotes(allQuotes);
    } catch {}
    try {
      const allInvoices = InvoiceService.getAll().filter((i) => i.projectId === id);
      setInvoices(allInvoices);
    } catch {}
  }, [id, activeTab]);

  const clientName = useMemo(() => {
    if (!project?.clientId) return undefined;
    const c = clients.find((cl) => cl.id === project.clientId);
    return c?.fullName;
  }, [project?.clientId, clients]);

  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[16px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
          >
            Project not found
          </Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text style={{ fontFamily: "Inter_500Medium", color: colors.primary }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleStatusChange = (newStatus: ProjectStatus) => {
    const updates: Partial<typeof project> = { status: newStatus };
    if (newStatus === "in-progress" && !project.startDate) {
      updates.startDate = new Date().toISOString().split("T")[0];
    }
    if (newStatus === "complete" || newStatus === "delivered") {
      updates.completedDate = new Date().toISOString().split("T")[0];
    }
    update(project.id, updates);
  };

  const handleSaveEdit = () => {
    update(project.id, {
      name: editName.trim() || project.name,
      budget: editBudget ? parseFloat(editBudget) : undefined,
      estimatedHours: editEstHours ? parseFloat(editEstHours) : undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(project.name);
    setEditBudget(project.budget?.toString() ?? "");
    setEditEstHours(project.estimatedHours?.toString() ?? "");
    setEditNotes(project.notes ?? "");
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Project", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove(project.id);
          router.back();
        },
      },
    ]);
  };

  const materialCost = useMemo(() => {
    let total = 0;
    for (const ded of deductions) {
      try {
        const items = InventoryService.getAll?.() || [];
        const item = items.find((i: any) => i.id === ded.inventoryItemId);
        if (item?.unitCost) total += ded.quantityDeducted * item.unitCost;
      } catch {}
    }
    return total;
  }, [deductions]);

  const invoiceTotal = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      try {
        const { lineItems } = InvoiceService.getWithLineItems(inv.id);
        return sum + lineItems.reduce((s, li) => s + li.lineTotal, 0);
      } catch {
        return sum;
      }
    }, 0);
  }, [invoices]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="text-[22px] flex-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            numberOfLines={2}
          >
            {project.name}
          </Text>
          <StatusBadge status={project.status} />
        </View>

        {clientName && (
          <Text
            className="text-[13px] mb-1"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            Client: {clientName}
          </Text>
        )}

        {project.disciplineTags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {project.disciplineTags.map((tag) => (
              <View
                key={tag}
                className="rounded-full px-2 py-1"
                style={{ backgroundColor: colors.surfaceElevated }}
              >
                <Text
                  className="text-[11px]"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <FilterBar options={TABS} selected={activeTab} onSelect={setActiveTab} />

        {/* ======== OVERVIEW ======== */}
        {activeTab === "overview" && !editing && (
          <View className="mt-4">
            <InfoRow label="Status" value={project.status} colors={colors} />
            {project.budget != null && (
              <InfoRow label="Budget" value={`$${project.budget.toFixed(2)}`} colors={colors} />
            )}
            {project.estimatedHours != null && (
              <InfoRow label="Estimated" value={`${project.estimatedHours} hrs`} colors={colors} />
            )}
            <InfoRow label="Logged" value={`${project.actualHours} hrs`} colors={colors} />
            {project.startDate && <InfoRow label="Started" value={project.startDate} colors={colors} />}
            {project.targetDate && <InfoRow label="Target" value={project.targetDate} colors={colors} />}
            {project.completedDate && (
              <InfoRow label="Completed" value={project.completedDate} colors={colors} />
            )}

            {project.notes && (
              <View className="mt-4">
                <Text
                  className="text-[12px] uppercase tracking-wider mb-2"
                  style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                >
                  Notes
                </Text>
                <Text
                  className="text-[14px] leading-5"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textPrimary }}
                >
                  {project.notes}
                </Text>
              </View>
            )}

            {/* Status advance */}
            <Text
              className="text-[12px] uppercase tracking-wider mb-2 mt-6"
              style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
            >
              Move Status
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {STATUS_FLOW.filter((s) => s !== project.status).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => handleStatusChange(s)}
                  className="rounded-full px-3 py-2"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    className="text-[12px] capitalize"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                  >
                    {s.replace("-", " ")}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <Pressable
              onPress={() => setEditing(true)}
              className="rounded-xl py-4 items-center mt-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-[16px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
              >
                Edit Project
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              className="rounded-xl py-4 items-center mt-3"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: "#ef4444",
              }}
            >
              <Text
                className="text-[16px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#ef4444" }}
              >
                Delete Project
              </Text>
            </Pressable>

            <Pressable onPress={() => router.back()} className="items-center mt-4 py-3">
              <Text
                className="text-[14px]"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Back
              </Text>
            </Pressable>
          </View>
        )}

        {/* ======== OVERVIEW EDIT MODE ======== */}
        {activeTab === "overview" && editing && (
          <View className="mt-4">
            <Text
              className="text-[14px] mb-1"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Project Name
            </Text>
            <TextInput
              className="rounded-lg px-4 py-3 mb-4 text-[16px]"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: "Inter_400Regular",
              }}
              value={editName}
              onChangeText={setEditName}
              placeholder="Project name"
              placeholderTextColor={colors.textMuted}
            />

            <Text
              className="text-[14px] mb-1"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Budget ($)
            </Text>
            <TextInput
              className="rounded-lg px-4 py-3 mb-4 text-[16px]"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: "JetBrainsMono_500Medium",
              }}
              value={editBudget}
              onChangeText={setEditBudget}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            <Text
              className="text-[14px] mb-1"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Estimated Hours
            </Text>
            <TextInput
              className="rounded-lg px-4 py-3 mb-4 text-[16px]"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: "JetBrainsMono_500Medium",
              }}
              value={editEstHours}
              onChangeText={setEditEstHours}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            <Text
              className="text-[14px] mb-1"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textMuted }}
            >
              Notes
            </Text>
            <TextInput
              className="rounded-lg px-4 py-3 mb-4 text-[16px]"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontFamily: "Inter_400Regular",
                minHeight: 100,
                textAlignVertical: "top",
              }}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Project notes..."
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <Pressable
              onPress={handleSaveEdit}
              className="rounded-xl py-4 items-center mt-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-[16px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#0f0f1a" }}
              >
                Save Changes
              </Text>
            </Pressable>

            <Pressable onPress={handleCancelEdit} className="items-center mt-4 py-3">
              <Text
                className="text-[14px]"
                style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        )}

        {/* ======== MATERIALS ======== */}
        {activeTab === "materials" && (
          <View className="mt-4">
            {deductions.length === 0 ? (
              <EmptyTab
                message="No materials consumed yet"
                hint="Deduct inventory items and link them to this project"
                colors={colors}
              />
            ) : (
              <>
                <View
                  className="flex-row justify-between py-2 mb-2"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text
                    className="text-[11px] uppercase tracking-wider"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                  >
                    Material
                  </Text>
                  <Text
                    className="text-[11px] uppercase tracking-wider"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                  >
                    Qty / Cost
                  </Text>
                </View>
                {deductions.map((ded) => (
                  <DeductionRow key={ded.id} deduction={ded} colors={colors} />
                ))}
                <View
                  className="flex-row justify-between py-3 mt-2"
                  style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                >
                  <Text
                    className="text-[14px]"
                    style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
                  >
                    Total Material Cost
                  </Text>
                  <Text
                    className="text-[14px]"
                    style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
                  >
                    ${materialCost.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* ======== CALCULATORS ======== */}
        {activeTab === "calculators" && (
          <View className="mt-4">
            {calcs.length === 0 ? (
              <EmptyTab
                message="No calculator results linked"
                hint="Save calculator results and link them to this project"
                colors={colors}
              />
            ) : (
              calcs.map((calc) => (
                <CalcResultCard key={calc.id} calc={calc} colors={colors} />
              ))
            )}
          </View>
        )}

        {/* ======== JOURNAL ======== */}
        {activeTab === "journal" && (
          <View className="mt-4">
            {journalEntries.length === 0 ? (
              <EmptyTab
                message="No journal entries yet"
                hint="Tag journal entries with this project to see them here"
                colors={colors}
              />
            ) : (
              <>
                {journalEntries.map((entry) => (
                  <Pressable
                    key={entry.id}
                    onPress={() => router.push(`/shop/journal/${entry.id}`)}
                    className="rounded-xl p-4 mb-3"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text
                        className="text-[13px]"
                        style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
                      >
                        {entry.entryDate}
                      </Text>
                      {entry.mood && (
                        <Text className="text-[16px]">{MOOD_MAP[entry.mood] ?? ""}</Text>
                      )}
                    </View>
                    <Text
                      className="text-[15px] mb-1"
                      style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
                      numberOfLines={1}
                    >
                      {entry.title || "Untitled"}
                    </Text>
                    {entry.bodyRichText && (
                      <Text
                        className="text-[13px]"
                        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                        numberOfLines={2}
                      >
                        {entry.bodyRichText}
                      </Text>
                    )}
                    {entry.hoursLogged != null && entry.hoursLogged > 0 && (
                      <Text
                        className="text-[12px] mt-2"
                        style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
                      >
                        {entry.hoursLogged} hrs logged
                      </Text>
                    )}
                  </Pressable>
                ))}
                <View
                  className="rounded-lg p-3 mt-1"
                  style={{ backgroundColor: colors.surfaceElevated }}
                >
                  <Text
                    className="text-[13px] text-center"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
                  >
                    {journalEntries.reduce((sum, e) => sum + (e.hoursLogged ?? 0), 0).toFixed(1)} total
                    hours across {journalEntries.length} entries
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* ======== FINANCIALS ======== */}
        {activeTab === "financials" && (
          <View className="mt-4">
            {quotes.length === 0 && invoices.length === 0 ? (
              <EmptyTab
                message="No quotes or invoices linked"
                hint="Create a quote or invoice and assign it to this project"
                colors={colors}
              />
            ) : (
              <>
                {/* Summary card */}
                <View
                  className="rounded-xl p-4 mb-4"
                  style={{
                    backgroundColor: colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    className="text-[12px] uppercase tracking-wider mb-3"
                    style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                  >
                    Financial Summary
                  </Text>
                  <View className="flex-row justify-between mb-2">
                    <Text
                      className="text-[13px]"
                      style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                    >
                      Material Cost
                    </Text>
                    <Text
                      className="text-[13px]"
                      style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
                    >
                      ${materialCost.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text
                      className="text-[13px]"
                      style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                    >
                      Invoiced
                    </Text>
                    <Text
                      className="text-[13px]"
                      style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
                    >
                      ${invoiceTotal.toFixed(2)}
                    </Text>
                  </View>
                  {project.budget != null && (
                    <View className="flex-row justify-between mb-2">
                      <Text
                        className="text-[13px]"
                        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                      >
                        Budget
                      </Text>
                      <Text
                        className="text-[13px]"
                        style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
                      >
                        ${project.budget.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View
                    className="flex-row justify-between pt-2"
                    style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                  >
                    <Text
                      className="text-[14px]"
                      style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
                    >
                      Margin
                    </Text>
                    <Text
                      className="text-[14px]"
                      style={{
                        fontFamily: "JetBrainsMono_700Bold",
                        color: invoiceTotal - materialCost >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      ${(invoiceTotal - materialCost).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Quotes */}
                {quotes.length > 0 && (
                  <>
                    <Text
                      className="text-[12px] uppercase tracking-wider mb-2"
                      style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                    >
                      Quotes ({quotes.length})
                    </Text>
                    {quotes.map((q) => (
                      <Pressable
                        key={q.id}
                        onPress={() => router.push(`/shop/quotes/${q.id}`)}
                        className="rounded-xl p-4 mb-2"
                        style={{
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <View className="flex-row justify-between items-center">
                          <Text
                            className="text-[15px]"
                            style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
                          >
                            {q.quoteNumber}
                          </Text>
                          <StatusBadge status={q.status} />
                        </View>
                        <Text
                          className="text-[12px] mt-1"
                          style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
                        >
                          Created {q.createdAt.split("T")[0]}
                        </Text>
                      </Pressable>
                    ))}
                  </>
                )}

                {/* Invoices */}
                {invoices.length > 0 && (
                  <>
                    <Text
                      className="text-[12px] uppercase tracking-wider mb-2 mt-4"
                      style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
                    >
                      Invoices ({invoices.length})
                    </Text>
                    {invoices.map((inv) => {
                      let balance = 0;
                      try { balance = InvoiceService.getBalanceDue(inv.id); } catch {}
                      return (
                        <Pressable
                          key={inv.id}
                          onPress={() => router.push(`/shop/invoices/${inv.id}`)}
                          className="rounded-xl p-4 mb-2"
                          style={{
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor:
                              inv.status === "overdue" ? "#ef4444" : colors.border,
                          }}
                        >
                          <View className="flex-row justify-between items-center">
                            <Text
                              className="text-[15px]"
                              style={{
                                fontFamily: "Inter_600SemiBold",
                                color: colors.textPrimary,
                              }}
                            >
                              {inv.invoiceNumber}
                            </Text>
                            <StatusBadge status={inv.status} />
                          </View>
                          <View className="flex-row justify-between mt-1">
                            <Text
                              className="text-[12px]"
                              style={{
                                fontFamily: "Inter_400Regular",
                                color: colors.textMuted,
                              }}
                            >
                              Due {inv.dueDate ?? "—"}
                            </Text>
                            {balance > 0 && (
                              <Text
                                className="text-[12px]"
                                style={{
                                  fontFamily: "JetBrainsMono_500Medium",
                                  color: "#ef4444",
                                }}
                              >
                                ${balance.toFixed(2)} due
                              </Text>
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View
      className="flex-row justify-between py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <Text
        className="text-[13px]"
        style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
      >
        {label}
      </Text>
      <Text
        className="text-[14px]"
        style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
      >
        {value}
      </Text>
    </View>
  );
}

function EmptyTab({
  message,
  hint,
  colors,
}: {
  message: string;
  hint: string;
  colors: any;
}) {
  return (
    <View
      className="rounded-xl p-6 items-center justify-center"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 120,
      }}
    >
      <Text
        className="text-[14px] mb-1"
        style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
      >
        {message}
      </Text>
      <Text
        className="text-[12px] text-center"
        style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
      >
        {hint}
      </Text>
    </View>
  );
}

function DeductionRow({
  deduction,
  colors,
}: {
  deduction: InventoryDeduction;
  colors: any;
}) {
  let itemName = "Unknown Item";
  let unitCost = 0;
  try {
    const allItems = InventoryService.getAll?.() || [];
    const item = allItems.find((i: any) => i.id === deduction.inventoryItemId);
    if (item) {
      itemName = item.name;
      unitCost = item.unitCost ?? 0;
    }
  } catch {}

  const lineCost = deduction.quantityDeducted * unitCost;

  return (
    <View
      className="flex-row justify-between py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-[14px]"
          style={{ fontFamily: "Inter_500Medium", color: colors.textPrimary }}
          numberOfLines={1}
        >
          {itemName}
        </Text>
        {deduction.notes && (
          <Text
            className="text-[11px] mt-1"
            style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            numberOfLines={1}
          >
            {deduction.notes}
          </Text>
        )}
      </View>
      <View className="items-end">
        <Text
          className="text-[13px]"
          style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
        >
          {deduction.quantityDeducted} {deduction.unit}
        </Text>
        {unitCost > 0 && (
          <Text
            className="text-[11px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.primary }}
          >
            ${lineCost.toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );
}

function CalcResultCard({
  calc,
  colors,
}: {
  calc: CalculatorResult;
  colors: any;
}) {
  const outputs = calc.outputsJson as Record<string, unknown>;
  const displayLabel =
    calc.label || CALC_LABELS[calc.calculatorType] || calc.calculatorType;

  const previewEntries = Object.entries(outputs).slice(0, 3);

  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="text-[15px]"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          {displayLabel}
        </Text>
        <View className="rounded-full px-2 py-1" style={{ backgroundColor: colors.surfaceElevated }}>
          <Text
            className="text-[10px]"
            style={{ fontFamily: "Inter_500Medium", color: colors.textMuted }}
          >
            {calc.module}
          </Text>
        </View>
      </View>
      {previewEntries.map(([key, val]) => (
        <View key={key} className="flex-row justify-between py-1">
          <Text
            className="text-[12px]"
            style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
          >
            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
          </Text>
          <Text
            className="text-[12px]"
            style={{ fontFamily: "JetBrainsMono_500Medium", color: colors.textPrimary }}
          >
            {typeof val === "number" ? val.toFixed(2) : String(val ?? "—")}
          </Text>
        </View>
      ))}
      <Text
        className="text-[10px] mt-2"
        style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
      >
        {calc.createdAt.split("T")[0]}
      </Text>
    </View>
  );
}
