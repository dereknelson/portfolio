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
} from "./components/matrix";
import { clamp } from "./components/matrix/helpers";

// =============================================================================
// Scene Choreography
// =============================================================================

const scene: SceneDirector = () => effects.tunnel;

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
  "Vim",
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
        tension: 80,
        friction: 10,
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
  const anim = useAnimatedValue(150 + index * 20);
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
  cardRef,
}: {
  company: string;
  role: string;
  period: string;
  bullets: string[];
  index: number;
  cardRef?: (index: number, el: View | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View
      ref={(el) => cardRef?.(index, el)}
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
  cardRef,
}: {
  name: string;
  url: string;
  year: string;
  description: string;
  index: number;
  cardRef?: (index: number, el: View | null) => void;
}) {
  const anim = useAnimatedValue(300 + index * 30);
  const [hovered, setHovered] = useState(false);

  return (
    <Animated.View
      ref={(el: View | null) => cardRef?.(index, el)}
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
  const underlineAnim = useAnimatedValue(100);
  const gravityWellsRef = useRef<GravityWell[]>([]);
  const scrollYRef = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0 });
  const expCardRefs = useRef<(HTMLElement | null)[]>([]);
  const projCardRefs = useRef<(HTMLElement | null)[]>([]);
  const initialMeasureDone = useRef(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [showGyroButton, setShowGyroButton] = useState(false);

  // Detect mobile for gyro button
  useEffect(() => {
    if (Platform.OS === "web") {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      setShowGyroButton(isMobile);

      // On Android/non-iOS, gyro works without permission — enable automatically
      const doe = DeviceOrientationEvent as any;
      if (isMobile && typeof doe.requestPermission !== "function") {
        enableGyroscope();
      }
    }
  }, []);

  const enableGyroscope = () => {
    const PARALLAX_RANGE = 80;
    const SMOOTHING = 0.1;
    let baseGamma: number | null = null;
    let baseBeta: number | null = null;

    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      if (baseGamma === null) { baseGamma = e.gamma; baseBeta = e.beta; }
      const dx = clamp((e.gamma - baseGamma!) / 30, -1, 1) * PARALLAX_RANGE;
      const dy = clamp((e.beta - baseBeta!) / 30, -1, 1) * PARALLAX_RANGE;
      tiltRef.current.x += (dx - tiltRef.current.x) * SMOOTHING;
      tiltRef.current.y += (dy - tiltRef.current.y) * SMOOTHING;
    };

    window.addEventListener("deviceorientation", handler);
    setGyroEnabled(true);
    setShowGyroButton(false);
  };

  const handleGyroPress = () => {
    const doe = DeviceOrientationEvent as any;
    if (typeof doe.requestPermission === "function") {
      doe.requestPermission().then((r: string) => {
        if (r === "granted") enableGyroscope();
        else setShowGyroButton(false);
      }).catch(() => setShowGyroButton(false));
    } else {
      enableGyroscope();
    }
  };

  // Measure gravity wells once after entrance animations settle
  useEffect(() => {
    const t = setTimeout(() => {
      initialMeasureDone.current = true;
      measureGravityWells();
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Store card element refs (measurement happens after animations settle)
  const handleExpCardRef = (index: number, el: View | null) => {
    if (Platform.OS === "web" && el) {
      expCardRefs.current[index] = el as unknown as HTMLElement;
    }
  };

  const handleProjCardRef = (index: number, el: View | null) => {
    if (Platform.OS === "web" && el) {
      projCardRefs.current[index] = el as unknown as HTMLElement;
    }
  };

  // Measure card positions directly from DOM, write to ref — no re-render
  const measureGravityWells = () => {
    const vh = windowHeight;
    const wells: GravityWell[] = [];
    const allRefs = [...expCardRefs.current, ...projCardRefs.current];
    allRefs.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      wells.push({
        x: rect.left,
        y: rect.top - 10,
        width: rect.width,
        height: rect.height,
        strength: 1.2,
      });
    });
    gravityWellsRef.current = wells;
  };

  // Main scroll handler — writes to refs only, no setState
  const handleScroll = (e: any) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
    measureGravityWells();
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]} />

      {/* Matrix rain — scene transitions from tunnel to rain on scroll */}
      <MatrixRain
        scene={scene}
        scrollYRef={scrollYRef}
        gravityWellsRef={gravityWellsRef}
        tiltRef={tiltRef}
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
          <View style={styles.hero}>
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

              <View style={styles.socialRow}>
                <Pressable
                  onPress={() => Linking.openURL("https://github.com/dereknelson")}
                  style={styles.socialLink}
                >
                  {Platform.OS === "web" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#94a3b8">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  ) : (
                    <Text style={styles.socialFallback}>GitHub</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL("https://x.com/prodigynelson")}
                  style={styles.socialLink}
                >
                  {Platform.OS === "web" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ) : (
                    <Text style={styles.socialFallback}>X</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL("https://instagram.com/prodigynelson")}
                  style={styles.socialLink}
                >
                  {Platform.OS === "web" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#94a3b8">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ) : (
                    <Text style={styles.socialFallback}>IG</Text>
                  )}
                </Pressable>
              </View>

              {showGyroButton && (
                <Pressable onPress={handleGyroPress} style={styles.gyroButton}>
                  <Text style={styles.gyroButtonText}>Enable Parallax Mode</Text>
                </Pressable>
              )}
            </Animated.View>

          </View>

          {/* Skills */}
          <Section title="Skills" delay={100}>
            <View style={styles.skillsContainer}>
              {skills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} index={i} />
              ))}
            </View>
          </Section>

          {/* Experience */}
          <Section title="Experience" delay={200}>
            {experience.map((exp, i) => (
              <ExperienceCard
                key={exp.company}
                {...exp}
                index={i}
                cardRef={handleExpCardRef}
              />
            ))}
          </Section>

          {/* Projects */}
          <Section title="Noteworthy Projects" delay={350}>
            {projects.map((proj, i) => (
              <ProjectCard key={proj.name} {...proj} index={i} cardRef={handleProjCardRef} />
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
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  socialLink: {
    padding: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(80, 80, 80, 0.5)",
    ...(Platform.OS === "web" && {
      cursor: "pointer",
      transition: "border-color 0.2s",
    }),
  },
  socialFallback: {
    fontSize: 14,
    color: "#94a3b8",
  },
  gyroButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.4)",
    backgroundColor: "rgba(96, 165, 250, 0.1)",
  },
  gyroButtonText: {
    fontSize: 12,
    color: "#60a5fa",
    letterSpacing: 0.5,
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
    justifyContent: "center",
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
    backgroundColor: "rgba(0, 0, 0, 0.88)",
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
