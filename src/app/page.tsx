"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle } from "lucide-react";

// Types
interface Market {
  id: string;
  title: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  updatedAt: string;
  priceHistory: { time: string; price: number }[];
}

interface Order {
  id: string;
  marketTitle: string;
  direction: "YES" | "NO";
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  riskAlerts: string[];
}

// Mock Data
const mockMarkets: Market[] = [
  { id: "1", title: "2024 US Presidential Election", category: "Politics", yesPrice: 0.52, noPrice: 0.48, volume24h: 1250000, updatedAt: "2 min ago", priceHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, price: 0.45 + Math.random() * 0.2 })) },
  { id: "2", title: "Fed Rate Cut Q1 2025", category: "Finance", yesPrice: 0.38, noPrice: 0.62, volume24h: 450000, updatedAt: "5 min ago", priceHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, price: 0.3 + Math.random() * 0.3 })) },
  { id: "3", title: "BTC above $100k by EOY", category: "Crypto", yesPrice: 0.28, noPrice: 0.72, volume24h: 890000, updatedAt: "1 min ago", priceHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, price: 0.2 + Math.random() * 0.4 })) },
  { id: "4", title: "Apple announces new product", category: "Tech", yesPrice: 0.65, noPrice: 0.35, volume24h: 230000, updatedAt: "10 min ago", priceHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, price: 0.5 + Math.random() * 0.3 })) },
  { id: "5", title: "SpaceX Starship orbital success", category: "Science", yesPrice: 0.71, noPrice: 0.29, volume24h: 340000, updatedAt: "3 min ago", priceHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, price: 0.6 + Math.random() * 0.2 })) },
  { id: "6", title: "Taylor Swift new album 2024", category: "Entertainment", yesPrice: 0.43, noPrice: 0.57, volume24h: 180000, updatedAt: "8 min ago", priceHistory: Array.from({ length: 24 }, (_, i) => ({ time: `${i}h`, price: 0.35 + Math.random() * 0.25 })) },
];

