import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useRouter } from 'expo-router';
import { Shield, Smartphone, CreditCard } from "lucide-react-native";

import { theme } from "@/theme";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { secureStorage } from "@/services/secureStorage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* -------------------------------------------------------------------------- */
/*                                   DATA                                     */
/* -------------------------------------------------------------------------- */

const slides = [
  {
    id: "1",
    title: "Welcome to PayFlow",
    description:
      "Experience the future of digital payments with secure and instant transactions",
    icon: Smartphone,
  },
  {
    id: "2",
    title: "Easy & Secure Login",
    description:
      "Multiple login options with top-notch security to protect your account",
    icon: Shield,
  },
  {
    id: "3",
    title: "Safe Payments",
    description:
      "All transactions protected with MPIN verification for your peace of mind",
    icon: CreditCard,
  },
];

/* -------------------------------------------------------------------------- */
/*                             SLIDE COMPONENT                                 */
/* -------------------------------------------------------------------------- */

type SlideProps = {
  item: typeof slides[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
};

function OnboardingSlide({ item, index, scrollX }: SlideProps) {
  const Icon = item.icon;

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Icon size={120} color={theme.colors.primary[500]} strokeWidth={1.5} />
      </Animated.View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                          PAGINATION DOT COMPONENT                           */
/* -------------------------------------------------------------------------- */

type DotProps = {
  index: number;
  scrollX: Animated.SharedValue<number>;
};

function PaginationDot({ index, scrollX }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      width,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

/* -------------------------------------------------------------------------- */
/*                             MAIN SCREEN                                     */
/* -------------------------------------------------------------------------- */

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const router = useRouter();

  const completeOnboarding = async () => {
    await secureStorage.setHasOpened();
    router.replace('/(auth)/login');
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <OnboardingSlide item={item} index={index} scrollX={scrollX} />
        )}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        <AnimatedButton
          title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                    */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
  },
  skipText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeights.semibold,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing[8],
  },
  iconContainer: {
    marginBottom: theme.spacing[10],
  },
  title: {
    fontSize: theme.typography.fontSizes["3xl"],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  description: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight:
      theme.typography.fontSizes.md *
      theme.typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[8],
    gap: theme.spacing[2],
  },
  dot: {
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[500],
  },
  button: {
    width: "100%",
  },
});
