
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Apple, Brain, Calendar, Heart, Pill, Shield } from 'lucide-react';
import Layout from '@/components/Layout';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Activity,
      title: 'متابعة الصحة اليومية',
      description: 'تتبع مؤشراتك الصحية مثل الوزن، النوم، معدل ضربات القلب، والنشاط البدني.',
    },
    {
      icon: Apple,
      title: 'نصائح غذائية مخصصة',
      description: 'خطط وجبات يومية تعتمد على أهدافك الصحية وتفضيلاتك الغذائية.',
    },
    {
      icon: Brain,
      title: 'دعم الصحة النفسية',
      description: 'تمارين تأمل، تقنيات تنفس، وأدوات لتحسين صحتك النفسية.',
    },
    {
      icon: Pill,
      title: 'تذكير بالأدوية',
      description: 'نظام تنبيهات لتناول الأدوية في مواعيدها المحددة.',
    },
    {
      icon: Calendar,
      title: 'إدارة المواعيد الطبية',
      description: 'تنظيم وتذكير بمواعيد زياراتك للأطباء والفحوصات الطبية.',
    },
    {
      icon: Shield,
      title: 'خصوصية وأمان',
      description: 'بياناتك الصحية محمية بأعلى معايير الأمان والخصوصية.',
    },
  ];

  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'مستخدم منذ 6 أشهر',
      content: 'ساعدني تطبيق صحّتي على تنظيم مواعيد أدويتي وتحسين نمط حياتي بشكل كبير. أنصح به بشدة!',
    },
    {
      name: 'سارة علي',
      role: 'مستخدمة منذ سنة',
      content: 'بفضل التطبيق، تمكنت من خسارة 10 كيلوغرامات واكتساب عادات صحية جديدة. تجربة رائعة!',
    },
    {
      name: 'خالد عبدالله',
      role: 'مريض سكري',
      content: 'يساعدني التطبيق على متابعة حالتي الصحية بشكل يومي وتنظيم وجباتي بما يتناسب مع حالتي.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  صحّتي - رفيقك الذكي لحياة صحية أفضل
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  تطبيق متكامل يساعدك على تتبع صحتك، تحسين نمط حياتك، والوصول إلى استشارات طبية موثوقة.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <Button size="lg" asChild>
                    <Link to="/dashboard">الذهاب إلى لوحة التحكم</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link to="/register">ابدأ الآن مجاناً</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/login">تسجيل الدخول</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mx-auto lg:mr-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-3xl blur-3xl opacity-30"></div>
              <img
                src="https://placehold.co/600x400/4CAF50/FFFFFF/png?text=صحّتي"
                alt="صحّتي تطبيق"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                width={550}
                height={310}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                <Heart className="inline-block h-4 w-4 ml-1 text-primary" />
                ميزات التطبيق
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                كل ما تحتاجه لحياة صحية في مكان واحد
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                يقدم تطبيق صحّتي مجموعة متكاملة من الأدوات لمساعدتك على تحسين صحتك ونمط حياتك
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                ماذا يقول مستخدمو صحّتي
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                تجارب حقيقية من أشخاص استفادوا من تطبيق صحّتي
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">"{testimonial.content}"</p>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                ابدأ رحلتك نحو حياة صحية أفضل
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                انضم إلى الآلاف من المستخدمين الذين يستفيدون من تطبيق صحّتي يومياً
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">الذهاب إلى لوحة التحكم</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/register">ابدأ الآن مجاناً</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/login">تسجيل الدخول</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;