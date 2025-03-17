import { MainLayout } from "@/components/MainLayout";
import TimezoneConverter from "@/components/TimezoneConverter";
import WorldClock from "@/components/WorldClock";
import Favorites from "@/components/Favorites";
import RecentConversions from "@/components/RecentConversions";

export default function Home() {
  return (
    <MainLayout>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: Main Converter */}
        <div className="space-y-6">
          <TimezoneConverter />
        </div>

        {/* Right Column: Additional Features */}
        <div className="space-y-6">
          <WorldClock />
          <Favorites />
          <RecentConversions />
        </div>
      </div>
    </MainLayout>
  );
}
