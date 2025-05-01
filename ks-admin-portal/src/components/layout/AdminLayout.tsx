import type React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/toaster';
import {
  Boxes,
  ChevronRight,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  ShieldCheck,
  Tag,
  User2,
  UserRound,
  Wallet,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const sidebarItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      requiredPermission: null,
    },
    {
      name: 'Products',
      path: '/products',
      icon: <Package className="h-5 w-5" />,
      requiredPermission: 'products.view',
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: <Tag className="h-5 w-5" />,
      requiredPermission: 'categories.view',
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: <User2 className="h-5 w-5" />,
      requiredPermission: 'customers.view',
    },
    {
      name: 'Warranties',
      path: '/warranties',
      icon: <ShieldCheck className="h-5 w-5" />,
      requiredPermission: 'warranties.view',
    },
    {
      name: 'Users',
      path: '/users',
      icon: <UserRound className="h-5 w-5" />,
      requiredPermission: 'users.view',
    },
    {
      name: 'Roles',
      path: '/roles',
      icon: <Wallet className="h-5 w-5" />,
      requiredPermission: 'roles.view',
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col space-y-2 py-4">
      <div className="px-3 py-2">
        <Link to="/dashboard" className="flex items-center gap-2 px-2">
          <Boxes className="h-6 w-6" />
          <span className="text-xl font-bold">K-S Enterprise</span>
        </Link>
      </div>
      <div className="px-3 py-2">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 text-sm">
          <Home className="h-4 w-4" />
          <span>Go to Website</span>
        </Link>
      </div>
      <div className="px-3 py-2">
        <p className="mb-2 px-2 text-xs font-semibold uppercase">Admin</p>
        <nav className="flex flex-col space-y-1">
          {sidebarItems.map((item) => {
            // Only show menu item if user has required permission or item needs no permission
            if (item.requiredPermission === null || hasPermission(item.requiredPermission)) {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            }
            return null;
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
          </div>

          {/* Title (Mobile) */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold">K-S Enterprise</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings/password">Change Password</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <div className="hidden border-r bg-background lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] w-60 overflow-y-auto">
            {renderSidebarContent()}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-6">{children}</div>
        </main>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};
