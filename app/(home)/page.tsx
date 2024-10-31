import CTAButtons from "@/components/CTAButtons";
import { CheckCircleIcon, PieChartIcon, LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    title: "User-Friendly Design",
    description:
      "Easily create, manage, and distribute your forms in just a few steps. Our intuitive design is tailored for seamless navigation.",
    icon: <CheckCircleIcon className="w-6 h-6" />,
    id: 1,
  },
  {
    title: "Advanced Data Analysis",
    description:
      "Get automatic summaries and visualize your data effortlessly with dynamic charts and graphs.",
    icon: <PieChartIcon className="w-6 h-6" />,
    id: 2,
  },
  {
    title: "Flexible Integrations",
    description:
      "Connect FormCraft with the tools you already use for seamless workflows. Integrate with platforms like Google Sheets and more.",
    icon: <LinkIcon className="w-6 h-6" />,
    id: 3,
  },
];

export default function Home() {
  return (
    <main className="">
      <>
        <div className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter mb-4 sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Discover Insights Instantly with FormCraft
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-700">
                  Create and share online forms effortlessly, and analyze
                  responses in real-time with advanced analytics.
                </p>
              </div>

              <CTAButtons />
            </div>
          </div>
        </div>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center mx-auto gap-4 px-4 md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl ">
                Why Choose FormCraft?
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed">
                Trusted by thousands of teams globally, FormCraft allows you to
                gather and organize information faster and more effectively.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.id}>
                  <CardHeader className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    {feature.icon}
                  </CardHeader>
                  <CardContent>
                    <p className="text-grey-500">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <CTAButtons className="mt-8" />
          </div>
        </section>
      </>
    </main>
  );
}
