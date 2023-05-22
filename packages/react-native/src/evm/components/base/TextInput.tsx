import { StyleSheet, TextInput as TextInputRN } from "react-native";
import Box from "./Box";
import { useTheme } from "@shopify/restyle";

type TextInputProps = (typeof Box)["arguments"] &
  TextInputRN["props"]["onChangeText"];

export const TextInput = ({ onChangeText, ...props }: TextInputProps) => {
  const theme = useTheme();

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      borderColor="border"
      borderWidth={1}
      borderRadius="md"
      pr="xs"
      {...props}
    >
      <TextInputRN
        style={{ ...styles.textInput, color: theme.colors.textPrimary }}
        returnKeyType={"done"}
        clearTextOnFocus={false}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  textInput: {
    textAlign: "left",
    flex: 1,
    height: 40,
    paddingLeft: 5,
  },
});