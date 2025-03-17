import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimezones } from "@/hooks/useTimezones";
import { Skeleton } from "@/components/ui/skeleton";

interface Favorite {
  id: number;
  sourceTimezone: string;
  targetTimezone: string;
  name: string;
  createdAt: string;
}

export default function Favorites() {
  const { toast } = useToast();
  const { data: timezones } = useTimezones();

  // Fetch favorites
  const { data: favorites, isLoading } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
  });

  // Delete favorite mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Favorite removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    },
  });

  const getTimezoneLabel = (tzValue: string) => {
    const timezone = timezones?.find(tz => tz.value === tzValue);
    return timezone?.label.split(' ')[0] || tzValue;
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const useFavorite = (favorite: Favorite) => {
    // Logic to use this favorite conversion would go here
    // For now, we'll just show a toast
    toast({
      title: "Using favorite",
      description: `${favorite.name} conversion selected`,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">Saved Favorites</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200">
                <div>
                  <p className="font-medium">{favorite.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getTimezoneLabel(favorite.sourceTimezone)} to {getTimezoneLabel(favorite.targetTimezone)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                    onClick={() => useFavorite(favorite)}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">Use this conversion</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    onClick={() => handleDelete(favorite.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove from favorites</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <Star className="h-6 w-6 mx-auto mb-2" />
            <p>No favorites saved yet</p>
            <p className="text-sm mt-1">Your saved timezone conversions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
