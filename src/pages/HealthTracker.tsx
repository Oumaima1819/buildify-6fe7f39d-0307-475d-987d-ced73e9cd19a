
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, HealthMetric } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Activity, Droplet, Heart, Moon, Scale, Smile } from 'lucide-react';
import Layout from '@/components/Layout';

const HealthTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [todayMetrics, setTodayMetrics] = useState<HealthMetric | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<HealthMetric[]>([]);
  
  // Form state
  const [weight, setWeight] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [steps, setSteps] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  const [mood, setMood] = useState<string>('');
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchTodayMetrics();
      fetchRecentMetrics();
    }
  }, [user]);

  const fetchTodayMetrics = async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today\'s metrics:', error);
    } else if (data) {
      setTodayMetrics(data as HealthMetric);
      // Populate form with today's data
      setWeight(data.weight);
      setSleepHours(data.sleep_hours);
      setHeartRate(data.heart_rate);
      setSteps(data.steps);
      setWaterIntake(data.water_intake);
      setMood(data.mood || '');
      setStressLevel(data.stress_level || 5);
      setNotes(data.notes || '');
    }
    
    setLoading(false);
  };

  const fetchRecentMetrics = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Error fetching recent metrics:', error);
    } else {
      setRecentMetrics(data as HealthMetric[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    
    const metrics = {
      user_id: user.id,
      date: today,
      weight,
      sleep_hours: sleepHours,
      heart_rate: heartRate,
      steps,
      water_intake: waterIntake,
      mood,
      stress_level: stressLevel,
      notes
    };

    let error;
    
    if (todayMetrics) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('health_metrics')
        .update(metrics)
        .eq('id', todayMetrics.id);
      
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('health_metrics')
        .insert([metrics]);
      
      error = insertError;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: error.message,
      });
    } else {
      toast({
        title: "تم حفظ البيانات بنجاح",
        description: "تم تحديث بياناتك الصحية لهذا اليوم",
      });
      fetchTodayMetrics();
      fetchRecentMetrics();
    }
    
    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">متابعة الصحة</h1>
          <p className="text-muted-foreground">
            سجل وتتبع مؤشراتك الصحية اليومية للحفاظ على نمط حياة صحي
          </p>
        </div>

        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">تسجيل البيانات</TabsTrigger>
            <TabsTrigger value="history">السجل السابق</TabsTrigger>
          </TabsList>
          
          <TabsContent value="record">
            <Card>
              <CardHeader>
                <CardTitle>تسجيل البيانات الصحية</CardTitle>
                <CardDescription>
                  سجل بياناتك الصحية ليوم {format(new Date(), 'yyyy-MM-dd')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weight */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="weight">الوزن (كجم)</Label>
                      </div>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={weight || ''}
                        onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    
                    {/* Sleep Hours */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="sleepHours">ساعات النوم</Label>
                      </div>
                      <Input
                        id="sleepHours"
                        type="number"
                        step="0.5"
                        placeholder="0.0"
                        value={sleepHours || ''}
                        onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                    
                    {/* Heart Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="heartRate">معدل ضربات القلب (نبضة/دقيقة)</Label>
                      </div>
                      <Input
                        id="heartRate"
                        type="number"
                        placeholder="0"
                        value={heartRate || ''}
                        onChange={(e) => setHeartRate(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    
                    {/* Steps */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="steps">عدد الخطوات</Label>
                      </div>
                      <Input
                        id="steps"
                        type="number"
                        placeholder="0"
                        value={steps || ''}
                        onChange={(e) => setSteps(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    
                    {/* Water Intake */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Droplet className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="waterIntake">كمية الماء (مل)</Label>
                      </div>
                      <Input
                        id="waterIntake"
                        type="number"
                        placeholder="0"
                        value={waterIntake || ''}
                        onChange={(e) => setWaterIntake(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    
                    {/* Mood */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Smile className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="mood">المزاج</Label>
                      </div>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger id="mood">
                          <SelectValue placeholder="اختر مزاجك اليوم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ممتاز">ممتاز 😄</SelectItem>
                          <SelectItem value="جيد">جيد 🙂</SelectItem>
                          <SelectItem value="محايد">محايد 😐</SelectItem>
                          <SelectItem value="متعب">متعب 😔</SelectItem>
                          <SelectItem value="سيء">سيء 😞</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Stress Level */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stressLevel">مستوى التوتر</Label>
                      <span className="text-sm text-muted-foreground">{stressLevel}/10</span>
                    </div>
                    <Slider
                      id="stressLevel"
                      min={1}
                      max={10}
                      step={1}
                      value={[stressLevel]}
                      onValueChange={(value) => setStressLevel(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>مسترخي</span>
                      <span>متوتر جداً</span>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      placeholder="أي ملاحظات إضافية عن صحتك اليوم..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>سجل البيانات السابقة</CardTitle>
                <CardDescription>
                  عرض بياناتك الصحية للأيام السابقة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentMetrics.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات مسجلة بعد
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentMetrics.map((metric) => (
                      <Card key={metric.id} className="overflow-hidden">
                        <CardHeader className="bg-muted py-3">
                          <CardTitle className="text-base">
                            {formatDate(metric.date)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {metric.weight && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">الوزن</p>
                                  <p className="text-sm text-muted-foreground">{metric.weight} كجم</p>
                                </div>
                              </div>
                            )}
                            
                            {metric.sleep_hours && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Moon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">النوم</p>
                                  <p className="text-sm text-muted-foreground">{metric.sleep_hours} ساعة</p>
                                </div>
                              </div>
                            )}
                            
                            {metric.heart_rate && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Heart className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">النبض</p>
                                  <p className="text-sm text-muted-foreground">{metric.heart_rate} نبضة/دقيقة</p>
                                </div>
                              </div>
                            )}
                            
                            {metric.steps && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">الخطوات</p>
                                  <p className="text-sm text-muted-foreground">{metric.steps}</p>
                                </div>
                              </div>
                            )}
                            
                            {metric.water_intake && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Droplet className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">الماء</p>
                                  <p className="text-sm text-muted-foreground">{metric.water_intake} مل</p>
                                </div>
                              </div>
                            )}
                            
                            {metric.mood && (
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Smile className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">المزاج</p>
                                  <p className="text-sm text-muted-foreground">{metric.mood}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {metric.notes && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium">ملاحظات:</p>
                              <p className="text-sm text-muted-foreground">{metric.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" disabled={recentMetrics.length === 0}>
                  عرض المزيد من السجلات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HealthTracker;