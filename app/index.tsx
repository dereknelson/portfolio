import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Linking,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MatrixRain, GravityWell } from "./components/MatrixRain";

// =============================================================================
// Data
// =============================================================================

const skills = [
  "React/React Native",
  "TypeScript",
  "Expo",
  "Next.js",
  "Node",
  "Python",
  "Docker",
  "AWS/GCP",
  "GraphQL",
];

const experience = [
  {
    company: "Rlvnt Development",
    role: "Founder/Operator",
    period: "January 2020 - Present",
    bullets: [
      "Owner and operator of a full stack & full service app development company",
      "Design and develop useful UIs, handle code review, the full stack release process, developer operations, business infrastructure (CMS & payments), and more.",
    ],
  },
  {
    company: "Rainbow Inc",
    role: "Senior React Native Developer",
    period: "August 2023 - May 2024",
    bullets: [
      "Migrated the build/delivery process of a 5 year old React Native app to Expo",
      "Worked on swaps v2, gas quote optimizations, and added support for a few Ethereum Layer 2 networks",
    ],
  },
  {
    company: "Bright Development",
    role: "Director, React Native",
    period: "May 2021 - June 2022",
    bullets: [
      "Led teams of 5-10 to develop projects from scratch to market, notably: Homebody",
      "On two occasions, directed 6 figure spend on flagship features that resulted in clients closing their first 7 figure contract, notably: Reconstruct",
    ],
  },
  {
    company: "Mosaic App Inc",
    role: "React/React Native Developer",
    period: "April 2019 - May 2020",
    bullets: [
      "Only mobile developer with complete ownership of iOS and Android apps",
      "Developed v2 of the most important feature for any project management tool, the task list - added a 2nd dimension of organization, task groups, on both web and mobile",
    ],
  },
  {
    company: "metoo",
    role: "Founder",
    period: "August 2017 - March 2020",
    bullets: [
      "2.5 years into a BS in computer science, I dropped out to develop a social app for making plans with friends and interacting with people on your campus and colleges across the country",
      "Daily active users peaked over 250 in spring 2019. By the time Covid retired it, more than 20,000 people signed up",
    ],
  },
];

const projects = [
  {
    name: "Beatgig",
    url: "https://beatgig.com",
    year: "2024",
    description:
      "Incepted, named and build Eva (Entertainment Virtual Assistant), wrapping chatGPT with in app functionality for creating and managing event bookings",
  },
  {
    name: "Reconstruct Inc",
    url: "https://reconstructinc.com",
    year: "2022",
    description:
      "Rebuilt the most critical path in the mobile app for a 3D construction project visualization tool: video file upload. This feature's reliability was the final blocker for closing a multimillion dollar deal with a department store for construction expansion and inventory management",
  },
  {
    name: "Comm",
    url: "https://comm.app",
    year: "2022",
    description:
      "Added Sign In With Ethereum to comm, a web3 discord alternative",
  },
  {
    name: "Dojo",
    url: "https://dojo.co",
    year: "2022",
    description:
      "Built a network visualizer which enables large employers like Goldman Sachs to gain insights on how digital collaboration relates to real-time office occupancy",
  },
];

// =============================================================================
// Hooks
// =============================================================================

function useAnimatedValue(delay: number = 0) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return anim;
}

