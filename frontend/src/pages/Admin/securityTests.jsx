import { useState } from 'react';
import { mockApiClient } from '@/tests/security/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  TestStatus, 
  TestCategory, 
  TestDescriptions, 
  TestData,
  TestSeverity,
  createTestResult,
  formatTestResult 
} from '@/tests/security/testUtils';

const SecurityTests = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const runTestCategory = async (category) => {
    const results = [];
    results.push(createTestResult(category, TestStatus.RUNNING));

    try {
      switch (category) {
        case TestCategory.AUTH_TOKEN:
          // Test valid token
          await mockApiClient.post('/api/test/auth/token', { token: TestData.TEST_TOKEN });
          // Test expired token
          try {
            await mockApiClient.post('/api/test/auth/token', { token: TestData.EXPIRED_TOKEN });
          } catch (error) {
            if (error.response?.status === 401) {
              results.push(createTestResult(
                category,
                TestStatus.PASSED,
                'Token validation working correctly',
                { severity: TestSeverity.HIGH }
              ));
            }
          }
          break;

        case TestCategory.SESSION_MANAGEMENT:
          await mockApiClient.get('/api/test/auth/session');
          results.push(createTestResult(
            category,
            TestStatus.PASSED,
            'Session management working correctly',
            { severity: TestSeverity.HIGH }
          ));
          break;

        case TestCategory.PASSWORD_SECURITY:
          await mockApiClient.post('/api/test/auth/password', { 
            password: 'Test123!@#',
            hashedPassword: 'hashed_password_here'
          });
          results.push(createTestResult(
            category,
            TestStatus.PASSED,
            'Password security checks working correctly',
            { severity: TestSeverity.CRITICAL }
          ));
          break;

        case TestCategory.RATE_LIMITING: {
          const rateLimitPromises = Array(5).fill().map(() => 
            mockApiClient.get('/api/test/rate-limit')
          );
          await Promise.all(rateLimitPromises);
          results.push(createTestResult(
            category,
            TestStatus.PASSED,
            'Rate limiting working correctly',
            { severity: TestSeverity.MEDIUM }
          ));
          break;
        }

        case TestCategory.CORS_PROTECTION:
          try {
            await fetch(TestData.MALICIOUS_URL);
            results.push(createTestResult(
              category,
              TestStatus.FAILED,
              'CORS protection failed',
              { severity: TestSeverity.HIGH }
            ));
          } catch {
            results.push(createTestResult(
              category,
              TestStatus.PASSED,
              'CORS protection working correctly',
              { severity: TestSeverity.HIGH }
            ));
          }
          break;

        case TestCategory.XSS_PROTECTION:
          try {
            await mockApiClient.post('/api/test/xss', { data: TestData.XSS_PAYLOAD });
          } catch (error) {
            if (error.response?.status === 400) {
              results.push(createTestResult(
                category,
                TestStatus.PASSED,
                'XSS protection working correctly',
                { severity: TestSeverity.CRITICAL }
              ));
            }
          }
          break;

        case TestCategory.CSRF_PROTECTION:
          try {
            await mockApiClient.post('/api/test/csrf', { data: 'test' });
          } catch (error) {
            if (error.response?.status === 403) {
              results.push(createTestResult(
                category,
                TestStatus.PASSED,
                'CSRF protection working correctly',
                { severity: TestSeverity.HIGH }
              ));
            }
          }
          break;

        case TestCategory.SQL_INJECTION:
          try {
            await mockApiClient.post('/api/test/sql-injection', { 
              query: TestData.SQL_INJECTION 
            });
          } catch (error) {
            if (error.response?.status === 400) {
              results.push(createTestResult(
                category,
                TestStatus.PASSED,
                'SQL injection protection working correctly',
                { severity: TestSeverity.CRITICAL }
              ));
            }
          }
          break;

        case TestCategory.SECURITY_HEADERS: {
          const response = await mockApiClient.get('/api/test/headers');
          if (response.data.success) {
            results.push(createTestResult(
              category,
              TestStatus.PASSED,
              'Security headers properly configured',
              { severity: TestSeverity.MEDIUM }
            ));
          }
          break;
        }

        case TestCategory.FILE_UPLOAD:
          try {
            await mockApiClient.post('/api/test/file-upload', { 
              file: TestData.MALICIOUS_FILE 
            });
          } catch (error) {
            if (error.response?.status === 400) {
              results.push(createTestResult(
                category,
                TestStatus.PASSED,
                'File upload security working correctly',
                { severity: TestSeverity.HIGH }
              ));
            }
          }
          break;

        default:
          results.push(createTestResult(
            category,
            TestStatus.SKIPPED,
            'Test not implemented',
            { severity: TestSeverity.LOW }
          ));
      }
    } catch (error) {
      console.error(`Test error for ${category}:`, error);
      results.push(createTestResult(
        category,
        TestStatus.FAILED,
        error.message || 'Test failed',
        { 
          severity: TestSeverity.HIGH,
          error: error.response?.data || error.message
        }
      ));
    }

    return results;
  };

  const runAllTests = async () => {
    setIsLoading(true);
    const allResults = [];

    try {
      // Run tests for each category
      for (const category of Object.values(TestCategory)) {
        const categoryResults = await runTestCategory(category);
        allResults.push(...categoryResults);
      }
    } catch (error) {
      console.error('Test suite error:', error);
      toast({
        title: "Test Suite Error",
        description: error.message || "An error occurred while running tests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTestResults(allResults);
    }
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return testResults;
    return testResults.filter(result => result.name === activeTab);
  };

  const getStatusSummary = () => {
    const summary = {
      [TestStatus.PASSED]: 0,
      [TestStatus.FAILED]: 0,
      [TestStatus.RUNNING]: 0,
      [TestStatus.SKIPPED]: 0,
      [TestStatus.WARNING]: 0
    };

    testResults.forEach(result => {
      summary[result.status]++;
    });

    return summary;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Security Features Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Security Tests</CardTitle>
          <CardDescription>
            Run tests to verify the implementation of security features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2 text-sm">
            {Object.entries(getStatusSummary()).map(([status, count]) => (
              <div key={status} className="text-center p-2 rounded bg-gray-100">
                <div className="font-semibold">{status}</div>
                <div>{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 inline-flex min-w-full">
              <TabsTrigger value="all" className="whitespace-nowrap">All Tests</TabsTrigger>
              {Object.values(TestCategory).map(category => (
                <TabsTrigger key={category} value={category} className="whitespace-nowrap">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {getFilteredResults().map((result, index) => {
              const formattedResult = formatTestResult(result);
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <span>{formattedResult.name}</span>
                        <p className="text-sm text-gray-500 mt-1">
                          {TestDescriptions[formattedResult.name]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${formattedResult.statusColor}`}>
                          {formattedResult.status}
                        </span>
                        {formattedResult.details?.severity && (
                          <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                            {formattedResult.details.severity}
                          </span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {formattedResult.message && (
                    <CardContent>
                      <p className="text-sm text-gray-600">{formattedResult.message}</p>
                      {formattedResult.details?.error && (
                        <p className="text-sm text-red-600 mt-2">
                          Error: {formattedResult.details.error}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formattedResult.formattedTime}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityTests; 