import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Boxes,
  Database,
  CheckCircle,
  LineChart,
  MessageCircle,
  Settings as SettingsIcon,
  CloudUpload,
  Plug,
  BarChart3,
  PackageOpen,
  AlertTriangle,
  Ship,
  Layers,
} from 'lucide-react';
import InventoryInsightAgent from '@/pages/InventoryInsightAgent';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

type Section = 'uploads' | 'checks' | 'insights' | 'replenishment' | 'inventory' | 'demand' | 'liquidation' | 'chat' | 'settings';

interface Props {
  showHeader?: boolean;
}

const InventorySuite: React.FC<Props> = ({ showHeader = true }) => {
  const { toast } = useToast();
  const [active, setActive] = useState<Section>('insights');
  const [files, setFiles] = useState<File[]>([]);
  const [autoReplenishment, setAutoReplenishment] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [supplierDelayThreshold, setSupplierDelayThreshold] = useState(10);

  const kpis = useMemo(() => ([
    { label: 'Stockouts (7d)', value: 42, change: -8, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Slow Movers', value: 128, change: -4, icon: PackageOpen, color: 'text-emerald-600' },
    { label: 'Turnover Ratio', value: '6.4x', change: 12, icon: BarChart3, color: 'text-emerald-600' },
    { label: 'On-time Suppliers', value: '92%', change: 3, icon: Ship, color: 'text-emerald-600' },
  ]), []);

  const demandVsInventoryData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Demand',
        data: [320, 290, 410, 380, 450, 500, 520],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.35,
      },
      {
        label: 'Inventory',
        data: [480, 470, 430, 420, 410, 380, 360],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.35,
      },
    ],
  }), []);

  const stockoutHeatmapData = useMemo(() => ({
    labels: ['SKU-A', 'SKU-B', 'SKU-C', 'SKU-D', 'SKU-E', 'SKU-F'],
    datasets: [
      {
        label: 'Stockouts (count)',
        data: [5, 9, 2, 11, 7, 4],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  }), []);

  const abcMixData = useMemo(() => ({
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        label: 'ABC Mix',
        data: [20, 35, 45],
        backgroundColor: ['#06B6D4', '#10B981', '#6366F1'],
        borderWidth: 0,
      },
    ],
  }), []);

  const ageBucketData = useMemo(() => ({
    labels: ['0-30d', '31-60d', '61-90d', '90d+'],
    datasets: [
      {
        label: 'Units',
        data: [3400, 2100, 1200, 800],
        backgroundColor: ['#10B981', '#22D3EE', '#6366F1', '#F59E0B'],
      },
    ],
  }), []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles(prev => [...prev, ...selected]);
    toast({ title: 'Files added', description: `${selected.length} file(s) added for processing.` });
  };

  const NavButton: React.FC<{ id: Section; label: string; icon: React.ElementType; gradient: string }>
    = ({ id, label, icon: Icon, gradient }) => (
    <button
      onClick={() => setActive(id)}
      className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
        active === id
          ? `${gradient} text-white shadow-md border-transparent`
          : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active === id ? 'bg-white/20' : 'bg-white/70 dark:bg-viz-dark/70'}`}>
        <Icon className={`w-5 h-5 ${active === id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        {active === id && (
          <div className="text-sm text-white/85 line-clamp-2">
            {label === 'Insights & Dashboards' && 'Procurement, Replenishment, Liquidation, KPI analytics'}
            {label === 'Data Uploads' && 'CSV/Excel uploads and ERP connectors'}
            {label === 'Data Checks & Validation' && 'Missing data, duplicates, anomalies'}
            {label === 'AI Chat / Q&A' && 'Ask questions. Explain with charts'}
            {label === 'Settings' && 'Thresholds, rules, automations'}
            {label === 'Replenishment' && 'AI POs, reorder points, draft approvals'}
            {label === 'Inventory' && 'On-hand, value, DOS, ABC mix'}
            {label === 'Demand / Product' && 'Forecasts, movers, explainability'}
            {label === 'Liquidation' && 'Aging, markdowns, recovery plan'}
          </div>
        )}
      </div>
      {active === id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );

  const UploadsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-viz-medium/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CloudUpload className="w-5 h-5 text-emerald-600" /> Upload Datasets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">Upload CSV/Excel files for sales, procurement, stock levels, lead times, returns.</div>
          <Input type="file" accept=".csv,.xlsx,.xls" multiple onChange={handleFileUpload} />
          {!!files.length && (
            <div className="border rounded-lg divide-y dark:divide-viz-light/20">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="truncate max-w-[70%]">{f.name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{(f.size / 1024).toFixed(1)} KB</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-viz-medium/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plug className="w-5 h-5 text-viz-accent" /> ERP / E‑commerce Connectors</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[{name: 'Shopify'}, {name: 'SAP'}, {name: 'Oracle NetSuite'}, {name: 'BigCommerce'}, {name: 'WooCommerce'}, {name: 'Custom API'}].map((c) => (
            <Button key={c.name} variant="outline" className="justify-start">
              <Database className="w-4 h-4 mr-2 text-viz-accent" /> Connect {c.name}
            </Button>
          ))}
          <div className="col-span-full text-xs text-slate-500">Connectors are placeholders for now. We will wire APIs next.</div>
        </CardContent>
      </Card>
    </div>
  );

  const ChecksPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600" /> Data Quality & Validation</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <StatTile label="Missing Values" value={files.length ? '1.8%' : '—'} accent="from-amber-500 to-rose-500" />
          <StatTile label="Duplicates" value={files.length ? '0.6%' : '—'} accent="from-indigo-500 to-blue-500" />
          <StatTile label="Anomalies" value={files.length ? '14' : '—'} accent="from-emerald-500 to-teal-600" />
        </CardContent>
      </Card>

      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-viz-accent" /> Issues, Rules & Auto-Fixes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.length ? (
            <>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li>SKU-123 missing lead time for 3 suppliers — <Button size="sm" variant="outline" onClick={() => toast({ title: 'Auto-fill applied', description: 'Used median per supplier.' })}>Auto-fill</Button></li>
                <li>10 duplicate rows in sales_feb.csv — <Button size="sm" variant="outline" onClick={() => toast({ title: 'Deduped', description: 'Duplicates removed (10).' })}>Deduplicate</Button></li>
                <li>Demand spike for SKU-88 on Apr 12 — <Button size="sm" variant="outline" onClick={() => toast({ title: 'Promo tagged', description: 'Marked as promotion-driven.' })}>Mark promo</Button></li>
              </ul>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                  <div className="font-medium">Enforce unique SKU</div>
                  <div className="text-sm text-slate-500">Hard error on duplicates</div>
                  <Switch className="mt-2" />
                </div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                  <div className="font-medium">Ignore weekends</div>
                  <div className="text-sm text-slate-500">Exclude non-business days</div>
                  <Switch className="mt-2" />
                </div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                  <div className="font-medium">Outlier Z-score</div>
                  <div className="text-sm text-slate-500">Threshold</div>
                  <Input type="number" defaultValue={3} className="mt-2 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => toast({ title: 'Validation run', description: 'Checks executed on uploaded datasets.' })}>Run validation</Button>
                <Button variant="outline" onClick={() => toast({ title: 'Auto-fixes applied', description: 'Resolved 3 issues.' })}>Apply all auto-fixes</Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-600">Upload datasets to run validations.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const InsightsPanel: React.FC = () => (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid md:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <Card key={idx} className="bg-white/80 dark:bg-viz-medium/80 border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{k.label}</div>
                  <div className="text-2xl font-bold mt-1">{k.value}</div>
                  <div className={`text-xs mt-1 ${k.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {k.change >= 0 ? '+' : ''}{k.change}% vs last period
                  </div>
                </div>
                <k.icon className={`w-6 h-6 ${k.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white/80 dark:bg-viz-medium/80 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="w-5 h-5 text-viz-accent" /> Demand vs Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={demandVsInventoryData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-viz-medium/80 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" /> Stockout Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={stockoutHeatmapData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-white/80 dark:bg-viz-medium/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Boxes className="w-5 h-5 text-emerald-600" /> Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
          <RecItem title="Replenish" detail="Order 200 units of SKU-567 by Oct 15 to prevent stockout." />
          <RecItem title="Liquidate" detail="Discount SKU-902 by 15% to clear aging inventory in 3 weeks." />
          <RecItem title="Supplier" detail="Supplier A has +12% delay trend — increase safety stock by 5 days." />
        </CardContent>
      </Card>
    </div>
  );

  const ChatPanel: React.FC = () => (
    <div className="space-y-4">
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-viz-accent" /> IIA Chat</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Styled similar to MIA/DUFA chat: clean full panel */}
          <div className="rounded-b-lg overflow-hidden">
            <InventoryInsightAgent showHeader={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-viz-accent" /> Automation & Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Low-stock threshold</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Trigger alerts when on-hand falls below N days</div>
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" className="w-24" value={lowStockThreshold} onChange={e => setLowStockThreshold(Number(e.target.value || 0))} />
              <span className="text-sm text-slate-500">days</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">AI-driven replenishment proposals</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Draft recommended POs for approval</div>
            </div>
            <Switch checked={autoReplenishment} onCheckedChange={setAutoReplenishment} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium">Auto-approve cap</div>
              <div className="text-sm text-slate-500">POs under this amount</div>
              <Input type="number" placeholder="$5000" className="mt-2" />
            </div>
            <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium">Supplier delay SLA (%)</div>
              <div className="text-sm text-slate-500">Alert when above</div>
              <Input type="number" value={supplierDelayThreshold} onChange={e => setSupplierDelayThreshold(Number(e.target.value || 0))} className="mt-2" />
            </div>
            <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium">Safety stock policy</div>
              <div className="text-sm text-slate-500">e.g., 95% service level</div>
              <Input placeholder="95% service level" className="mt-2" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div>
                <div className="font-medium">Slack alerts</div>
                <div className="text-sm text-slate-500">Send to #inv-alerts</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div>
                <div className="font-medium">Email alerts</div>
                <div className="text-sm text-slate-500">Daily digest</div>
              </div>
              <Switch />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toast({ title: 'Settings saved', description: 'Automation rules updated.' })}>Save settings</Button>
            <Button variant="outline" onClick={() => toast({ title: 'Simulation complete', description: 'Policies simulated on last 30 days.' })}>Run policy simulation</Button>
          </div>
          <div className="text-xs text-slate-500">Exports (Excel/PDF/API) will be added next.</div>
        </CardContent>
      </Card>
    </div>
  );

  const ReplenishmentPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Boxes className="w-5 h-5 text-emerald-600" /> AI Replenishment Proposals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <StatTile label="Draft POs" value="7" accent="from-emerald-500 to-teal-600" />
            <StatTile label="Pending approval" value="3" accent="from-indigo-500 to-blue-600" />
            <StatTile label="Budget used" value="$82.4k" accent="from-amber-500 to-rose-500" />
          </div>
          <div className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 overflow-hidden">
            <div className="grid grid-cols-6 bg-slate-50 dark:bg-viz-dark/40 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="px-3 py-2">SKU</div>
              <div className="px-3 py-2">Vendor</div>
              <div className="px-3 py-2">ROP</div>
              <div className="px-3 py-2">Qty</div>
              <div className="px-3 py-2">Lead time</div>
              <div className="px-3 py-2">Action</div>
            </div>
            {[
              { sku: 'SKU-567', vendor: 'Alpha Co.', rop: 180, qty: 200, lt: '12d' },
              { sku: 'SKU-221', vendor: 'Beta Ltd.', rop: 90, qty: 110, lt: '8d' },
              { sku: 'SKU-902', vendor: 'Gamma Inc.', rop: 60, qty: 80, lt: '15d' },
            ].map((r) => (
              <div key={r.sku} className="grid grid-cols-6 border-t border-slate-200/60 dark:border-viz-light/20 text-sm">
                <div className="px-3 py-2">{r.sku}</div>
                <div className="px-3 py-2">{r.vendor}</div>
                <div className="px-3 py-2">{r.rop}</div>
                <div className="px-3 py-2">{r.qty}</div>
                <div className="px-3 py-2">{r.lt}</div>
                <div className="px-3 py-2">
                  <Button size="sm" onClick={() => toast({ title: 'PO approved', description: `${r.sku} added to approved POs.` })}>Approve</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toast({ title: 'Draft POs generated', description: '7 proposals ready for review.' })}>Generate draft POs</Button>
            <Button variant="outline" onClick={() => toast({ title: 'Reorder points refreshed', description: 'ROP recalculated using latest demand and lead time.' })}>Recalculate ROP</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InventoryPanel: React.FC = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PackageOpen className="w-5 h-5 text-purple-600" /> ABC Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={abcMixData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Boxes className="w-5 h-5 text-emerald-600" /> Inventory Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <StatTile label="On-hand units" value="12,480" accent="from-emerald-500 to-teal-600" />
            <StatTile label="Inv. value" value="$1.24M" accent="from-indigo-500 to-blue-600" />
            <StatTile label="Avg. DOS" value="34d" accent="from-amber-500 to-rose-500" />
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-600" /> Ageing Buckets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={ageBucketData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DemandPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-600" /> Forecast vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={demandVsInventoryData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-viz-accent" /> Movers & Laggards</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2">Top Movers</div>
            <ul className="space-y-1">
              {['SKU-111 +42%', 'SKU-567 +38%', 'SKU-888 +31%'].map((t) => <li key={t} className="flex items-center justify-between p-2 rounded border border-slate-200/60 dark:border-viz-light/20"><span>{t}</span><Badge variant="secondary">High</Badge></li>)}
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Laggards</div>
            <ul className="space-y-1">
              {['SKU-902 -18%', 'SKU-221 -15%', 'SKU-312 -12%'].map((t) => <li key={t} className="flex items-center justify-between p-2 rounded border border-slate-200/60 dark:border-viz-light/20"><span>{t}</span><Badge className="bg-amber-500">Watch</Badge></li>)}
            </ul>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button onClick={() => toast({ title: 'Forecast generated', description: '12-week forecast prepared.' })}>Generate forecast</Button>
            <Button variant="outline" onClick={() => toast({ title: 'Explanation ready', description: 'Top drivers summarized.' })}>Explain drivers</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const LiquidationPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-viz-medium/90 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-600" /> Liquidation Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 overflow-hidden">
            <div className="grid grid-cols-5 bg-slate-50 dark:bg-viz-dark/40 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="px-3 py-2">SKU</div>
              <div className="px-3 py-2">Age</div>
              <div className="px-3 py-2">Units</div>
              <div className="px-3 py-2">Markdown</div>
              <div className="px-3 py-2">Action</div>
            </div>
            {[
              { sku: 'SKU-902', age: '120d', units: 340, md: '15%' },
              { sku: 'SKU-445', age: '95d', units: 220, md: '10%' },
              { sku: 'SKU-119', age: '180d', units: 150, md: '25%' },
            ].map((r) => (
              <div key={r.sku} className="grid grid-cols-5 border-t border-slate-200/60 dark:border-viz-light/20 text-sm">
                <div className="px-3 py-2">{r.sku}</div>
                <div className="px-3 py-2">{r.age}</div>
                <div className="px-3 py-2">{r.units}</div>
                <div className="px-3 py-2">{r.md}</div>
                <div className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => toast({ title: 'Markdown applied', description: `${r.sku} discounted ${r.md}.` })}>Apply</Button></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toast({ title: 'Clearance plan generated', description: '3-week recovery plan created.' })}>Generate clearance plan</Button>
            <Button variant="outline" onClick={() => toast({ title: 'Aging refreshed', description: 'Aging metrics recalculated.' })}>Refresh aging</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      {showHeader && <Header showDataSection={false} />}

      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Left Navigation */}
        <div className="hidden md:flex w-72 bg-white/85 dark:bg-viz-medium/85 backdrop-blur-sm border-r border-slate-200/50 dark:border-viz-light/20 flex-col flex-shrink-0">
          <div className="p-5 border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-viz-dark dark:text-white">IIA</h2>
              <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Inventory Insight Agent</p>
            </div>
          </div>

          <nav className="flex-1 p-5 space-y-3">
            <NavButton id="uploads" label="Data Uploads" icon={Database} gradient="bg-gradient-to-r from-emerald-500 to-green-600" />
            <NavButton id="checks" label="Data Checks & Validation" icon={CheckCircle} gradient="bg-gradient-to-r from-indigo-500 to-blue-600" />
            <NavButton id="insights" label="Insights & Dashboards" icon={LineChart} gradient="bg-gradient-to-r from-viz-accent to-blue-600" />
            <NavButton id="replenishment" label="Replenishment" icon={Boxes} gradient="bg-gradient-to-r from-teal-500 to-emerald-600" />
            <NavButton id="inventory" label="Inventory" icon={PackageOpen} gradient="bg-gradient-to-r from-purple-500 to-indigo-600" />
            <NavButton id="demand" label="Demand / Product" icon={BarChart3} gradient="bg-gradient-to-r from-cyan-500 to-blue-600" />
            <NavButton id="liquidation" label="Liquidation" icon={AlertTriangle} gradient="bg-gradient-to-r from-amber-500 to-rose-600" />
            <NavButton id="chat" label="AI Chat / Q&A" icon={MessageCircle} gradient="bg-gradient-to-r from-pink-500 to-viz-accent" />
            <NavButton id="settings" label="Settings" icon={SettingsIcon} gradient="bg-gradient-to-r from-purple-500 to-indigo-600" />
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white/50 dark:bg-viz-dark/50">
          {/* Mobile tabs */}
          <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="px-4 py-2 grid grid-cols-9 gap-2">
              {[
                { id: 'uploads', label: 'Uploads' },
                { id: 'checks', label: 'Checks' },
                { id: 'insights', label: 'Insights' },
                { id: 'replenishment', label: 'Repl' },
                { id: 'inventory', label: 'Inv' },
                { id: 'demand', label: 'Demand' },
                { id: 'liquidation', label: 'Liq' },
                { id: 'chat', label: 'Chat' },
                { id: 'settings', label: 'Settings' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id as Section)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active === t.id
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            {active === 'uploads' && <UploadsPanel />}
            {active === 'checks' && <ChecksPanel />}
            {active === 'insights' && <InsightsPanel />}
            {active === 'replenishment' && <ReplenishmentPanel />}
            {active === 'inventory' && <InventoryPanel />}
            {active === 'demand' && <DemandPanel />}
            {active === 'liquidation' && <LiquidationPanel />}
            {active === 'chat' && <ChatPanel />}
            {active === 'settings' && <SettingsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatTile: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent = 'from-viz-accent to-blue-600' }) => (
  <div
    className={`rounded-lg p-4 text-white shadow bg-gradient-to-r ${accent}`}
    role="status"
    aria-label={`${label}: ${value}`}
    tabIndex={0}
  >
    <div className="text-xs uppercase tracking-wide text-white/80">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

const RecItem: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="p-4 rounded-lg bg-white/70 dark:bg-viz-dark/60 border border-slate-200/50 dark:border-viz-light/20">
    <div className="font-medium mb-1">{title}</div>
    <div className="text-sm text-slate-600 dark:text-slate-300">{detail}</div>
  </div>
);

export default InventorySuite;
