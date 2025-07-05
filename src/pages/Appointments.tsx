
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Appointment } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format, isToday, isPast, addDays } from 'date-fns';
import { Calendar, Clock, MapPin, User, Plus, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';

const Appointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data as Appointment[]);
      
      const today = new Date();
      const upcoming: Appointment[] = [];
      const past: Appointment[] = [];
      
      (data as Appointment[]).forEach(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        if (appointmentDate >= today) {
          upcoming.push(appointment);
        } else {
          past.push(appointment);
        }
      });
      
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    
    const appointmentData = {
      user_id: user.id,
      title,
      doctor_name: doctorName,
      specialty,
      location,
      date,
      time,
      notes,
      reminder_sent: false,
    };

    let error;
    
    if (editingAppointment) {
      // Update existing appointment
      const { error: updateError } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', editingAppointment.id);
      
      error = updateError;
    } else {
      // Insert new appointment
      const { error: insertError } = await supabase
        .from('appointments')
        .insert([appointmentData]);
      
      error = insertError;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الموعد",
        description: error.message,
      });
    } else {
      toast({
        title: "تم حفظ الموعد بنجاح",
        description: "تم تحديث بيانات الموعد",
      });
      resetForm();
      fetchAppointments();
    }
    
    setSaving(false);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setDoctorName(appointment.doctor_name || '');
    setSpecialty(appointment.specialty || '');
    setLocation(appointment.location || '');
    setDate(appointment.date);
    setTime(appointment.time);
    setNotes(appointment.notes || '');
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!user) return;
    
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ في حذف الموعد",
          description: error.message,
        });
      } else {
        toast({
          title: "تم حذف الموعد",
          description: "تم حذف الموعد بنجاح",
        });
        fetchAppointments();
      }
    }
  };

  const resetForm = () => {
    setEditingAppointment(null);
    setTitle('');
    setDoctorName('');
    setSpecialty('');
    setLocation('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('');
    setNotes('');
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'اليوم';
    }
    if (isToday(addDays(date, -1))) {
      return 'غداً';
    }
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">المواعيد</h1>
          <p className="text-muted-foreground">
            إدارة مواعيد الزيارات الطبية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Appointment Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{editingAppointment ? 'تعديل موعد' : 'إضافة موعد جديد'}</CardTitle>
              <CardDescription>
                أدخل تفاصيل الموعد الطبي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الموعد</Label>
                  <Input
                    id="title"
                    placeholder="مثال: فحص دوري، استشارة"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doctorName">اسم الطبيب</Label>
                  <Input
                    id="doctorName"
                    placeholder="د. أحمد محمد"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialty">التخصص</Label>
                  <Input
                    id="specialty"
                    placeholder="مثال: طب عام، قلب، أسنان"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">المكان</Label>
                  <Input
                    id="location"
                    placeholder="مثال: مستشفى، عيادة"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">التاريخ</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">الوقت</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
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
                  <Button type="submit" className="flex-1" disabled={saving || !title || !date || !time}>
                    {saving ? 'جاري الحفظ...' : (editingAppointment ? 'تحديث الموعد' : 'إضافة الموعد')}
                  </Button>
                  
                  {editingAppointment && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>المواعيد القادمة</CardTitle>
              <CardDescription>
                المواعيد المجدولة القادمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">لا توجد مواعيد قادمة</p>
                  <Button variant="outline" onClick={() => document.getElementById('title')?.focus()}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة موعد جديد
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardHeader className="bg-muted py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{appointment.title}</CardTitle>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(appointment)}>
                              تعديل
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAppointment(appointment.id)}>
                              حذف
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatAppointmentDate(appointment.date)}</span>
                            <span className="mx-2">•</span>
                            <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                            <span>{appointment.time}</span>
                          </div>
                          
                          {appointment.doctor_name && (
                            <div className="flex items-center text-sm">
                              <User className="ml-2 h-4 w-4 text-muted-foreground" />
                              <span>د. {appointment.doctor_name}</span>
                              {appointment.specialty && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{appointment.specialty}</span>
                                </>
                              )}
                            </div>
                          )}
                          
                          {appointment.location && (
                            <div className="flex items-center text-sm">
                              <MapPin className="ml-2 h-4 w-4 text-muted-foreground" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                          
                          {appointment.notes && (
                            <div className="mt-2 pt-2 border-t text-sm">
                              <p className="text-muted-foreground">{appointment.notes}</p>
                            </div>
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

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>المواعيد السابقة</CardTitle>
            <CardDescription>
              سجل المواعيد السابقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p>
            ) : pastAppointments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">لا توجد مواعيد سابقة</p>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden opacity-70">
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{appointment.title}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAppointment(appointment.id)}>
                          حذف
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(appointment.date), 'yyyy-MM-dd')}</span>
                          <span className="mx-2">•</span>
                          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                          <span>{appointment.time}</span>
                        </div>
                        
                        {appointment.doctor_name && (
                          <div className="flex items-center text-sm">
                            <User className="ml-2 h-4 w-4 text-muted-foreground" />
                            <span>د. {appointment.doctor_name}</span>
                            {appointment.specialty && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{appointment.specialty}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <Button variant="outline" disabled={pastAppointments.length === 0}>
              عرض المزيد من المواعيد السابقة
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Appointments;