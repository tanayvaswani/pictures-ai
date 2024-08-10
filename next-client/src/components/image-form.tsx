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
  sdxl1: 'stable-diffusion-xl-base-1.0',
  sdxll: 'stable-diffusion-xl-lightning',
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_HONO_URL}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName: values.modelName,
          prompt: values.prompt,
        }),
      });

      if (!response.ok || !response) {
        throw new Error('Failed to get a response from server, please try again.');
      }

      const imageBinaryData = await response.blob();

      if (form.formState.isSubmitted && !form.formState.isSubmitSuccessful) {
        throw new Error('Failed to get a response from server, please try again.');
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
    <div className="w-full flex flex-col lg:flex-row items-start gap-6">
      <div className="w-full border rounded-lg">
        <h1 className="py-3 px-3 text-xl font-semibold border-b">Generate an Image</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full px-3 py-4"
          >
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a model" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.keys(models).map((model, index) => (
                        <SelectItem key={`${model}`} value={model}>
                          {models[model]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormDescription>Choose a model to generate your image</FormDescription>
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
                      placeholder="A mustang on the highway"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>Enter a prompt to get response</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full transition-all delay-150">
              {isSubmitting ? (
                <Loader className="animate-spin transition-all delay-150 h-4 w-4 mr-1" />
              ) : (
                ''
              )}
              Submit
            </Button>
          </form>
        </Form>
      </div>

      <div className="w-full flex items-center justify-center">
        {isSubmitting && (
          <p className="animate-pulse py-6">
            Please wait while we generate an image for you, Thanks!
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
