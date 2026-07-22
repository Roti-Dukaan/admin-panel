import { UtensilsCrossed, Store, Clock, Download, Calendar, Clock3, User, Phone, MapPin, CheckCircle, XCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { ProductionStatusBadge, StatusSelect } from '@/features/subscription-production/components/ProductionStatusBadge';
import type { CookingSheet } from '@/lib/api/subscription-production.api';
import { useState } from 'react';

export function ProductionCookingSheet({ sheet }: { sheet: CookingSheet | null }) {
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  if (!sheet) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <UtensilsCrossed className="h-12 w-12 mb-3" />
        <p className="text-sm">No cooking sheet available</p>
      </div>
    );
  }

  const totalRevenue = sheet.totals.byFoodItem.reduce((sum, item) => {
    const mealSnapshot = sheet.items?.find((i) => i.items.some((si) => si.foodItemId === item.foodItemId))?.items[0]?.mealSnapshot;
    if (mealSnapshot && mealSnapshot.basePrice > 0) {
      return sum + item.totalQuantity * mealSnapshot.basePrice;
    }
    return sum;
  }, 0);

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cooking Sheet - ${sheet.branchName} - ${sheet.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px; }
            .subtitle { font-size: 16px; color: #6b7280; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
            .card-title { font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 10px; }
            .customer-card { background-color: #f9fafb; }
            .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .item-row:last-child { border-bottom: none; }
            .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-in-progress { background-color: #dbeafe; color: #1e40af; }
            .status-completed { background-color: #dcfce7; color: #166534; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            .status-skipped { background-color: #f3f4f6; color: #374151; }
            .totals { background-color: #f3f4f6; padding: 20px; border-radius: 8px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .total-row:last-child { font-weight: bold; font-size: 18px; }
            .priority-critical { border-left: 4px solid #ef4444; }
            .priority-normal { border-left: 4px solid #3b82f6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">🍽️ Cooking Sheet</h1>
            <p class="subtitle">Branch: ${sheet.branchName} (${sheet.branchCode})</p>
            <p class="subtitle">Date: ${new Date(sheet.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            ${sheet.deliverySlot ? `<p class="subtitle">Delivery Slot: ${sheet.deliverySlot}</p>` : ''}
            <p class="subtitle">Generated: ${new Date(sheet.generatedAt).toLocaleString('en-IN')}</p>
          </div>

          <div class="section">
            <h2 class="section-title">📊 Kitchen Summary</h2>
            <div class="grid">
              <div class="card priority-normal">
                <h3 class="card-title">📦 Total Items</h3>
                <p style="font-size: 24px; font-weight: bold; color: #3b82f6;">${sheet.totals.totalItems}</p>
              </div>
              <div class="card priority-normal">
                <h3 class="card-title">📏 Total Quantity</h3>
                <p style="font-size: 24px; font-weight: bold; color: #10b981;">${sheet.totals.totalQuantity}</p>
              </div>
              <div class="card priority-normal">
                <h3 class="card-title">👥 Active Subscriptions</h3>
                <p style="font-size: 24px; font-weight: bold; color: #6366f1;">${sheet.items.length}</p>
              </div>
              <div class="card priority-critical">
                <h3 class="card-title">💰 Estimated Revenue</h3>
                <p style="font-size: 24px; font-weight: bold; color: #10b981;">₹${totalRevenue}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">🍽️ Menu Items</h2>
            <div class="grid">
              ${sheet.totals.byFoodItem.map((item) => `<!-- Find meal snapshot for ${item.foodItemId} -->
              <div class="card">
                <h3 class="card-title">🍽️ ${item.foodItemName}</h3>
                <div class="space-y-2">
                  <div class="item-row">
                    <span>📏 Quantity:</span>
                    <span><strong>${item.totalQuantity}</strong></span>
                  </div>
                  <div class="item-row">
                    <span>📦 Subscriptions:</span>
                    <span><strong>${item.subscriptions}</strong></span>
                  </div>
                </div>
              </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">👥 Customer Details</h2>
            ${sheet.items.map((customer) => `
              <div class="card customer-card priority-${
                customer.items.some((i) => ['PENDING', 'IN_PROGRESS'].includes(i.status)) ? 'critical' : 'normal'
              }">
                <h3 class="card-title">👤 ${customer.customerName}</h3>
                <div class="space-y-2">
                  <div class="item-row">
                    <span>📞 Phone:</span>
                    <span><strong>${customer.customerPhone}</strong></span>
                  </div>
                  <div class="item-row">
                    <span>⏰ Delivery Slot:</span>
                    <span><strong>${customer.deliverySlot}</strong></span>
                  </div>
                  <div class="item-row">
                    <span>📍 Address:</span>
                    <span><strong>${customer.address || 'Not provided'}</strong></span>
                  </div>
                  <div class="item-row">
                    <span>✅ Status:</span>
                    <span>
                      <span class="status-badge status-${
                        customer.items.reduce((acc, i) => {
                          if (['PENDING', 'IN_PROGRESS'].includes(i.status)) return 'critical';
                          if (i.status === 'COMPLETED') return 'completed';
                          if (i.status === 'CANCELLED') return 'cancelled';
                          return 'normal';
                        }, 'normal')
                      }">
                        ${customer.items.some((i) => i.status === 'PENDING') ? '⚠️' : '✓'} ${customer.items.some((i) => i.status === 'IN_PROGRESS') ? '🔄' : '✅'}
                      </span>
                    </span>
                  </div>
                </div>

                <div class="mt-3">
                  <h4 class="card-title" style="font-size: 14px;">🥘 Food Items</h4>
                  ${customer.items.map((foodItem) => `
                    <div class="item-row" style="padding: 6px 0;">
                      <span>🍽️ ${foodItem.foodItemName} (🔼: ${foodItem.isVeg ? '✅' : '❌'})</span>
                      <span><strong>Qty: ${foodItem.quantity}</strong> | <strong>Status: ${foodItem.status}</strong></span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <h3 class="card-title" style="color: white;">📊 Total Summary</h3>
            <div class="total-row">
              <span>Total Production Items:</span>
              <span>${sheet.totals.totalItems}</span>
            </div>
            <div class="total-row">
              <span>Total Quantity to Prepare:</span>
              <span>${sheet.totals.totalQuantity}</span>
            </div>
            <div class="total-row">
              <span>Active Orders:</span>
              <span>${sheet.items.length}</span>
            </div>
            <div class="total-row">
              <span>Estimated Revenue:</span>
              <span>₹${totalRevenue}</span>
            </div>
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-orange-600" />
            Cooking Sheet
          </h1>
          <p className="text-gray-600 mt-1">
            {sheet.branchName} ({sheet.branchCode}) • {new Date(sheet.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {sheet.deliverySlot && ` • ${sheet.deliverySlot}`}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{sheet.totals.totalItems}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Total Quantity</p>
          <p className="text-2xl font-bold text-gray-900">{sheet.totals.totalQuantity}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Active Orders</p>
          <p className="text-2xl font-bold text-blue-600">{sheet.items.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Generated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(sheet.generatedAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sheet.items.map((customer) => (
          <div key={customer.subscriptionId} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <button
              onClick={() => setExpandedCustomer(expandedCustomer === customer.subscriptionId ? null : customer.subscriptionId)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{customer.customerName}</span>
                <span className="text-xs text-gray-500">{customer.customerPhone}</span>
                <span className="text-xs text-gray-500">{customer.deliverySlot}</span>
                <span className="text-xs text-gray-500 truncate max-w-xs">
                  {customer.address || 'No address'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {customer.items.reduce((acc, i) => acc + i.quantity, 0)} items
                </span>
                {customer.items.some((i) => ['PENDING', 'IN_PROGRESS'].includes(i.status)) && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                {customer.items.some((i) => i.status === 'CANCELLED') && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                {customer.items.every((i) => i.status === 'COMPLETED') && (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${expandedCustomer === customer.subscriptionId ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {expandedCustomer === customer.subscriptionId && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <div className="mt-3 space-y-2">
                  {customer.items.map((item) => (
                    <div key={item.productionItemId} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-3">
                        <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">{item.foodItemName}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                            <span>• Qty: {item.quantity}</span>
                            <span>• Price: ₹{item.basePrice}</span>
                          </div>
                        </div>
                      </div>
                      <ProductionStatusBadge status={item.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED'} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}