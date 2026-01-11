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
import { MatrixRain } from "./components/MatrixRain";

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
      "Design and develop useful UIs, handle code review, own frontend/backend release process, developer operations, business infrastructure such as CMS/payments, and creating assets for marketing campaigns",
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
  onMeasure?: (index: number, y: number, height: number, width: number) => void;
  scrollProgress?: number;
  direction?: number;
  viewportWidth?: number;
}) {
  const [hovered, setHovered] = useState(false);

  // Smooth interpolated animation based on focus progress
  // progress 0 = 20% off to the side, transparent
  // progress 1 = fully centered, opaque
  const slideDistance = direction === -1
    ? -viewportWidth * 0.2
    : viewportWidth * 0.2;

  const translateX = (1 - scrollProgress) * slideDistance;
  const opacity = scrollProgress;
  const scale = 0.85 + scrollProgress * 0.15; // Scale from 0.85 to 1

  return (
    <View
      style={{
        opacity,
        transform: [
          { translateX: translateX + (hovered ? 8 * -direction : 0) },
          { scale },
        ],
      }}
      onLayout={(e) => {
        if (onMeasure) {
          const { y, height, width } = e.nativeEvent.layout;
          onMeasure(index, y, height, width);
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
  const [cardBounds, setCardBounds] = useState<{ x: number; y: number; width: number; height: number; strength: number }[]>([]);
  const [cardAnimations, setCardAnimations] = useState<{ progress: number; direction: number }[]>(
    experience.map((_, i) => ({ progress: 0, direction: i % 2 === 0 ? 1 : -1 })) // All cards start hidden, animate on scroll
  );
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const experienceCardLayouts = useRef<{ y: number; height: number; width: number }[]>([]);
  const experienceSectionY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle card measurement (y and width relative to section)
  const handleCardMeasure = (index: number, relativeY: number, height: number, width: number) => {
    const absoluteY = experienceSectionY.current + relativeY;
    experienceCardLayouts.current[index] = { y: absoluteY, height, width };
  };

  // ==========================================
  // Animation Functions (discrete, composable)
  // ==========================================

  // Easing function
  const ease = (t: number) => t * t * (3 - 2 * t);

  // Clamp value between 0 and 1
  const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

  // Calculate progress for a single card based on scroll
  // All cards animate sequentially, each taking scrollPerCard
  const getCardProgress = (
    scrollY: number,
    cardIndex: number,
    scrollPerCard: number
  ): number => {
    // All cards animate sequentially
    const cardStartScroll = cardIndex * scrollPerCard;
    const cardEndScroll = (cardIndex + 1) * scrollPerCard;

    if (scrollY < cardStartScroll) return 0;
    if (scrollY >= cardEndScroll) return 1;

    const rawProgress = (scrollY - cardStartScroll) / scrollPerCard;
    return ease(clamp01(rawProgress));
  };

  // Calculate card bounds for gravity effect
  const getCardBounds = (
    progress: number,
    direction: number,
    cardScreenY: number,
    cardWidth: number,
    cardHeight: number,
    viewportWidth: number
  ) => {
    if (progress <= 0.01 || progress >= 0.99) return null;

    const slideDistance = direction === -1 ? -viewportWidth * 0.2 : viewportWidth * 0.2;
    const slideOffset = (1 - progress) * slideDistance;
    const cardCenterX = viewportWidth / 2 + slideOffset;

    // Strength peaks at 50% progress, scaled up for dramatic effect
    const strength = progress * (1 - progress) * 8;

    return {
      x: cardCenterX - cardWidth / 2,
      y: cardScreenY,
      width: cardWidth,
      height: cardHeight,
      strength,
    };
  };

  // Main scroll handler
  const handleScroll = (e: any) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const scrollY = contentOffset.y;
    const viewportHeight = layoutMeasurement.height;
    const viewportWidth = layoutMeasurement.width;
    setViewportSize({ width: viewportWidth, height: viewportHeight });

    const contentWidth = Math.min(viewportWidth, 800);
    const cardCount = experience.length;

    // Calculate scroll progress relative to when Experience section enters viewport
    // Animation starts as soon as user begins scrolling
    const relativeScroll = scrollY;

    // Sequential animation config
    const scrollPerCard = 300; // Each card takes 300px of scroll to animate (first card is instant)

    const newAnimations: { progress: number; direction: number }[] = [];
    let activeGravityBounds: { x: number; y: number; width: number; height: number; strength: number } | null = null;

    experienceCardLayouts.current.forEach((cardData, index) => {
      const direction = index % 2 === 0 ? 1 : -1;

      // Calculate progress for this card (sequential, one at a time)
      const progress = getCardProgress(scrollY, index, scrollPerCard);

      newAnimations.push({ progress, direction });

      // Only one gravity well at a time - the currently animating card
      if (cardData && !activeGravityBounds && progress > 0.01 && progress < 0.99) {
        const cardScreenY = cardData.y - scrollY;
        const cardWidth = cardData.width || contentWidth - 48;
        const gravityBounds = getCardBounds(
          progress,
          direction,
          cardScreenY,
          cardWidth,
          cardData.height,
          viewportWidth
        );
        if (gravityBounds) {
          activeGravityBounds = gravityBounds;
        }
      }
    });

    setCardAnimations(newAnimations);
    setCardBounds(activeGravityBounds ? [activeGravityBounds] : []);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />

      {/* Matrix rain background with card gravity effect */}
      <MatrixRain warpIntensity={0} cardBounds={cardBounds} />

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
          <View onLayout={(e) => { experienceSectionY.current = e.nativeEvent.layout.y; }}>
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
          </View>

          {/* Projects */}
          <Section title="Noteworthy Projects" delay={900}>
            {projects.map((proj, i) => (
              <ProjectCard key={proj.name} {...proj} index={i} />
            ))}
          </Section>

          {/* Footer */}
          <AnimatedSection delay={1600}>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Built with Expo + React Native Web
              </Text>
            </View>
          </AnimatedSection>
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
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(60, 60, 60, 0.3)",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#475569",
  },
});
