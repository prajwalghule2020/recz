import type { Metadata } from 'next';

export const DEFAULT_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
export const NORMALIZED_DEFAULT_URL = DEFAULT_URL.endsWith('/') ? DEFAULT_URL : `${DEFAULT_URL}/`;
export const DEFAULT_TITLE = 'Face AI - Intelligent Photo Search';
export const DEFAULT_DESCRIPTION =
  'Face AI helps you organize and search your photos by people, places, and events with AI-powered recognition and semantic search.';
export const DEFAULT_IMAGE_URL = `${NORMALIZED_DEFAULT_URL}logo.svg`;

const defaultMetadata: Metadata = {
  metadataBase: new URL(NORMALIZED_DEFAULT_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Face AI',
    url: NORMALIZED_DEFAULT_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_IMAGE_URL, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_IMAGE_URL],
  },
};

const generateMetadata = (title?: string, description?: string, canonicaUrl?: string, imageUrl?: string): Metadata => {
  return {
    ...defaultMetadata,
    title: title ?? defaultMetadata.title,
    description: description ?? defaultMetadata.description,
    alternates: {
      canonical: canonicaUrl,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title ?? defaultMetadata.openGraph?.title,
      description: description ?? defaultMetadata.openGraph?.description,
      url: canonicaUrl ?? defaultMetadata.openGraph?.url,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title ?? defaultMetadata.twitter?.title,
      description: description ?? defaultMetadata.twitter?.description,
      images: imageUrl ? [imageUrl] : defaultMetadata.twitter?.images,
    },
  };
};

export { defaultMetadata, generateMetadata };
