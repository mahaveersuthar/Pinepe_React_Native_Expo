import React from "react";
import { View, Text, StyleSheet } from "react-native";
import DropDownPicker, { ListModeType } from "react-native-dropdown-picker";
import { theme } from "@/theme";

export type DropdownItem = {
  label: string;
  value: string;
};

interface AppDropdownProps {
  label?: string;
  error?: string;
  open: boolean;
  value: string | null;
  items: DropdownItem[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValue: React.Dispatch<React.SetStateAction<any>>;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  zIndex?: number;
  listMode?: ListModeType;
  // --- FIX: Added onClose to the interface ---
  onClose?: () => void;
}

const CustomDropdown: React.FC<AppDropdownProps> = ({
  label,
  error,
  open,
  value,
  items,
  setOpen,
  setValue,
  placeholder = "Select option",
  loading = false,
  disabled = false,
  searchable = false,
  zIndex = 0,
  listMode = "SCROLLVIEW",
  onClose, // --- FIX: Destructured onClose ---
}) => {
  return (
    <View style={{ zIndex }}>
      {label && <Text style={styles.label}>{label}</Text>}

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        onClose={onClose} // --- FIX: Passed onClose to DropDownPicker ---
        placeholder={placeholder}
        loading={loading}
        disabled={disabled}
        searchable={searchable}
        listMode={listMode}
        dropDownDirection="BOTTOM"
        maxHeight={250}
        style={[
          styles.dropdown,
          error ? styles.inputError : null,
          open && !error ? styles.inputFocused : null,
        ]}
        dropDownContainerStyle={[
          styles.dropdownContainer,
          error ? styles.inputError : null,
        ]}
        placeholderStyle={{ color: theme.colors.text.secondary, fontSize: 15 }}
        labelStyle={{ color: theme.colors.text.primary, fontSize: 15 }}
        disabledItemContainerStyle={{
          opacity: 0.5,
          backgroundColor: "#F3F4F6",
        }}
        disabledItemLabelStyle={{
          color: "#9CA3AF",
        }}
        scrollViewProps={{ nestedScrollEnabled: true }}
        zIndex={zIndex}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  dropdown: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    minHeight: 55,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    backgroundColor: "#FFF",
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 14,
    elevation: 5,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  inputFocused: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default CustomDropdown;