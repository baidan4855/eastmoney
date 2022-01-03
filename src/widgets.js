export const Number = ({ value, gap = 0, color, suffix }) => {
  const fontColor = color || (value > gap ? "red" : "green");
  return (
    <span style={{ color: fontColor, fontWeight: 500 }}>
      {value}
      {suffix || ""}
    </span>
  );
};
