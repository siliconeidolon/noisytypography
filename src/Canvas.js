import React, { useEffect, useRef, useState, useCallback } from "react";
import canvasSketch from "canvas-sketch";
import random from "canvas-sketch-util/random";
import { lerp } from "canvas-sketch-util/math";
import palettes from "nice-color-palettes";
import { PaletteItem } from "./PaletteItem";
import { InputGroup } from "./InputGroup";

export const Canvas = () => {
  const sketchRef = useRef(null);
  const [settings] = useState({
    suffix: random.getSeed(),
    dimensions: [1024, 1024],
    scaleToView: true
  });
  const [count, setCount] = useState(30);
  const [multiplier, setMultiplier] = useState(0.25);
  const [symbol, setSymbol] = useState("{");
  const [fontFamily, setFontFamily] = useState("serif");
  const [points, setPoints] = useState([]);
  const [seed, setSeed] = useState(867504);
  const [palette, setPalette] = useState(random.shuffle(random.pick(palettes)));
  const [canvasColour, setCanvasColour] = useState("#ffffff");
  const [colourToAdd, setColourToAdd] = useState("#000000");

  const handleUpdateSeed = e => {
    setSeed(e);
    random.setSeed(seed);
  };

  const handleRandomiseSeed = useCallback(() => {
    setSeed(random.getRandomSeed());
    random.setSeed(seed);
  }, [seed]);

  useEffect(() => {
    handleRandomiseSeed();
  }, []);

  const handleUpdatePalette = (e, i) => {
    const updatedPalette = [...palette];
    updatedPalette[i] = e;
    setPalette(updatedPalette);
  };

  const handleAddColour = colour => {
    const updatedPalette = [...palette];
    updatedPalette.push(colour);
    setPalette(updatedPalette);
  };

  const handleRemoveColour = i => {
    const updatedPalette = [...palette];
    updatedPalette.splice(i, 1);

    setPalette(updatedPalette);
  };

  const handleRandomisePalette = () => {
    setPalette(
      random.shuffle(random.pick(palettes)).slice(0, random.rangeFloor(1, 6))
    );
  };

  // createGrid should only update when seed or count updates
  const createGrid = useCallback(() => {
    const points = [];
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        const size = Math.abs(random.noise2D(u, v)) * multiplier;
        const rotation = random.noise2D(u, v);

        points.push({
          colour: random.pick(palette),
          size: size,
          rotation: rotation,
          position: [u, v]
        });
      }
    }

    return points.filter(() => random.value() > 0.5);
  }, [count, palette, multiplier]);

  useEffect(() => {
    setPoints(createGrid());
  }, [createGrid, seed]);

  //Point colours should only update when palette changes
  // if points is added as a dependency, then there's an infinite state update
  useEffect(() => {
    const updatedPoints = points.map(point => {
      return { ...point, colour: random.pick(palette) };
    });

    setPoints(updatedPoints);
  }, [palette]);

  useEffect(() => {
    const sketch = () => {
      const margin = 100;

      return ({ context, width, height }) => {
        context.fillStyle = canvasColour;
        context.fillRect(0, 0, width, height);

        points.forEach(data => {
          const { position, size, colour, rotation } = data;
          const [u, v] = position;
          const x = lerp(margin, width - margin, u);
          const y = lerp(margin, width - margin, v);

          context.save();

          context.fillStyle = colour;
          context.font = `${(size * width) / 2}px ${fontFamily}`;
          context.translate(x, y);
          context.rotate(rotation);
          context.fillText(symbol, 0, 0);

          context.restore();
        });
      };
    };

    canvasSketch(
      sketch,
      {
        ...settings,
        canvas: sketchRef.current
      },
      [sketchRef]
    );
  }, [settings, fontFamily, points, symbol, seed, canvasColour]);
  return (
    <div className="canvas-container">
      <div className="canvas-controls">
        <InputGroup
          value={count}
          label={`Number of grid points`}
          type="number"
          onChange={e => setCount(e.target.value)}
          options={{ max: 100 }}
        />
        <InputGroup
          label="Size Multiplier"
          value={multiplier}
          type="number"
          onChange={e => setMultiplier(e.target.value)}
          options={{ step: 0.05 }}
        />
        <InputGroup
          label="Canvas Background"
          value={canvasColour}
          type="color"
          onChange={e => setCanvasColour(e.target.value)}
          options={{ title: "Canvas background colour picker" }}
        />

        <div className="input-group">
          <label>Palette</label>
          <button
            onClick={() => handleRandomisePalette()}
            style={{ display: "block", marginBottom: "1rem" }}
          >
            Randomise palette
          </button>
          <div style={{ minHeight: "180px" }}>
            {palette.map((colour, i) => {
              return (
                <PaletteItem
                  key={colour + i}
                  colour={colour}
                  handleRemoveColour={handleRemoveColour}
                  handleUpdatePalette={handleUpdatePalette}
                  colourIndex={i}
                />
              );
            })}
            <div className="new-colour-container">
              <label>Pick a new colour</label>
              <div className="palette-item">
                <button
                  className="palette-add-btn"
                  onClick={() => handleAddColour(colourToAdd)}
                >
                  +
                </button>
                <input
                  value={colourToAdd}
                  onChange={e => setColourToAdd(e.target.value)}
                  type="color"
                />
              </div>
            </div>
          </div>
        </div>

        <InputGroup
          label="Symbol (try emojis 🍻)"
          value={symbol}
          type="text"
          onChange={e => setSymbol(e.target.value)}
        />
        <InputGroup
          label="Font Family"
          value={fontFamily}
          type="text"
          onChange={e => setFontFamily(e.target.value)}
        />
        <InputGroup
          label="Randomisation Seed"
          value={seed}
          type="text"
          onChange={e => handleUpdateSeed(e.target.value)}
        />
        <button onClick={() => handleRandomiseSeed()}>Randomise Seed</button>
      </div>
      <canvas className="canvas-preview" ref={sketchRef} />
    </div>
  );
};
