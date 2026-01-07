import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    slug?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    image,
    type = 'website',
    slug = ''
}) => {
    const siteName = 'Nelo Marketplace';
    const defaultDescription = 'Achetez et vendez facilement au Congo-Brazzaville. Le plus grand marché en ligne pour la mode, l\'électronique et plus encore.';
    const defaultImage = 'https://nzyuwfxghaujzzfjewze.supabase.co/storage/v1/object/public/assets/og-image.jpg'; // Replace with real default

    // Construct full URL
    const url = `${window.location.origin}${slug}`;
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* OpenGraph / Facebook / WhatsApp */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
