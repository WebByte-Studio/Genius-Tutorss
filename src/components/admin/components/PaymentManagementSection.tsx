'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Search, Filter, Download, Plus, CreditCard, DollarSign, BarChart2, ArrowUpRight, ArrowDownRight, Wallet, Calendar, CheckCircle, XCircle, Eye, Trash } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'mobile_banking' | 'card' | 'other';
  status: 'active' | 'inactive';
  processingFee: string;
  addedAt: string;
}

interface Transaction {
  id: string;
  studentName: string;
  tutorName: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  date: string;
  transactionId: string;
  type: 'payment' | 'refund' | 'payout';
}

interface PaymentAnalytics {
  totalRevenue: string;
  monthlyRevenue: string;
  processingFees: string;
  pendingPayouts: string;
  transactionCount: number;
  successRate: string;
}

export function PaymentManagementSection() {
  const { toast } = useToast();
  
  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<Partial<PaymentMethod>>({
    type: 'bank',
    status: 'active',
    processingFee: '0'
  });
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // State for analytics
  const [analytics, setAnalytics] = useState<PaymentAnalytics>({
    totalRevenue: '৳0',
    monthlyRevenue: '৳0',
    processingFees: '৳0',
    pendingPayouts: '৳0',
    transactionCount: 0,
    successRate: '0%'
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for initial display
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'bKash',
      type: 'mobile_banking',
      status: 'active',
      processingFee: '1.5%',
      addedAt: '2023-05-15'
    },
    {
      id: '2',
      name: 'Nagad',
      type: 'mobile_banking',
      status: 'active',
      processingFee: '1.2%',
      addedAt: '2023-06-20'
    },
    {
      id: '3',
      name: 'Bank Transfer',
      type: 'bank',
      status: 'active',
      processingFee: '0.5%',
      addedAt: '2023-04-10'
    },
    {
      id: '4',
      name: 'Visa/Mastercard',
      type: 'card',
      status: 'active',
      processingFee: '2.5%',
      addedAt: '2023-07-05'
    },
    {
      id: '5',
      name: 'Rocket',
      type: 'mobile_banking',
      status: 'inactive',
      processingFee: '1.8%',
      addedAt: '2023-03-25'
    },
  ];
  
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      studentName: 'Rafiul Islam',
      tutorName: 'Ahmed Khan',
      amount: '৳2,500',
      status: 'completed',
      paymentMethod: 'bKash',
      date: '2023-08-15',
      transactionId: 'TRX123456789',
      type: 'payment'
    },
    {
      id: '2',
      studentName: 'Sadia Rahman',
      tutorName: 'Farhan Ali',
      amount: '৳1,800',
      status: 'pending',
      paymentMethod: 'Nagad',
      date: '2023-08-14',
      transactionId: 'TRX987654321',
      type: 'payment'
    },
    {
      id: '3',
      studentName: 'Karim Ahmed',
      tutorName: 'Nusrat Jahan',
      amount: '৳3,200',
      status: 'failed',
      paymentMethod: 'Visa/Mastercard',
      date: '2023-08-13',
      transactionId: 'TRX456789123',
      type: 'payment'
    },
    {
      id: '4',
      studentName: 'Tahmina Akter',
      tutorName: 'Zubair Hossain',
      amount: '৳1,500',
      status: 'refunded',
      paymentMethod: 'bKash',
      date: '2023-08-12',
      transactionId: 'TRX789123456',
      type: 'refund'
    },
    {
      id: '5',
      studentName: '',
      tutorName: 'Sabina Yasmin',
      amount: '৳4,500',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      date: '2023-08-11',
      transactionId: 'TRX321654987',
      type: 'payout'
    },
  ];
  
  const mockAnalytics: PaymentAnalytics = {
    totalRevenue: '৳125,000',
    monthlyRevenue: '৳28,500',
    processingFees: '৳3,200',
    pendingPayouts: '৳15,800',
    transactionCount: 87,
    successRate: '94.2%'
  };
  
  // Fetch data on component mount
  useEffect(() => {
    // In a real application, you would fetch from an API
    // For now, we'll use the mock data
    setPaymentMethods(mockPaymentMethods);
    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
    setAnalytics(mockAnalytics);
    setIsLoading(false);
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    let result = transactions;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        transaction.studentName.toLowerCase().includes(query) ||
        transaction.tutorName.toLowerCase().includes(query) ||
        transaction.transactionId.toLowerCase().includes(query) ||
        transaction.paymentMethod.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(transaction => transaction.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(transaction => transaction.type === typeFilter);
    }
    
    // Apply date filter (simplified for mock data)
    if (dateFilter === 'today') {
      result = result.filter(transaction => transaction.date === '2023-08-15');
    } else if (dateFilter === 'week') {
      result = result.filter(transaction => ['2023-08-15', '2023-08-14', '2023-08-13', '2023-08-12', '2023-08-11', '2023-08-10', '2023-08-09'].includes(transaction.date));
    } else if (dateFilter === 'month') {
      // All transactions in our mock data are from August 2023
      result = result;
    }
    
    setFilteredTransactions(result);
  }, [searchQuery, statusFilter, typeFilter, dateFilter, transactions]);
  
  // Handle adding a new payment method
  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the payment method.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, you would call an API
    const newMethod: PaymentMethod = {
      id: (paymentMethods.length + 1).toString(),
      name: newPaymentMethod.name || '',
      type: newPaymentMethod.type as 'bank' | 'mobile_banking' | 'card' | 'other',
      status: newPaymentMethod.status as 'active' | 'inactive',
      processingFee: newPaymentMethod.processingFee + '%' || '0%',
      addedAt: new Date().toISOString().split('T')[0]
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddMethodModal(false);
    setNewPaymentMethod({
      type: 'bank',
      status: 'active',
      processingFee: '0'
    });
    
    toast({
      title: "Payment Method Added",
      description: `${newMethod.name} has been added as a payment method.`,
    });
  };
  
  // Handle toggling payment method status
  const handleToggleMethodStatus = (id: string) => {
    // In a real application, you would call an API
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, status: method.status === 'active' ? 'inactive' : 'active' } : method
    ));
    
    const method = paymentMethods.find(m => m.id === id);
    const newStatus = method?.status === 'active' ? 'inactive' : 'active';
    
    toast({
      title: `Payment Method ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `${method?.name} is now ${newStatus}.`,
    });
  };
  
  // Handle deleting a payment method
  const handleDeletePaymentMethod = (id: string) => {
    // In a real application, you would call an API
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    
    toast({
      title: "Payment Method Deleted",
      description: "The payment method has been removed from the system.",
    });
  };
  
  // Render status badge for transactions
  const renderTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  // Render type badge for transactions
  const renderTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Payment</Badge>;
      case 'refund':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refund</Badge>;
      case 'payout':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Payout</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  // Render status badge for payment methods
  const renderMethodStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6 w-full overflow-y-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-teal-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Payment Management</h2>
            <p className="text-white/90 mt-1">Manage payment methods, transactions, and financial analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white">
              {transactions.length} Transactions
            </Badge>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalRevenue}</div>
                <p className="text-sm text-muted-foreground">Lifetime platform revenue</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-600" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.monthlyRevenue}</div>
                <p className="text-sm text-muted-foreground">Current month earnings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  Pending Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingPayouts}</div>
                <p className="text-sm text-muted-foreground">Awaiting disbursement to tutors</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.successRate}</div>
                <p className="text-sm text-muted-foreground">Transaction completion rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.transactionCount}</div>
                <p className="text-sm text-muted-foreground">Total processed transactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                  Processing Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.processingFees}</div>
                <p className="text-sm text-muted-foreground">Total payment processing costs</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue breakdown for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Revenue chart visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Payment Methods</h3>
            <Dialog open={showAddMethodModal} onOpenChange={setShowAddMethodModal}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method to the platform
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="methodName">Method Name</Label>
                    <Input
                      id="methodName"
                      placeholder="e.g., bKash, Bank Transfer"
                      value={newPaymentMethod.name || ''}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="methodType">Method Type</Label>
                    <Select 
                      value={newPaymentMethod.type} 
                      onValueChange={(value) => setNewPaymentMethod({...newPaymentMethod, type: value as any})}
                    >
                      <SelectTrigger id="methodType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="processingFee">Processing Fee (%)</Label>
                    <Input
                      id="processingFee"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="e.g., 1.5"
                      value={newPaymentMethod.processingFee || ''}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, processingFee: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="methodStatus">Initial Status</Label>
                    <Select 
                      value={newPaymentMethod.status} 
                      onValueChange={(value) => setNewPaymentMethod({...newPaymentMethod, status: value as any})}
                    >
                      <SelectTrigger id="methodStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMethodModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPaymentMethod} className="bg-green-600 hover:bg-green-700">
                    Add Method
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Processing Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>
                        {method.type === 'mobile_banking' ? 'Mobile Banking' : 
                         method.type === 'bank' ? 'Bank Transfer' : 
                         method.type === 'card' ? 'Credit/Debit Card' : 'Other'}
                      </TableCell>
                      <TableCell>{method.processingFee}</TableCell>
                      <TableCell>{renderMethodStatusBadge(method.status)}</TableCell>
                      <TableCell>{method.addedAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleMethodStatus(method.id)}>
                              {method.status === 'active' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transactions Table */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Transactions</CardTitle>
              <Button variant="outline" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                          <TableCell>{transaction.studentName || '-'}</TableCell>
                          <TableCell>{transaction.tutorName || '-'}</TableCell>
                          <TableCell>{transaction.amount}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell>{renderTransactionTypeBadge(transaction.type)}</TableCell>
                          <TableCell>{renderTransactionStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowTransactionModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Transaction Detail Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                  <p className="font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{selectedTransaction.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p className="font-semibold">{selectedTransaction.amount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div>{renderTransactionStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <div>{renderTransactionTypeBadge(selectedTransaction.type)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <p>{selectedTransaction.paymentMethod}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Parties Involved</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTransaction.studentName && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Student</h5>
                      <p>{selectedTransaction.studentName}</p>
                    </div>
                  )}
                  {selectedTransaction.tutorName && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Tutor</h5>
                      <p>{selectedTransaction.tutorName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransactionModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}