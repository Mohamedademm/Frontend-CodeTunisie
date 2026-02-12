import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { TestCard } from '@/app/components/TestCard';
import { Test } from '@/app/types';
import { testService } from '@/services/testService';
import { useTranslation } from 'react-i18next';

export function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await testService.getTests();
      setTests(data);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError(t('tests.error_loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = (test: Test) => {
    // Navigate to the dedication test taking page
    navigate(`/tests/${test.id}/take`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('tests.title')}</h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400">
            {t('tests.subtitle')}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Test Stats */}
            {!error && tests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tests.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('tests.stats.available')}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {tests.filter(t => t.passed).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('tests.stats.passed')}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {tests.filter(testItem => testItem.progress && testItem.progress > 0 && !testItem.passed).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('tests.stats.in_progress')}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {tests.filter(testItem => testItem.score).length > 0
                      ? Math.round(
                        tests.filter(testItem => testItem.score).reduce((acc, testItem) => acc + (testItem.score || 0), 0) /
                        tests.filter(testItem => testItem.score).length
                      )
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('tests.stats.avg_score')}</div>
                </div>
              </motion.div>
            )}

            {/* Test Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TestCard test={test} onStart={() => handleStartTest(test)} />
                </motion.div>
              ))}
            </div>

            {!isLoading && tests.length === 0 && !error && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t('tests.no_tests')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
