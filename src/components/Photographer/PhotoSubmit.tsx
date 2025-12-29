"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";

const formSchema = z.object({
  portfolioLinks: z.string().url("Please enter a valid portfolio URL"),
  samplePhotos: z.array(z.string()).min(1, "Please upload at least one photo"),
});

type PhotoSubmitProps = {
  onNext: any,
  onBack: any,
  data: any,
}

export default function PhotoSubmit({ onNext, onBack, data } : PhotoSubmitProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioLinks: data?.portfolioLinks || "",
      samplePhotos: data?.samplePhotos || [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    form.setValue("samplePhotos", urls);
  };

  //@ts-ignore
  const onSubmit = (values) => {
    onNext(values);
    // Here you would typically handle the final form submission
    console.log("Form submitted:", values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="portfolioLinks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio URL</FormLabel>
              <FormControl>
                <Input placeholder="https://your-portfolio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="samplePhotos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Sample Photos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              <FormMessage />
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}