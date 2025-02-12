import { StyleSheet } from "react-native";
import { BLACK, WHITE } from "../constants/color";
import { HEIGHT, WIDTH } from "../constants/config";
export const appStyles = StyleSheet.create({
  safeareacontainer: {
    flex: 1,
    backgroundColor: WHITE,
  },
  maincontainer: {
    flex: 1,
    alignItems: "center",
  },
  customButtonWrapper: {
    width: "100%",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  textcolor: {
    color: BLACK,
  },
  customTextInputWrapper: {
    width: "90%",
    alignSelf: "center",
  },
  termstextWrapper: {
    width: "100%",
  },
  rowInputsStyleWrapper: {
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    justifyContent: "space-between",
    // backgroundColor: "red",
  },
});
