import { ScrollView, View, Text, Linking, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

function Link({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      <Text className="text-blue-400 underline">{children}</Text>
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function ExperienceItem({
  company,
  role,
  period,
  bullets,
}: {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-start flex-wrap">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{company}</Text>
          <Text className="text-slate-400 text-sm">{role}</Text>
        </View>
        <Text className="text-slate-500 text-sm">{period}</Text>
      </View>
      <View className="mt-2">
        {bullets.map((bullet, i) => (
          <View key={i} className="flex-row mt-1">
            <Text className="text-slate-400 mr-2">•</Text>
            <Text className="text-slate-300 flex-1 text-sm">{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProjectItem({
  name,
  url,
  year,
  description,
}: {
  name: string;
  url: string;
  year: string;
  description: string;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center">
        <Link url={url}>{name}</Link>
        <Text className="text-slate-500 text-sm">{year}</Text>
      </View>
      <Text className="text-slate-300 text-sm mt-1">{description}</Text>
    </View>
  );
}

export default function Portfolio() {
  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-5 py-4">
        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-white mb-2">
            Derek Nelson
          </Text>
          <Text className="text-slate-400 text-center">
            Brooklyn, NY • derek@rlvnt.io
          </Text>
        </View>

        {/* Skills */}
        <Section title="Skills">
          <View className="flex-row flex-wrap gap-2">
            {skills.map((skill) => (
              <View
                key={skill}
                className="bg-slate-800 px-3 py-1.5 rounded-full"
              >
                <Text className="text-slate-300 text-sm">{skill}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          {experience.map((exp) => (
            <ExperienceItem key={exp.company} {...exp} />
          ))}
        </Section>

        {/* Projects */}
        <Section title="Noteworthy Projects">
          {projects.map((proj) => (
            <ProjectItem key={proj.name} {...proj} />
          ))}
        </Section>

        {/* Footer spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
