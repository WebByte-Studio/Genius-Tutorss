// Generic Dashboard Sidebar Component
import {
  BookOpen,
  Search,
  CreditCard,
  Calendar,
  Star,
  MessageSquare,
  User,
  Wallet,
  LogOut,
  Users,
  Settings,
  BarChart3,
  FileText,
  DollarSign,
  Globe,
  Shield,
  Bell,
  List,
  CheckCircle2,
  BookDashed,
  BookCheck,
  Briefcase,
  Quote,
  Video,
  Key,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Tag,
  Code,
  History,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/hooks/usePermissionMenu';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  role: 'student' | 'tutor' | 'admin' | 'super_admin' | 'manager';
  menuItems?: MenuItem[];
}

export function DashboardSidebar({ activeTab, onTabChange, onLogout, role, menuItems }: DashboardSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    BarChart3,
    BookOpen,
    Search,
    CreditCard,
    Calendar,
    Star,
    MessageSquare,
    User,
    Wallet,
    Users,
    Settings,
    FileText,
    DollarSign,
    Globe,
    Shield,
    Bell,
    List,
    CheckCircle2,
    BookDashed,
    BookCheck,
    Briefcase,
    Quote,
    Video,
    Key,
    UserCheck,
    Tag,
    Code,
    History,
    ClipboardList,
  };

  // Define menu items based on role
  const getMenuItems = () => {
    // If menuItems are provided, use them (for permission-based menu)
    if (menuItems) {
      const main = menuItems.filter(item => !item.id.includes('profile') && (!item.subMenus || item.subMenus.length === 0));
      const quick = menuItems.filter(item => item.subMenus && item.subMenus.length > 0);
      const account = menuItems.filter(item => item.id.includes('profile'));
      
      return {
        main,
        quick,
        account
      };
    }

    // Fallback to role-based menu
    switch (role) {
      case 'student':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'request', label: 'Tutor Request', icon: BookOpen },
            { id: 'posted-jobs', label: 'Posted Jobs', icon: List },
            { id: 'search', label: 'Search Tutors', icon: Search },
            { id: 'demo-classes', label: 'Demo Classes', icon: BookOpen },
            { id: 'courses', label: 'My Courses', icon: BookCheck },
            // { id: 'bookings', label: 'Bookings & Payments', icon: CreditCard },
          ],
          quick: [
          ],
          account: [
            { id: 'profile', label: 'Profile Settings', icon: User },
          ],
        };
      case 'tutor':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'jobs', label: 'Find Jobs', icon: Search },
            { id: 'applications', label: 'Applications', icon: ClipboardList },
            { id: 'assignments', label: 'Assignments', icon: CheckCircle2 },
            { id: 'demo-classes', label: 'Demo Classes', icon: BookOpen },
            { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
          ],
          quick: [
            { id: 'subscription', label: 'Upgrade & Subscription', icon: Shield },
          ],
          account: [
            { id: 'profile', label: 'Profile & Documents', icon: User },
          ],
        };
      case 'super_admin':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User & Role Management', icon: Users },
          ],
          quick: [
            { id: 'platform', label: 'Platform Control', icon: Settings },
          ],
          account: [
            { id: 'profile', label: 'Profile', icon: User },
          ],
        };
      case 'admin':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'tution-request', label: 'Tution Requests', icon: Briefcase },
            { id: 'tutor connect', label: 'Tutor Connect', icon: BookCheck },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'role-management', label: 'Role Management', icon: Key },
            { id: 'upgrade-applications', label: 'Upgrade Applications', icon: Shield },
            { id: 'upgrade-packages', label: 'Package Management', icon: Settings },
            { id: 'tutor-applications', label: 'Tutor Applications', icon: UserCheck },
            { id: 'demo-classes', label: 'Demo Classes', icon: BookOpen },
            { id: 'courses', label: 'Course Management', icon: BookCheck },
            { id: 'history', label: 'History', icon: History },
          ],
          quick: [
            { 
              id: 'platform', 
              label: 'Platform Control', 
              icon: Settings,
              subMenus: [
                { id: 'seo-analytics', label: 'SEO & Analytics', icon: Tag },
                { id: 'taxonomy', label: 'Taxonomy', icon: Code },
                { id: 'featured-media', label: 'Featured Media', icon: Globe },
                { id: 'video-testimonials', label: 'Video Testimonials', icon: Video },
                { id: 'testimonials', label: 'Testimonials', icon: Quote },
                { id: 'logs', label: 'Logs & Security', icon: FileText },
              ]
            },
            { id: 'payment', label: 'Payment Management', icon: DollarSign },
          ],
          account: [
            { id: 'profile', label: 'Profile Settings', icon: User },
          ],
        };
      case 'manager':
        return {
          main: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'tutors', label: 'Tutor Management', icon: UserCheck },
            { id: 'testimonials', label: 'Testimonials', icon: Quote },
            { id: 'video-testimonials', label: 'Video Testimonials', icon: Video },
            { id: 'featured-media', label: 'Featured Media', icon: Globe },
            { id: 'payments', label: 'Payment Management', icon: DollarSign },
          ],
          quick: [
          ],
          account: [
            { id: 'profile', label: 'Profile Settings', icon: User },
          ],
        };
      default:
        return {
          main: [],
          quick: [],
          account: [],
        };
    }
  };

  const resolvedMenuItems = getMenuItems();

  const renderMenuItem = (item: any) => {
    const hasSubMenus = item.subMenus && item.subMenus.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    
    // Get icon component - handle both string and component icons
    const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;

    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => {
            if (hasSubMenus) {
              toggleMenu(item.id);
            } else {
              onTabChange(item.id);
            }
          }}
          className={`w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-green-50 hover:text-green-700 ${
            activeTab === item.id
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:shadow-sm'
          }`}
        >
          {IconComponent && <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />}
          <span className="font-medium text-xs sm:text-sm lg:text-base flex-1 text-left">{item.label}</span>
          {hasSubMenus && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </button>
        
        {hasSubMenus && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.subMenus.map((subItem: any) => {
              const SubIconComponent = typeof subItem.icon === 'string' ? iconMap[subItem.icon] : subItem.icon;
              return (
                <button
                  key={subItem.id}
                  onClick={() => onTabChange(subItem.id)}
                  className={`w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-green-50 hover:text-green-700 ${
                    activeTab === subItem.id
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:shadow-sm'
                  }`}
                >
                  {SubIconComponent && <SubIconComponent className="h-4 w-4 mr-3" />}
                  <span className="font-medium text-xs sm:text-sm">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 hide-scrollbar smooth-scroll">
        <div className="space-y-6">
          {/* Main Menu */}
          <div>
            <h3 className="px-2 sm:px-3 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
              Main Menu
            </h3>
            <div className="space-y-1 sm:space-y-2">
              {resolvedMenuItems.main.map((item) => renderMenuItem(item))}
            </div>
          </div>
          
          {/* Quick Actions */}
          {resolvedMenuItems.quick.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="px-2 sm:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {resolvedMenuItems.quick.map((item) => renderMenuItem(item))}
                </div>
              </div>
            </>
          )}

          {/* Account */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="px-2 sm:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
              Account
            </h3>
            <div className="space-y-1 sm:space-y-2">
              {resolvedMenuItems.account.map((item) => renderMenuItem(item))}
              <button
                onClick={onLogout}
                className="w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-700 text-red-600 hover:shadow-sm"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="font-medium text-xs sm:text-sm lg:text-base">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
