export interface Project {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  image: string;
  technologies: string[];
  status: 'development' | 'completed' | 'planning';
  features: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  price?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  hours?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  description?: string;
}

export interface HeroCTA {
  id: string;
  title: string;
  description: string;
  projectId: string;
  ctaText: string;
  ctaLink: string;
}