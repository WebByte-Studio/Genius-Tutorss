'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { getWebsiteInfo } from "@/services/websiteService";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  
  const [websiteInfo, setWebsiteInfo] = useState({ 
    siteName: 'Tutor Connect', 
    siteLogo: '/logo.svg',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    footerCredit: '© 2025 Tutor Today. All rights reserved | Developed by <a href="https://webbytestudio.com" target="_blank" class="text-primary hover:text-primary/80 transition-colors">WebByte Studio</a>'
  });
  
  useEffect(() => {
    const fetchWebsiteInfo = async () => {
      try {
        const info = await getWebsiteInfo();
        setWebsiteInfo(info);
      } catch (error) {
        console.error('Error fetching website info:', error);
      }
    };
    
    fetchWebsiteInfo();
  }, []);
  
  // Don't show footer in admin pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin')) {
    return null;
  }
  
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 col-span-2 xs:col-span-2 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              {websiteInfo.siteLogo ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 relative">
                  <Image 
                    src={websiteInfo.siteLogo} 
                    alt={websiteInfo.siteName} 
                    fill 
                    className="object-contain" 
                  />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-base sm:text-lg">T</span>
                </div>
              )}
              <span className="text-lg sm:text-xl font-bold text-gradient">
                {websiteInfo.siteName}
              </span>
            </Link>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find the best tutors in your area for home and online tuitions. 
              Connecting students with qualified teachers for better learning.
            </p>
            <div className="flex space-x-4">
              {websiteInfo.socialLinks?.facebook && (
                <a href={websiteInfo.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                </a>
              )}
              {websiteInfo.socialLinks?.twitter && (
                <a href={websiteInfo.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                </a>
              )}
              {websiteInfo.socialLinks?.instagram && (
                <a href={websiteInfo.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                </a>
              )}
              {websiteInfo.socialLinks?.linkedin && (
                <a href={websiteInfo.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/tuition-jobs" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Tuition Jobs
                </Link>
              </li>
              <li>
                <Link href="/premium-tutors" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Tutor Hub
                </Link>
              </li>
              <li>
                <Link href="/tutor-request" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Tutor Request
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Support</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/about" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4 col-span-2 xs:col-span-2 sm:col-span-2 md:col-span-1 mt-4 sm:mt-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Contact Info</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  {websiteInfo.contactPhone}
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  {websiteInfo.contactEmail}
                </span>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  {websiteInfo.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p 
              className="text-xs sm:text-sm text-muted-foreground [&_a]:text-primary [&_a]:hover:text-primary/80 [&_a]:transition-colors"
              dangerouslySetInnerHTML={{ __html: websiteInfo.footerCredit }}
            />
            <div className="flex space-x-4 sm:space-x-6 mt-3 md:mt-0">
              <Link href="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};