import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { DollarSign, PlusCircle, Trash2, Receipt, Calendar, Tag, Shield, Users, Wallet, TrendingUp } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  userId: string;
}

interface Sponsor {
  id: string;
  name: string;
  amount: number;
  date: string;
  userId: string;
}

interface Budget {
  id: string;
  totalAmount: number;
  sponsorshipAmount: number;
  startDate: string;
  endDate: string;
  userId: string;
}

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'equipment',
    date: new Date().toISOString().split('T')[0]
  });
  const [budgetForm, setBudgetForm] = useState({
    totalAmount: '',
    sponsorName: '',
    sponsorAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const categories = [
    { value: 'equipment', label: 'Sports Equipment' },
    { value: 'venue', label: 'Venue Rental' },
    { value: 'refreshments', label: 'Refreshments' },
    { value: 'prizes', label: 'Prizes & Awards' },
    { value: 'transport', label: 'Transportation' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      const expensesSnap = await getDocs(expensesQuery);
      const expensesData = expensesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // Fetch sponsors
      const sponsorsQuery = query(
        collection(db, 'sponsors'),
        where('userId', '==', user.uid)
      );
      const sponsorsSnap = await getDocs(sponsorsQuery);
      const sponsorsData = sponsorsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sponsor[];
      setSponsors(sponsorsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // Fetch budget
      const budgetQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', user.uid)
      );
      const budgetSnap = await getDocs(budgetQuery);
      if (!budgetSnap.empty) {
        setBudget({ id: budgetSnap.docs[0].id, ...budgetSnap.docs[0].data() } as Budget);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in');

      const expenseData = {
        description: newExpense.description.trim(),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'expenses'), expenseData);
      
      setNewExpense({
        description: '',
        amount: '',
        category: 'equipment',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in');

      const totalBudgetAmount = parseFloat(budgetForm.totalAmount);
      const sponsorAmount = budgetForm.sponsorName && budgetForm.sponsorAmount ? 
        parseFloat(budgetForm.sponsorAmount) : 0;

      // Add sponsor if provided
      if (budgetForm.sponsorName && sponsorAmount > 0) {
        await addDoc(collection(db, 'sponsors'), {
          name: budgetForm.sponsorName.trim(),
          amount: sponsorAmount,
          date: new Date().toISOString().split('T')[0],
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }

      // Update or create budget
      const budgetData = {
        totalAmount: totalBudgetAmount + sponsorAmount, // Include sponsor amount in total budget
        sponsorshipAmount: (budget?.sponsorshipAmount || 0) + sponsorAmount,
        startDate: budgetForm.startDate,
        endDate: budgetForm.endDate,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };

      if (budget) {
        await updateDoc(doc(db, 'budgets', budget.id), budgetData);
      } else {
        await addDoc(collection(db, 'budgets'), budgetData);
      }
      
      setBudgetForm({
        totalAmount: '',
        sponsorName: '',
        sponsorAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      setShowBudgetForm(false);
      fetchData();
    } catch (err) {
      console.error('Error updating budget:', err);
      setError('Failed to update budget');
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      fetchData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  const handleDeleteSponsor = async (sponsorId: string) => {
    try {
      await deleteDoc(doc(db, 'sponsors', sponsorId));
      fetchData();
    } catch (err) {
      console.error('Error deleting sponsor:', err);
      setError('Failed to delete sponsor');
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSponsorship = sponsors.reduce((sum, sponsor) => sum + sponsor.amount, 0);
  const availableBudget = (budget?.totalAmount || 0) - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Sports Budget Manager</h1>
          <p className="text-gray-400">Track and manage sports-related expenses</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowBudgetForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            <Wallet className="h-5 w-5" />
            {budget ? 'Update Budget' : 'Set Budget'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Add Expense
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-400" />
          {error}
        </div>
      )}

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Wallet className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-white">₹{(budget?.totalAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Available Budget</p>
              <p className={`text-2xl font-bold ${availableBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{availableBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Sponsors</h2>
          <div className="space-y-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-gray-700/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-700 rounded-xl">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{sponsor.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(sponsor.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">₹{sponsor.amount.toLocaleString()}</span>
                  <button
                    onClick={() => handleDeleteSponsor(sponsor.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {sponsors.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No sponsors added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Expenses</h2>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-gray-700/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-700 rounded-xl">
                    <Receipt className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{expense.description}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Tag className="h-4 w-4" />
                        {categories.find(c => c.value === expense.category)?.label}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">₹{expense.amount.toLocaleString()}</span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No expenses recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Expense</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                  placeholder="Enter expense description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  required
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {budget ? 'Update Budget' : 'Set Budget'}
            </h2>
            
            <form onSubmit={handleBudgetSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Budget Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={budgetForm.totalAmount}
                  onChange={(e) => setBudgetForm({...budgetForm, totalAmount: e.target.value})}
                  className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                  placeholder="Enter base budget amount"
                />
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add Sponsor (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sponsor Name
                    </label>
                    <input
                      type="text"
                      value={budgetForm.sponsorName}
                      onChange={(e) => setBudgetForm({...budgetForm, sponsorName: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      placeholder="Enter sponsor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sponsorship Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetForm.sponsorAmount}
                      onChange={(e) => setBudgetForm({...budgetForm, sponsorAmount: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                      placeholder="Enter sponsorship amount"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget Period
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      required
                      value={budgetForm.startDate}
                      onChange={(e) => setBudgetForm({...budgetForm, startDate: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                    />
                    <p className="text-sm text-gray-400 mt-1">Start Date</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      required
                      value={budgetForm.endDate}
                      onChange={(e) => setBudgetForm({...budgetForm, endDate: e.target.value})}
                      className="block w-full rounded-xl bg-gray-700/50 border border-gray-600 focus:border-orange-500 focus:ring focus:ring-orange-500/20 text-white"
                    />
                    <p className="text-sm text-gray-400 mt-1">End Date</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-400 mb-4">
                  {budgetForm.sponsorAmount ? (
                    <>
                      Total Budget will be: ₹
                      {(parseFloat(budgetForm.totalAmount || '0') + parseFloat(budgetForm.sponsorAmount || '0')).toLocaleString()}
                      <br />
                      <span className="text-xs">
                        (Base Budget: ₹{parseFloat(budgetForm.totalAmount || '0').toLocaleString()} + 
                        Sponsorship: ₹{parseFloat(budgetForm.sponsorAmount || '0').toLocaleString()})
                      </span>
                    </>
                  ) : (
                    `Total Budget will be: ₹${parseFloat(budgetForm.totalAmount || '0').toLocaleString()}`
                  )}
                </p>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBudgetForm(false)}
                    className="flex-1 px-4 py-3 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200"
                  >
                    {budget ? 'Update Budget' : 'Set Budget'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}