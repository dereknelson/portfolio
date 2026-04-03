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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  MatrixRain,
  GravityWell,
  SceneDirector,
  effects,
  blend,
  easings,
} from "./components/MatrixRain";

// =============================================================================
// Scene Choreography
// =============================================================================

const scene: SceneDirector = (scrollY, time, w, h) => {
  // Hero: fly through the tunnel
  if (scrollY < h * 0.15) return effects.tunnel;
  // Collapse: tunnel breaks apart into rain columns
  if (scrollY < h * 0.75) {
    const t = easings.easeInOut((scrollY - h * 0.15) / (h * 0.6));
    return blend(effects.tunnel, effects.rain, t);
  }
  // Content: vertical rain (gravity wells bend it around cards)
  return effects.rain;
};

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
  // Use a smaller slide on narrow screens to avoid hiding content
  const slideFactor = viewportWidth < 500 ? 0.03 : 0.08;
  const slideDistance = direction === -1
    ? -viewportWidth * slideFactor
    : viewportWidth * slideFactor;

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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const headerAnim = useAnimatedValue(0);
  const underlineAnim = useAnimatedValue(300);
  const [gravityWells, setGravityWells] = useState<GravityWell[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [cardAnimations, setCardAnimations] = useState<{ progress: number; direction: number }[]>(
    experience.map((_, i) => ({ progress: i === 0 ? 1 : 0, direction: i % 2 === 0 ? 1 : -1 }))
  );
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const experienceCardLayouts = useRef<{ y: number; height: number; width: number }[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitializedRef = useRef(false);
  const currentScrollY = useRef(0);

  // Scroll indicator pulse
  const scrollHintAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollHintAnim, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
        Animated.timing(scrollHintAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);


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

  // Calculate progress based on card's position in the viewport.
  // Cards animate in when they scroll into view, not based on cumulative scroll.
  const REVEAL_DISTANCE = 150; // px of scroll after entering viewport to fully reveal

  const getCardProgress = (
    cardScreenY: number,
    viewportHeight: number,
    cardIndex: number
  ): number => {
    // First card is always fully visible
    if (cardIndex === 0) return 1;

    // Card starts animating when its top enters the bottom of the viewport
    // and is fully visible after scrolling REVEAL_DISTANCE further
    const distanceIntoViewport = viewportHeight - cardScreenY;

    if (distanceIntoViewport <= 0) return 0;
    if (distanceIntoViewport >= REVEAL_DISTANCE) return 1;

    const progress = distanceIntoViewport / REVEAL_DISTANCE;
    return ease(clamp01(progress));
  };

  // Main scroll handler
  const handleScroll = (e: any) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const scrollY = contentOffset.y;
    currentScrollY.current = scrollY;
    setScrollPosition(scrollY);
    if (scrollY > 50 && showScrollHint) setShowScrollHint(false);
    const viewportHeight = layoutMeasurement.height;
    const viewportWidth = layoutMeasurement.width;
    setViewportSize({ width: viewportWidth, height: viewportHeight });

    const contentWidth = Math.min(viewportWidth, 800);

    const newAnimations: { progress: number; direction: number }[] = [];
    const newGravityWells: GravityWell[] = [];

    experienceCardLayouts.current.forEach((cardData, index) => {
      const direction = index % 2 === 0 ? 1 : -1;

      // Calculate card's position relative to viewport (top of viewport = 0)
      const cardScreenY = cardData ? cardData.y - scrollY : viewportHeight + 100;

      // Calculate progress based on viewport position
      const progress = getCardProgress(cardScreenY, viewportHeight, index);

      newAnimations.push({ progress, direction });

      // Create gravity well for every visible card on screen
      if (cardData && progress > 0) {
        const cardWidth = cardData.width || contentWidth - 48;
        const gravSlideFactor = viewportWidth < 500 ? 0.03 : 0.08;
        const slideDistance = direction === -1 ? -viewportWidth * gravSlideFactor : viewportWidth * gravSlideFactor;
        const slideOffset = (1 - progress) * slideDistance;
        const cardCenterX = viewportWidth / 2 + slideOffset;

        // Pad the well slightly so characters accumulate around edges
        const pad = 20;
        newGravityWells.push({
          x: cardCenterX - cardWidth / 2 - pad,
          y: cardScreenY - pad,
          width: cardWidth + pad * 2,
          height: cardData.height + pad * 2,
          strength: progress >= 0.99 ? 1.2 : progress,
        });
      }
    });

    setCardAnimations(newAnimations);
    setGravityWells(newGravityWells);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />

      {/* Matrix rain — scene transitions from tunnel to rain on scroll */}
      <MatrixRain
        scene={scene}
        scrollY={scrollPosition}
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
          {/* Hero — full viewport, tunnel effect behind */}
          <View style={[styles.hero, { minHeight: windowHeight }]}>
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

              <Pressable
                onPress={() => Linking.openURL("https://github.com/dereknelson")}
                style={styles.githubLink}
              >
                {Platform.OS === "web" ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#94a3b8"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                ) : (
                  <Text style={styles.githubFallback}>GitHub</Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Scroll indicator */}
            {showScrollHint && (
              <Animated.View style={[styles.scrollHint, { opacity: scrollHintAnim }]}>
                <Text style={styles.scrollHintText}>↓</Text>
              </Animated.View>
            )}
          </View>

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
  hero: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  scrollHint: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  scrollHintText: {
    fontSize: 28,
    color: "#60a5fa",
    ...(Platform.OS === "web" && {
      textShadow: "0 0 15px rgba(96, 165, 250, 0.6)",
    }),
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
  githubLink: {
    marginTop: 12,
    padding: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(80, 80, 80, 0.5)",
    ...(Platform.OS === "web" && {
      cursor: "pointer",
      transition: "border-color 0.2s",
    }),
  },
  githubFallback: {
    fontSize: 14,
    color: "#94a3b8",
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
