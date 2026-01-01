/**
 * SEO Component
 * Manages meta tags for better SEO and social sharing
 */

import { useEffect } from 'react';

const SEO = ({
  title = 'Signum - AI-Powered Learning with Blockchain Credentials',
  description = 'Master Data Structures and Blockchain with interactive visualizations, AI tutoring, and secure NFT certificates. Unforgettable learning, unforgeable credentials.',
  keywords = 'online learning, data structures, blockchain, AI tutor, NFT certificates, Solana, interactive learning, coding challenges',
  author = 'Signum Education',
  ogType = 'website',
  ogImage = '/signum-og-image.png',
  twitterCard = 'summary_large_image',
  canonicalUrl,
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', author);
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    updateMeta('theme-color', '#10b981');
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    if (canonicalUrl) {
      updateMeta('og:url', canonicalUrl, true);
    }
    updateMeta('og:site_name', 'Signum', true);
    
    // Twitter Card tags
    updateMeta('twitter:card', twitterCard);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    
    // Additional SEO tags
    updateMeta('robots', 'index, follow');
    updateMeta('language', 'English');
    updateMeta('revisit-after', '7 days');
    
    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }
    
    // Structured Data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'Signum',
      'description': description,
      'url': canonicalUrl || window.location.origin,
      'logo': ogImage,
      'sameAs': [],
      'offers': {
        '@type': 'Offer',
        'category': 'Education',
        'priceCurrency': 'USD',
        'price': '0',
        'availability': 'https://schema.org/InStock'
      }
    };
    
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
    
  }, [title, description, keywords, author, ogType, ogImage, twitterCard, canonicalUrl]);
  
  return null; // This component doesn't render anything
};

export default SEO;
