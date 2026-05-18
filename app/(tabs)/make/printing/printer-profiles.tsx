import { useState, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import {
  getAllProfiles,
  createProfile,
  deleteProfile,
  setActiveProfile,
  type PrinterProfile,
} from "../../../../src/modules/printing/data/printerProfiles";
import { CalculatorInput } from "../../../../src/design-system/components/CalculatorInput";
import { FilterBar } from "../../../../src/design-system/components/FilterBar";
import { useTheme } from "../../../../src/design-system/hooks/useTheme";

const EXTRUDER_OPTIONS = [
  { label: "Direct", value: "direct" },
  { label: "Bowden", value: "bowden" },
];

const emptyForm = () => ({
  name: "",
  buildVolumeX: "220",
  buildVolumeY: "220",
  buildVolumeZ: "250",
  nozzleDiameter: "0.4",
  maxVolumetricFlow: "15",
  extruderType: "direct",
  bowdenLengthMm: "",
  defaultSpeedMms: "60",
  defaultTravelMms: "120",
  stepsPerMmE: "",
});

export default function PrinterProfilesScreen() {
  const { colors } = useTheme();
  const [profiles, setProfiles] = useState<PrinterProfile[]>(() => {
    try { return getAllProfiles(); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const reload = useCallback(() => {
    try { setProfiles(getAllProfiles()); } catch { setProfiles([]); }
  }, []);

  const handleSetActive = (id: string) => {
    try {
      setActiveProfile(id);
      reload();
    } catch {
      Alert.alert("Error", "Failed to set active profile.");
    }
  };

  const handleDelete = (profile: PrinterProfile) => {
    Alert.alert(
      "Delete Profile",
      `Delete "${profile.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            try {
              deleteProfile(profile.id);
              reload();
            } catch {
              Alert.alert("Error", "Failed to delete profile.");
            }
          },
        },
      ]
    );
  };

  const handleCreate = () => {
    const x = parseFloat(form.buildVolumeX);
    const y = parseFloat(form.buildVolumeY);
    const z = parseFloat(form.buildVolumeZ);
    const noz = parseFloat(form.nozzleDiameter);
    if (!form.name.trim() || !x || !y || !z || !noz) {
      Alert.alert("Missing Fields", "Name and build volume and nozzle diameter are required.");
      return;
    }
    try {
      createProfile({
        name: form.name.trim(),
        buildVolumeX: x,
        buildVolumeY: y,
        buildVolumeZ: z,
        nozzleDiameter: noz,
        maxVolumetricFlow: parseFloat(form.maxVolumetricFlow) || null,
        extruderType: form.extruderType,
        bowdenLengthMm: form.extruderType === "bowden" ? (parseFloat(form.bowdenLengthMm) || null) : null,
        defaultSpeedMms: parseFloat(form.defaultSpeedMms) || null,
        defaultTravelMms: parseFloat(form.defaultTravelMms) || null,
        stepsPerMmX: null,
        stepsPerMmY: null,
        stepsPerMmZ: null,
        stepsPerMmE: parseFloat(form.stepsPerMmE) || null,
        source: "user",
        createdAt: new Date().toISOString(),
      });
      setForm(emptyForm());
      setShowForm(false);
      reload();
      Alert.alert("Saved", "Printer profile created.");
    } catch {
      Alert.alert("Error", "Failed to create profile.");
    }
  };

  const activeId = useMemo(() => profiles.find((p) => p.isActive)?.id, [profiles]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-[22px] mb-1"
          style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
        >
          My Printers
        </Text>
        <Text
          className="text-[13px] mb-4"
          style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
        >
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
          {activeId ? " · 1 active" : ""}
        </Text>

        {/* Profile list */}
        {profiles.map((profile) => (
          <View
            key={profile.id}
            className="rounded-xl p-4 mb-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: profile.isActive ? 2 : 1,
              borderColor: profile.isActive ? colors.primary : colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-[15px] flex-1 mr-2"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
                numberOfLines={1}
              >
                {profile.name}
                {profile.isActive ? (
                  <Text style={{ color: colors.primary }}> ✓</Text>
                ) : null}
              </Text>
              {profile.isActive ? (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${colors.primary}22` }}
                >
                  <Text
                    className="text-[11px]"
                    style={{ fontFamily: "Inter_500Medium", color: colors.primary }}
                  >
                    Active
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
              <Text
                className="text-[13px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
              >
                {profile.buildVolumeX}×{profile.buildVolumeY}×{profile.buildVolumeZ}mm
              </Text>
              <Text
                className="text-[13px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
              >
                {profile.nozzleDiameter}mm nozzle
              </Text>
              <Text
                className="text-[13px]"
                style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
              >
                {profile.extruderType}
              </Text>
              {profile.maxVolumetricFlow !== null ? (
                <Text
                  className="text-[13px]"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                >
                  {profile.maxVolumetricFlow} mm³/s max
                </Text>
              ) : null}
              {profile.defaultSpeedMms !== null ? (
                <Text
                  className="text-[13px]"
                  style={{ fontFamily: "Inter_400Regular", color: colors.textSecondary }}
                >
                  {profile.defaultSpeedMms}mm/s print
                </Text>
              ) : null}
            </View>

            <View className="flex-row gap-2 mt-3">
              {!profile.isActive ? (
                <Pressable
                  onPress={() => handleSetActive(profile.id)}
                  className="flex-1 rounded-lg py-2 items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_500Medium", color: "#fff" }}
                  >
                    Set Active
                  </Text>
                </Pressable>
              ) : null}
              {profile.source !== "built-in" ? (
                <Pressable
                  onPress={() => handleDelete(profile)}
                  className="rounded-lg py-2 px-4 items-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.error ?? "#ef4444",
                  }}
                >
                  <Text
                    className="text-[13px]"
                    style={{ fontFamily: "Inter_500Medium", color: colors.error ?? "#ef4444" }}
                  >
                    Delete
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}

        {profiles.length === 0 ? (
          <View
            className="rounded-xl p-6 mb-4 items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text
              className="text-[14px]"
              style={{ fontFamily: "Inter_400Regular", color: colors.textMuted }}
            >
              No printer profiles yet. Add one below.
            </Text>
          </View>
        ) : null}

        {/* Add profile button */}
        <Pressable
          onPress={() => setShowForm(!showForm)}
          className="rounded-xl py-3 items-center mb-4"
          style={{
            backgroundColor: showForm ? colors.surface : colors.primary,
            borderWidth: showForm ? 1 : 0,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-[14px]"
            style={{ fontFamily: "Inter_500Medium", color: showForm ? colors.textSecondary : "#fff" }}
          >
            {showForm ? "Cancel" : "+ Add Printer"}
          </Text>
        </Pressable>

        {/* Add form */}
        {showForm ? (
          <View
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text
              className="text-[16px] mb-3"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textPrimary }}
            >
              New Printer Profile
            </Text>

            <CalculatorInput
              label="Printer Name"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Ender 3 Pro"
            />
            <CalculatorInput
              label="Build Volume X"
              value={form.buildVolumeX}
              onChangeText={(v) => setForm((f) => ({ ...f, buildVolumeX: v }))}
              unit="mm"
              placeholder="220"
            />
            <CalculatorInput
              label="Build Volume Y"
              value={form.buildVolumeY}
              onChangeText={(v) => setForm((f) => ({ ...f, buildVolumeY: v }))}
              unit="mm"
              placeholder="220"
            />
            <CalculatorInput
              label="Build Volume Z"
              value={form.buildVolumeZ}
              onChangeText={(v) => setForm((f) => ({ ...f, buildVolumeZ: v }))}
              unit="mm"
              placeholder="250"
            />
            <CalculatorInput
              label="Nozzle Diameter"
              value={form.nozzleDiameter}
              onChangeText={(v) => setForm((f) => ({ ...f, nozzleDiameter: v }))}
              unit="mm"
              placeholder="0.4"
            />
            <CalculatorInput
              label="Max Volumetric Flow"
              value={form.maxVolumetricFlow}
              onChangeText={(v) => setForm((f) => ({ ...f, maxVolumetricFlow: v }))}
              unit="mm³/s"
              placeholder="15"
            />

            <Text
              className="text-[12px] uppercase tracking-wider mb-2 mt-2"
              style={{ fontFamily: "Inter_500Medium", color: colors.textSecondary }}
            >
              Extruder Type
            </Text>
            <FilterBar
              options={EXTRUDER_OPTIONS}
              selected={form.extruderType}
              onSelect={(v) => setForm((f) => ({ ...f, extruderType: v }))}
            />

            {form.extruderType === "bowden" ? (
              <CalculatorInput
                label="Bowden Tube Length"
                value={form.bowdenLengthMm}
                onChangeText={(v) => setForm((f) => ({ ...f, bowdenLengthMm: v }))}
                unit="mm"
                placeholder="400"
              />
            ) : null}

            <CalculatorInput
              label="Default Print Speed"
              value={form.defaultSpeedMms}
              onChangeText={(v) => setForm((f) => ({ ...f, defaultSpeedMms: v }))}
              unit="mm/s"
              placeholder="60"
            />
            <CalculatorInput
              label="Default Travel Speed"
              value={form.defaultTravelMms}
              onChangeText={(v) => setForm((f) => ({ ...f, defaultTravelMms: v }))}
              unit="mm/s"
              placeholder="120"
            />
            <CalculatorInput
              label="Extruder E-Steps"
              value={form.stepsPerMmE}
              onChangeText={(v) => setForm((f) => ({ ...f, stepsPerMmE: v }))}
              unit="steps/mm"
              placeholder="93"
            />

            <Pressable
              onPress={handleCreate}
              className="rounded-xl py-3 items-center mt-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-[14px]"
                style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}
              >
                Save Profile
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
