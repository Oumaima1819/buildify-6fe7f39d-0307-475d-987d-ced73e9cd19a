
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Meal, NutritionPlan } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Apple, Utensils, Plus, ChevronRight, Info } from 'lucide-react';
import Layout from '@/components/Layout';

const mealTypes = [
  { id: 'breakfast', label: 'الإفطار' },
  { id: 'lunch', label: 'الغداء' },
  { id: 'dinner', label: 'العشاء' },
  { id: 'snack', label: 'وجبة خفيفة' },
];

const Nutrition = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Form state
  const [mealType, setMealType] = useState('');
  const [foodItems, setFoodItems] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    if (user) {
      fetchMeals();
      fetchNutritionPlans();
    }
  }, [user, selectedDate]);

  const fetchMeals = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', selectedDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching meals:', error);
    } else {
      setMeals(data as Meal[]);
    }
    
    setLoading(false);
  };

  const fetchNutritionPlans = async () => {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching nutrition plans:', error);
    } else {
      setNutritionPlans(data as NutritionPlan[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    
    const mealData = {
      user_id: user.id,
      date: selectedDate,
      meal_type: mealType,
      food_items: foodItems.split(',').map(item => item.trim()),
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseFloat(protein) : null,
      carbs: carbs ? parseFloat(carbs) : null,
      fat: fat ? parseFloat(fat) : null,
      notes,
    };

    let error;
    
    if (editingMeal) {
      // Update existing meal
      const { error: updateError } = await supabase
        .from('meals')
        .update(mealData)
        .eq('id', editingMeal.id);
      
      error = updateError;
    } else {
      // Insert new meal
      const { error: insertError } = await supabase
        .from('meals')
        .insert([mealData]);
      
      error = insertError;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الوجبة",
        description: error.message,
      });
    } else {
      toast({
        title: "تم حفظ الوجبة بنجاح",
        description: "تم تحديث بيانات الوجبة",
      });
      resetForm();
      fetchMeals();
    }
    
    setSaving(false);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealType(meal.meal_type);
    setFoodItems(meal.food_items?.join(', ') || '');
    setCalories(meal.calories?.toString() || '');
    setProtein(meal.protein?.toString() || '');
    setCarbs(meal.carbs?.toString() || '');
    setFat(meal.fat?.toString() || '');
    setNotes(meal.notes || '');
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return;
    
    if (confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ في حذف الوجبة",
          description: error.message,
        });
      } else {
        toast({
          title: "تم حذف الوجبة",
          description: "تم حذف الوجبة بنجاح",
        });
        fetchMeals();
      }
    }
  };

  const resetForm = () => {
    setEditingMeal(null);
    setMealType('');
    setFoodItems('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
  };

  const calculateTotalNutrition = () => {
    return meals.reduce((totals, meal) => {
      return {
        calories: (totals.calories || 0) + (meal.calories || 0),
        protein: (totals.protein || 0) + (meal.protein || 0),
        carbs: (totals.carbs || 0) + (meal.carbs || 0),
        fat: (totals.fat || 0) + (meal.fat || 0),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealTypeLabel = (type: string) => {
    return mealTypes.find(meal => meal.id === type)?.label || type;
  };

  const totals = calculateTotalNutrition();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">التغذية</h1>
          <p className="text-muted-foreground">
            تتبع وجباتك وخطط لنظام غذائي صحي
          </p>
        </div>

        <Tabs defaultValue="tracker" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracker">تتبع الوجبات</TabsTrigger>
            <TabsTrigger value="plans">خطط غذائية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Meal Form */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>{editingMeal ? 'تعديل وجبة' : 'إضافة وجبة جديدة'}</CardTitle>
                  <CardDescription>
                    {selectedDate === format(new Date(), 'yyyy-MM-dd') 
                      ? 'سجل وجبات اليوم' 
                      : `سجل وجبات ${selectedDate}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">التاريخ</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mealType">نوع الوجبة</Label>
                      <Select value={mealType} onValueChange={setMealType} required>
                        <SelectTrigger id="mealType">
                          <SelectValue placeholder="اختر نوع الوجبة" />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="foodItems">الأطعمة</Label>
                      <Textarea
                        id="foodItems"
                        placeholder="أدخل الأطعمة مفصولة بفواصل"
                        value={foodItems}
                        onChange={(e) => setFoodItems(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calories">السعرات الحرارية</Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="0"
                          value={calories}
                          onChange={(e) => setCalories(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="protein">البروتين (جرام)</Label>
                        <Input
                          id="protein"
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={protein}
                          onChange={(e) => setProtein(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="carbs">الكربوهيدرات (جرام)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={carbs}
                          onChange={(e) => setCarbs(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fat">الدهون (جرام)</Label>
                        <Input
                          id="fat"
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={fat}
                          onChange={(e) => setFat(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات</Label>
                      <Textarea
                        id="notes"
                        placeholder="أي ملاحظات إضافية..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex space-x-2 space-x-reverse">
                      <Button type="submit" className="flex-1" disabled={saving || !mealType}>
                        {saving ? 'جاري الحفظ...' : (editingMeal ? 'تحديث الوجبة' : 'إضافة الوجبة')}
                      </Button>
                      
                      {editingMeal && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                          إلغاء
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Meals List */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>وجبات {selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'اليوم' : selectedDate}</CardTitle>
                  <CardDescription>
                    سجل وجباتك اليومية لمتابعة نظامك الغذائي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
                  ) : meals.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <Utensils className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">لم تسجل أي وجبات لهذا اليوم</p>
                      <Button variant="outline" onClick={() => document.getElementById('mealType')?.focus()}>
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة وجبة جديدة
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meals.map((meal) => (
                        <Card key={meal.id} className="overflow-hidden">
                          <CardHeader className="bg-muted py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base flex items-center">
                                <Utensils className="ml-2 h-4 w-4 text-muted-foreground" />
                                {getMealTypeLabel(meal.meal_type)}
                              </CardTitle>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button variant="ghost" size="sm" onClick={() => handleEditMeal(meal)}>
                                  تعديل
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteMeal(meal.id)}>
                                  حذف
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">الأطعمة:</h4>
                                <p className="text-sm text-muted-foreground">
                                  {meal.food_items?.join('، ') || '-'}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2">
                                <div>
                                  <p className="text-sm font-medium">السعرات</p>
                                  <p className="text-sm text-muted-foreground">{meal.calories || 0}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">البروتين</p>
                                  <p className="text-sm text-muted-foreground">{meal.protein || 0} جرام</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">الكربوهيدرات</p>
                                  <p className="text-sm text-muted-foreground">{meal.carbs || 0} جرام</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">الدهون</p>
                                  <p className="text-sm text-muted-foreground">{meal.fat || 0} جرام</p>
                                </div>
                              </div>
                              
                              {meal.notes && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">ملاحظات:</h4>
                                  <p className="text-sm text-muted-foreground">{meal.notes}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Daily Totals */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">إجمالي اليوم</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <p className="text-sm font-medium">السعرات</p>
                              <p className="text-lg font-bold">{totals.calories}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">البروتين</p>
                              <p className="text-lg font-bold">{totals.protein.toFixed(1)} جرام</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">الكربوهيدرات</p>
                              <p className="text-lg font-bold">{totals.carbs.toFixed(1)} جرام</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">الدهون</p>
                              <p className="text-lg font-bold">{totals.fat.toFixed(1)} جرام</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="plans">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutritionPlans.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-8 space-y-4">
                      <Apple className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">لا توجد خطط غذائية متاحة حالياً</p>
                    </CardContent>
                  </Card>
                ) : (
                  nutritionPlans.map((plan) => (
                    <Card key={plan.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>{plan.title}</CardTitle>
                        <CardDescription>{plan.goal}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-muted p-2 rounded-md">
                              <p className="text-xs text-muted-foreground">السعرات</p>
                              <p className="font-bold">{plan.daily_calories}</p>
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                              <p className="text-xs text-muted-foreground">البروتين</p>
                              <p className="font-bold">{plan.protein_percentage}%</p>
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                              <p className="text-xs text-muted-foreground">الكربوهيدرات</p>
                              <p className="font-bold">{plan.carbs_percentage}%</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`#plan-${plan.id}`}>
                            عرض التفاصيل
                            <ChevronRight className="mr-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
              
              <Card className="bg-muted/50">
                <CardHeader>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>نصائح غذائية عامة</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>تناول وجبات متوازنة تحتوي على البروتينات والكربوهيدرات المعقدة والدهون الصحية.</p>
                    <p>اشرب كمية كافية من الماء يومياً (8-10 أكواب).</p>
                    <p>تناول 5 حصص على الأقل من الفواكه والخضروات يومياً.</p>
                    <p>قلل من تناول السكريات المضافة والأطعمة المصنعة.</p>
                    <p>تناول وجبات منتظمة وتجنب تخطي الوجبات، خاصة وجبة الإفطار.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Nutrition;