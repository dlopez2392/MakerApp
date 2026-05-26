import { View } from "react-native";

interface WoodSwatchProps {
  colorHex: string;
  grainColorHex: string;
  size?: number;
  borderRadius?: number;
}

export function WoodSwatch({
  colorHex,
  grainColorHex,
  size = 48,
  borderRadius = 10,
}: WoodSwatchProps) {
  const grainLines = Array.from({ length: 6 }, (_, i) => i);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: colorHex,
        overflow: "hidden",
        justifyContent: "space-evenly",
      }}
    >
      {grainLines.map((i) => (
        <View
          key={i}
          style={{
            height: 1.5,
            backgroundColor: grainColorHex,
            opacity: 0.5 + (i % 3) * 0.15,
            marginLeft: (i % 2) * 4,
            marginRight: ((i + 1) % 2) * 6,
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}
