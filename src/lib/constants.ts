import { Project, Service, NavigationItem, HeroCTA } from '@/types';

export const COMPANY_INFO = {
  name: 'Big Brain Coding',
  tagline: 'Modern solutions for modern problems',
  description: 'A software development company specializing in modern web technologies, AI integration, and custom application development.',
  domain: 'bigbraincoding.com',
  founded: '2024',
};

export const NAVIGATION: NavigationItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Projects', href: '/projects' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const PROJECTS: Project[] = [
  {
    id: 'mealforge',
    name: 'MealForge',
    shortDescription: 'AI-powered meal planning with recipe management',
    description: 'An intelligent meal planning application that uses AI to suggest recipes, manage dietary preferences, and provide comprehensive meal planning solutions.',
    image: '/images/projects/mealforge.jpg',
    technologies: ['React', 'TypeScript', 'AI/ML', 'Node.js', 'PostgreSQL', 'Next.js'],
    status: 'development',
    features: [
      'AI-powered recipe suggestions',
      'Dietary preference management',
      'Recipe management and organization',
      'Meal planning tools',
      'Recipe scaling capabilities',
      'Grocery list generation',
      'Modern web interface'
    ],
  },
  {
    id: 'mindmate',
    name: 'MindMate',
    shortDescription: 'ADHD/Neurodiverse AI Assistant for habit tracking',
    description: 'A compassionate AI assistant designed specifically for neurodiverse individuals to help with daily routines, medication reminders, and habit formation.',
    image: '/images/projects/mindmate.jpg',
    technologies: ['React Native', 'TypeScript', 'AI/ML', 'Firebase', 'Push Notifications'],
    status: 'development',
    features: [
      'Gentle habit reminders',
      'Medication tracking',
      'Meal time suggestions',
      'Bathroom break reminders',
      'Customizable notification system',
      'Progress tracking',
      'Mood and energy monitoring'
    ],
  },
  {
    id: 'accessiview',
    name: 'AccessiView',
    shortDescription: 'Chrome extension for neurodiverse-friendly browsing',
    description: 'A browser extension that makes the web more accessible for neurodiverse individuals by offering dyslexia-friendly fonts, reducing animations, and filtering out distracting content.',
    image: '/images/projects/accessiview.jpg',
    technologies: ['Chrome Extension', 'JavaScript', 'CSS', 'Web APIs'],
    status: 'development',
    features: [
      'Dyslexia-friendly font options',
      'Animation reduction',
      'Ad and noise filtering',
      'Sensory overload prevention',
      'Customizable reading modes',
      'Focus enhancement tools',
      'Website accessibility improvements'
    ],
  },
];

export const SERVICES: Service[] = [
  {
    id: 'web-design',
    name: 'Website Design & Development',
    description: 'Modern, responsive websites built with the latest technologies',
    icon: 'Globe',
    features: [
      'Custom design and development',
      'Responsive layouts',
      'SEO optimization',
      'Performance optimization',
      'Content management systems',
      'E-commerce integration'
    ],
  },
  {
    id: 'hosting',
    name: 'Website Hosting Services',
    description: 'Reliable hosting solutions with 99.9% uptime guarantee',
    icon: 'Server',
    features: [
      'Cloud hosting solutions',
      'SSL certificates',
      'Domain management',
      'Backup services',
      '24/7 monitoring',
      'Technical support'
    ],
  },
  {
    id: 'ai-integration',
    name: 'AI Feature Integration',
    description: 'Intelligent features that enhance user experience and business efficiency',
    icon: 'Brain',
    features: [
      'Chatbot integration',
      'Recommendation systems',
      'Data analysis',
      'Automation workflows',
      'Natural language processing',
      'Machine learning models'
    ],
  },
  {
    id: 'app-development',
    name: 'Custom Application Development',
    description: 'Tailored applications to solve your specific business needs',
    icon: 'Smartphone',
    features: [
      'Web applications',
      'Mobile apps',
      'Desktop applications',
      'API development',
      'Database design',
      'Third-party integrations'
    ],
  },
  {
    id: 'chrome-extensions',
    name: 'Chrome Extension Development',
    description: 'Browser extensions to enhance productivity and user experience',
    icon: 'Puzzle',
    features: [
      'Custom browser extensions',
      'Productivity tools',
      'Accessibility features',
      'Data collection',
      'User interface enhancements',
      'Cross-browser compatibility'
    ],
  },
];

// Social links are now handled by the SocialIcons component

export const HERO_CTAS: HeroCTA[] = [
  {
    id: 'mealforge-cta',
    title: 'Revolutionize Your Meal Planning',
    description: 'Discover MealForge - the AI-powered meal planning app that makes healthy eating effortless.',
    projectId: 'mealforge',
    ctaText: 'Learn More',
    ctaLink: '/projects#mealforge',
  },
  {
    id: 'mindmate-cta',
    title: 'Your Personal AI Companion',
    description: 'Meet MindMate - the compassionate AI assistant designed for neurodiverse individuals.',
    projectId: 'mindmate',
    ctaText: 'Explore MindMate',
    ctaLink: '/projects#mindmate',
  },
  {
    id: 'accessiview-cta',
    title: 'Make the Web Accessible',
    description: 'Experience AccessiView - the Chrome extension that makes browsing easier for everyone.',
    projectId: 'accessiview',
    ctaText: 'Try AccessiView',
    ctaLink: '/projects#accessiview',
  },
];

export const CONTACT_INFO = {
  email: 'hello@bigbraincoding.com',
  phone: '+1 (555) 123-4567',
  address: 'United States',
  support: 'support@bigbraincoding.com',
  sales: 'sales@bigbraincoding.com',
  hours: 'Monday - Friday, 9:00 AM - 6:00 PM EST',
  responseTime: 'We typically respond within 24 hours',
};