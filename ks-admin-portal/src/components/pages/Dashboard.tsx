import type React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BadgeCheck,
  Box,
  Calendar,
  FileEdit,
  MessageSquare,
  Package,
  ShieldCheck,
  User2,
  UserRound,
  Wallet,
} from 'lucide-react';
import { getAllContactSubmissions } from '@/services/contact.service';
import { getAllContent } from '@/services/content.service';

export const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [contactSubmissionsCount, setContactSubmissionsCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);

  // Fetch data for dashboard stats
  useEffect(() => {
    const fetchContactSubmissions = async () => {
      try {
        if (hasPermission('contact.view')) {
          const result = await getAllContactSubmissions(1, 1);
          if (result.success) {
            setContactSubmissionsCount(result.data.pagination.total);
          }
        }
      } catch (error) {
        console.error('Error fetching contact submissions count:', error);
      }
    };

    const fetchContentSections = async () => {
      try {
        if (hasPermission('content.view')) {
          const result = await getAllContent();
          if (result.success) {
            setContentCount(result.data.length);
          }
        }
      } catch (error) {
        console.error('Error fetching content sections count:', error);
      }
    };

    fetchContactSubmissions();
    fetchContentSections();
  }, [hasPermission]);

  // Mock data for dashboard stats - in a real app this would come from API
  const stats = {
    totalProducts: 124,
    totalCategories: 8,
    totalCustomers: 350,
    totalWarranties: 298,
    activeWarranties: 245,
    expiringWarranties: 12,
    totalUsers: 5,
    totalRoles: 4,
  };

  // Cards to display on dashboard
  const statCards = [
    {
      id: 'products',
      title: 'Total Products',
      value: stats.totalProducts,
      description: 'Products in inventory',
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/products',
      permission: 'products.view',
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: stats.totalCustomers,
      description: 'Registered customers',
      icon: <User2 className="h-5 w-5" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      link: '/customers',
      permission: 'customers.view',
    },
    {
      id: 'warranties',
      title: 'Active Warranties',
      value: stats.activeWarranties,
      description: 'Currently active warranties',
      icon: <ShieldCheck className="h-5 w-5" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      link: '/warranties',
      permission: 'warranties.view',
    },
    {
      id: 'expiring',
      title: 'Expiring Soon',
      value: stats.expiringWarranties,
      description: 'Warranties expiring in 30 days',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      link: '/warranties',
      permission: 'warranties.view',
    },
  ];

  const adminStatCards = [
    {
      id: 'categories',
      title: 'Total Categories',
      value: stats.totalCategories,
      description: 'Product categories',
      icon: <Box className="h-5 w-5" />,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      link: '/categories',
      permission: 'categories.view',
    },
    {
      id: 'contact',
      title: 'Contact Messages',
      value: contactSubmissionsCount,
      description: 'Customer inquiries',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      link: '/contact',
      permission: 'contact.view',
    },
    {
      id: 'content',
      title: 'Content Sections',
      value: contentCount,
      description: 'Website content sections',
      icon: <FileEdit className="h-5 w-5" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      link: '/content',
      permission: 'content.view',
    },
    {
      id: 'users',
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'System users',
      icon: <UserRound className="h-5 w-5" />,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      link: '/users',
      permission: 'users.view',
    },
  ];

  // Filter cards based on user permissions
  const filteredStatCards = statCards.filter(card =>
    !card.permission || hasPermission(card.permission)
  );

  const filteredAdminStatCards = adminStatCards.filter(card =>
    !card.permission || hasPermission(card.permission)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your system.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredStatCards.map((card) => (
          <Link to={card.link} key={card.id}>
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`${card.bgColor} ${card.color} rounded-full p-2`}>{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Admin Stats */}
      <div>
        <h3 className="mb-4 text-lg font-medium">Administration</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredAdminStatCards.map((card) => (
            <Link to={card.link} key={card.id}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`${card.bgColor} ${card.color} rounded-full p-2`}>{card.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h3 className="mb-4 text-lg font-medium">Recent Activity</h3>
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              This is a placeholder for recent activity and system metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In the complete implementation, this section would show recent activities like new
              customers, products, or warranty registrations. It could also display charts for
              analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