// Risk check function
function checkRisk(orders: Order[], newOrder: { quantity: number; price: number; direction: string }): string[] {
  const alerts: string[] = [];
  const totalOrders = orders.length + 1;
  const totalValue = orders.reduce((sum, o) => sum + o.total, 0) + newOrder.price * newOrder.quantity;

  if (totalOrders > 10) alerts.push("⚠️ Daily order limit reached (10 orders)");
  if (newOrder.quantity > 100) alerts.push("⚠️ Single order exceeds 100 shares limit");
  if (totalValue > 1000) alerts.push("⚠️ Total exposure exceeds $1000");
  if (orders.length > 0 && orders[orders.length - 1].marketTitle === "2024 US Presidential Election") {
    const sameMarketOrders = orders.filter(o => o.marketTitle === "2024 US Presidential Election");
    if (sameMarketOrders.length >= 2) alerts.push("⚠️ Repeated orders on same market");
  }

  return alerts;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderForm, setOrderForm] = useState({ direction: "YES" as "YES" | "NO", quantity: 10, price: 0.5 });
  const [showTradePanel, setShowTradePanel] = useState(false);
  const [riskAlerts, setRiskAlerts] = useState<string[]>([]);

  const filteredMarkets = useMemo(() => {
    return mockMarkets.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalExposure = orders.reduce((sum, o) => sum + o.total, 0);

  const handleTrade = () => {
    const alerts = checkRisk(orders, { ...orderForm, direction: orderForm.direction });
    setRiskAlerts(alerts);

    const newOrder: Order = {
      id: Date.now().toString(),
      marketTitle: selectedMarket?.title || "Unknown",
      direction: orderForm.direction,
      quantity: orderForm.quantity,
      price: orderForm.price,
      total: orderForm.quantity * orderForm.price,
      createdAt: new Date().toLocaleTimeString(),
      riskAlerts: alerts,
    };

    setOrders([newOrder, ...orders]);
    setShowTradePanel(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-[#333]">
        <div>
          <h1 className="text-2xl font-bold text-[#00D395]">Polymarket Assistant</h1>
          <p className="text-gray-500 text-sm">Demo: Monitor & Simulate Trading</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="bg-[#1A1A1A] px-4 py-2 rounded">
            <span className="text-gray-400">Orders:</span> <span className="text-[#00D395] font-bold">{orders.length}</span>
          </div>
          <div className="bg-[#1A1A1A] px-4 py-2 rounded">
            <span className="text-gray-400">Exposure:</span> <span className="text-[#00D395] font-bold">${totalExposure.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Market List */}
        <div className="col-span-4 bg-[#1A1A1A] rounded-xl p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#00D395] outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {filteredMarkets.map(market => (
              <div
                key={market.id}
                onClick={() => { setSelectedMarket(market); setShowTradePanel(false); setOrderForm({ ...orderForm, price: market.yesPrice }); }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${selectedMarket?.id === market.id ? 'bg-[#00D395]/20 border-[#00D395]' : 'bg-[#0D0D0D] border-[#333] hover:border-[#444]'}`}
                style={{ borderWidth: '1px' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-[#333] px-2 py-1 rounded">{market.category}</span>
                  <span className="text-xs text-gray-500">{market.updatedAt}</span>
                </div>
                <h3 className="font-medium mb-3">{market.title}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#00D395]">YES {(market.yesPrice * 100).toFixed(0)}%</span>
                  <div className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#00D395] price-bar-yes" style={{ width: `${market.yesPrice * 100}%` }} />
                    <div className="h-full bg-[#FF5C5C] price-bar-no" style={{ width: `${market.noPrice * 100}%` }} />
                  </div>
                  <span className="text-[#FF5C5C]">NO {(market.noPrice * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Market Detail / Trade Panel */}
        <div className="col-span-8">
          {selectedMarket ? (
            <div className="space-y-6">
              {/* Market Info */}
              <div className="bg-[#1A1A1A] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-2">{selectedMarket.title}</h2>
                <div className="flex gap-6 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> ${(selectedMarket.volume24h / 1000).toFixed(0)}K vol</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedMarket.updatedAt}</span>
                </div>

                {/* Price Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedMarket.priceHistory}>
                      <XAxis dataKey="time" stroke="#444" fontSize={12} />
                      <YAxis domain={[0, 1]} stroke="#444" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                        labelStyle={{ color: '#888' }}
                      />
                      <Line type="monotone" dataKey="price" stroke="#00D395" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trade Panel */}
              <div className="bg-[#1A1A1A] rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#00D395]" />
                    Quick Simulated Trade
                  </h3>
                  {showTradePanel && (
                    <button
                      onClick={() => setShowTradePanel(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!showTradePanel ? (
                  <button
                    onClick={() => setShowTradePanel(true)}
                    className="w-full bg-[#00D395] text-black font-bold py-3 rounded-lg hover:bg-[#00A876] transition-colors"
                  >
                    Open Trade Panel
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {["YES", "NO"].map(dir => (
                        <button
                          key={dir}
                          onClick={() => setOrderForm({ ...orderForm, direction: dir as "YES" | "NO" })}
                          className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                            orderForm.direction === dir
                              ? dir === "YES" ? 'bg-[#00D395] text-black' : 'bg-[#FF5C5C] text-black'
                              : 'bg-[#333] text-gray-400'
                          }`}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Quantity (shares)</label>
                      <input
                        type="number"
                        value={orderForm.quantity}
                        onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                        className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Simulated Price</label>
                      <input
                        type="number"
                        step="0.01"
                        max="1"
                        value={orderForm.price}
                        onChange={(e) => setOrderForm({ ...orderForm, price: Number(e.target.value) })}
                        className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg px-4 py-2"
                      />
                    </div>

                    <div className="bg-[#0D0D0D] rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Notional Value</span>
                        <span>${(orderForm.quantity * orderForm.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fee (0.5%)</span>
                        <span>${(orderForm.quantity * orderForm.price * 0.005).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-[#333]">
                        <span>Total</span>
                        <span className="text-[#00D395]">${(orderForm.quantity * orderForm.price * 1.005).toFixed(2)}</span>
                      </div>
                    </div>

                    {riskAlerts.length > 0 && (
                      <div className="bg-[#FF5C5C]/10 border border-[#FF5C5C] rounded-lg p-4 space-y-1">
                        {riskAlerts.map((alert, i) => (
                          <div key={i} className="text-[#FF5C5C] text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {alert}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleTrade}
                      className="w-full bg-[#00D395] text-black font-bold py-3 rounded-lg hover:bg-[#00A876] transition-colors"
                    >
                      Submit Simulated Order
                    </button>
                  </div>
                )}
              </div>

              {/* Order History */}
              {orders.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between bg-[#0D0D0D] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            order.direction === "YES" ? 'bg-[#00D395]/20 text-[#00D395]' : 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                          }`}>
                            {order.direction}
                          </span>
                          <span className="text-sm">{order.marketTitle}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">×{order.quantity}</span>
                          <span className="font-bold">${order.total.toFixed(2)}</span>
                          <span className="text-gray-500">{order.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1A1A1A] rounded-xl p-12 text-center">
              <TrendingUp className="w-16 h-16 text-[#333] mx-auto mb-4" />
              <p className="text-gray-400">Select a market to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}