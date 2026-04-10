'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setIsLoading(true);
        
        // Check admin token in localStorage
        const adminToken = localStorage.getItem('adminToken');
        const adminEmail = localStorage.getItem('adminEmail');
        const expectedAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';

        // Verify admin status
        if (adminToken && adminEmail?.toLowerCase() === expectedAdminEmail.toLowerCase()) {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // Not authorized - redirect to login
        setError('You need to log in as admin to access this page');
        setIsLoading(false);
        
        // Redirect after a short delay to show error
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } catch (err: any) {
        console.error('Admin verification error:', err);
        setError('Failed to verify admin status');
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333333]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#333333] border-t-white rounded-full animate-spin" />
              <p className="text-white text-center">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
            <p className="text-[#999999] text-sm">
              Only administrators can access this page. Please log in with your admin credentials.
            </p>
            <Button 
              onClick={() => router.push('/admin/login')}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Unauthorized
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                You do not have permission to access the admin dashboard.
              </AlertDescription>
            </Alert>
            <p className="text-[#999999] text-sm">
              This is an admin-only section. Please contact your administrator if you believe this is an error.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white text-black hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin is verified, render actual admin dashboard
  // The real admin dashboard logic goes here
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <Button
            onClick={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminEmail');
              router.push('/');
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        </div>

        <Alert className="bg-green-500/10 border-green-500/30 mb-6">
          <AlertCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-400">
            ✓ Admin access verified. You can now manage the platform.
          </AlertDescription>
        </Alert>

        {/* Add your admin dashboard content here */}
        <Card className="bg-[#1a1a1a] border-[#333333]">
          <CardHeader>
            <CardTitle className="text-white">Welcome to Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="text-[#999999]">
            <p>Your admin dashboard is ready. Build your admin features here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
