import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';

interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function AnimatedInput({ label, error, style, ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(theme.colors.border.medium);
  const labelScale = useSharedValue(1);
  const labelY = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(theme.colors.primary[500], { duration: 200 });
    if (label) {
      labelScale.value = withTiming(0.85, { duration: 200 });
      labelY.value = withTiming(-24, { duration: 200 });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(theme.colors.border.medium, { duration: 200 });
    if (label && !props.value) {
      labelScale.value = withTiming(1, { duration: 200 });
      labelY.value = withTiming(0, { duration: 200 });
    }
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }, { translateY: labelY.value }],
  }));

  return (
    <View style={styles.container}>
      {label && (
        <Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
          <Text style={[styles.label, (isFocused || props.value) && styles.labelFocused]}>
            {label}
          </Text>
        </Animated.View>
      )}
      <Animated.View style={[styles.inputContainer, animatedBorderStyle, error && styles.errorBorder]}>
        <TextInput
          {...props}
          style={[styles.input, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  labelContainer: {
    position: 'absolute',
    left: theme.spacing[4],
    top: theme.spacing[3],
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[1],
    zIndex: 1,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  labelFocused: {
    color: theme.colors.primary[500],
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.border.medium,
  },
  input: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.primary,
  },
  errorBorder: {
    borderColor: theme.colors.error[500],
  },
  errorText: {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.error[500],
  },
});
