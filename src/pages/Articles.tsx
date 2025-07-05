
import { useState, useEffect } from 'react';
import { supabase, HealthArticle } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, FileText, Tag, Calendar, User } from 'lucide-react';
import Layout from '@/components/Layout';

const Articles = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<HealthArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('health_articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data as HealthArticle[]);
      
      // Extract featured articles
      const featured = (data as HealthArticle[]).filter(article => article.is_featured);
      setFeaturedArticles(featured);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set((data as HealthArticle[]).map(article => article.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    }
    
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filtered articles logic
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
  };

  const handleArticleSelect = (article: HealthArticle) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">مقالات صحية</h1>
          <p className="text-muted-foreground">
            مقالات ونصائح صحية موثوقة
          </p>
        </div>

        {selectedArticle ? (
          <div className="space-y-6">
            <Button variant="outline" onClick={() => setSelectedArticle(null)}>
              العودة إلى قائمة المقالات
            </Button>
            
            <Card>
              {selectedArticle.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={selectedArticle.image_url} 
                    alt={selectedArticle.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {selectedArticle.author && (
                      <div className="flex items-center">
                        <User className="ml-1 h-4 w-4" />
                        {selectedArticle.author}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="ml-1 h-4 w-4" />
                      {format(new Date(selectedArticle.published_at), 'yyyy-MM-dd')}
                    </div>
                    {selectedArticle.category && (
                      <Badge variant="outline">{selectedArticle.category}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                {selectedArticle.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
                {selectedArticle.tags && selectedArticle.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="ml-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </div>
        ) : (
          <>
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">مقالات مميزة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article) => (
                    <Card 
                      key={article.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleArticleSelect(article)}
                    >
                      {article.image_url ? (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={article.image_url} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="flex items-center text-xs">
                          <Calendar className="ml-1 h-3 w-3" />
                          {format(new Date(article.published_at), 'yyyy-MM-dd')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.content.substring(0, 150)}...
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="link" className="px-0">
                          قراءة المزيد
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن مقالات..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategorySelect(null)}
                >
                  الكل
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">جميع المقالات</h2>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
              ) : filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8 space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">لا توجد مقالات متطابقة مع بحثك</p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}>
                      عرض جميع المقالات
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <Card 
                      key={article.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleArticleSelect(article)}
                    >
                      {article.image_url ? (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={article.image_url} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                          {article.category && (
                            <Badge variant="outline" className="ml-2 shrink-0">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center text-xs">
                          <Calendar className="ml-1 h-3 w-3" />
                          {format(new Date(article.published_at), 'yyyy-MM-dd')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.content.substring(0, 150)}...
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="link" className="px-0">
                          قراءة المزيد
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Articles;