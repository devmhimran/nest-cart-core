'use client';

import {
  Image,
  LayoutDashboard,
  List,
  ListOrdered,
  Package,
  Palette,
  RulerDimensionLine,
  Store,
  TicketPercent,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@repo/ui';
import UserNav from './user-nav';

const superAdminMenuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Media Library',
    url: '/dashboard/media-library',
    icon: Image,
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: ListOrdered,
  },
  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: Package,
  },
  {
    title: 'Categories',
    url: '/dashboard/categories',
    icon: List,
  },
  {
    title: 'Sub Categories',
    url: '/dashboard/sub-categories',
    icon: List,
  },
  {
    title: 'Colors',
    url: '/dashboard/colors',
    icon: Palette,
  },
  {
    title: 'Sizes',
    url: '/dashboard/sizes',
    icon: RulerDimensionLine,
  },
  {
    title: 'Promo Code',
    url: '/dashboard/promo-code',
    icon: TicketPercent,
  },
  // {
  //   title: 'Shipping Charge',
  //   url: '/dashboard/shipping-charge',
  //   icon: Truck,
  // },

  {
    title: 'Customers',
    url: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 px-4 py-2 hover:bg-sidebar-accent rounded-md'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
            <Store />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>Nest Cart Core</span>
            <span className='truncate text-xs text-sidebar-foreground/70'>
              Ecommerce Admin
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='gap-2'>
              {superAdminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className='text-sm'
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                    isActive={pathname === item.url}
                  ></SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