// =============================================================================
// Components
// =============================================================================

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const anim = useAnimatedValue(delay);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Link({ url, children }: { url: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Text style={[styles.link, hovered && styles.linkHovered]}>
        {children}
      </Text>
    </Pressable>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <LinearGradient
          colors={["rgba(96, 165, 250, 0.5)", "rgba(96, 165, 250, 0.2)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionDivider}
        />
        {children}
      </View>
    </AnimatedSection>
  );
}

function SkillBadge({ skill, index }: { skill: string; index: number }) {
  const anim = useAnimatedValue(500 + index * 60);
  const [hovered, setHovered] = useState(false);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, hovered ? 1.08 : 1],
            }),
          },
        ],
      }}
    >
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <LinearGradient
          colors={
            hovered
              ? ["rgba(96, 165, 250, 0.2)", "rgba(59, 130, 246, 0.15)"]
              : ["rgba(40, 40, 40, 0.8)", "rgba(30, 30, 30, 0.8)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.skillBadge, hovered && styles.skillBadgeHovered]}
        >
          <Text style={styles.skillText}>{skill}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function ExperienceCard({
  company,
  role,
  period,
  bullets,
  index,
  onMeasure,
  scrollProgress = 0,
  direction = 1,
  viewportWidth = 800,
}: {
  company: string;
  role: string;
  period: string;
  bullets: string[];
  index: number;
  onMeasure?: (index: number, screenY: number, height: number, width: number) => void;
  scrollProgress?: number;
  direction?: number;
  viewportWidth?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const viewRef = useRef<View>(null);

  // First card is always visible, others slide in from sides
  const effectiveProgress = index === 0 ? 1 : scrollProgress;

  // Slide animation - cards come in from left or right based on direction
  const slideDistance = direction === -1
    ? -viewportWidth * 0.08
    : viewportWidth * 0.08;

  const translateX = (1 - effectiveProgress) * slideDistance;
  const opacity = effectiveProgress;
  const scale = 0.85 + effectiveProgress * 0.15;

  return (
    <View
      ref={viewRef}
      style={{
        opacity,
        transform: [
          { translateX: translateX + (hovered ? 8 * -direction : 0) },
          { scale },
        ],
      }}
      onLayout={() => {
        if (onMeasure && Platform.OS === "web" && viewRef.current) {
          // Delay to ensure AnimatedSection translateY animation completes
          setTimeout(() => {
            const element = viewRef.current as unknown as HTMLElement;
            if (element && element.getBoundingClientRect) {
              const rect = element.getBoundingClientRect();
              // rect.top is screen Y; convert to content Y by adding current scroll
              // Since we're inside ScrollView, we need to track scroll separately
              // For now, store screen Y and handle in scroll handler
              console.log(`Card ${index} measured: top=${rect.top}, height=${rect.height}`);
              onMeasure(index, rect.top, rect.height, rect.width);
            }
          }, 600); // Wait for animations to settle
        }
      }}
    >
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <LinearGradient
          colors={
            hovered
              ? ["rgba(96, 165, 250, 0.1)", "rgba(59, 130, 246, 0.05)"]
              : ["rgba(20, 20, 20, 0.9)", "rgba(30, 30, 30, 0.8)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, hovered && styles.cardHovered]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.companyName}>{company}</Text>
              <Text style={styles.roleName}>{role}</Text>
            </View>
            <View style={styles.periodBadge}>
              <Text style={styles.periodText}>{period}</Text>
            </View>
          </View>
          <View style={styles.bulletList}>
            {bullets.map((bullet, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function ProjectCard({
  name,
  url,
  year,
  description,
  index,
}: {
  name: string;
  url: string;
  year: string;
  description: string;
  index: number;
}) {
  const anim = useAnimatedValue(1300 + index * 100);
  const [hovered, setHovered] = useState(false);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, hovered ? 1.02 : 1],
            }),
          },
        ],
      }}
    >
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <LinearGradient
          colors={
            hovered
              ? ["rgba(40, 40, 40, 0.95)", "rgba(50, 50, 50, 0.8)"]
              : ["rgba(20, 20, 20, 0.9)", "rgba(30, 30, 30, 0.7)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.projectCard, hovered && styles.cardHovered]}
        >
          <View style={styles.projectHeader}>
            <Link url={url}>{name}</Link>
            <Text style={styles.yearText}>{year}</Text>
          </View>
          <Text style={styles.projectDescription}>{description}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function Portfolio() {
  const headerAnim = useAnimatedValue(0);
  const underlineAnim = useAnimatedValue(300);
  const [gravityWells, setGravityWells] = useState<GravityWell[]>([]);
  const prevCardPositions = useRef<Record<string, { x: number; y: number; timestamp: number }>>({});
  const [cardAnimations, setCardAnimations] = useState<{ progress: number; direction: number }[]>(
    experience.map((_, i) => ({ progress: i === 0 ? 1 : 0, direction: i % 2 === 0 ? 1 : -1 })) // First card visible, others hidden until they scroll into view
  );
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const experienceCardLayouts = useRef<{ y: number; height: number; width: number }[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitializedRef = useRef(false);
  const currentScrollY = useRef(0); // Track current scroll for measurements


  // Handle card measurement - converts screen Y to content Y
  const handleCardMeasure = (index: number, screenY: number, height: number, width: number) => {
    // Convert screen Y to content Y by adding current scroll position
    const contentY = screenY + currentScrollY.current;
    console.log(`Card ${index}: screenY=${screenY}, scrollY=${currentScrollY.current}, contentY=${contentY}`);
    experienceCardLayouts.current[index] = { y: contentY, height, width };

    // Create initial gravity well for the first visible card
    if (index === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const contentWidth = Math.min(viewportSize.width, 800);
      const cardWidth = width || contentWidth - 48;
      const cardX = viewportSize.width / 2 - cardWidth / 2;

      // Use screen Y directly for initial gravity well (scroll is ~0 at init)
      setGravityWells([{
        x: cardX,
        y: screenY,
        width: cardWidth,
        height,
        strength: 1,
      }]);
    }
  };

  // ==========================================
  // Animation Functions (discrete, composable)
  // ==========================================

  // Easing function
  const ease = (t: number) => t * t * (3 - 2 * t);

  // Clamp value between 0 and 1
  const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

  // Calculate progress based on scroll position
  // Cards animate in sequentially as you scroll
  const SCROLL_PER_CARD = 250; // Each card takes 250px of scroll to animate

  const getCardProgress = (
    scrollY: number,
    cardIndex: number
  ): number => {
    // First card is always fully visible
    if (cardIndex === 0) return 1;

    // Each subsequent card animates over SCROLL_PER_CARD pixels
    // Card 1: scrollY 0-250, Card 2: scrollY 250-500, etc.
    const cardStartScroll = (cardIndex - 1) * SCROLL_PER_CARD;
    const cardEndScroll = cardIndex * SCROLL_PER_CARD;

    if (scrollY <= cardStartScroll) return 0;
    if (scrollY >= cardEndScroll) return 1;

    const progress = (scrollY - cardStartScroll) / SCROLL_PER_CARD;
    return ease(clamp01(progress));
  };

  // Calculate card bounds for gravity effect, including velocity
  // Now creates gravity wells for ALL visible cards, not just animating ones
  const getCardBounds = (
    progress: number,
    direction: number,
    cardScreenY: number,
    cardWidth: number,
    cardHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    timestamp: number,
    cardIndex: number
  ) => {
    // Skip if card is not visible at all (fully off-screen)
    if (progress <= 0) return null;

    // Skip if card is off-screen vertically
    if (cardScreenY + cardHeight < -100 || cardScreenY > viewportHeight + 100) return null;

    const slideDistance = direction === -1 ? -viewportWidth * 0.2 : viewportWidth * 0.2;
    const slideOffset = (1 - progress) * slideDistance;
    const cardCenterX = viewportWidth / 2 + slideOffset;
    const cardX = cardCenterX - cardWidth / 2;

    // Calculate velocity from previous position
    let velocityX = 0;
    let velocityY = 0;

    // Use per-card velocity tracking
    const prevKey = `card_${cardIndex}`;
    const prev = prevCardPositions.current[prevKey];
    if (prev) {
      const deltaTime = (timestamp - prev.timestamp) / 1000;
      if (deltaTime > 0 && deltaTime < 0.1) {
        velocityX = (cardX - prev.x) / deltaTime;
        velocityY = (cardScreenY - prev.y) / deltaTime;
        velocityX = Math.max(-2000, Math.min(2000, velocityX));
        velocityY = Math.max(-2000, Math.min(2000, velocityY));
      }
    }
    prevCardPositions.current[prevKey] = { x: cardX, y: cardScreenY, timestamp };

    // Strength calculation:
    // - During animation (0 < progress < 1): peaks at 50% progress
    // - When fully visible (progress = 1): constant moderate strength
    let strength: number;
    if (progress >= 0.99) {
      // Fully visible card - constant gravity well
      strength = 1.5;
    } else {
      // Animating card - stronger effect that peaks at 50%
      strength = progress * (1 - progress) * 8;
    }

    return {
      x: cardX,
      y: cardScreenY,
      width: cardWidth,
      height: cardHeight,
      strength,
      velocityX,
      velocityY,
    };
  };

  // Main scroll handler
  const handleScroll = (e: any) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const scrollY = contentOffset.y;
    currentScrollY.current = scrollY; // Track for measurements
    const viewportHeight = layoutMeasurement.height;
    const viewportWidth = layoutMeasurement.width;
    const timestamp = performance.now();
    setViewportSize({ width: viewportWidth, height: viewportHeight });

    const contentWidth = Math.min(viewportWidth, 800);

    const newAnimations: { progress: number; direction: number }[] = [];
    let activeGravityWell: GravityWell | null = null;
    let lastVisibleCardIndex = 0;

    experienceCardLayouts.current.forEach((cardData, index) => {
      const direction = index % 2 === 0 ? 1 : -1;

      // Calculate card's position relative to viewport (top of viewport = 0)
      const cardScreenY = cardData ? cardData.y - scrollY : viewportHeight + 100;

      // Calculate progress based on scroll position (sequential animation)
      const progress = getCardProgress(scrollY, index);

      newAnimations.push({ progress, direction });

      // Track the last card that's at least partially visible
      if (progress > 0) {
        lastVisibleCardIndex = index;
      }

      // Create gravity well for the card that's currently animating
      if (cardData && !activeGravityWell && progress > 0.01 && progress < 0.99) {
        const cardWidth = cardData.width || contentWidth - 48;

        // Calculate the card's current X position based on slide animation
        const slideDistance = direction === -1 ? -viewportWidth * 0.08 : viewportWidth * 0.08;
        const slideOffset = (1 - progress) * slideDistance;
        const cardCenterX = viewportWidth / 2 + slideOffset;

        activeGravityWell = {
          x: cardCenterX - cardWidth / 2,
          y: cardScreenY,
          width: cardWidth,
          height: cardData.height,
          strength: 1,
        };
      }
    });

    // If no card is currently animating, keep gravity well at the last visible card
    if (!activeGravityWell && lastVisibleCardIndex > 0) {
      const cardData = experienceCardLayouts.current[lastVisibleCardIndex];
      if (cardData) {
        const direction = lastVisibleCardIndex % 2 === 0 ? 1 : -1;
        const cardScreenY = cardData.y - scrollY;
        const cardWidth = cardData.width || contentWidth - 48;
        const cardCenterX = viewportWidth / 2; // Centered since fully visible

        activeGravityWell = {
          x: cardCenterX - cardWidth / 2,
          y: cardScreenY,
          width: cardWidth,
          height: cardData.height,
          strength: 0.8,
        };
      }
    }

    setCardAnimations(newAnimations);
    setGravityWells(activeGravityWell ? [activeGravityWell] : []);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />

      {/* Matrix rain background with card gravity effect */}
      <MatrixRain
        gravityWells={gravityWells}
        enableGravity={true}
        debug={false}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.name,
                {
                  transform: [
                    {
                      scale: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              Derek Nelson
            </Animated.Text>

            <Animated.View
              style={[
                styles.underline,
                {
                  opacity: underlineAnim,
                  transform: [{ scaleX: underlineAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["#3b82f6", "#60a5fa", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underlineGradient}
              />
            </Animated.View>

            <View style={styles.locationRow}>
              <View style={styles.statusDot} />
              <Text style={styles.location}>Brooklyn, NY</Text>
            </View>

            <Pressable onPress={() => Linking.openURL("mailto:derek@rlvnt.io")}>
              <Text style={styles.email}>derek@rlvnt.io</Text>
            </Pressable>
          </Animated.View>

          {/* Skills */}
          <Section title="Skills" delay={300}>
            <View style={styles.skillsContainer}>
              {skills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} index={i} />
              ))}
            </View>
          </Section>

          {/* Experience */}
          <Section title="Experience" delay={500}>
            {experience.map((exp, i) => (
              <ExperienceCard
                key={exp.company}
                {...exp}
                index={i}
                onMeasure={handleCardMeasure}
                scrollProgress={cardAnimations[i]?.progress ?? 0}
                direction={cardAnimations[i]?.direction ?? (i % 2 === 0 ? -1 : 1)}
                viewportWidth={viewportSize.width}
              />
            ))}
          </Section>

          {/* Projects */}
          <Section title="Noteworthy Projects" delay={900}>
            {projects.map((proj, i) => (
              <ProjectCard key={proj.name} {...proj} index={i} />
            ))}
          </Section>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 800,
    marginHorizontal: "auto",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  name: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    letterSpacing: -1,
    ...(Platform.OS === "web" && {
      textShadow: "0 0 30px rgba(96, 165, 250, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)",
    }),
  },
  underline: {
    height: 4,
    width: 120,
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  underlineGradient: {
    flex: 1,
    borderRadius: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#60a5fa",
    marginRight: 8,
    ...(Platform.OS === "web" && {
      boxShadow: "0 0 10px rgba(96, 165, 250, 0.6)",
    }),
  },
  location: {
    fontSize: 18,
    color: "#94a3b8",
  },
  email: {
    fontSize: 16,
    color: "#60a5fa",
    marginTop: 4,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    letterSpacing: -0.5,
    ...(Platform.OS === "web" && {
      textShadow: "0 0 20px rgba(96, 165, 250, 0.4)",
    }),
  },
  sectionDivider: {
    height: 1,
    marginBottom: 24,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  skillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(80, 80, 80, 0.5)",
  },
  skillBadgeHovered: {
    borderColor: "rgba(96, 165, 250, 0.5)",
    ...(Platform.OS === "web" && {
      boxShadow: "0 0 20px rgba(96, 165, 250, 0.3)",
    }),
  },
  skillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e2e8f0",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(60, 60, 60, 0.5)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(10px)",
    }),
  },
  cardHovered: {
    borderColor: "rgba(96, 165, 250, 0.4)",
    ...(Platform.OS === "web" && {
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(96, 165, 250, 0.2)",
      transform: [{ translateY: -2 }],
    }),
  },
  projectCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    minWidth: 200,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  roleName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#60a5fa",
    marginTop: 2,
  },
  periodBadge: {
    backgroundColor: "rgba(50, 50, 50, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginTop: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#60a5fa",
    marginTop: 6,
    marginRight: 12,
    ...(Platform.OS === "web" && {
      boxShadow: "0 0 8px rgba(96, 165, 250, 0.6)",
    }),
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 22,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  yearText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: Platform.OS === "web" ? "monospace" : undefined,
  },
  projectDescription: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#60a5fa",
  },
  linkHovered: {
    color: "#93c5fd",
    ...(Platform.OS === "web" && {
      textShadow: "0 0 10px rgba(96, 165, 250, 0.5)",
    }),
  },
});
