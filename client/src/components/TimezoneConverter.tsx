import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTimezones } from "@/hooks/useTimezones";
import { insertConversionSchema } from "@shared/schema";
import { Clipboard, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertTime, getISODate, getISOTime } from "@/utils/timezone";

// Form schema
const FormSchema = z.object({
  conversionType: z.enum(["toIST", "fromIST"]),
  sourceTimezone: z.string().min(1, "Please select a timezone"),
  targetTimezone: z.string().min(1, "Please select a timezone"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function TimezoneConverter() {
  const { toast } = useToast();
  const [conversionResult, setConversionResult] = useState<{
    sourceTime: string;
    targetTime: string;
    sourceDate: string;
    targetDate: string;
    sourceTimezone: string;
    targetTimezone: string;
    difference: string;
  } | null>(null);

  const { data: timezones, isLoading: isLoadingTimezones } = useTimezones();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      conversionType: "toIST",
      sourceTimezone: "",
      targetTimezone: "",
      date: getISODate(),
      time: getISOTime(),
    },
  });

  // Save to history mutation
  const saveConversionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/conversions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save conversion to history",
        variant: "destructive",
      });
    },
  });

  // Save to favorites mutation
  const saveFavoriteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/favorites", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Conversion saved to favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save to favorites",
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = async (formData: FormValues) => {
    try {
      console.log("Converting with form data:", formData);
      const istTimezone = "Asia/Kolkata";
      let sourceTimezone, targetTimezone;

      if (formData.conversionType === "toIST") {
        sourceTimezone = formData.sourceTimezone;
        targetTimezone = istTimezone;
      } else {
        sourceTimezone = istTimezone;
        targetTimezone = formData.targetTimezone;
      }

      console.log("Source timezone:", sourceTimezone);
      console.log("Target timezone:", targetTimezone);
      console.log("Date:", formData.date);
      console.log("Time:", formData.time);

      // Convert time
      const result = convertTime(
        sourceTimezone,
        targetTimezone,
        formData.date,
        formData.time
      );

      // Find timezone display names
      const sourceTimezoneObj = timezones?.find(tz => tz.value === sourceTimezone);
      const targetTimezoneObj = timezones?.find(tz => tz.value === targetTimezone);

      const sourceLabel = sourceTimezoneObj?.label.split(' ')[0] || sourceTimezone;
      const targetLabel = targetTimezoneObj?.label.split(' ')[0] || targetTimezone;

      // Set result
      setConversionResult({
        sourceTime: result.sourceTime,
        targetTime: result.targetTime,
        sourceDate: formData.date,
        targetDate: result.targetDate,
        sourceTimezone: sourceLabel,
        targetTimezone: targetLabel,
        difference: result.difference,
      });

      // Save to history
      saveConversionMutation.mutate({
        sourceTimezone,
        targetTimezone,
        sourceTime: result.sourceTime,
        targetTime: result.targetTime,
        date: formData.date,
      });
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Failed to convert between timezones",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  // Handle save to favorites
  const handleSaveToFavorites = () => {
    if (!conversionResult) return;

    let sourceTimezone, targetTimezone;
    if (form.getValues("conversionType") === "toIST") {
      sourceTimezone = form.getValues("sourceTimezone");
      targetTimezone = "Asia/Kolkata";
    } else {
      sourceTimezone = "Asia/Kolkata";
      targetTimezone = form.getValues("targetTimezone");
    }

    const name = `${conversionResult.sourceTimezone} → ${conversionResult.targetTimezone}`;

    saveFavoriteMutation.mutate({
      sourceTimezone,
      targetTimezone,
      name,
    });
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (!conversionResult) return;

    const textToCopy = `${conversionResult.sourceTimezone}: ${conversionResult.sourceTime} → ${conversionResult.targetTimezone}: ${conversionResult.targetTime} (${conversionResult.targetDate})`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({ 
        title: "Copied to clipboard",
        description: textToCopy
      });
    }).catch(() => {
      toast({ 
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive"
      });
    });
  };

  // Update form fields based on conversion type
  const conversionType = form.watch("conversionType");
  
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-6">Time Converter</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Conversion Type Tabs */}
              <FormField
                control={form.control}
                name="conversionType"
                render={({ field }) => (
                  <FormItem>
                    <Tabs
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-700">
                        <TabsTrigger value="toIST">To IST</TabsTrigger>
                        <TabsTrigger value="fromIST">From IST</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormItem>
                )}
              />

              {/* Source Timezone Selection */}
              {conversionType === "toIST" && (
                <FormField
                  control={form.control}
                  name="sourceTimezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Time Zone</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingTimezones ? (
                              <Skeleton className="h-24" />
                            ) : (
                              timezones?.filter(tz => tz.value !== "Asia/Kolkata").map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label} ({tz.offset})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Target Timezone Selection */}
              {conversionType === "fromIST" && (
                <FormField
                  control={form.control}
                  name="targetTimezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Time Zone</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingTimezones ? (
                              <Skeleton className="h-24" />
                            ) : (
                              timezones?.filter(tz => tz.value !== "Asia/Kolkata").map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label} ({tz.offset})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Date Picker */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Time Input */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Convert Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={saveConversionMutation.isPending}
              >
                Convert
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Conversion Result Card */}
      {conversionResult && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Conversion Result</h3>
            
            {/* Source Time */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{conversionResult.sourceTimezone}</p>
                  <p className="text-2xl font-semibold">{conversionResult.sourceTime}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{conversionResult.sourceDate}</p>
                </div>
                <div>
                  <span className="text-xs font-medium bg-gray-100 dark:bg-slate-600 rounded-full px-2 py-1">
                    {conversionResult.difference}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Target Time */}
            <div className="bg-primary-50 dark:bg-slate-700 rounded-lg p-4 border border-primary-100 dark:border-primary-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-primary-600 dark:text-primary-300">{conversionResult.targetTimezone}</p>
                  <p className="text-2xl font-semibold text-primary-700 dark:text-primary-300">{conversionResult.targetTime}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400">{conversionResult.targetDate}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 h-8 w-8 p-0">
                  <Clipboard className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Save to Favorites Button */}
            <div className="mt-4">
              <Button 
                variant="link" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-0 h-auto" 
                onClick={handleSaveToFavorites}
                disabled={saveFavoriteMutation.isPending}
              >
                <Star className="h-4 w-4 mr-1" /> Save to Favorites
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
