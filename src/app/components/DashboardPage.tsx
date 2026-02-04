import { motion } from 'motion/react';
import { Award, BookOpen, FileText, Calendar, Flame, Target, Star, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { mockUser, mockCourses } from '@/app/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { useTranslation } from 'react-i18next';
import { BadgesList } from '@/app/components/BadgesList';

export function DashboardPage() {
  const { t } = useTranslation();
  const weeklyActivity = [
    { day: t('dashboard_page.days.mon'), minutes: 45 },
    { day: t('dashboard_page.days.tue'), minutes: 60 },
    { day: t('dashboard_page.days.wed'), minutes: 30 },
    { day: t('dashboard_page.days.thu'), minutes: 75 },
    { day: t('dashboard_page.days.fri'), minutes: 50 },
    { day: t('dashboard_page.days.sat'), minutes: 90 },
    { day: t('dashboard_page.days.sun'), minutes: 40 },
  ];

  const progressData = [
    { name: t('dashboard_page.categories.signs'), value: 85 },
    { name: t('dashboard_page.categories.rules'), value: 65 },
    { name: t('dashboard_page.categories.safety'), value: 90 },
    { name: t('dashboard_page.categories.infractions'), value: 45 },
  ];

  const categoryProgress = [
    { name: t('dashboard_page.status.completed'), value: 5, color: '#22c55e' },
    { name: t('dashboard_page.status.in_progress'), value: 2, color: '#3b82f6' },
    { name: t('dashboard_page.status.not_started'), value: 1, color: '#e5e7eb' },
  ];

  const recentCourses = mockCourses.filter(c => (c.progress || 0) > 0).slice(0, 3);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src={mockUser.avatar}
              alt={mockUser.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard_page.welcome', { name: mockUser.name.split(' ')[0] })}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{t('dashboard_page.progression_subtitle')}</p>
            </div>
          </div>
        </motion.div>

        {/* Gamification & Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <Card className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white border-none shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <CardContent className="p-6 relative z-10 flex items-center justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Niveau {Math.floor(mockUser.totalScore / 20) + 1}
                    </Badge>
                    <span className="text-blue-100 text-sm">Apprenti Conducteur</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">9,450 XP</h3>
                  <p className="text-blue-100 text-sm mb-4">550 XP avant le niveau suivant</p>
                  <div className="w-full bg-blue-900/40 rounded-full h-2 mb-1">
                    <div className="bg-white rounded-full h-2" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow dark:bg-gray-800 border-none shadow-md group">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                    +12%
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard_page.stats.tests_passed')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{mockUser.testsCompleted}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow dark:bg-gray-800 border-none shadow-md group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
              <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard_page.stats.current_streak')}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{mockUser.currentStreak}</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard_page.days_unit')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="dark:bg-gray-800 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Calendar className="w-5 h-5" />
                    {t('dashboard_page.weekly_activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="day" className="text-xs fill-gray-600 dark:fill-gray-400" />
                      <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                      />
                      <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress by Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="dark:bg-gray-800 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Target className="w-5 h-5" />
                    {t('dashboard_page.category_progress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium dark:text-gray-200">{item.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="dark:bg-gray-800 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="dark:text-white">{t('dashboard_page.recent_courses')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <div key={course.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium dark:text-white">{course.title}</h4>
                          <Progress value={course.progress} className="h-1.5 mt-2" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{course.progress}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="dark:bg-gray-800 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Award className="w-5 h-5" />
                    {t('dashboard_page.badges_earned')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgesList earnedBadges={mockUser.badges} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="dark:bg-gray-800 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="dark:text-white">{t('dashboard_page.course_distribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryProgress}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => `${entry.value}`}
                      >
                        {categoryProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {categoryProgress.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="dark:text-gray-300">{item.name}</span>
                        </div>
                        <span className="font-semibold dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="dark:bg-gray-800 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Star className="w-5 h-5" />
                    {t('dashboard_page.recommendations.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium mb-1 dark:text-blue-200">{t('dashboard_page.recommendations.streak_title')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('dashboard_page.recommendations.streak_desc', { count: mockUser.currentStreak })}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium mb-1 dark:text-green-200">{t('dashboard_page.recommendations.next_step_title')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('dashboard_page.recommendations.next_step_desc')}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium mb-1 dark:text-purple-200">{t('dashboard_page.recommendations.challenge_title')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('dashboard_page.recommendations.challenge_desc')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
