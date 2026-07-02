import IconInstagram from '@/components/icons/social/IconInstagram.vue';
import IconLinkedin from '@/components/icons/social/IconLinkedin.vue';
import IconFacebook from '@/components/icons/social/IconFacebook.vue';
import IconPinterest from '@/components/icons/social/IconPinterest.vue';
import IconGoogle from '@/components/icons/social/IconGoogle.vue';

export const socialProviders = [
  { slug: 'instagram', label: 'Instagram', icon: IconInstagram, color: '#E1306C' },
  { slug: 'linkedin', label: 'LinkedIn', icon: IconLinkedin, color: '#0A66C2' },
  { slug: 'facebook', label: 'Facebook', icon: IconFacebook, color: '#1877F2' },
  { slug: 'pinterest', label: 'Pinterest', icon: IconPinterest, color: '#E60023' },
  { slug: 'google-business', label: 'Google Business Profile', icon: IconGoogle, color: '#4285F4' },
];

// Réseaux réellement gérés par le backend pour la publication (SocialNetwork enum côté API).
export const publishableNetworks = ['instagram', 'linkedin', 'facebook'];

export function findProvider(slug) {
  return socialProviders.find((p) => p.slug === slug);
}
