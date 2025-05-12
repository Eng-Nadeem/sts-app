import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PlusIcon, Edit2Icon, Trash2Icon, BoltIcon, CheckIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateMeterNumber } from "@/lib/utils";
import { Meter } from "@shared/schema";

// Form schema for adding/editing a meter
const meterFormSchema = z.object({
  meterNumber: z.string()
    .min(1, "Meter number is required")
    .refine(validateMeterNumber, {
      message: "Invalid meter number format (11 digits required)"
    }),
  nickname: z.string()
    .min(1, "Nickname is required")
    .max(50, "Nickname must be less than 50 characters"),
  address: z.string()
    .min(1, "Address is required"),
  customerName: z.string()
    .min(1, "Customer name is required"),
});

type MeterFormData = z.infer<typeof meterFormSchema>;

const MetersScreen = () => {
  const [, navigate] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all meters
  const { data: meters, isLoading } = useQuery<Meter[]>({
    queryKey: ['/api/meters'],
  });
  
  // Form setup for adding new meter
  const addForm = useForm<MeterFormData>({
    resolver: zodResolver(meterFormSchema),
    defaultValues: {
      meterNumber: "",
      nickname: "",
      address: "",
      customerName: "",
    },
  });
  
  // Form setup for editing existing meter
  const editForm = useForm<MeterFormData>({
    resolver: zodResolver(meterFormSchema),
    defaultValues: {
      meterNumber: "",
      nickname: "",
      address: "",
      customerName: "",
    },
  });
  
  // Mutation for adding new meter
  const addMeterMutation = useMutation({
    mutationFn: async (data: MeterFormData) => {
      const response = await apiRequest("POST", "/api/meters", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meters'] });
      toast({
        title: "Meter added successfully",
        description: "Your new meter has been added to your account",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add meter",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating existing meter
  const updateMeterMutation = useMutation({
    mutationFn: async (data: MeterFormData & { id: number }) => {
      const { id, ...meterData } = data;
      const response = await apiRequest("PUT", `/api/meters/${id}`, meterData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meters'] });
      toast({
        title: "Meter updated successfully",
        description: "Your meter information has been updated",
      });
      setIsEditDialogOpen(false);
      setSelectedMeter(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update meter",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Handle adding new meter
  const handleAddMeter = (data: MeterFormData) => {
    addMeterMutation.mutate(data);
  };
  
  // Handle updating existing meter
  const handleUpdateMeter = (data: MeterFormData) => {
    if (selectedMeter) {
      updateMeterMutation.mutate({ ...data, id: selectedMeter.id });
    }
  };
  
  // Open edit dialog for a meter
  const handleEditMeter = (meter: Meter) => {
    setSelectedMeter(meter);
    editForm.reset({
      meterNumber: meter.meterNumber,
      nickname: meter.nickname || "",
      address: meter.address || "",
      customerName: meter.customerName || "",
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle meter selection for recharge
  const handleMeterSelect = (meter: Meter) => {
    navigate(`/recharge?meterId=${meter.id}&meterNumber=${meter.meterNumber}&nickname=${meter.nickname || ''}`);
  };
  
  return (
    <div className="slide-in px-4 pt-4 pb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">My Meters</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Meter
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : meters && meters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {meters.map((meter) => (
            <Card key={meter.id} className="overflow-hidden">
              <div className={`h-2 ${meter.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">
                    {meter.nickname || `Meter ${meter.meterNumber.substring(0, 5)}...`}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditMeter(meter)}
                      className="h-8 w-8"
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm space-y-2 mb-3">
                  <div className="flex items-start">
                    <div className="w-24 text-gray-500">Meter Number:</div>
                    <div className="font-medium">{meter.meterNumber}</div>
                  </div>
                  
                  {meter.address && (
                    <div className="flex items-start">
                      <div className="w-24 text-gray-500">Address:</div>
                      <div>{meter.address}</div>
                    </div>
                  )}
                  
                  {meter.customerName && (
                    <div className="flex items-start">
                      <div className="w-24 text-gray-500">Customer:</div>
                      <div>{meter.customerName}</div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <div className="w-24 text-gray-500">Type:</div>
                    <div>{meter.type || "STS"}</div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-24 text-gray-500">Status:</div>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        meter.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="capitalize">{meter.status || "Active"}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => handleMeterSelect(meter)}
                >
                  <BoltIcon className="mr-2 h-4 w-4" />
                  Recharge Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <div className="mb-4">
            <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
              <BoltIcon className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Meters Added</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't added any electricity meters yet. Add a meter to start managing and recharging it.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Your First Meter
          </Button>
        </Card>
      )}
      
      {/* Dialog for adding new meter */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Meter</DialogTitle>
            <DialogDescription>
              Enter your meter details to add it to your account
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddMeter)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="meterNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 12345678901" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Home, Office" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Property address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name on the bill" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addMeterMutation.isPending}
                >
                  {addMeterMutation.isPending ? (
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing
                    </span>
                  ) : (
                    <span>Add Meter</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing existing meter */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meter</DialogTitle>
            <DialogDescription>
              Update your meter details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateMeter)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="meterNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Home, Office" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Property address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name on the bill" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMeterMutation.isPending}
                >
                  {updateMeterMutation.isPending ? (
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving
                    </span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MetersScreen;