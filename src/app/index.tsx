import * as Device from "expo-device";
import { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, Text, Dimensions } from "react-native";
import Animated, {
  LinearTransition,
  CurvedTransition,
  EntryExitTransition,
  FlipInEasyY,
  FlipOutYLeft,
  Easing,
  FadeOut,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type SodaCell from "./components/soda-cell-view";
import SodaCellView from "./components/soda-cell-view";

SplashScreen.setOptions({
  duration: 5000,
  fade: true,
});

const SCORE_HEIGHT = 40;
const BOARD_MARGIN = 16;
const CELL_MARGIN = 4;
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const boardWidth =
  (screenWidth < screenHeight ? screenWidth : screenHeight) -
  SCORE_HEIGHT -
  BOARD_MARGIN;
// make sure board fits window and score

const ROWS = 9;
const COLUMNS = 9;
const cellSize = boardWidth / COLUMNS - CELL_MARGIN;
const BOARD_SIZE = ROWS * COLUMNS;
const SODA_COLORS: string[] = [
  "hotpink",
  "skyblue",
  "coral",
  "mistyrose",
  "gold",
  "chartreuse",
];

let scoreBonus = 0;

export default function App() {
  let initialGrid: Object[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    let typeId = Math.floor(Math.random() * SODA_COLORS.length);

    initialGrid.push({
      index: i,
      typeId: typeId,
      color: SODA_COLORS[typeId],
      key: i + "-" + SODA_COLORS[typeId],
      width: cellSize,
    });
  }

  // Initialize board randomly (ensure no baseline matches on start if desired)

  const [grid, setGrid] = useState(initialGrid);
  const [score, setScore] = useState(0);

  // Standard horizontal & vertical match validator (from previous step code)
  const checkForMatches = (currentGrid: (typeof SodaCell)[]) => {
    let matched = new Array(BOARD_SIZE).fill(false);
    let hasMatches = false;

    for (let i = 0; i < BOARD_SIZE; i++) {
      const col = i % COLUMNS;

      if (col < COLUMNS - 2) {
        if (
          currentGrid[i].color &&
          currentGrid[i].color === currentGrid[i + 1].color &&
          currentGrid[i].color === currentGrid[i + 2].color
        ) {
          matched[i] = matched[i + 1] = matched[i + 2] = true;
          hasMatches = true;
          // check if better match
          //
          //
          if (col < COLUMNS - 3) {
            if (
              currentGrid[i].color &&
              currentGrid[i].color === currentGrid[i + 1].color &&
              currentGrid[i].color === currentGrid[i + 2].color &&
              currentGrid[i].color === currentGrid[i + 3].color
            ) {
              matched[i] =
                matched[i + 1] =
                matched[i + 2] =
                matched[i + 3] =
                  true;
              hasMatches = true;
              console.log(
                "matched 4 at index {" + i + "} set bonus to add 150",
              );
              scoreBonus += 150;
            }
          }
          // match 4
          //
          //
        }
      }
    }

    // no idea what this was supposed to do
    for (let i = 0; i < BOARD_SIZE - COLUMNS * 2; i++) {
      if (
        currentGrid[i].color &&
        currentGrid[i].color === currentGrid[i + COLUMNS].color &&
        currentGrid[i].color === currentGrid[i + COLUMNS * 2].color
      ) {
        matched[i] = matched[i + COLUMNS] = matched[i + COLUMNS * 2] = true;
        hasMatches = true;
      }
    }
    return { hasMatches, matched };
  };

  // Falling Cascade Loop
  const processBoardGameLoop = () => {
    let currentGrid = [...grid];
    const { hasMatches, matched } = checkForMatches(currentGrid);

    if (!hasMatches) return false;

    // 1. Clear elements
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (matched[i]) currentGrid[i] = null;
    }
    console.log("cleared at index");
    setScore((prev) => prev + scoreBonus + 30);
    scoreBonus = 0;

    // 2. Drop mechanism
    for (let col = 0; col < COLUMNS; col++) {
      for (let row = COLUMNS - 1; row >= 0; row--) {
        const index = row * COLUMNS + col;
        if (currentGrid[index] === null) {
          let lookUpRow = row - 1;
          while (lookUpRow >= 0) {
            const checkIndex = lookUpRow * COLUMNS + col;
            if (currentGrid[checkIndex] !== null) {
              currentGrid[index] = currentGrid[checkIndex];
              currentGrid[checkIndex] = null;
              break;
            }
            lookUpRow--;
          }
          if (currentGrid[index] === null) {
            const sodaType = Math.floor(Math.random() * SODA_COLORS.length);
            currentGrid[index] = {
              index: index,
              sodaType: sodaType,
              color: SODA_COLORS[sodaType],
              width: cellSize,
            };
          }
        }
      }
    }

    setGrid(currentGrid);
    return true;
  };

  useEffect(() => {
    if (grid.length === 0) return;
    const altered = processBoardGameLoop();
    if (altered) {
      const timer = setTimeout(() => {}, 250); // DOES NOT WORK Pause briefly between consecutive cascades
      return () => clearTimeout(timer);
    }
  }, [grid]);

  // Handle Input Swipe Actions from the individual cells
  const handleSwipe = (index: number, direction: string) => {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    let targetIndex = null;

    if (direction === "LEFT" && col > 0) targetIndex = index - 1;
    if (direction === "RIGHT" && col < COLUMNS - 1) targetIndex = index + 1;
    if (direction === "UP" && row > 0) targetIndex = index - ROWS;
    if (direction === "DOWN" && row < ROWS - 1) targetIndex = index + ROWS;

    if (targetIndex !== null) {
      let testGrid = [...grid];
      // Perform Swap
      const temp = testGrid[index];
      testGrid[index] = testGrid[targetIndex];
      testGrid[targetIndex] = temp;

      // Confirm match validity before allowing board to update
      const { hasMatches } = checkForMatches(testGrid);
      if (hasMatches) {
        setGrid(testGrid);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Animated.View
          layout={LinearTransition.springify()
            .damping(30)
            .mass(5)
            .rotate("20")
            .stiffness(10)
            .overshootClamping(0)
            .energyThreshold(6e-8)}

          style={[styles.board, { width: boardWidth }]}
        >
          {grid.map((cell, index) => (
            <SodaCellView
              index={index}
              typeId={cell.typeId}
              key={`${index}-${cell.color}`} // Dynamic key combination ensures clean exit animation traces
              color={cell.color}
              cellSize={cellSize}
              onSwipe={handleSwipe}
            />
          ))}
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#13131A",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    maxHeight: 30,
    fontSize: 36,
    fontWeight: "100",
    color: "#FFF",
    marginBottom: 24,
  },
  debugText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#FFF",
    marginBottom: 24,
  },
  board: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  debug: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
});
