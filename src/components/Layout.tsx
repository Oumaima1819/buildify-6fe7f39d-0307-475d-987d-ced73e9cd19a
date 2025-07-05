
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  User, 
  Activity, 
  Apple, 
  Brain, 
  Pill, 
  Calendar, 
  FileText, 
  Menu, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: Home },
    ...(user ? [
      { name: 'لوحة التحكم', href: '/dashboard', icon: Activity },
      { name: 'الملف الشخصي', href: '/profile', icon: User },
      { name: 'متابعة الصحة', href: '/health-tracker', icon: Activity },
      { name: 'التغذية', href: '/nutrition', icon: Apple },
      { name: 'الصحة النفسية', href: '/mental-health', icon: Brain },
      { name: 'الأدوية', href: '/medications', icon: Pill },
      { name: 'المواعيد', href: '/appointments', icon: Calendar },
    ] : []),
    { name: 'مقالات صحية', href: '/articles', icon: FileText },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background'}`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <span className="text-2xl font-bold text-primary">صحّتي</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">إنشاء حساب</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 pt-10">
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 space-x-reverse px-2 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                        isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <item.icon className="h-5 w-5 ml-2" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} صحّتي - جميع الحقوق محفوظة
              </p>
            </div>
            <div className="flex space-x-6 space-x-reverse">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                شروط الاستخدام
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;