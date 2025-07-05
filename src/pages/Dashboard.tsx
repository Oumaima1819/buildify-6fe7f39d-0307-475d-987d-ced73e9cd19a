
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, HealthMetric } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Droplet, Heart, Moon, Apple, Brain, Pill, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [todayMetrics, setTodayMetrics] = useState<HealthMetric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayMetrics = async () => {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today\'s metrics:', error);
      } else {
        setTodayMetrics(data as HealthMetric);
      }
      
      setLoading(false);
    };

    fetchTodayMetrics();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  const calculateWaterProgress = () => {
    if (!todayMetrics?.water_intake) return 0;
    // Assuming recommended water intake is 2500ml
    return Math.min(100, (todayMetrics.water_intake / 2500) * 100);
  };

  const calculateStepsProgress = () => {
    if (!todayMetrics?.steps) return 0;
    // Assuming goal is 10,000 steps
    return Math.min(100, (todayMetrics.steps / 10000) * 100);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {profile?.full_name || 'مستخدم صحّتي'}
          </h1>
          <p className="text-muted-foreground">
            تابع صحتك اليومية وحافظ على نمط حياة صحي
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الخطوات</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : todayMetrics?.steps || 0}
              </div>
              <Progress value={calculateStepsProgress()} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                الهدف: 10,000 خطوة
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الماء</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${todayMetrics?.water_intake || 0} مل`}
              </div>
              <Progress value={calculateWaterProgress()} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                الهدف: 2,500 مل
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل ضربات القلب</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${todayMetrics?.heart_rate || '--'} نبضة/دقيقة`}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                آخر قياس: {todayMetrics?.created_at ? new Date(todayMetrics.created_at).toLocaleTimeString('ar-SA') : '--'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">النوم</CardTitle>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${todayMetrics?.sleep_hours || '--'} ساعة`}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                الهدف: 8 ساعات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mt-8 mb-4">الأقسام الرئيسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Activity className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-lg mb-2">متابعة الصحة</CardTitle>
              <CardDescription className="mb-4">
                سجل وتتبع مؤشراتك الصحية اليومية
              </CardDescription>
              <Button asChild className="w-full">
                <Link to="/health-tracker">فتح</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Apple className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-lg mb-2">التغذية</CardTitle>
              <CardDescription className="mb-4">
                تتبع وجباتك وخطط لنظام غذائي صحي
              </CardDescription>
              <Button asChild className="w-full">
                <Link to="/nutrition">فتح</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Brain className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-lg mb-2">الصحة النفسية</CardTitle>
              <CardDescription className="mb-4">
                تمارين للاسترخاء وتحسين الصحة النفسية
              </CardDescription>
              <Button asChild className="w-full">
                <Link to="/mental-health">فتح</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Pill className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-lg mb-2">الأدوية</CardTitle>
              <CardDescription className="mb-4">
                تذكيرات بمواعيد الأدوية ومتابعتها
              </CardDescription>
              <Button asChild className="w-full">
                <Link to="/medications">فتح</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add Health Data CTA */}
        {!todayMetrics && !loading && (
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold">لم تسجل بياناتك الصحية اليوم</h3>
                <p className="text-muted-foreground">
                  سجل بياناتك اليومية للحفاظ على تتبع دقيق لصحتك
                </p>
              </div>
              <Button asChild>
                <Link to="/health-tracker">تسجيل البيانات الآن</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;