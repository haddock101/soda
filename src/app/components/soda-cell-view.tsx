import React from "react";
import SvgComponent from "./svg-component";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  LinearTransition,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type SodaCell = {
  index: number | null;
  typeId: number | null;
  color: string | null;
  key: string | null;
  width: string | null;
} | null;

import chroma from "chroma-js";

const SodaCellView = ({
  index,
  typeId,
  color,
  cellSize,
  onSwipe,
}: {
  index: number;
  typeId: number;
  color: string;
  cellSize: number;
  onSwipe: Function;
}) => {
  const SWIPE_THRESHOLD = cellSize - 5;
  const initialTranslationX = useSharedValue(0); // position before a cell is moved
  const initialTranslationY = useSharedValue(0);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(10);
  const grabbing = useSharedValue(false);

  const animatedStyles = useAnimatedStyle(() => ({
    borderWidth: 2,
    backgroundColor: chroma(color).hex() || "transparent",
    borderColor: chroma(color).hex() || "transparent",
    boxShadow:
      "inset 0px 8px 8px " +
      chroma(color).brighten(1.2).saturate(2).hex() +
      ", inset -0px -8px 8px " +
      chroma(color).darken(2).saturate(2).hex(),
    width: cellSize - 4,
    height: cellSize - 4,
    margin: 2,
    zIndex: zIndex.value,
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
    cursor: grabbing.value ? "grabbing" : "grab",
  }));



  const panGesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = 1.1;
      grabbing.value = true;
      zIndex.value = 100;
    })
    .onChange((event) => {
      let direction = null;
      if (Math.abs(translationX.value) > Math.abs(translationY.value)) {
        direction = translationX.value > 0 ? "RIGHT" : "LEFT";
      } else {
        direction = translationY.value > 0 ? "DOWN" : "UP";
      }
      translationX.value = event.translationX;
      translationY.value = event.translationY;
      // Detect absolute primary movement axis
      if (
        Math.abs(translationX.value) > SWIPE_THRESHOLD ||
        Math.abs(translationY.value) > SWIPE_THRESHOLD
      ) {
        grabbing.value = true;

        // Trigger swap function back on main thread safely
        if (direction) {
          onSwipe(index, direction);
        }
      }
    })
    .onFinalize(() => {
      scale.value = 1;
      zIndex.value = 10;
      grabbing.value = false;
      translationX.value = 0;
      translationY.value = 0;
    });

  return (
    <GestureDetector gesture={panGesture}>

        <Animated.View
          // LinearTransition handles the fluid "dropping" animation when layout indices change
          layout={LinearTransition.springify().stiffness(200).damping(80)}
          entering={ZoomIn.springify().stiffness(200).damping(80)}

          exiting={ZoomOut}
          style={[styles.soda, animatedStyles]}
        >
          <SvgComponent pointerEvents="none" color={color} />
        </Animated.View>

    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  soda: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "inherit",
    borderWidth: 2,
  },
});

export default SodaCellView;
