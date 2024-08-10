'use client';

import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

const PromptForm = () => {
  const [promptResponse, setPromptResponse] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setPromptResponse('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HONO_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(
          'Failed to get a response from server, please try again.',
        );
      }

      const data = await response.json();

      if (!data) {
        setPromptResponse('Empty response, this might be out of my knowledge.');
      }

      if (form.formState.isSubmitted && !form.formState.isSubmitSuccessful) {
        throw new Error(
          'Failed to get a response from server, please try again.',
        );
      }

      setPromptResponse(data.detail.response.toString());
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
              )}{' '}
              Submit
            </Button>
          </form>
        </Form>
      </div>

      <div className="flex items-center justify-center py-6">
        {isSubmitting && (
          <p className="animate-pulse">
            Please wait while we generate the response.
          </p>
        )}

        {promptResponse && <p className="text-lg">{promptResponse}</p>}
      </div>
    </div>
  );
};

export default PromptForm;
