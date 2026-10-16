import Svg, { Circle, Path, Rect, SvgProps } from "react-native-svg";

export default function SvgComponent(props: SvgProps) {
  return (
    <Svg height="256" width="256" viewBox="0 0 256 256" {...props}>
      <Path
        d="M198.749,36.663C198.749,36.663 186.594,32.492 180,40C173.406,47.508 103.235,36.161 80,60C30.741,110.539 42.448,174.253 37.959,183.061C33.47,191.869 20.901,204.857 30,214C37.694,221.731 42.03,216.339 56,210C69.97,203.661 135.297,212.523 161.461,179.15C205.906,122.46 193.531,71.295 200,64C206.469,56.705 198.749,36.663 198.749,36.663Z"
        fill="currentColor" stroke="currentColor"
      />
    </Svg>
  );
}
