import React from "react";

export const PaletteItem = ({
  colour,
  handleRemoveColour,
  colourIndex,
  handleUpdatePalette
}) => {
  return (
    <div className="palette-item">
      <button
        className="palette-delete-btn"
        title={`Delete ${colour}`}
        onClick={() => handleRemoveColour(colourIndex)}
      >
        x
      </button>
      <input
        title={colour}
        value={colour}
        type="color"
        onChange={e => handleUpdatePalette(e.target.value, colourIndex)}
      />
    </div>
  );
};
