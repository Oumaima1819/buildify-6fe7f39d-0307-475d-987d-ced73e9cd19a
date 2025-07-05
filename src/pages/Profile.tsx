
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

const healthGoalOptions = [
  { id: 'weight_loss', label: 'خسارة الوزن' },
  { id: 'weight_gain', label: 'زيادة الوزن' },
  { id: 'muscle_building', label: 'بناء العضلات' },
  { id: 'better_sleep', label: 'تحسين النوم' },
  { id: 'stress_reduction', label: 'تقليل التوتر' },
  { id: 'better_nutrition', label: 'تحسين التغذية' },
  { id: 'more_activity', label: 'زيادة النشاط البدني' },
  { id: 'quit_smoking', label: 'الإقلاع عن التدخين' },
];

const chronicConditionOptions = [
  { id: 'diabetes', label: 'السكري' },
  { id: 'hypertension', label: 'ارتفاع ضغط الدم' },
  { id: 'heart_disease', label: 'أمراض القلب' },
  { id: 'asthma', label: 'الربو' },
  { id: 'arthritis', label: 'التهاب المفاصل' },
  { id: 'thyroid', label: 'اضطرابات الغدة الدرقية' },
  { id: 'depression', label: 'الاكتئاب' },
  { id: 'anxiety', label: 'القلق' },
];

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setGender(profile.gender || '');
      setBirthDate(profile.birth_date ? format(new Date(profile.birth_date), 'yyyy-MM-dd') : '');
      setHeight(profile.height?.toString() || '');
      setWeight(profile.weight?.toString() || '');
      setHealthGoals(profile.health_goals || []);
      setChronicConditions(profile.chronic_conditions || []);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    const updates = {
      full_name: fullName,
      username,
      gender,
      birth_date: birthDate || null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      health_goals: healthGoals,
      chronic_conditions: chronicConditions,
      updated_at: new Date().toISOString(),
    };

    const { error } = await updateProfile(updates);

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الملف الشخصي",
        description: error.message,
      });
    } else {
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ بياناتك الشخصية بنجاح",
      });
    }
    
    setLoading(false);
  };

  const toggleHealthGoal = (goalId: string) => {
    setHealthGoals(current => 
      current.includes(goalId)
        ? current.filter(id => id !== goalId)
        : [...current, goalId]
    );
  };

  const toggleChronicCondition = (conditionId: string) => {
    setChronicConditions(current => 
      current.includes(conditionId)
        ? current.filter(id => id !== conditionId)
        : [...current, conditionId]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">الملف الشخصي</h1>
          <p className="text-muted-foreground">
            إدارة معلوماتك الشخصية والصحية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback>{getInitials(profile?.full_name || 'مستخدم صحّتي')}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{profile?.full_name || 'مستخدم صحّتي'}</h3>
              <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
              <Separator className="my-4" />
              <div className="w-full space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">البريد الإلكتروني:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الانضمام:</span>
                  <span>{user?.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : '-'}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">تغيير كلمة المرور</Button>
            </CardFooter>
          </Card>

          {/* Profile Edit Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>تعديل الملف الشخصي</CardTitle>
              <CardDescription>
                قم بتحديث معلوماتك الشخصية والصحية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">الجنس</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                        <SelectItem value="other">آخر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">الطول (سم)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">الوزن (كجم)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>الأهداف الصحية</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {healthGoalOptions.map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`goal-${goal.id}`}
                          checked={healthGoals.includes(goal.id)}
                          onCheckedChange={() => toggleHealthGoal(goal.id)}
                        />
                        <Label htmlFor={`goal-${goal.id}`} className="cursor-pointer">
                          {goal.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>الحالات الصحية المزمنة</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {chronicConditionOptions.map((condition) => (
                      <div key={condition.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`condition-${condition.id}`}
                          checked={chronicConditions.includes(condition.id)}
                          onCheckedChange={() => toggleChronicCondition(condition.id)}
                        />
                        <Label htmlFor={`condition-${condition.id}`} className="cursor-pointer">
                          {condition.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;