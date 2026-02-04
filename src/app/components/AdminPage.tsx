import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { StatsOverview } from './admin/StatsOverview';
import { UserManagement } from './admin/UserManagement';
import { CourseManagement } from './admin/CourseManagement';
import { TestManagement } from './admin/TestManagement';

export function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-xl text-gray-600">
            Gérez le contenu et suivez les statistiques de la plateforme
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview />
        </div>

        {/* Management Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Gestion de la plateforme</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
                  <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                  <TabsTrigger value="content">Cours & Vidéos</TabsTrigger>
                  <TabsTrigger value="tests">Tests & Questions</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>

                <TabsContent value="content">
                  <CourseManagement />
                </TabsContent>

                <TabsContent value="tests">
                  <TestManagement />
                </TabsContent>

                <TabsContent value="finance">
                  <div className="text-center py-8 text-gray-500">
                    Module Finance bientôt disponible
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
