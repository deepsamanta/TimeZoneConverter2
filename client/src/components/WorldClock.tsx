import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTimezones } from "@/hooks/useTimezones";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentTime, formatTimeDifference } from "@/utils/timezone";

interface ClockData {
  timezone: string;
  name: string;
  offset: string;
  time: string;
  date: string;
  difference: string;
  isNow: boolean;
}

export default function WorldClock() {
  const { toast } = useToast();
  const [clocks, setClocks] = useState<ClockData[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [open, setOpen] = useState(false);
  
  const { data: timezones, isLoading: isLoadingTimezones } = useTimezones();

  // Initialize with IST and a few other popular timezones
  useEffect(() => {
    const initialTimezones = ["Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"];
    updateClocks(initialTimezones);
    
    // Set up interval to update clocks every minute
    const interval = setInterval(() => {
      updateClocks(clocks.map(clock => clock.timezone));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Update all clocks
  const updateClocks = (timezoneList: string[]) => {
    if (!timezoneList.length || !timezones) return;
    
    const istTimezone = "Asia/Kolkata";
    const now = new Date();
    
    const updatedClocks = timezoneList.map(timezone => {
      const tzInfo = timezones.find(tz => tz.value === timezone);
      const { time, date } = getCurrentTime(timezone);
      
      // Calculate difference from IST for display
      const istTime = getCurrentTime(istTimezone);
      const istDate = new Date(`${istTime.date} ${istTime.time}`);
      const localDate = new Date(`${date} ${time}`);
      
      const difference = formatTimeDifference(istDate, localDate);
      
      return {
        timezone,
        name: tzInfo?.label.split(' ')[0] || timezone,
        offset: tzInfo?.offset || "",
        time,
        date,
        difference,
        isNow: timezone === istTimezone,
      };
    });
    
    setClocks(updatedClocks);
  };

  // Add a new timezone
  const addTimezone = () => {
    if (!selectedTimezone || clocks.some(clock => clock.timezone === selectedTimezone)) {
      toast({
        title: "Error",
        description: "Please select a different timezone",
        variant: "destructive",
      });
      return;
    }
    
    const newTimezones = [...clocks.map(clock => clock.timezone), selectedTimezone];
    updateClocks(newTimezones);
    setOpen(false);
    setSelectedTimezone("");
    
    toast({
      title: "Timezone Added",
      description: "The new timezone has been added to your world clock",
    });
  };

  // Remove a timezone
  const removeTimezone = (timezone: string) => {
    // Don't allow removing IST
    if (timezone === "Asia/Kolkata") {
      toast({
        title: "Cannot Remove",
        description: "Indian Standard Time (IST) cannot be removed",
        variant: "destructive",
      });
      return;
    }
    
    const newTimezones = clocks.filter(clock => clock.timezone !== timezone).map(clock => clock.timezone);
    updateClocks(newTimezones);
    
    toast({
      title: "Timezone Removed",
      description: "The timezone has been removed from your world clock",
    });
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">World Clock</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="link" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-0 h-auto"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Timezone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Timezone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones?.filter(tz => !clocks.some(clock => clock.timezone === tz.value))
                      .map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label} ({tz.offset})
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <Button onClick={addTimezone} className="w-full">Add Timezone</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {clocks.map((clock) => (
            <div 
              key={clock.timezone} 
              className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 group relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{clock.name}</p>
                  <p className="text-2xl font-semibold">{clock.time}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {clock.offset ? `(GMT${clock.offset})` : ""}
                  </p>
                </div>
                <div className="flex items-start">
                  {clock.isNow ? (
                    <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full px-2 py-1">
                      Now
                    </span>
                  ) : (
                    <span className="text-xs font-medium bg-gray-100 dark:bg-slate-600 rounded-full px-2 py-1">
                      {clock.difference}
                    </span>
                  )}
                </div>
              </div>
              {/* Remove button (visible on hover) */}
              {!clock.isNow && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeTimezone(clock.timezone)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
