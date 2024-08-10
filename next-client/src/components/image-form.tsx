'use client';

import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const models: { [key: string]: string } = {
  'stable-diffusion-xl-base-1.0': 'sdxl1',
  'stable-diffusion-xl-lightning': 'sdxll',
};

const formSchema = z.object({
  modelName: z.enum(['sdxl1', 'sdxll']),
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

const ImageForm = () => {
  const [imageResponse, setImageResponse] = useState<Blob | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setImageResponse(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HONO_URL}/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            modelName: values.modelName,
            prompt: values.prompt,
          }),
        },
      );

      if (!response.ok || !response) {
        throw new Error(
          'Failed to get a response from server, please try again.',
        );
      }

      const imageBinaryData = await response.blob();

      if (form.formState.isSubmitted && !form.formState.isSubmitSuccessful) {
        throw new Error(
          'Failed to get a response from server, please try again.',
        );
      }

      setImageResponse(imageBinaryData);
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - POST hono/ask from Prompt Form`,
        error,
      );
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="w-full md:max-w-screen-md md:mx-auto">
      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a model" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.values(models).map((model, index) => (
                        <SelectItem key={`${model}`} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    Choose a model to generate your image from.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>

                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="What's the capital of India?"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Please enter a prompt to get response.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="min-w-32 transition-all">
              {isSubmitting ? (
                <Loader className="animate-spin h-4 w-4 mr-1" />
              ) : (
                ''
              )}
              Submit
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex items-center justify-center py-6">
        {isSubmitting && (
          <p className="animate-pulse">
            Please wait while we generate the image for you, Thanks!
          </p>
        )}

        {imageResponse && (
          <Image
            src={URL.createObjectURL(imageResponse)}
            alt="generated image"
            className="rounded-md shadow-sm"
            width={600}
            height={600}
          />
        )}
      </div>
    </div>
  );
};

export default ImageForm;
