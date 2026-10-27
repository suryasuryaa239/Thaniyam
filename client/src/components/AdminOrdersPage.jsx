import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Package, Truck, CheckCircle2, Clock, AlertCircle,
  Phone, ArrowLeft, RefreshCw, ShieldCheck, ChevronRight,
  ChevronLeft, MapPin, Calendar, X, Eye, Lock, LogOut,
  Copy, Check, ExternalLink, IndianRupee, Sparkles, Filter,
  User, Mail, SlidersHorizontal
} from 'lucide-react';
import { ALL_PRODUCTS } from '../data/productsCatalog';
import AdminInventoryTab from './AdminInventoryTab';
import { apiUrl } from '../config/api';

const STATUS_OPTIONS = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminOrdersPage({
  onNavigateHome,
  onNavigateTrack,
  onProductChange
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // 'orders' | 'inventory'

  // Authentication states
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('thaniyam_admin_token') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Orders data & UI states
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7days' | '30days'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected order for detailed modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatusSelection, setNewStatusSelection] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Verify stored token on mount
  useEffect(() => {
    if (!authToken) return;

    let isMounted = true;
    fetch(apiUrl('/api/orders/admin/verify'), {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem('thaniyam_admin_token');
          if (isMounted) {
            setAuthToken('');
            setAdminUser(null);
          }
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success) {
          setAdminUser(data.admin);
        }
      })
      .catch((err) => {
        console.warn('⚠️ [Admin] Session verification check notice:', err.message);
      });

    return () => { isMounted = false; };
  }, [authToken]);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!authToken) return;

    setIsLoadingOrders(true);
    setFetchError(null);

    try {
      const res = await fetch(apiUrl('/api/orders/admin/all'), {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          sessionStorage.removeItem('thaniyam_admin_token');
          setAuthToken('');
          setAdminUser(null);
          throw new Error('Your admin session has expired. Please log in again.');
        }
        throw new Error(data.message || 'Failed to load customer orders.');
      }

      setOrders(data.orders || []);
      setSummary(data.summary || null);
    } catch (err) {
      setFetchError(err.message || 'Error connecting to admin orders server.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      fetchOrders();
    }
  }, [authToken, fetchOrders]);

  // Admin Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch(apiUrl('/api/orders/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid administrator username or password.');
      }

      sessionStorage.setItem('thaniyam_admin_token', data.token);
      setAuthToken(data.token);
      setAdminUser(data.admin);
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Admin Logout Handler
  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch(apiUrl('/api/orders/admin/logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      sessionStorage.removeItem('thaniyam_admin_token');
      setAuthToken('');
      setAdminUser(null);
      setOrders([]);
      setSelectedOrder(null);
    }
  };

  // Update Status for an order (either from table dropdown or from modal)
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    setIsUpdatingStatus(true);
    setActionFeedback(null);

    try {
      const res = await fetch(apiUrl(`/api/orders/admin/${orderId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status.');
      }

      const updated = data.order;

      // Update in local state immediately
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: updated.orderStatus, updatedAt: updated.updatedAt } : o))
      );

      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: updated.orderStatus,
          updatedAt: updated.updatedAt
        }));
      }

      setActionFeedback({
        type: 'success',
        message: `Order #${orderId} status successfully updated to "${updated.orderStatus}".`
      });

      // Refetch summary counts silently in background
      fetchOrders();

    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Status update failed.'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtered orders computation
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const cleanDigits = q.replace(/\D/g, '');
      result = result.filter((o) => {
        const idMatch = (o.orderId || '').toLowerCase().includes(q);
        const nameMatch = (o.customer?.fullName || '').toLowerCase().includes(q);
        const emailMatch = (o.customer?.email || '').toLowerCase().includes(q);
        const mobileMatch = cleanDigits.length > 0 &&
          (o.customer?.mobile || '').replace(/\D/g, '').includes(cleanDigits);
        return idMatch || nameMatch || emailMatch || mobileMatch;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      const target = statusFilter.toLowerCase();
      result = result.filter((o) => {
        const os = (o.orderStatus || 'Placed').toLowerCase();
        if (target === 'order placed' || target === 'placed') {
          return os === 'order placed' || os === 'placed';
        }
        if (target === 'shipped' || target === 'dispatched') {
          return os === 'shipped' || os === 'dispatched';
        }
        return os === target;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      result = result.filter((o) => {
        const orderTime = new Date(o.createdAt).getTime();
        if (dateFilter === 'today') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          return orderTime >= startOfToday;
        }
        if (dateFilter === '7days') {
          return now - orderTime <= 7 * 24 * 3600 * 1000;
        }
        if (dateFilter === '30days') {
          return now - orderTime <= 30 * 24 * 3600 * 1000;
        }
        return true;
      });
    }

    return result;
  }, [orders, searchQuery, statusFilter, dateFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Helper to copy Order ID
  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Helper for status badge class
  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'admin-badge-delivered';
    if (s === 'out for delivery') return 'admin-badge-out-for-delivery';
    if (s === 'shipped' || s === 'dispatched') return 'admin-badge-shipped';
    if (s === 'processing') return 'admin-badge-processing';
    if (s === 'confirmed') return 'admin-badge-confirmed';
    if (s === 'cancelled') return 'admin-badge-cancelled';
    return 'admin-badge-placed';
  };

  // Helper to format date
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Helper to get product image
  const getItemImage = (productId) => {
    const found = ALL_PRODUCTS.find((p) => p.id === productId);
    return found ? found.image : '/images/cat-snacks.jpg';
  };

  // ==========================================================================
  // VIEW 1: ADMIN LOGIN SCREEN (If not authenticated)
  // ==========================================================================
  if (!authToken) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-container">
          <div className="admin-login-card">
            <div className="admin-login-header">
              <div className="admin-login-icon">
                <Lock size={32} color="#1b4332" />
              </div>
              <h1 className="admin-login-title">Thaniyam Treats</h1>
              <p className="admin-login-subtitle">Admin Order Management Portal</p>
              <div className="admin-secure-pill">
                <ShieldCheck size={14} color="#d97706" />
                <span>Protected Store Administration System</span>
              </div>
            </div>

            {loginError && (
              <div className="admin-alert-banner error" role="alert">
                <AlertCircle size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="admin-username">Admin Username</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon-left text-muted" />
                  <input
                    id="admin-username"
                    type="text"
                    className="form-input"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter admin username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon-left text-muted" />
                  <input
                    id="admin-password"
                    type="password"
                    className="form-input"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary btn-full-width"
                disabled={isLoggingIn}
                id="btn-admin-login-submit"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Log In to Admin Dashboard</span>
                  </>
                )}
              </button>

              <div className="admin-quick-fill-box">
                <p className="quick-fill-hint">Development Credentials:</p>
                <button
                  type="button"
                  className="quick-fill-btn"
                  onClick={() => {
                    setLoginUsername('admin');
                    setLoginPassword('admin123');
                  }}
                >
                  ⚡ Auto-fill Default Admin (<code>admin</code> / <code>admin123</code>)
                </button>
              </div>

              <div className="admin-login-footer">
                <button
                  type="button"
                  className="btn-link text-muted"
                  onClick={onNavigateHome}
                >
                  <ArrowLeft size={14} />
                  <span>Return to Customer Storefront</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: AUTHENTICATED ADMIN ORDER MANAGEMENT DASHBOARD
  // ==========================================================================
  return (
    <div className="admin-orders-page">
      {/* 1. Admin Top Banner */}
      <div className="admin-header-banner">
        <div className="admin-container">
          <div className="admin-header-flex">
            <div className="admin-title-group">
              <div className="admin-badge-strip">
                <span className="admin-badge-icon">🌿</span>
                <span className="admin-badge-name">Thaniyam Treats Store Administration</span>
                <span className="admin-badge-tag">
                  {activeAdminTab === 'orders' ? 'Step 9 • Order Operations' : 'Step 10 • Inventory Operations'}
                </span>
              </div>
              <h1 className="admin-page-title">
                {activeAdminTab === 'orders' ? 'Admin Order Management' : 'Product & Inventory Management'}
              </h1>
              <p className="admin-page-subtitle">
                {activeAdminTab === 'orders'
                  ? 'View real-time customer orders, inspect line items & delivery addresses, and update fulfillment milestones.'
                  : 'Manage authentic product catalogue, update prices & live stock, safely deactivate items, and replenish inventory.'}
              </p>
            </div>

            <div className="admin-header-actions">
              {activeAdminTab === 'orders' && (
                <button
                  type="button"
                  className="btn-admin-action"
                  onClick={fetchOrders}
                  disabled={isLoadingOrders}
                  title="Refresh latest customer orders"
                  id="btn-admin-refresh-orders"
                >
                  <RefreshCw size={16} className={isLoadingOrders ? 'spinner' : ''} />
                  <span>{isLoadingOrders ? 'Syncing...' : 'Refresh Orders'}</span>
                </button>
              )}

              <div className="admin-user-pill">
                <User size={15} color="#1b4332" />
                <span>{adminUser?.username || 'admin'} ({adminUser?.role || 'Manager'})</span>
              </div>

              <button
                type="button"
                className="btn-admin-action btn-logout"
                onClick={handleLogout}
                title="Log out of admin session"
                id="btn-admin-logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-container admin-content-section">
        {/* Primary Admin Tab Navigation */}
        <div className="admin-nav-tabs-bar">
          <button
            type="button"
            className={`admin-nav-tab ${activeAdminTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('orders')}
            id="tab-admin-orders"
          >
            <Package size={17} />
            <span>Customer Orders</span>
            {summary?.total > 0 && <span className="tab-pill">{summary.total}</span>}
          </button>
          <button
            type="button"
            className={`admin-nav-tab ${activeAdminTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('inventory')}
            id="tab-admin-inventory"
          >
            <SlidersHorizontal size={17} />
            <span>Products &amp; Inventory</span>
          </button>
        </div>

        {activeAdminTab === 'inventory' ? (
          <AdminInventoryTab
            authToken={authToken}
            onProductChange={onProductChange}
          />
        ) : (
          <>
            {/* Action Feedback Banner */}
            {actionFeedback && (
              <div className={`admin-alert-banner ${actionFeedback.type}`} role="alert">
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 size={18} color="#15803d" />
                ) : (
                  <AlertCircle size={18} color="#dc2626" />
                )}
                <span className="alert-msg">{actionFeedback.message}</span>
                <button
                  type="button"
                  className="btn-alert-close"
                  onClick={() => setActionFeedback(null)}
                  aria-label="Dismiss message"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* 2. Key Metrics Summary Grid */}
            <div className="admin-metrics-grid">
          <div className="metric-card metric-total">
            <div className="metric-icon-box">
              <Package size={22} color="#1b4332" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Real Orders</span>
              <strong className="metric-value">{summary?.total ?? orders.length}</strong>
            </div>
          </div>

          <div className="metric-card metric-placed">
            <div className="metric-icon-box">
              <Clock size={22} color="#2563eb" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Placed / Confirmed</span>
              <strong className="metric-value">
                {(summary?.placed || 0) + (summary?.confirmed || 0)}
              </strong>
            </div>
          </div>

          <div className="metric-card metric-processing">
            <div className="metric-icon-box">
              <Sparkles size={22} color="#d97706" />
            </div>
            <div className="metric-info">
              <span className="metric-label">In Preparation</span>
              <strong className="metric-value">{summary?.processing || 0}</strong>
            </div>
          </div>

          <div className="metric-card metric-transit">
            <div className="metric-icon-box">
              <Truck size={22} color="#0891b2" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Shipped / Out for Delivery</span>
              <strong className="metric-value">
                {(summary?.shipped || 0) + (summary?.outForDelivery || 0)}
              </strong>
            </div>
          </div>

          <div className="metric-card metric-delivered">
            <div className="metric-icon-box">
              <CheckCircle2 size={22} color="#15803d" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Delivered Orders</span>
              <strong className="metric-value">{summary?.delivered || 0}</strong>
            </div>
          </div>

          <div className="metric-card metric-revenue">
            <div className="metric-icon-box">
              <IndianRupee size={22} color="#b45309" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Active Sales Revenue</span>
              <strong className="metric-value">
                ₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* 3. Search & Filters Panel */}
        <div className="admin-controls-card">
          <div className="admin-search-wrapper">
            <Search size={18} className="search-icon-decor" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by Order ID, customer name, mobile number, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              id="admin-order-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-filter-group">
            {/* Status Filter */}
            <div className="filter-select-wrap">
              <Filter size={15} className="filter-decor-icon" />
              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                id="admin-status-filter"
                aria-label="Filter orders by status"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="filter-select-wrap">
              <Calendar size={15} className="filter-decor-icon" />
              <select
                className="admin-select"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                id="admin-date-filter"
                aria-label="Filter orders by date"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateFilter('all');
                  setCurrentPage(1);
                }}
                title="Reset all filters"
              >
                <RefreshCw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="admin-results-summary-bar">
          <span className="results-count-text">
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> customer orders
          </span>
          {isLoadingOrders && (
            <span className="syncing-indicator">
              <RefreshCw size={13} className="spinner" /> Syncing with database...
            </span>
          )}
        </div>

        {/* 4. Orders Table Card */}
        <div className="admin-table-card">
          {fetchError ? (
            <div className="admin-empty-state error">
              <AlertCircle size={40} color="#dc2626" />
              <h3>Failed to Load Orders</h3>
              <p>{fetchError}</p>
              <button className="btn-primary" onClick={fetchOrders}>
                <span>Retry Loading</span>
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-empty-state">
              <Package size={44} color="#8a968f" />
              <h3>No Matching Orders Found</h3>
              <p>Try refining your search keyword or resetting the status and date filters.</p>
              {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                >
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Customer Name & Contact</th>
                    <th>Date & Time</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Current Status</th>
                    <th>Quick Update</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => {
                    const itemCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
                    const firstItem = order.items?.[0]?.name || 'Traditional Items';
                    const isCopied = copiedOrderId === order.orderId;

                    return (
                      <tr key={order.orderId} className="admin-table-row">
                        {/* Order ID */}
                        <td className="cell-order-id">
                          <div className="order-id-badge-wrap">
                            <span className="admin-order-id-code">{order.orderId}</span>
                            <button
                              type="button"
                              className="btn-inline-copy"
                              onClick={() => handleCopy(order.orderId)}
                              title="Copy Order ID"
                              aria-label={`Copy ${order.orderId}`}
                            >
                              {isCopied ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="cell-customer">
                          <div className="customer-info-block">
                            <strong className="customer-name">{order.customer?.fullName || 'Customer'}</strong>
                            <div className="customer-contact-sub">
                              <span className="customer-phone">
                                <Phone size={12} /> {order.customer?.mobile || '—'}
                              </span>
                              {order.customer?.city && (
                                <span className="customer-city">
                                  <MapPin size={12} /> {order.customer?.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="cell-date">
                          <span className="date-main">{formatDate(order.createdAt)}</span>
                        </td>

                        {/* Items */}
                        <td className="cell-items">
                          <div className="items-summary-wrap">
                            <span className="items-pill">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            <span className="items-preview" title={firstItem}>
                              {firstItem}
                              {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                            </span>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="cell-amount">
                          <div className="amount-block">
                            <strong className="amount-val">
                              ₹{(order.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                            </strong>
                            <span className="payment-method-tag">
                              {order.payment?.status || 'Pending'}
                            </span>
                          </div>
                        </td>

                        {/* Current Status Badge */}
                        <td className="cell-status">
                          <span className={`admin-status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                            <span className="badge-dot"></span>
                            {order.orderStatus || 'Placed'}
                          </span>
                        </td>

                        {/* Quick Update Dropdown */}
                        <td className="cell-quick-update">
                          <select
                            className="admin-inline-select"
                            value={order.orderStatus || 'Placed'}
                            disabled={isUpdatingStatus}
                            onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                            aria-label={`Update status for ${order.orderId}`}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Action: Open Modal */}
                        <td className="cell-actions text-right">
                          <button
                            type="button"
                            className="btn-view-order"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatusSelection(order.orderStatus || 'Placed');
                            }}
                            title="Inspect order details and shipping address"
                          >
                            <Eye size={15} />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Pagination Bar */}
          {totalPages > 1 && (
            <div className="admin-pagination-bar">
              <span className="pagination-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <div className="pagination-buttons">
                <button
                  type="button"
                  className="btn-page-nav"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn-page-num ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn-page-nav"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>

      {/* ====================================================================
          6. ORDER DETAILS MODAL (Requirement 5 & 6)
          ==================================================================== */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-order-title"
          >
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div className="modal-title-left">
                <div className="modal-id-row">
                  <h2 id="modal-order-title" className="modal-order-id">
                    {selectedOrder.orderId}
                  </h2>
                  <button
                    type="button"
                    className="btn-copy-mini"
                    onClick={() => handleCopy(selectedOrder.orderId)}
                    title="Copy Order ID"
                  >
                    {copiedOrderId === selectedOrder.orderId ? (
                      <Check size={14} color="#15803d" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copiedOrderId === selectedOrder.orderId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="modal-meta-row">
                  <Calendar size={14} className="text-muted" />
                  <span>Placed on {formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              <div className="modal-title-right">
                <span className={`admin-status-badge large ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                  <span className="badge-dot"></span>
                  {selectedOrder.orderStatus || 'Placed'}
                </span>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {/* Modal Top Alert if any */}
              {actionFeedback && (
                <div className={`admin-alert-banner mini ${actionFeedback.type}`} role="alert">
                  {actionFeedback.type === 'success' ? (
                    <CheckCircle2 size={16} color="#15803d" />
                  ) : (
                    <AlertCircle size={16} color="#dc2626" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              {/* Status Update Control Section */}
              <div className="modal-status-updater-card">
                <div className="status-updater-header">
                  <Sparkles size={18} color="#d97706" />
                  <strong>Update Customer Fulfillment Status</strong>
                </div>
                <p className="status-updater-desc">
                  Changes save directly to the database and update customer live tracking immediately.
                </p>

                <div className="status-updater-controls">
                  <select
                    className="status-updater-select"
                    value={newStatusSelection}
                    onChange={(e) => setNewStatusSelection(e.target.value)}
                    aria-label="Select order status"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn-primary btn-save-status"
                    disabled={isUpdatingStatus || newStatusSelection === selectedOrder.orderStatus}
                    onClick={() => handleUpdateStatus(selectedOrder.orderId, newStatusSelection)}
                    id="btn-save-modal-status"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <RefreshCw size={16} className="spinner" />
                        <span>Saving Update...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Save Status</span>
                      </>
                    )}
                  </button>

                  {/* Customer Tracking Live Link */}
                  <button
                    type="button"
                    className="btn-outline-track-link"
                    onClick={() => {
                      if (onNavigateTrack) {
                        onNavigateTrack(selectedOrder.orderId, selectedOrder.customer?.mobile);
                      } else {
                        window.location.hash = `#/track-order?orderId=${encodeURIComponent(selectedOrder.orderId)}&mobile=${encodeURIComponent(selectedOrder.customer?.mobile || '')}`;
                      }
                    }}
                    title="Open customer order tracking page to view customer-facing experience"
                  >
                    <ExternalLink size={15} />
                    <span>View in Customer Tracking</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="modal-details-grid">
                {/* Left Column: Customer & Delivery */}
                <div className="modal-col">
                  {/* Customer Information Card */}
                  <div className="modal-info-card">
                    <h3 className="modal-card-heading">
                      <User size={16} className="card-icon-accent" />
                      <span>Customer Details</span>
                    </h3>
                    <div className="info-field-group">
                      <div className="info-field">
                        <span className="field-label">Full Name:</span>
                        <strong className="field-value">{selectedOrder.customer?.fullName || '—'}</strong>
                      </div>
                      <div className="info-field">
                        <span className="field-label">Mobile Number:</span>
                        <a href={`tel:${selectedOrder.customer?.mobile}`} className="field-value phone-link">
                          <Phone size={13} /> {selectedOrder.customer?.mobile || '—'}
                        </a>
                      </div>
                      {selectedOrder.customer?.email && (
                        <div className="info-field">
                          <span className="field-label">Email:</span>
                          <a href={`mailto:${selectedOrder.customer?.email}`} className="field-value email-link">
                            <Mail size={13} /> {selectedOrder.customer?.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  <div className="modal-info-card">
                    <h3 className="modal-card-heading">
                      <MapPin size={16} className="card-icon-accent" />
                      <span>Delivery Address</span>
                    </h3>
                    <div className="address-display-box">
                      <p className="addr-line"><strong>{selectedOrder.customer?.addressLine}</strong></p>
                      <p className="addr-line">
                        {[
                          selectedOrder.customer?.city,
                          selectedOrder.customer?.district,
                          selectedOrder.customer?.state
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p className="addr-line">
                        PIN Code: <strong>{selectedOrder.customer?.pincode}</strong>
                      </p>
                      {selectedOrder.customer?.deliveryNotes && (
                        <div className="delivery-notes-box">
                          <span className="notes-tag">Special Instructions:</span>
                          <p className="notes-text">"{selectedOrder.customer?.deliveryNotes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Info Card */}
                  <div className="modal-info-card">
                    <h3 className="modal-card-heading">
                      <IndianRupee size={16} className="card-icon-accent" />
                      <span>Payment Summary</span>
                    </h3>
                    <div className="info-field-group">
                      <div className="info-field">
                        <span className="field-label">Payment Method:</span>
                        <span className="field-value">{selectedOrder.payment?.method || 'Pay on Delivery'}</span>
                      </div>
                      <div className="info-field">
                        <span className="field-label">Payment Status:</span>
                        <span className="status-tag-pill">{selectedOrder.payment?.status || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ordered Items & Bill Summary */}
                <div className="modal-col">
                  <div className="modal-info-card items-card">
                    <h3 className="modal-card-heading">
                      <Package size={16} className="card-icon-accent" />
                      <span>Ordered Traditional Foods ({selectedOrder.items?.length || 0})</span>
                    </h3>

                    <div className="modal-items-list">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <div key={item.productId || idx} className="modal-item-row">
                          <img
                            src={getItemImage(item.productId)}
                            alt={item.name}
                            className="modal-item-thumb"
                          />
                          <div className="modal-item-details">
                            <h4 className="modal-item-title">{item.name}</h4>
                            {item.tamilName && (
                              <span className="modal-item-tamil">{item.tamilName}</span>
                            )}
                            <div className="modal-item-meta">
                              {item.weight && <span className="item-weight">{item.weight}</span>}
                              <span className="item-price-calc">
                                ₹{item.unitPrice} × {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="modal-item-line-total">
                            <strong>₹{item.lineTotal || (item.unitPrice * item.quantity)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="modal-price-breakdown">
                      <div className="breakdown-row">
                        <span>Items Subtotal</span>
                        <span>₹{(selectedOrder.pricing?.subtotal || selectedOrder.pricing?.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Delivery & Packing Charges</span>
                        <span className="free-shipping-tag">FREE</span>
                      </div>
                      <div className="breakdown-row grand-total">
                        <strong>Grand Total Amount</strong>
                        <strong className="total-highlight">
                          ₹{(selectedOrder.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                <span>Close Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
