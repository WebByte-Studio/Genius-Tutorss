import { MenuItem } from '@/hooks/usePermissionMenu';

export const adminMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'BarChart3',
    permission: 'View Dashboard'
  },
  {
    id: 'tution-request',
    label: 'Tuition Requests',
    icon: 'Briefcase',
    permission: 'View Tuition Requests'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'Star',
    permission: 'View Reviews'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    permission: 'View Users'
  },
  {
    id: 'permission-assignment',
    label: 'Permission Assignment',
    icon: 'Shield',
    permission: 'View Role Management'
  },
  {
    id: 'upgrade-applications',
    label: 'Upgrade Applications',
    icon: 'Shield',
    permission: 'View Upgrade Applications'
  },
  {
    id: 'upgrade-packages',
    label: 'Package Management',
    icon: 'Settings',
    permission: 'View Package Management'
  },
  {
    id: 'tutor-applications',
    label: 'Tutor Applications',
    icon: 'UserCheck',
    permission: 'View Tutor Applications'
  },
  {
    id: 'demo-classes',
    label: 'Demo Classes',
    icon: 'BookOpen',
    permission: 'View Demo Classes'
  },
  {
    id: 'courses',
    label: 'Course Management',
    icon: 'BookCheck',
    permission: 'View Course Management'
  },
  {
    id: 'history',
    label: 'History',
    icon: 'History',
    permission: 'View History'
  },
  {
    id: 'platform',
    label: 'Platform Control',
    icon: 'Settings',
    permission: 'View Platform Control',
    subMenus: [
      {
        id: 'seo-analytics',
        label: 'SEO & Analytics',
        icon: 'Tag',
        permission: 'View SEO Analytics'
      },
      {
        id: 'taxonomy',
        label: 'Taxonomy',
        icon: 'Code',
        permission: 'View Taxonomy'
      },
      {
        id: 'featured-media',
        label: 'Featured Media',
        icon: 'Globe',
        permission: 'View Featured Media'
      },
      {
        id: 'video-testimonials',
        label: 'Video Testimonials',
        icon: 'Video',
        permission: 'View Video Testimonials'
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        icon: 'Quote',
        permission: 'View Testimonials'
      },
      {
        id: 'logs',
        label: 'Logs & Security',
        icon: 'FileText',
        permission: 'View Logs Security'
      }
    ]
  },
  {
    id: 'payment',
    label: 'Payment Management',
    icon: 'DollarSign',
    permission: 'View Payment Management'
  },
  {
    id: 'profile',
    label: 'Profile Settings',
    icon: 'User'
  }
];

export const managerMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'BarChart3',
    permission: 'View Dashboard'
  },
  {
    id: 'tution-request',
    label: 'Tuition Requests',
    icon: 'Briefcase',
    permission: 'View Tuition Requests'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'Star',
    permission: 'View Reviews'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'Users',
    permission: 'View Users'
  },
  {
    id: 'tutor-applications',
    label: 'Tutor Applications',
    icon: 'UserCheck',
    permission: 'View Tutor Applications'
  },
  {
    id: 'demo-classes',
    label: 'Demo Classes',
    icon: 'BookOpen',
    permission: 'View Demo Classes'
  },
  {
    id: 'upgrade-applications',
    label: 'Upgrade Applications',
    icon: 'Shield',
    permission: 'View Upgrade Applications'
  },
  {
    id: 'upgrade-packages',
    label: 'Package Management',
    icon: 'Settings',
    permission: 'View Package Management'
  },
  {
    id: 'courses',
    label: 'Course Management',
    icon: 'BookCheck',
    permission: 'View Course Management'
  },
  {
    id: 'history',
    label: 'History',
    icon: 'History',
    permission: 'View History'
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    icon: 'Quote',
    permission: 'View Testimonials'
  },
  {
    id: 'video-testimonials',
    label: 'Video Testimonials',
    icon: 'Video',
    permission: 'View Video Testimonials'
  },
  {
    id: 'featured-media',
    label: 'Featured Media',
    icon: 'Globe',
    permission: 'View Featured Media'
  },
  {
    id: 'payments',
    label: 'Payment Management',
    icon: 'DollarSign',
    permission: 'View Payment Management'
  },
  {
    id: 'profile',
    label: 'Profile Settings',
    icon: 'User'
  }
];
