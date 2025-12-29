"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  experience: z.string().min(10, "Please provide more details about your experience"),
  equipment: z.string().min(10, "Please provide details about your equipment"),
});

const specialties = [
  "Portrait",
  "Wedding",
  "Landscape",
  "Street",
  "Fashion",
  "Event",
  "Architecture",
  "Product",
];

type SkillDetailsProps = {
  onNext: any,
  onBack: any,
  data: any,
}


export default function SkillDetails({ onNext, onBack, data } : SkillDetailsProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialties: data?.specialties || [],
      experience: data?.experience || "",
      equipment: data?.equipment || "",
    },
  });

  //@ts-ignore
  const onSubmit = (values) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="specialties"
          render={() => (
            <FormItem>
              <FormLabel>Photography Specialties</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {specialties.map((specialty) => (
                  <FormField
                    key={specialty}
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(specialty)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              if (checked) {
                                field.onChange([...value, specialty]);
                              } else {
                                //@ts-ignore
                                field.onChange(value.filter((val) => val !== specialty));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{specialty}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your photography experience..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List your camera bodies, lenses, and other equipment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}