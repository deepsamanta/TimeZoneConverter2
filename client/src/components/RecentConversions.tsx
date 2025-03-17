import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Conversion {
  id: number;
  sourceTimezone: string;
  targetTimezone: string;
  sourceTime: string;
  targetTime: string;
  date: string;
  createdAt: string;
}

export default function RecentConversions() {
  const { toast } = useToast();

  // Fetch recent conversions
  const { data: conversions, isLoading } = useQuery<Conversion[]>({
    queryKey: ['/api/conversions'],
  });

  // Clear history mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/conversions`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversions'] });
      toast({
        title: "Success",
        description: "Conversion history cleared",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    },
  });

  const handleClearHistory = () => {
    clearMutation.mutate();
  };

  const useConversion = (conversion: Conversion) => {
    // Logic to reuse this conversion would go here
    // For now, we'll just show a toast
    toast({
      title: "Using conversion",
      description: `Applying ${conversion.sourceTimezone} to ${conversion.targetTimezone} conversion`,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d");
    } catch (e) {
      return dateString;
    }
  };

  const getTimezoneName = (timezone: string) => {
    const parts = timezone.split('/');
    return parts[parts.length - 1].replace('_', ' ');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">Recent Conversions</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : conversions && conversions.length > 0 ? (
          <>
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <div 
                  key={conversion.id}
                  className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center">
                      <span className="inline-block w-20 text-sm">{conversion.sourceTime}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                      <span className="inline-block w-20 text-sm">{conversion.targetTime}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimezoneName(conversion.sourceTimezone)} → {getTimezoneName(conversion.targetTimezone)} • {formatDate(conversion.date)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                    onClick={() => useConversion(conversion)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Use this conversion</span>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="link" 
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your conversion history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearHistory}
                      disabled={clearMutation.isPending}
                    >
                      {clearMutation.isPending ? "Clearing..." : "Clear History"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw className="h-6 w-6 mx-auto mb-2" />
            <p>No conversion history</p>
            <p className="text-sm mt-1">Your recent timezone conversions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
