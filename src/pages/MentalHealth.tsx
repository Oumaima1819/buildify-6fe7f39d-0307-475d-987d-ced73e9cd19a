
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, MentalExercise } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Brain, Play, Pause, Clock, Sparkles, Smile, Frown, Meh } from 'lucide-react';
import Layout from '@/components/Layout';

const MentalHealth = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<MentalExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<MentalExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number>(5);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timer < maxTime) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (timer >= maxTime && maxTime > 0) {
      setIsPlaying(false);
      toast({
        title: "تم الانتهاء من التمرين",
        description: "أحسنت! لقد أكملت التمرين بنجاح.",
      });
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, timer, maxTime]);

  const fetchExercises = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('mental_exercises')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
    } else {
      setExercises(data as MentalExercise[]);
    }
    
    setLoading(false);
  };

  const handleSelectExercise = (exercise: MentalExercise) => {
    setSelectedExercise(exercise);
    setTimer(0);
    setIsPlaying(false);
    setMaxTime(exercise.duration ? exercise.duration * 60 : 300); // Default to 5 minutes
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setTimer(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return maxTime > 0 ? (timer / maxTime) * 100 : 0;
  };

  const saveMoodRating = async () => {
    if (!user || moodRating === null) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have a health metric for today
    const { data, error: fetchError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing metrics:', fetchError);
      return;
    }
    
    const metrics = {
      mood: moodRating === 1 ? 'سيء' : moodRating === 2 ? 'محايد' : 'ممتاز',
      stress_level: stressLevel,
    };
    
    let error;
    
    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('health_metrics')
        .update(metrics)
        .eq('id', data.id);
      
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('health_metrics')
        .insert([{
          user_id: user.id,
          date: today,
          ...metrics
        }]);
      
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
        description: "تم تسجيل حالتك المزاجية لهذا اليوم",
      });
      setMoodRating(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">الصحة النفسية</h1>
          <p className="text-muted-foreground">
            تمارين للاسترخاء وتحسين الصحة النفسية
          </p>
        </div>

        <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercises">تمارين الاسترخاء</TabsTrigger>
            <TabsTrigger value="mood">تتبع المزاج</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Exercises List */}
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>تمارين الاسترخاء</CardTitle>
                    <CardDescription>
                      اختر تمرينًا للبدء
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                      <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
                    ) : exercises.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">لا توجد تمارين متاحة حاليًا</p>
                    ) : (
                      <div className="space-y-2">
                        {exercises.map((exercise) => (
                          <Card 
                            key={exercise.id} 
                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedExercise?.id === exercise.id ? 'border-primary' : ''}`}
                            onClick={() => handleSelectExercise(exercise)}
                          >
                            <CardContent className="p-4 flex items-center space-x-3 space-x-reverse">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Brain className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{exercise.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {exercise.duration} دقيقة • {exercise.category}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Exercise Player */}
              <Card className="md:col-span-2">
                {selectedExercise ? (
                  <>
                    <CardHeader>
                      <CardTitle>{selectedExercise.title}</CardTitle>
                      <CardDescription>{selectedExercise.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        {selectedExercise.image_url ? (
                          <img 
                            src={selectedExercise.image_url} 
                            alt={selectedExercise.title} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Sparkles className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <p>{selectedExercise.description}</p>
                        
                        {selectedExercise.instructions && (
                          <div className="mt-4 p-4 bg-muted rounded-md">
                            <h4 className="font-medium mb-2">تعليمات:</h4>
                            <p className="text-sm">{selectedExercise.instructions}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">التقدم</span>
                          <span className="text-sm font-medium">
                            {formatTime(timer)} / {formatTime(maxTime)}
                          </span>
                        </div>
                        <Progress value={calculateProgress()} className="h-2" />
                      </div>
                      
                      <div className="flex justify-center space-x-4 space-x-reverse">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={resetExercise}
                        >
                          <Clock className="h-6 w-6" />
                        </Button>
                        <Button
                          variant={isPlaying ? "destructive" : "default"}
                          size="icon"
                          className="h-16 w-16 rounded-full"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-8 w-8" />
                          ) : (
                            <Play className="h-8 w-8" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Brain className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-xl font-medium">اختر تمرينًا للبدء</h3>
                    <p className="text-muted-foreground">
                      اختر أحد تمارين الاسترخاء من القائمة للبدء في ممارسته
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="mood">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>كيف تشعر اليوم؟</CardTitle>
                  <CardDescription>
                    سجل حالتك المزاجية ومستوى التوتر لديك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>حالتك المزاجية</Label>
                    <div className="flex justify-between items-center">
                      <Button
                        variant={moodRating === 1 ? "default" : "outline"}
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2"
                        onClick={() => setMoodRating(1)}
                      >
                        <Frown className="h-8 w-8" />
                        <span>سيء</span>
                      </Button>
                      <Button
                        variant={moodRating === 2 ? "default" : "outline"}
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2"
                        onClick={() => setMoodRating(2)}
                      >
                        <Meh className="h-8 w-8" />
                        <span>محايد</span>
                      </Button>
                      <Button
                        variant={moodRating === 3 ? "default" : "outline"}
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2"
                        onClick={() => setMoodRating(3)}
                      >
                        <Smile className="h-8 w-8" />
                        <span>ممتاز</span>
                      </Button>
                    </div>
                  </div>
                  
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
                  
                  <Button 
                    className="w-full" 
                    disabled={moodRating === null}
                    onClick={saveMoodRating}
                  >
                    حفظ
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>نصائح للصحة النفسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">التنفس العميق</h4>
                    <p className="text-sm">خذ نفسًا عميقًا لمدة 4 ثوانٍ، احبس أنفاسك لمدة 7 ثوانٍ، ثم أخرج الهواء ببطء لمدة 8 ثوانٍ. كرر هذا التمرين 3-5 مرات عندما تشعر بالتوتر.</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">التأمل اليومي</h4>
                    <p className="text-sm">خصص 10 دقائق يوميًا للتأمل. اجلس في مكان هادئ، وركز على تنفسك، ودع أفكارك تمر دون الحكم عليها.</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">النوم الجيد</h4>
                    <p className="text-sm">احرص على النوم 7-8 ساعات يوميًا. حافظ على روتين منتظم للنوم والاستيقاظ، وتجنب الشاشات قبل النوم بساعة.</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">النشاط البدني</h4>
                    <p className="text-sm">مارس الرياضة لمدة 30 دقيقة على الأقل يوميًا. النشاط البدني يطلق الإندورفين التي تحسن المزاج وتقلل التوتر.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    عرض المزيد من النصائح
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MentalHealth;