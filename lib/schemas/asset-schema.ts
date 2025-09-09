import z from "zod";

export const CreateAssetSchema = z.object({
  title: z.string().min(1, { message: 'The title cannot be empty.' }),
  url: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .min(1, { message: 'The URL cannot be empty.' })
    .refine(
      async (url) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            return false;
          }

          const contentType = response.headers.get('content-type');
          return contentType && contentType.startsWith('image/');
        } catch {
          return false;
        }
      },
      {
        message: 'The URL does not point to a valid image.',
      },
    ),
});
