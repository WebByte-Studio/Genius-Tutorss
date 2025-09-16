'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Shield,
  TrendingUp,
  CreditCard,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  description: string;
  created_at: string;
  transactionId: string;
}

interface PaymentManagementSectionProps {
  permissions: Permission;
}

export function PaymentManagementSection({ permissions }: PaymentManagementSectionProps) {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch payments based on permissions
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockPayments: Payment[] = [
          {
            id: '1',
            amount: 5000,
            currency: 'BDT',
            status: 'completed',
            paymentMethod: 'Credit Card',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            description: 'Premium subscription payment',
            created_at: '2024-01-15',
            transactionId: 'TXN-123456'
          },
          {
            id: '2',
            amount: 2500,
            currency: 'BDT',
            status: 'pending',
            paymentMethod: 'Mobile Banking',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            description: 'Tutor session payment',
            created_at: '2024-01-14',
            transactionId: 'TXN-123457'
          },
          {
            id: '3',
            amount: 3000,
            currency: 'BDT',
            status: 'failed',
            paymentMethod: 'Credit Card',
            customerName: 'Bob Johnson',
            customerEmail: 'bob@example.com',
            description: 'Course enrollment',
            created_at: '2024-01-13',
            transactionId: 'TXN-123458'
          }
        ];
        setPayments(mockPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payments',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (permissions['payments.view']) {
      fetchPayments();
    }
  }, [permissions, toast]);

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle payment processing
  const handleProcessPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    if (!permissions['payments.process']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to process payments',
        variant: 'destructive'
      });
      return;
    }

    try {
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: action === 'approve' ? 'completed' : 'failed' }
          : payment
      ));
      
      toast({
        title: 'Success',
        description: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive'
      });
    }
  };

  // Handle refund
  const handleRefund = async (paymentId: string) => {
    if (!permissions['payments.refund']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to process refunds',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to process a refund for this payment?')) {
      return;
    }

    try {
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'refunded' }
          : payment
      ));
      
      toast({
        title: 'Success',
        description: 'Refund processed successfully',
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive'
      });
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Calculate summary stats
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);

  if (!permissions['payments.view']) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center">
          You don't have permission to view payment management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
          <p className="text-gray-600">
            Manage payments and transactions. You have {permissions['payments.process'] ? 'process' : ''} 
            {permissions['payments.refund'] ? ', refund' : ''} permissions.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">৳{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">৳{pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">৳{failedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payments ({filteredPayments.length})</span>
            <Badge variant="outline">
              {payments.length} total transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No payments found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{payment.customerName}</h3>
                        <Badge variant={getStatusBadgeVariant(payment.status)} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>{payment.customerEmail}</span>
                        <span className="mx-2">•</span>
                        <span>{payment.paymentMethod}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Transaction ID: {payment.transactionId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-semibold text-lg">৳{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{payment.currency}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {permissions['payments.view'] && (
                        <Button variant="outline" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {permissions['payments.process'] && payment.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleProcessPayment(payment.id, 'approve')}
                            title="Approve Payment"
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleProcessPayment(payment.id, 'reject')}
                            title="Reject Payment"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {permissions['payments.refund'] && payment.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRefund(payment.id)}
                          title="Process Refund"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Refund
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
