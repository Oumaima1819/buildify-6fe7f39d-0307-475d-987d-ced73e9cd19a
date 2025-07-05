
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Medication } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Pill, Plus, Clock, Calendar, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';

const frequencyOptions = [
  { value: 'daily', label: 'يومياً' },
  { value: 'twice_daily', label: 'مرتين يومياً' },
  { value: 'three_times_daily', label: 'ثلاث مرات يومياً' },
  { value: 'four_times_daily', label: 'أربع مرات يومياً' },
  { value: 'weekly', label: 'أسبوعياً' },
  { value: 'as_needed', label: 'عند الحاجة' },
];

const timeOptions = [
  { value: '06:00', label: '6:00 صباحاً' },
  { value: '08:00', label: '8:00 صباحاً' },
  { value: '12:00', label: '12:00 ظهراً' },
  { value: '14:00', label: '2:00 مساءً' },
  { value: '18:00', label: '6:00 مساءً' },
  { value: '20:00', label: '8:00 مساءً' },
  { value: '22:00', label: '10:00 مساءً' },
];

const Medications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayMedications, setTodayMedications] = useState<any[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedications();
      prepareTodayMedications();
    }
  }, [user]);

  const fetchMedications = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
    } else {
      setMedications(data as Medication[]);
    }
    
    setLoading(false);
  };

  const prepareTodayMedications = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .or(`end_date.gte.${today},end_date.is.null`)
      .lte('start_date', today);

    if (error) {
      console.error('Error fetching today\'s medications:', error);
      return;
    }
    
    const todayMeds: any[] = [];
    
    (data as Medication[]).forEach(med => {
      if (!med.reminder_times || med.reminder_times.length === 0) return;
      
      med.reminder_times.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const isPast = currentHour > hours || (currentHour === hours && currentMinutes > minutes);
        const isNow = currentHour === hours && Math.abs(currentMinutes - minutes) < 30;
        
        todayMeds.push({
          ...med,
          time: timeStr,
          formattedTime: `${hours}:${minutes.toString().padStart(2, '0')}`,
          status: isNow ? 'now' : isPast ? 'past' : 'upcoming',
        });
      });
    });
    
    // Sort by time
    todayMeds.sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      
      if (aHours !== bHours) return aHours - bHours;
      return aMinutes - bMinutes;
    });
    
    setTodayMedications(todayMeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    
    const medicationData = {
      user_id: user.id,
      name,
      dosage,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      reminder_times: reminderTimes,
      notes,
    };

    let error;
    
    if (editingMedication) {
      // Update existing medication
      const { error: updateError } = await supabase
        .from('medications')
        .update(medicationData)
        .eq('id', editingMedication.id);
      
      error = updateError;
    } else {
      // Insert new medication
      const { error: insertError } = await supabase
        .from('medications')
        .insert([medicationData]);
      
      error = insertError;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الدواء",
        description: error.message,
      });
    } else {
      toast({
        title: "تم حفظ الدواء بنجاح",
        description: "تم تحديث بيانات الدواء",
      });
      resetForm();
      fetchMedications();
      prepareTodayMedications();
    }
    
    setSaving(false);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setName(medication.name);
    setDosage(medication.dosage || '');
    setFrequency(medication.frequency || '');
    setStartDate(medication.start_date || format(new Date(), 'yyyy-MM-dd'));
    setEndDate(medication.end_date || '');
    setReminderTimes(medication.reminder_times || []);
    setNotes(medication.notes || '');
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (!user) return;
    
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ في حذف الدواء",
          description: error.message,
        });
      } else {
        toast({
          title: "تم حذف الدواء",
          description: "تم حذف الدواء بنجاح",
        });
        fetchMedications();
        prepareTodayMedications();
      }
    }
  };

  const resetForm = () => {
    setEditingMedication(null);
    setName('');
    setDosage('');
    setFrequency('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setReminderTimes([]);
    setNotes('');
  };

  const toggleReminderTime = (time: string) => {
    setReminderTimes(current => 
      current.includes(time)
        ? current.filter(t => t !== time)
        : [...current, time]
    );
  };

  const getFrequencyLabel = (value: string) => {
    return frequencyOptions.find(option => option.value === value)?.label || value;
  };

  const formatTimeForDisplay = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    return `${hour}:${minutes} ${hour >= 12 ? 'مساءً' : 'صباحاً'}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">الأدوية</h1>
          <p className="text-muted-foreground">
            إدارة الأدوية والتذكيرات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Medication Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{editingMedication ? 'تعديل دواء' : 'إضافة دواء جديد'}</CardTitle>
              <CardDescription>
                أدخل تفاصيل الدواء والجرعات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الدواء</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dosage">الجرعة</Label>
                  <Input
                    id="dosage"
                    placeholder="مثال: 500 ملغ، قرص واحد"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">التكرار</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="اختر تكرار الجرعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">تاريخ البدء</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">تاريخ الانتهاء (اختياري)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>أوقات التذكير</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`time-${option.value}`}
                          checked={reminderTimes.includes(option.value)}
                          onCheckedChange={() => toggleReminderTime(option.value)}
                        />
                        <Label htmlFor={`time-${option.value}`} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
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
                  <Button type="submit" className="flex-1" disabled={saving || !name}>
                    {saving ? 'جاري الحفظ...' : (editingMedication ? 'تحديث الدواء' : 'إضافة الدواء')}
                  </Button>
                  
                  {editingMedication && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Today's Medications */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>أدوية اليوم</CardTitle>
              <CardDescription>
                الأدوية المجدولة لليوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayMedications.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">لا توجد أدوية مجدولة لليوم</p>
                  <Button variant="outline" onClick={() => document.getElementById('name')?.focus()}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة دواء جديد
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayMedications.map((med, index) => (
                    <Card key={`${med.id}-${index}`} className={`overflow-hidden border-l-4 ${
                      med.status === 'now' ? 'border-l-primary' : 
                      med.status === 'past' ? 'border-l-muted' : 'border-l-muted'
                    }`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className={`p-2 rounded-full ${
                            med.status === 'now' ? 'bg-primary/10' : 
                            med.status === 'past' ? 'bg-muted' : 'bg-muted/50'
                          }`}>
                            <Pill className={`h-5 w-5 ${
                              med.status === 'now' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{med.name}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="ml-1 h-3 w-3" />
                              {formatTimeForDisplay(med.time)}
                              {med.dosage && ` • ${med.dosage}`}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          {med.status === 'now' ? (
                            <Button size="sm">تم التناول</Button>
                          ) : med.status === 'past' ? (
                            <Button size="sm" variant="outline">تم التناول</Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>قادم</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Medications */}
        <Card>
          <CardHeader>
            <CardTitle>جميع الأدوية</CardTitle>
            <CardDescription>
              قائمة بجميع الأدوية المسجلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
            ) : medications.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">لم تقم بإضافة أي أدوية بعد</p>
                <Button variant="outline" onClick={() => document.getElementById('name')?.focus()}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة دواء جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((medication) => {
                  const isActive = !medication.end_date || new Date(medication.end_date) >= new Date();
                  
                  return (
                    <Card key={medication.id} className={`overflow-hidden ${!isActive ? 'opacity-70' : ''}`}>
                      <CardHeader className="bg-muted py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base flex items-center">
                            <Pill className="ml-2 h-4 w-4 text-muted-foreground" />
                            {medication.name}
                            {!isActive && (
                              <span className="ml-2 text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full">
                                منتهي
                              </span>
                            )}
                          </CardTitle>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button variant="ghost" size="sm" onClick={() => handleEditMedication(medication)}>
                              تعديل
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMedication(medication.id)}>
                              حذف
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {medication.dosage && (
                              <div className="flex items-start space-x-2 space-x-reverse">
                                <span className="text-sm font-medium ml-2">الجرعة:</span>
                                <span className="text-sm text-muted-foreground">{medication.dosage}</span>
                              </div>
                            )}
                            
                            {medication.frequency && (
                              <div className="flex items-start space-x-2 space-x-reverse">
                                <span className="text-sm font-medium ml-2">التكرار:</span>
                                <span className="text-sm text-muted-foreground">{getFrequencyLabel(medication.frequency)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <span className="text-sm font-medium ml-2">تاريخ البدء:</span>
                              <span className="text-sm text-muted-foreground">
                                {medication.start_date ? format(new Date(medication.start_date), 'yyyy-MM-dd') : '-'}
                              </span>
                            </div>
                            
                            {medication.end_date && (
                              <div className="flex items-start space-x-2 space-x-reverse">
                                <span className="text-sm font-medium ml-2">تاريخ الانتهاء:</span>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(medication.end_date), 'yyyy-MM-dd')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {medication.reminder_times && medication.reminder_times.length > 0 && (
                              <div className="flex items-start space-x-2 space-x-reverse">
                                <span className="text-sm font-medium ml-2">أوقات التذكير:</span>
                                <span className="text-sm text-muted-foreground">
                                  {medication.reminder_times.map(formatTimeForDisplay).join('، ')}
                                </span>
                              </div>
                            )}
                            
                            {medication.notes && (
                              <div className="flex items-start space-x-2 space-x-reverse">
                                <span className="text-sm font-medium ml-2">ملاحظات:</span>
                                <span className="text-sm text-muted-foreground">{medication.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Medications;